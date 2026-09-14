/* Isi undangan yang tidak boleh ikut ter-publish.

   js/config.js adalah berkas statis: siapa pun bisa mengunduhnya langsung,
   tanpa melewati gerbang mana pun. Jadi apa pun yang dianggap tidak boleh
   bocor — nomor rekening, alamat rumah, nomor WA, nama lengkap orang tua —
   tidak diisi di sana, melainkan disimpan di server dan baru diambil SETELAH
   tamunya lolos gerbang.

   Cara kerjanya: server menyimpan pasangan kunci-nilai dengan kunci berupa
   jalur ke dalam CONFIG, misalnya

       gifts.address          Jl. Melati Raya No. 21, Bandung
       gifts.banks.0.number   1234567890
       events.1.place         Balai Kirana Ballroom

   Nilainya ditimpakan ke CONFIG sebelum halaman digambar. Yang tidak diisi di
   server tetap memakai isi js/config.js, jadi menambahkannya bisa sedikit demi
   sedikit dan situsnya tidak pernah rusak kalau bagian ini belum disiapkan.

   Berkas ini sendiri tidak memuat satu pun data itu — silakan dibaca sampai
   habis. */

const Isi = {
  sudah: false,

  rantai() {
    const khusus = (CONFIG.isi && CONFIG.isi.provider);
    const v = (khusus !== undefined && khusus !== null && khusus !== '')
      ? khusus
      : ((CONFIG.guests && CONFIG.guests.source) || 'sheet');
    return (Array.isArray(v) ? v : [v])
      .map(x => String(x).trim().toLowerCase())
      .filter(x => x === 'db' || x === 'sheet');
  },

  siap() {
    return this.rantai().filter(ke => ke === 'db'
      ? (typeof Db !== 'undefined' && Db.aktif())
      : !!((CONFIG.guests && CONFIG.guests.endpoint) || CONFIG.rsvp.endpoint));
  },

  aktif() { return (CONFIG.isi && CONFIG.isi.aktif) !== false && this.siap().length > 0; },

  kodeTamu() {
    return (typeof Access !== 'undefined' && Access.code)
      ? Access.code
      : (U.query('u') || U.query('kode')).trim();
  },

  satu(ke, kode) {
    if (ke === 'db') return Db.panggil('isi_undangan', { p_kode: kode }, 8000);
    const url = String((CONFIG.guests && CONFIG.guests.endpoint) || CONFIG.rsvp.endpoint || '').trim();
    const henti = new AbortController();
    const jam = setTimeout(() => henti.abort(), 8000);
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=isi&u=' + encodeURIComponent(kode),
                 { signal: henti.signal })
      .then(r => { clearTimeout(jam); return r.json(); },
            e => { clearTimeout(jam); throw e; });
  },

  // Menaruh satu nilai ke dalam CONFIG menurut jalurnya. Angka pada jalur
  // berarti indeks larik: 'gifts.banks.0.number'.
  tanam(jalur, nilai) {
    const bagian = String(jalur).split('.').filter(Boolean);
    if (!bagian.length) return;
    let simpul = CONFIG;
    for (let i = 0; i < bagian.length - 1; i++) {
      const k = bagian[i];
      // Jangan pernah membuat cabang baru yang tidak ada di config.js: server
      // cuma boleh mengisi tempat yang memang sudah disediakan.
      if (simpul[k] === undefined || simpul[k] === null || typeof simpul[k] !== 'object') return;
      simpul = simpul[k];
    }
    const akhir = bagian[bagian.length - 1];
    if (!(akhir in simpul)) return;
    simpul[akhir] = nilai;
  },

  terapkan(daftar) {
    if (!daftar) return 0;
    let n = 0;
    Object.keys(daftar).forEach(k => {
      const v = daftar[k];
      if (v === null || v === undefined || v === '') return;
      this.tanam(k, v);
      n++;
    });
    this.sudah = n > 0;
    return n;
  },

  // Selalu selesai. Kalau servernya diam atau belum disiapkan, CONFIG dibiarkan
  // apa adanya dan undangan tetap tampil — hanya isinya yang seadanya.
  muat() {
    if (!this.aktif()) return Promise.resolve(0);
    const kode = this.kodeTamu();
    if (!kode) return Promise.resolve(0);

    const daftar = this.siap();
    const coba = i => {
      if (i >= daftar.length) return Promise.resolve(0);
      return this.satu(daftar[i], kode)
        .then(j => {
          if (j && j.ok && j.isi) return this.terapkan(j.isi);
          return coba(i + 1);
        })
        .catch(() => coba(i + 1));
    };
    return coba(0);
  }
};
