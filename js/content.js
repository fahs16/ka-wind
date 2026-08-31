/* Isi panel-panel besar: acara, galeri, kado, RSVP, hitung mundur. */

const Content = {
  // Cari tamu dari link: ?u=KODE (dari daftar undangan) atau ?to=Nama Bebas
  guestInfo() {
    if (this._guest) return this._guest;
    const code = (U.query('u') || U.query('kode')).trim().toLowerCase();
    let info = { code: '', name: '', seats: 0, group: '' };
    if (code && typeof GUESTS !== 'undefined' && Array.isArray(GUESTS)) {
      const g = GUESTS.find(x => String(x.code).toLowerCase() === code);
      if (g) info = { code: g.code, name: g.name, seats: +g.seats || 0, group: g.group || '', wa: g.wa || '' };
    }
    if (!info.name) {
      const free = (U.query('to') || U.query('kepada') || U.query('nama')).trim();
      if (free) info.name = free.slice(0, 60);
      if (code && !info.code) info.code = code.slice(0, 24); // kode tak dikenal, tetap dicatat
    }
    this._guest = info;
    return info;
  },

  guest() { return this.guestInfo().name; },

  /* ---------- Detail acara ---------- */
  eventHtml(ev) {
    return '' +
      '<div class="card">' +
        '<div class="card-kicker">' + U.esc(ev.name) + '</div>' +
        '<div class="big">' + U.esc(ev.day) + '</div>' +
        '<div class="row"><span class="tag">JAM</span><span>' + U.esc(ev.time) + '</span></div>' +
        '<div class="row"><span class="tag">TEMPAT</span><span>' + U.esc(ev.place) + '</span></div>' +
        '<div class="row"><span class="tag">ALAMAT</span><span>' + U.esc(ev.address) + '</span></div>' +
        '<div class="btn-row">' +
          '<a class="btn btn-primary" href="' + U.esc(ev.maps) + '" target="_blank" rel="noopener">Buka Google Maps</a>' +
          '<button class="btn" data-ics="' + U.esc(ev.id) + '">Simpan ke Kalender</button>' +
        '</div>' +
      '</div>';
  },

  /* ---------- Galeri ---------- */
  galleryHtml() {
    const items = CONFIG.gallery.map((g, i) => {
      const inner = g.src
        ? '<img src="' + U.esc(g.src) + '" alt="' + U.esc(g.caption) + '" loading="lazy" onerror="this.parentNode.classList.add(\'ph\');this.remove();">'
        : '';
      return '<figure class="shot' + (g.src ? '' : ' ph') + '">' +
        '<div class="shot-img" data-n="' + (i + 1) + '">' + inner + '</div>' +
        '<figcaption>' + U.esc(g.caption) + '</figcaption></figure>';
    }).join('');
    return '<p class="lead">Sedikit potongan perjalanan kami.</p><div class="grid">' + items + '</div>' +
      '<p class="hint-text">Foto masih kosong? Taruh file di folder <code>img/</code> lalu isi <code>gallery[].src</code> di <code>js/config.js</code>.</p>';
  },

  /* ---------- Kado ---------- */
  giftHtml() {
    const banks = CONFIG.gifts.banks.map(b =>
      '<div class="acct">' +
        '<div class="acct-bank">' + U.esc(b.bank) + '</div>' +
        '<div class="acct-no">' + U.esc(b.number) + '</div>' +
        '<div class="acct-name">a.n. ' + U.esc(b.holder) + '</div>' +
        '<button class="btn btn-small" data-copy="' + U.esc(b.number) + '">Salin Nomor</button>' +
      '</div>').join('');
    return '<p class="lead">Kehadiran kalian sudah lebih dari cukup. Tapi kalau mau kirim tanda kasih, ini pintunya.</p>' +
      '<div class="accts">' + banks + '</div>' +
      '<div class="card"><div class="card-kicker">KIRIM KADO FISIK</div><div>' + U.esc(CONFIG.gifts.address) + '</div>' +
      '<div class="btn-row"><button class="btn btn-small" data-copy="' + U.esc(CONFIG.gifts.address) + '">Salin Alamat</button></div></div>';
  },

  /* ---------- RSVP ---------- */
  rsvpHtml() {
    const saved = Store.get();
    const info = this.guestInfo();
    const g = info.name;
    const maxSeat = U.clamp(info.seats || 5, 1, 10);
    const opts = n => Array.from({ length: n }, (_, i) =>
      '<option value="' + (i + 1) + '"' + (saved && +saved.jumlah === i + 1 ? ' selected' : '') + '>' + (i + 1) + ' orang</option>').join('');
    const sel = v => saved && saved.hadir === v ? ' selected' : '';
    return '<p class="lead">Titip kabar ya, biar kami siapin kursi (dan konsumsi) yang pas.' +
      (CONFIG.rsvp.deadline ? ' Ditunggu sebelum <b>' + U.esc(CONFIG.rsvp.deadline) + '</b>.' : '') + '</p>' +
      '<form id="rsvp-form" class="form">' +
        '<label>Nama kamu<input name="nama" required maxlength="60" value="' + U.esc(saved ? saved.nama : g) + '" placeholder="Nama lengkap"></label>' +
        '<label>Kamu bisa datang?<select name="hadir">' +
          '<option' + sel('Hadir') + '>Hadir</option>' +
          '<option' + sel('Masih ragu') + '>Masih ragu</option>' +
          '<option' + sel('Tidak bisa hadir') + '>Tidak bisa hadir</option>' +
        '</select></label>' +
        '<label>Bawa berapa orang?' + (info.seats ? ' <span class="muted">(jatah kamu ' + info.seats + ' kursi)</span>' : '') +
          '<select name="jumlah">' + opts(maxSeat) + '</select></label>' +
        '<label>Ucapan & doa<textarea name="pesan" rows="3" maxlength="400" placeholder="Tulis doa terbaikmu...">' + U.esc(saved ? saved.pesan : '') + '</textarea></label>' +
        '<button class="btn btn-primary" type="submit">Kirim RSVP</button>' +
      '</form>' +
      '<div id="rsvp-result"></div>';
  },

  /* ---------- Hitung mundur ---------- */
  countdownHtml() {
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '-' : d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return '<div class="card center">' +
        '<div class="card-kicker">SAVE THE DATE</div>' +
        '<div class="big">' + U.esc(tgl) + '</div>' +
        '<div id="cd" class="cd">' +
          '<div><b id="cd-d">0</b><span>hari</span></div>' +
          '<div><b id="cd-h">0</b><span>jam</span></div>' +
          '<div><b id="cd-m">0</b><span>menit</span></div>' +
          '<div><b id="cd-s">0</b><span>detik</span></div>' +
        '</div>' +
        '<div class="btn-row"><button class="btn btn-primary" data-ics="all">Simpan ke Kalender</button></div>' +
      '</div>';
  },

  /* ---------- Papan petunjuk ---------- */
  infoHtml() {
    const maps = CONFIG.events.map(e =>
      '<a class="btn" href="' + U.esc(e.maps) + '" target="_blank" rel="noopener">Lokasi ' + U.esc(e.name) + '</a>').join('');
    const live = CONFIG.liveStream
      ? '<div class="card"><div class="card-kicker">SIARAN LANGSUNG</div><div class="btn-row"><a class="btn btn-primary" href="' + U.esc(CONFIG.liveStream) + '" target="_blank" rel="noopener">Tonton Live</a></div></div>'
      : '';
    return '<div class="card"><div class="card-kicker">CARA MAIN</div>' +
        '<div class="row"><span class="tag">GERAK</span><span>Tombol panah / WASD, atau geser stik di layar HP</span></div>' +
        '<div class="row"><span class="tag">INTERAKSI</span><span>Tombol <b>E</b> / <b>Spasi</b>, atau tombol <b>A</b> di layar</span></div>' +
        '<div class="row"><span class="tag">MISI</span><span>Kunjungi 8 titik bertanda untuk membuka pesan penutup</span></div>' +
      '</div>' +
      '<div class="card"><div class="card-kicker">PETA LOKASI</div><div class="btn-row">' + maps + '</div></div>' +
      '<div class="card"><div class="card-kicker">DRESS CODE</div><div>Nuansa earth tone, sage, & dusty rose. Santai tapi rapi.</div></div>' +
      live;
  },

  /* ---------- File kalender (.ics) ---------- */
  icsFor(which) {
    const pad = n => String(n).padStart(2, '0');
    const fmt = dt => dt.getUTCFullYear() + pad(dt.getUTCMonth() + 1) + pad(dt.getUTCDate()) + 'T' +
      pad(dt.getUTCHours()) + pad(dt.getUTCMinutes()) + '00Z';
    const base = new Date(CONFIG.bigDay);
    const list = which === 'all' ? CONFIG.events : CONFIG.events.filter(e => e.id === which);
    const names = CONFIG.couple.groom.nick + ' & ' + CONFIG.couple.bride.nick;
    let out = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//undangan//pixel//ID\r\n';
    list.forEach((e, i) => {
      const start = new Date(base.getTime() + (e.id === 'resepsi' ? 3 * 3600000 : 0));
      const end = new Date(start.getTime() + 3 * 3600000);
      out += 'BEGIN:VEVENT\r\nUID:' + Date.now() + i + '@undangan\r\nDTSTAMP:' + fmt(new Date()) +
        '\r\nDTSTART:' + fmt(start) + '\r\nDTEND:' + fmt(end) +
        '\r\nSUMMARY:' + e.name + ' ' + names +
        '\r\nLOCATION:' + e.place + ' - ' + e.address +
        '\r\nEND:VEVENT\r\n';
    });
    return out + 'END:VCALENDAR';
  },

  downloadIcs(which) {
    const blob = new Blob([this.icsFor(which)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'undangan-' + which + '.ics';
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    Toast.show('File kalender diunduh');
  }
};

/* Penyimpanan RSVP di perangkat tamu. */
const Store = {
  KEY: 'undangan-rsvp',
  get() { try { return JSON.parse(localStorage.getItem(this.KEY) || 'null'); } catch (e) { return null; } },
  set(v) { try { localStorage.setItem(this.KEY, JSON.stringify(v)); } catch (e) {} },
  progress: {
    KEY: 'undangan-progress',
    get() { try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch (e) { return []; } },
    set(v) { try { localStorage.setItem(this.KEY, JSON.stringify(v)); } catch (e) {} }
  }
};
