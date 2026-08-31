/* Lapisan realtime: menampilkan tamu lain yang sedang membuka undangan.
   Dua transport tersedia:
     - 'local'    : BroadcastChannel, cuma antar-tab di satu perangkat (buat uji coba)
     - 'supabase' : Supabase Realtime, beneran online antar perangkat
   Kalau provider 'off' atau koneksinya gagal, undangan tetap jalan normal (mode sendirian). */

/* ---------- Penyaring teks ---------- */
const Moderate = {
  base: ['anjing', 'anjay', 'bangsat', 'kontol', 'memek', 'ngentot', 'ngentod', 'jancok', 'jancuk',
         'kampret', 'bajingan', 'brengsek', 'tolol', 'goblok', 'idiot', 'bego',
         'fuck', 'fucking', 'shit', 'bitch', 'asshole', 'bastard', 'dick', 'pussy'],

  norm(text) {
    return String(text).toLowerCase()
      .replace(/[0@]/g, 'o').replace(/1|!/g, 'i').replace(/3/g, 'e')
      .replace(/4/g, 'a').replace(/5|\$/g, 's').replace(/7/g, 't')
      .replace(/(.)\1{2,}/g, '$1$1')
      .replace(/[^a-z ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  },

  blocked(text) {
    const extra = (CONFIG.net && CONFIG.net.chat && CONFIG.net.chat.blocklist) || [];
    const list = this.base.concat(extra);
    const n = ' ' + this.norm(text) + ' ';
    return list.some(w => {
      w = String(w).toLowerCase().trim();
      if (!w) return false;
      return w.length <= 4 ? n.indexOf(' ' + w + ' ') >= 0 : n.indexOf(w) >= 0;
    });
  },

  // Rapikan jadi teks yang aman & bisa digambar font bitmap.
  clean(text, maxLen) {
    let t = String(text || '')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/[\x00-\x1f\x7f]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9 .,!?'\-&:\/+]/g, '');
    if (/\d{8,}/.test(t)) t = t.replace(/\d{6,}/g, '');
    return t.replace(/\s+/g, ' ').slice(0, maxLen || 60).trim();
  }
};

/* ---------- Transport: antar-tab di satu perangkat ---------- */
const LocalTransport = {
  ch: null,
  start(net) {
    if (typeof BroadcastChannel === 'undefined') { net.fail('Browser ini tidak mendukung mode uji coba.'); return; }
    this.ch = new BroadcastChannel('undangan-' + net.room);
    this.ch.onmessage = e => net.onMessage(e.data);
    net.ready = true;
    net.onReady();
  },
  send(msg) { if (this.ch) this.ch.postMessage(msg); },
  track() {},
  stop() { if (this.ch) { this.ch.close(); this.ch = null; } }
};

/* ---------- Transport: Supabase Realtime ---------- */
const SupabaseTransport = {
  ch: null, client: null,

  start(net, cfg) {
    if (!cfg.url || !cfg.key) { net.fail('URL / key Supabase belum diisi di config.js.'); return; }
    this.load(() => {
      const lib = window.supabase;
      if (!lib || !lib.createClient) { net.fail('Library realtime gagal dimuat.'); return; }
      try {
        this.client = lib.createClient(cfg.url, cfg.key, {
          realtime: { params: { eventsPerSecond: 12 } },
          auth: { persistSession: false }
        });
        const ch = this.client.channel('undangan-' + net.room, {
          config: { broadcast: { self: false }, presence: { key: net.id } }
        });
        ch.on('broadcast', { event: 'm' }, payload => net.onMessage(payload && payload.payload));
        ch.on('presence', { event: 'sync' }, () => {
          const state = (ch.presenceState && ch.presenceState()) || {};
          net.onPresence(Object.keys(state));
        });
        ch.on('presence', { event: 'leave' }, e => {
          ((e && e.leftPresences) || []).forEach(p => net.removePeer(p.id || p.key));
        });
        ch.subscribe(status => {
          if (status === 'SUBSCRIBED') {
            net.ready = true;
            this.track(net);
            net.onReady();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            net.fail('Koneksi realtime terputus.');
          }
        });
        this.ch = ch;
      } catch (e) {
        net.fail('Gagal menyambung ke server realtime.');
      }
    }, () => net.fail('Tidak bisa memuat library realtime.'));
  },

  load(ok, err) {
    if (window.supabase && window.supabase.createClient) { ok(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
    s.async = true;
    s.onload = ok;
    s.onerror = err;
    document.head.appendChild(s);
  },

  send(msg) {
    if (this.ch) { try { this.ch.send({ type: 'broadcast', event: 'm', payload: msg }); } catch (e) {} }
  },

  track(net) { if (this.ch && this.ch.track) { try { this.ch.track({ id: net.id, name: net.name }); } catch (e) {} } },
  stop() { if (this.ch) { try { this.ch.unsubscribe(); } catch (e) {} this.ch = null; } }
};

/* ---------- Inti ---------- */
const Net = {
  provider: 'off', transport: null, ready: false, failed: false,
  id: '', name: '', room: '', online: 1,
  peers: Object.create(null),
  lastSend: 0, lastChat: 0, chatTimes: [], lastState: '', _lastEmote: 0,

  PALETTES: ['tamu', 'tamu2', 'tamu3', 'tamu4', 'anak'],
  EMOTES: ['love', 'wave', 'party', 'clap'],

  active() { return this.provider !== 'off' && !this.failed; },

  // Nama di atas kepala: dipotong rapi kalau kepanjangan.
  shortName(raw) {
    const t = Moderate.clean(raw, 40);
    return t.length > 22 ? t.slice(0, 20).trim() + '..' : t;
  },

  init() {
    const cfg = (typeof CONFIG !== 'undefined' && CONFIG.net) || {};
    this.provider = cfg.provider || 'off';
    // Bisa dipaksa lewat URL buat uji coba: ?net=local (antar-tab) atau ?net=off
    const override = U.query('net').toLowerCase();
    if (override === 'local' || override === 'off' || override === 'supabase') this.provider = override;
    if (this.provider === 'off') return;

    this.id = this.myId();
    this.room = cfg.room || 'taman';
    const saved = Store.get();
    this.name = this.shortName(Content.guest() || (saved && saved.nama) || '') ||
                ('TAMU ' + this.id.slice(0, 3).toUpperCase());

    this.transport = this.provider === 'supabase' ? SupabaseTransport : LocalTransport;
    try { this.transport.start(this, cfg); } catch (e) { this.fail('Mode online tidak tersedia.'); }

    window.addEventListener('beforeunload', () => this.send({ t: 'bye', id: this.id }));
    document.addEventListener('visibilitychange', () => { if (!document.hidden) this.lastState = ''; });
  },

  myId() {
    let v = '';
    try { v = sessionStorage.getItem('undangan-id') || ''; } catch (e) {}
    if (!v) {
      v = Math.random().toString(36).slice(2, 8);
      try { sessionStorage.setItem('undangan-id', v); } catch (e) {}
    }
    return v;
  },

  onReady() {
    this.failed = false;
    Toast.show('Terhubung - tamu lain akan terlihat', 1800);
    this.updateHud();
  },

  fail(msg) {
    if (this.failed) return;
    this.failed = true;
    this.ready = false;
    this.peers = Object.create(null);
    this.updateHud();
    if (msg) Toast.show(msg + ' Undangan tetap bisa dibuka.', 3200);
  },

  send(msg) {
    if (!this.ready || !this.transport) return;
    try { this.transport.send(msg); } catch (e) {}
  },

  setName(name) {
    const n = this.shortName(name);
    if (!n || n === this.name) return;
    this.name = n;
    this.lastState = '';
    if (this.transport && this.transport.track) this.transport.track(this);
  },

  /* ----- kirim posisi -----
     Hemat kuota: hanya dikirim kalau posisinya berubah, dan makin ramai tamunya
     makin jarang dikirim (tiap pesan disebar ke semua orang di ruangan). ----- */
  sendInterval() {
    const base = (CONFIG.net && CONFIG.net.sendMs) || 140;
    const n = Object.keys(this.peers).length;
    return U.clamp(base + n * 35, base, 1000);
  },

  tick(now, player) {
    if (!this.ready) return;
    if (now - this.lastSend < this.sendInterval()) return;
    const state = Math.round(player.x) + ',' + Math.round(player.y) + ',' + player.dir + ',' + player.frame;
    const heartbeat = now - this.lastSend > 3000;
    if (state === this.lastState && !heartbeat) return;
    this.lastState = state;
    this.lastSend = now;
    this.send({
      t: 'pos', id: this.id, n: this.name,
      x: Math.round(player.x), y: Math.round(player.y), d: player.dir, f: player.frame
    });
  },

  /* ----- terima pesan ----- */
  onMessage(m) {
    if (!m || !m.id || m.id === this.id) return;
    if (m.t === 'bye') { this.removePeer(m.id); return; }

    let p = this.peers[m.id];
    if (!p) {
      const max = (CONFIG.net && CONFIG.net.maxPeers) || 40;
      if (Object.keys(this.peers).length >= max) return;
      p = this.peers[m.id] = {
        id: m.id, name: '', x: m.x || 0, y: m.y || 0, tx: m.x || 0, ty: m.y || 0,
        dir: 'down', frame: 0, chat: '', chatUntil: 0, emote: '', emoteUntil: 0,
        pal: this.PALETTES[Math.abs(this.hash(m.id)) % this.PALETTES.length],
        last: 0
      };
      this.updateHud();
    }
    p.last = performance.now();

    if (m.t === 'pos') {
      if (typeof m.x === 'number') p.tx = m.x;
      if (typeof m.y === 'number') p.ty = m.y;
      p.dir = m.d || 'down';
      p.frame = m.f || 0;
      if (m.n) p.name = this.shortName(m.n);
    } else if (m.t === 'chat') {
      const txt = Moderate.clean(m.c, (CONFIG.net.chat && CONFIG.net.chat.maxLen) || 60);
      if (txt && !Moderate.blocked(txt)) {
        p.chat = txt;
        p.chatUntil = performance.now() + 6000;
        Chip.blip();
      }
    } else if (m.t === 'emote') {
      if (this.EMOTES.indexOf(m.e) >= 0) {
        p.emote = m.e;
        p.emoteUntil = performance.now() + 1400;
      }
    }
  },

  onPresence(ids) {
    this.online = Math.max(1, ids.length);
    Object.keys(this.peers).forEach(id => { if (ids.indexOf(id) < 0) this.removePeer(id); });
    this.updateHud();
  },

  removePeer(id) {
    if (id && this.peers[id]) { delete this.peers[id]; this.updateHud(); }
  },

  /* ----- kirim chat & emote ----- */
  chat(text) {
    const cfg = (CONFIG.net && CONFIG.net.chat) || {};
    if (!this.ready || cfg.enabled === false) return { ok: false, msg: 'Chat belum aktif.' };
    const now = performance.now();
    if (now - this.lastChat < (cfg.cooldownMs || 2500)) return { ok: false, msg: 'Sabar sebentar ya...' };
    this.chatTimes = this.chatTimes.filter(t => now - t < 10000);
    if (this.chatTimes.length >= 3) return { ok: false, msg: 'Kebanyakan pesan, tunggu sebentar.' };

    const txt = Moderate.clean(text, cfg.maxLen || 60);
    if (!txt) return { ok: false, msg: 'Pesannya kosong atau pakai karakter yang tidak didukung.' };
    if (Moderate.blocked(txt)) return { ok: false, msg: 'Pesannya ditahan. Yang sopan ya, ini kondangan :)' };

    this.lastChat = now;
    this.chatTimes.push(now);
    this.send({ t: 'chat', id: this.id, n: this.name, c: txt });
    return { ok: true, text: txt };
  },

  emote(key) {
    if (!this.ready || this.EMOTES.indexOf(key) < 0) return null;
    const now = performance.now();
    if (now - this._lastEmote < 700) return null;
    this._lastEmote = now;
    this.send({ t: 'emote', id: this.id, n: this.name, e: key });
    return key;
  },

  /* ----- dipanggil tiap frame ----- */
  update(dt) {
    if (!this.active()) return;
    const now = performance.now();
    let changed = false;
    for (const id in this.peers) {
      const p = this.peers[id];
      if (now - p.last > 12000) { delete this.peers[id]; changed = true; continue; }
      p.x += (p.tx - p.x) * Math.min(1, dt * 12);
      p.y += (p.ty - p.y) * Math.min(1, dt * 12);
      if (p.chat && now > p.chatUntil) p.chat = '';
      if (p.emote && now > p.emoteUntil) p.emote = '';
    }
    if (this.provider === 'local') this.online = Object.keys(this.peers).length + 1;
    if (changed) this.updateHud();
  },

  list() { return Object.keys(this.peers).map(k => this.peers[k]); },

  updateHud() {
    const el = document.getElementById('hud-online');
    if (!el) return;
    if (!this.active() || !this.ready) { el.classList.add('hidden'); return; }
    el.classList.remove('hidden');
    const n = Math.max(this.online, Object.keys(this.peers).length + 1);
    el.querySelector('b').textContent = n;
  },

  hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h;
  }
};
