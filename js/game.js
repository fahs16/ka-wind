/* Mesin game: kamera, gerak, tabrakan, interaksi, misi, dan layar penutup. */

const QUEST_IDS = ['gate', 'akad', 'resepsi', 'galeri', 'cerita', 'couple', 'kado', 'rsvp'];

const Game = {
  canvas: null, ctx: null, w: 0, h: 0, scale: 3,
  player: { x: T(28), y: T(38), dir: 'up', frame: 0, anim: 0 },
  cam: { x: 0, y: 0 },
  keys: {}, touch: { x: 0, y: 0, active: false },
  t: 0, last: 0, running: false,
  visited: [], near: null, cooldown: 0,
  confetti: [], ended: false,

  init() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    Sprites.init();
    World.init();
    Dialogue.init();
    Modal.init();
    Toast.init();
    this.visited = Store.progress.get() || [];
    this.bindInput();
    this.bindPanels();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.updateHud();
  },

  /* ---------- Layar ---------- */
  resize() {
    const box = document.getElementById('stage');
    const cw = box.clientWidth, ch = box.clientHeight;
    // makin besar layar, makin besar pixel-nya (2x - 5x)
    this.scale = U.clamp(Math.floor(Math.min(cw / 130, ch / 200)), 2, 5);
    this.w = Math.ceil(cw / this.scale);
    this.h = Math.ceil(ch / this.scale);
    this.canvas.width = this.w;
    this.canvas.height = this.h;
    this.canvas.style.width = cw + 'px';
    this.canvas.style.height = ch + 'px';
    this.ctx.imageSmoothingEnabled = false;
  },

  /* ---------- Input ---------- */
  bindInput() {
    const move = ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'];
    window.addEventListener('keydown', e => {
      const k = e.key.toLowerCase();
      if (move.indexOf(k) >= 0 || k === ' ') e.preventDefault();
      this.keys[k] = true;
      if (k === 'e' || k === ' ' || k === 'enter') this.pressAction();
      if (k === 'escape') { if (Modal.open) Modal.close(); else if (Dialogue.open) Dialogue.close(); }
      if (k === 'm') this.toggleMusic();
    });
    window.addEventListener('keyup', e => { this.keys[e.key.toLowerCase()] = false; });
    window.addEventListener('blur', () => { this.keys = {}; this.touch.active = false; this.touch.x = this.touch.y = 0; });

    // stik analog di layar sentuh
    const stick = document.getElementById('stick'), knob = document.getElementById('knob');
    const R = 30;
    const setVec = (ev) => {
      const r = stick.getBoundingClientRect();
      let dx = ev.clientX - (r.left + r.width / 2);
      let dy = ev.clientY - (r.top + r.height / 2);
      const len = Math.hypot(dx, dy) || 1;
      const cl = Math.min(len, R);
      dx = dx / len * cl; dy = dy / len * cl;
      knob.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      this.touch.x = dx / R; this.touch.y = dy / R;
    };
    stick.addEventListener('pointerdown', e => {
      e.preventDefault(); stick.setPointerCapture(e.pointerId);
      this.touch.active = true; setVec(e);
    });
    stick.addEventListener('pointermove', e => { if (this.touch.active) setVec(e); });
    const end = () => {
      this.touch.active = false; this.touch.x = this.touch.y = 0;
      knob.style.transform = 'translate(0,0)';
    };
    stick.addEventListener('pointerup', end);
    stick.addEventListener('pointercancel', end);
    document.getElementById('btn-a').addEventListener('pointerdown', e => { e.preventDefault(); this.pressAction(); });

    document.getElementById('btn-music').onclick = () => this.toggleMusic();
    document.getElementById('btn-help').onclick = () => {
      Modal.show('Petunjuk & Info', Content.infoHtml());
    };
  },

  bindPanels() {
    const body = document.querySelector('#modal .modal-body');
    body.addEventListener('click', e => {
      const cp = e.target.closest('[data-copy]');
      if (cp) { copyText(cp.getAttribute('data-copy'), 'Tersalin'); return; }
      const ics = e.target.closest('[data-ics]');
      if (ics) { Content.downloadIcs(ics.getAttribute('data-ics')); }
    });
    body.addEventListener('submit', e => {
      if (e.target.id !== 'rsvp-form') return;
      e.preventDefault();
      this.submitRsvp(e.target);
    });
  },

  toggleMusic() {
    const on = Chip.toggle();
    document.getElementById('btn-music').textContent = on ? '♪ ON' : '♪ OFF';
    Toast.show(on ? 'Musik dinyalakan' : 'Musik dimatikan', 1200);
  },

  /* ---------- Mulai ---------- */
  start() {
    document.getElementById('intro').classList.add('gone');
    document.getElementById('stage').classList.add('ready');
    this.running = true;
    this.last = performance.now();
    if (CONFIG.music) { Chip.start(); document.getElementById('btn-music').textContent = '♪ ON'; }
    requestAnimationFrame(ts => this.loop(ts));
    setTimeout(() => Actions.gate(), 450);
  },

  blocked() { return Dialogue.open || Modal.open; },

  syncControls() {
    document.body.classList.toggle('talking', Dialogue.open || Modal.open);
  },

  pressAction() {
    if (Modal.open) return;
    if (Dialogue.open) { Dialogue.advance(); return; }
    if (this.cooldown > 0) return;
    if (this.near) { this.cooldown = 0.25; this.run(this.near.id); }
  },

  run(id) {
    const fn = Actions[id];
    if (fn) { Chip.open(); fn(); }
  },

  /* ---------- Misi ---------- */
  markVisited(id) {
    if (QUEST_IDS.indexOf(id) < 0 || this.visited.indexOf(id) >= 0) return;
    this.visited.push(id);
    Store.progress.set(this.visited);
    this.updateHud();
    Toast.show('Titik ditemukan! (' + this.visited.length + '/' + QUEST_IDS.length + ')', 1600);
    if (this.visited.length >= QUEST_IDS.length && !this.ended) {
      this.ended = true;
      setTimeout(() => this.finale(), 900);
    }
  },

  updateHud() {
    document.getElementById('hud-progress').textContent = this.visited.length + '/' + QUEST_IDS.length;
  },

  finale() {
    Chip.fanfare();
    this.burst(60);
    const c = CONFIG.couple;
    Dialogue.show([
      { name: 'Selesai!', text: 'Kamu sudah keliling seluruh taman kami. Terima kasih sudah menyempatkan waktu sejauh ini.' },
      { name: c.groom.nick + ' & ' + c.bride.nick, face: 'bride',
        text: 'Doa dan restu kalian adalah hadiah paling berharga buat kami. Sampai jumpa di hari bahagia itu, ya!' },
      { name: 'Sampai jumpa', text: c.hashtag + ' — jangan lupa pakai tagar ini kalau upload foto nanti :)' }
    ], {
      actions: [{ label: 'Isi RSVP', primary: true, fn: () => { Dialogue.close(); Actions.rsvp(); } }]
    });
  },

  burst(n) {
    for (let i = 0; i < n; i++) {
      this.confetti.push({
        x: Math.random() * this.w, y: -Math.random() * this.h * 0.6,
        vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 40,
        c: [C.rose, C.gold, C.cream, C.leaf3, C.sky][Math.floor(Math.random() * 5)],
        s: 1 + Math.floor(Math.random() * 2), life: 4 + Math.random() * 3
      });
    }
  },

  /* ---------- RSVP ---------- */
  submitRsvp(form) {
    const data = {
      nama: form.nama.value.trim(),
      hadir: form.hadir.value,
      jumlah: form.jumlah.value,
      pesan: form.pesan.value.trim(),
      waktu: new Date().toISOString()
    };
    if (!data.nama) return;
    Store.set(data);
    this.markVisited('rsvp');
    Chip.confirm();

    const c = CONFIG.couple;
    const text = 'Halo ' + c.groom.nick + ' & ' + c.bride.nick + '!%0A' +
      'Nama: ' + encodeURIComponent(data.nama) + '%0A' +
      'Kehadiran: ' + encodeURIComponent(data.hadir) + '%0A' +
      'Jumlah: ' + encodeURIComponent(data.jumlah) + ' orang%0A' +
      (data.pesan ? 'Ucapan: ' + encodeURIComponent(data.pesan) : '');
    const wa = 'https://wa.me/' + CONFIG.rsvp.whatsapp + '?text=' + text;

    if (CONFIG.rsvp.endpoint) {
      try {
        fetch(CONFIG.rsvp.endpoint, {
          method: 'POST', mode: 'no-cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(() => {});
      } catch (e) {}
    }

    document.getElementById('rsvp-result').innerHTML =
      '<div class="card ok"><div class="card-kicker">TERSIMPAN</div>' +
      '<div>Makasih, ' + U.esc(data.nama) + '! Jawabanmu sudah kami catat.</div>' +
      '<div class="btn-row"><a class="btn btn-primary" href="' + wa + '" target="_blank" rel="noopener">Kirim juga via WhatsApp</a></div></div>';
    this.burst(24);
    const res = document.getElementById('rsvp-result');
    if (res && res.scrollIntoView) res.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  },

  /* ---------- Loop ---------- */
  loop(ts) {
    if (!this.running) return;
    const dt = Math.min(0.05, (ts - this.last) / 1000);
    this.last = ts;
    this.t += dt;
    this.update(dt);
    this.render();
    requestAnimationFrame(t2 => this.loop(t2));
  },

  update(dt) {
    if (this.cooldown > 0) this.cooldown -= dt;
    const p = this.player;
    let dx = 0, dy = 0;
    if (!this.blocked()) {
      const k = this.keys;
      if (k['arrowleft'] || k['a']) dx -= 1;
      if (k['arrowright'] || k['d']) dx += 1;
      if (k['arrowup'] || k['w']) dy -= 1;
      if (k['arrowdown'] || k['s']) dy += 1;
      if (this.touch.active) {
        if (Math.abs(this.touch.x) > 0.25) dx += this.touch.x;
        if (Math.abs(this.touch.y) > 0.25) dy += this.touch.y;
      }
    }
    const len = Math.hypot(dx, dy);
    if (len > 0) {
      dx /= len; dy /= len;
      const sp = 64 * dt;
      this.moveX(dx * sp);
      this.moveY(dy * sp);
      p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      p.anim += dt;
      if (p.anim > 0.16) { p.anim = 0; p.frame = (p.frame + 1) % 2; }
    } else {
      p.frame = 0; p.anim = 0;
    }

    // kamera
    const worldW = MAP_W * TILE, worldH = MAP_H * TILE;
    this.cam.x = worldW <= this.w ? (worldW - this.w) / 2 : U.clamp(p.x - this.w / 2, 0, worldW - this.w);
    this.cam.y = worldH <= this.h ? (worldH - this.h) / 2 : U.clamp(p.y - this.h / 2, 0, worldH - this.h);

    // objek terdekat
    this.near = null;
    let best = 1e9;
    for (const o of World.objects) {
      if (!o.hot) continue;
      if (U.pointInRect(p.x, p.y, o.hot, 8)) {
        const cx = o.hot.x + o.hot.w / 2, cy = o.hot.y + o.hot.h / 2;
        const d = Math.hypot(p.x - cx, p.y - cy);
        if (d < best) { best = d; this.near = o; }
      }
    }

    // confetti
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c2 = this.confetti[i];
      c2.x += c2.vx * dt; c2.y += c2.vy * dt;
      c2.vy += 30 * dt; c2.life -= dt;
      if (c2.life <= 0 || c2.y > this.h + 20) this.confetti.splice(i, 1);
    }
  },

  canStand(x, y) {
    const hw = 5;
    return !World.isSolidPx(x - hw, y - 1) && !World.isSolidPx(x + hw, y - 1) &&
           !World.isSolidPx(x - hw, y - 7) && !World.isSolidPx(x + hw, y - 7);
  },

  moveX(d) {
    const p = this.player, nx = U.clamp(p.x + d, 8, MAP_W * TILE - 8);
    if (this.canStand(nx, p.y)) p.x = nx;
  },
  moveY(d) {
    const p = this.player, ny = U.clamp(p.y + d, 16, MAP_H * TILE - 4);
    if (this.canStand(p.x, ny)) p.y = ny;
  },

  /* ---------- Gambar ---------- */
  render() {
    const g = this.ctx, cam = this.cam;
    g.fillStyle = '#4f7a45';
    g.fillRect(0, 0, this.w, this.h);
    g.save();
    g.translate(-Math.round(cam.x), -Math.round(cam.y));

    g.drawImage(World.ground, 0, 0);

    const list = [];
    for (const o of World.objects) list.push({ base: o.base, kind: 'obj', ref: o });
    for (const d of World.decos) list.push({ base: d.base, kind: 'deco', ref: d });
    for (const n of World.npcs) list.push({ base: n.y, kind: 'npc', ref: n });
    list.push({ base: this.player.y, kind: 'player', ref: this.player });
    list.sort((a, b) => a.base - b.base);

    const viewL = cam.x - 60, viewR = cam.x + this.w + 60;
    const viewT = cam.y - 80, viewB = cam.y + this.h + 60;

    for (const it of list) {
      const r = it.ref;
      const x = r.x != null ? r.x : 0;
      if (x < viewL - 100 || x > viewR + 100 || it.base < viewT || it.base > viewB + 60) continue;
      if (it.kind === 'obj') r.draw(g, r, this.t);
      else if (it.kind === 'deco') Paint.deco(g, r, this.t);
      else if (it.kind === 'npc') {
        Sprites.shadow(g, r.x, r.y, 12);
        const idle = Math.floor(this.t * 1.6) % 2;
        if (r.key === 'bride') { // kerudung digambar di belakang kepala
          U.px(g, r.x - 9, r.y - 19, 18, 16, C.cream);
          U.px(g, r.x - 10, r.y - 16, 3, 12, C.shade);
          U.px(g, r.x + 7, r.y - 16, 3, 12, C.shade);
        }
        Sprites.drawChar(g, r.key, 'down', idle, r.x, r.y);
        if (r.key === 'bride') { // buket bunga
          U.px(g, r.x + 3, r.y - 8, 6, 5, C.leaf);
          U.px(g, r.x + 3, r.y - 11, 4, 4, C.rose);
          U.px(g, r.x + 6, r.y - 10, 3, 3, C.cream);
        } else {
          U.px(g, r.x - 3, r.y - 9, 2, 2, C.rose); // bunga di saku jas
          U.px(g, r.x - 1, r.y - 5, 4, 1, C.gold);
        }
      } else {
        Sprites.shadow(g, r.x, r.y, 12);
        Sprites.drawChar(g, 'tamu', r.dir, r.frame, r.x, r.y);
      }
    }

    // penanda misi di atas tiap titik
    for (const o of World.objects) {
      if (!o.quest || !o.hot) continue;
      const done = this.visited.indexOf(o.id) >= 0;
      const mx = Math.round(o.hot.x + o.hot.w / 2);
      const my = Math.round(o.y - 16 + Math.sin(this.t * 3 + o.x) * 2);
      if (mx < viewL || mx > viewR) continue;
      if (done) {
        U.px(g, mx - 5, my + 2, 4, 4, C.rose);
        U.px(g, mx + 1, my + 2, 4, 4, C.rose);
        U.px(g, mx - 5, my + 5, 10, 3, C.rose);
        U.px(g, mx - 3, my + 8, 6, 2, C.rose2);
        U.px(g, mx - 1, my + 10, 2, 2, C.rose2);
        U.px(g, mx - 4, my + 3, 2, 2, '#f7a9bb');
      } else {
        U.px(g, mx - 7, my - 1, 14, 17, C.ink);
        U.px(g, mx - 6, my, 12, 15, C.gold);
        U.px(g, mx - 5, my + 1, 10, 3, '#f7dda2');
        Font.drawCentered(g, '!', mx + 1, my + 3, C.ink, 2, 1);
        U.px(g, mx - 2, my + 16, 4, 2, C.ink);
        U.px(g, mx - 1, my + 18, 2, 2, C.ink);
      }
    }

    // gelembung petunjuk
    if (this.near && !this.blocked()) {
      const o = this.near;
      const label = o.label.toUpperCase();
      const tw = Font.width(label, 1, 1);
      const bx = Math.round(o.hot.x + o.hot.w / 2 - (tw + 12) / 2);
      const by = Math.round(Math.min(o.hot.y, o.base) - 24 + Math.sin(this.t * 4) * 1);
      U.px(g, bx - 1, by - 1, tw + 14, 13, C.ink);
      U.px(g, bx, by, tw + 12, 11, C.cream);
      Font.draw(g, label, bx + 6, by + 3, C.ink, 1, 1);
      const kb = 'TEKAN E';
      const kw = Font.width(kb, 1, 1);
      U.px(g, bx + (tw + 12 - kw - 8) / 2, by + 13, kw + 8, 10, C.rose2);
      Font.draw(g, kb, bx + (tw + 12 - kw - 8) / 2 + 4, by + 16, C.cream, 1, 1);
    }

    g.restore();

    this.drawGuides(g);

    // confetti (koordinat layar)
    for (const c2 of this.confetti) U.px(g, c2.x, c2.y, 2 + c2.s, 2 + c2.s, c2.c);

    // vignette lembut
    const grd = g.createRadialGradient(this.w / 2, this.h / 2, this.h * 0.35, this.w / 2, this.h / 2, this.h * 0.85);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(20,12,24,0.35)');
    g.fillStyle = grd;
    g.fillRect(0, 0, this.w, this.h);
  },

  // Penunjuk arah di tepi layar untuk 3 titik terdekat yang belum dikunjungi.
  drawGuides(g) {
    if (this.blocked()) return;
    const p = this.player;
    const list = World.objects
      .filter(o => o.quest && o.hot && this.visited.indexOf(o.id) < 0)
      .map(o => ({ o: o, d: Math.hypot(o.hot.x + o.hot.w / 2 - p.x, o.y - p.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
    for (const it of list) {
      const o = it.o;
      const sx = o.hot.x + o.hot.w / 2 - this.cam.x;
      const sy = o.y - this.cam.y;
      if (sx > 12 && sx < this.w - 12 && sy > 12 && sy < this.h - 12) continue;
      const px = U.clamp(sx, 8, this.w - 9);
      const py = U.clamp(sy, 12, this.h - 13);
      U.px(g, px - 5, py - 5, 11, 11, C.ink);
      U.px(g, px - 4, py - 4, 9, 9, C.gold);
      U.px(g, px - 1, py - 3, 2, 5, C.ink);
      U.px(g, px - 1, py + 3, 2, 2, C.ink);
    }
  }
};

/* ---------------- Aksi tiap titik ---------------- */
const Actions = {
  gate() {
    const g = Content.guest();
    const c = CONFIG.couple;
    Game.markVisited('gate');
    Dialogue.show([
      { name: 'Gerbang', text: 'Assalamualaikum' + (g ? ', ' + g : '') + '! Selamat datang di taman kecil milik ' + c.groom.nick + ' & ' + c.bride.nick + '.' },
      { name: 'Gerbang', text: 'Ini bukan undangan biasa. Jalan-jalan aja dulu, semua info acara disembunyikan di 8 titik bertanda seru (!).' },
      { name: 'Cara main', text: 'Gerak: tombol panah / WASD (atau stik di layar HP). Berdiri dekat objek lalu tekan E / tombol A untuk berinteraksi.' },
      { name: 'Gerbang', text: CONFIG.quote.text + ' (' + CONFIG.quote.source + ')' }
    ], { actions: [{ label: 'Mulai Jalan', primary: true, fn: () => Dialogue.close() }] });
  },

  akad() {
    Game.markVisited('akad');
    const ev = CONFIG.events[0];
    Dialogue.show([{ name: 'Gedung Akad', text: 'Di sinilah janji itu diucapkan. Datang lebih awal ya, biar nggak ketinggalan momennya.' }], {
      onDone: () => Modal.show(ev.name, Content.eventHtml(ev))
    });
  },

  resepsi() {
    Game.markVisited('resepsi');
    const ev = CONFIG.events[1];
    Dialogue.show([{ name: 'Balai Resepsi', text: 'Musik, makanan, dan foto bareng. Bagian paling ramai ada di sini.' }], {
      onDone: () => Modal.show(ev.name, Content.eventHtml(ev))
    });
  },

  couple() {
    Game.markVisited('couple');
    Game.burst(30);
    const c = CONFIG.couple;
    Dialogue.show([
      { name: c.groom.nick, face: 'groom', text: 'Eh, kamu beneran datang! Makasih ya sudah nyempetin jalan sampai sini.' },
      { name: c.bride.nick, face: 'bride', text: 'Kami tunggu kehadiran kamu di hari H. Jangan lupa isi buku tamu di kotak surat dekat gerbang!' },
      { name: c.groom.nick, face: 'groom', text: 'Doakan kami ya, semoga jadi keluarga yang sakinah, mawaddah, warahmah.' }
    ], {
      actions: [{
        label: 'Lihat Profil', primary: true, fn: () => {
          Dialogue.close();
          Modal.show('Kedua Mempelai',
            '<div class="card center"><div class="card-kicker">MEMPELAI PRIA</div><div class="big">' + U.esc(c.groom.full) + '</div>' +
            '<div class="muted">' + U.esc(c.groom.role) + '</div></div>' +
            '<div class="amp">&amp;</div>' +
            '<div class="card center"><div class="card-kicker">MEMPELAI WANITA</div><div class="big">' + U.esc(c.bride.full) + '</div>' +
            '<div class="muted">' + U.esc(c.bride.role) + '</div></div>' +
            '<p class="quote">' + U.esc(CONFIG.quote.text) + '<span>' + U.esc(CONFIG.quote.source) + '</span></p>');
        }
      }]
    });
  },

  galeri() {
    Game.markVisited('galeri');
    Modal.show('Galeri Foto', Content.galleryHtml());
  },

  cerita() {
    Game.markVisited('cerita');
    const pages = CONFIG.story.map(s => ({ name: s.year + ' — ' + s.title, text: s.text }));
    pages.unshift({ name: 'Papan Cerita', text: 'Setiap papan menyimpan satu babak. Baca pelan-pelan ya.' });
    Dialogue.show(pages);
  },

  kado() {
    Game.markVisited('kado');
    Dialogue.show([{ name: 'Kotak Kado', text: 'Kotaknya kelihatan berat... padahal isinya cuma harapan baik. Mau ikut ngisi?' }], {
      onDone: () => Modal.show('Amplop Digital', Content.giftHtml())
    });
  },

  rsvp() {
    Game.markVisited('rsvp');
    Modal.show('Konfirmasi Kehadiran', Content.rsvpHtml());
  },

  jukebox() {
    const on = Chip.toggle();
    document.getElementById('btn-music').textContent = on ? '♪ ON' : '♪ OFF';
    Dialogue.show([{ name: 'Jukebox', text: on ? 'Musik dinyalakan. Volume aman kok, nggak bikin kaget.' : 'Oke, kita diam-diaman dulu. Tekan lagi kalau mau musiknya balik.' }]);
  },

  jam() {
    let iv = null;
    Modal.show('Hitung Mundur', Content.countdownHtml(), () => clearInterval(iv));
    const tick = () => {
      const cd = U.countdown(CONFIG.bigDay);
      if (!cd) return;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
      set('cd-d', cd.d); set('cd-h', cd.h); set('cd-m', cd.m); set('cd-s', cd.s);
    };
    tick();
    iv = setInterval(tick, 1000);
  },

  petunjuk() { Modal.show('Petunjuk & Info', Content.infoHtml()); },

  fountain() {
    const wishes = [
      'Kamu melempar koin. Airnya berkilau sebentar... katanya permohonanmu didengar.',
      'Ada tulisan kecil di dasar kolam: "yang penting datang, bukan kadonya".',
      'Kolamnya memantulkan bayanganmu. Kelihatan bahagia — bagus, pertahankan.',
      'Seekor ikan koi pixel lewat, lalu pergi lagi. Dia juga diundang katanya.'
    ];
    Dialogue.show([{ name: 'Air Mancur', text: wishes[Math.floor(Math.random() * wishes.length)] }]);
  }
};

/* ---------------- Booting ---------------- */
window.addEventListener('DOMContentLoaded', () => {
  const c = CONFIG.couple;
  const cd = U.countdown(CONFIG.bigDay);
  const guest = Content.guest();
  document.getElementById('intro-names').textContent = c.groom.nick + ' & ' + c.bride.nick;
  document.getElementById('intro-date').textContent = new Date(CONFIG.bigDay)
    .toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  document.title = 'Undangan Pernikahan ' + c.groom.nick + ' & ' + c.bride.nick;
  if (guest) {
    document.getElementById('intro-guest').innerHTML =
      'Kepada Yth.<br><b>' + U.esc(guest) + '</b>';
  }
  if (cd && !cd.past) {
    document.getElementById('intro-count').textContent = cd.d + ' hari lagi menuju hari bahagia';
  }

  Game.init();
  document.getElementById('btn-open').addEventListener('click', () => Game.start());
});
