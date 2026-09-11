/* Gerbang akses + pencarian identitas tamu.

   Tiga sumber daftar tamu (diatur di CONFIG.guests.source):
     'db'    : dari tabel tamu di Supabase -> browser cuma boleh memanggil
               cek_tamu(kode); tabelnya sendiri terkunci total. Paling aman.
     'sheet' : dari Google Sheet -> browser hanya menanyakan SATU kode, dan
               server hanya menjawab satu tamu itu.
     'lokal' : dari js/guests.js -> ikut ter-publish, nama tamu bisa dibaca
               siapa pun. Cuma untuk undangan yang memang tidak dikunci.

   CATATAN: pemeriksaan ini berjalan di browser tamu. Untuk kunci sungguhan,
   pakai gerbang sisi server di netlify/edge-functions/gate.js (lihat README). */

const Access = {
  granted: false,
  code: '',
  tamu: null,            // { code, name, seats, group }
  gagalHubungi: false,   // true kalau server daftar tamu tidak bisa dihubungi
  darurat: false,        // true kalau tamu diloloskan karena server sedang mati

  aktif() { return !!(CONFIG.access && CONFIG.access.private); },
  sumber() { return ((CONFIG.guests && CONFIG.guests.source) || 'lokal').toLowerCase(); },
  alamat() {
    return ((CONFIG.guests && CONFIG.guests.endpoint) || CONFIG.rsvp.endpoint || '').trim();
  },
  bypass() {
    return ((CONFIG.access && CONFIG.access.bypass) || [])
      .map(c => String(c).trim().toLowerCase()).filter(Boolean);
  },
  kodeUrl() {
    return (U.query('u') || U.query('kode')).trim().toLowerCase().slice(0, 32);
  },

  /* ---------- sumber daftar tamu ---------- */
  dariLokal(kode) {
    if (typeof GUESTS === 'undefined' || !Array.isArray(GUESTS)) return null;
    const g = GUESTS.find(x => String(x.code).trim().toLowerCase() === kode);
    if (!g) return null;
    return {
      code: String(g.code), name: g.name || '',
      seats: +g.seats || 0, group: g.group || ''
    };
  },

  /* ---------- ingatan sementara ----------
     Hasil pencarian disimpan sepanjang tab terbuka, supaya buka-tutup panel
     tidak menembak server berulang kali. */
  dariIngatan(kode) {
    try {
      const simpan = sessionStorage.getItem('undangan-tamu-' + kode);
      return simpan ? JSON.parse(simpan) : null;
    } catch (e) { return null; }
  },
  keIngatan(kode, tamu) {
    try { sessionStorage.setItem('undangan-tamu-' + kode, JSON.stringify(tamu)); } catch (e) {}
  },

  // Tanya basis data: "siapa pemilik kode ini?" Jawabannya cuma satu tamu,
  // tanpa nomor WA, dan tidak ada cara menariknya jadi daftar penuh.
  dariDb(kode) {
    if (typeof Db === 'undefined' || !Db.aktif()) return Promise.resolve(null);
    const ingat = this.dariIngatan(kode);
    if (ingat) return Promise.resolve(ingat);

    return Db.cekTamu(kode, 5000)
      .then(t => {
        if (!t) return null;
        this.keIngatan(kode, t);
        return t;
      })
      .catch(() => {
        this.gagalHubungi = true;   // dibedakan dari "kode tidak terdaftar"
        return null;
      });
  },

  // Tanya Apps Script. Sama idenya dengan dariDb, beda pintunya saja.
  dariSheet(kode) {
    const url = this.alamat();
    if (!url) return Promise.resolve(null);

    const ingat = this.dariIngatan(kode);
    if (ingat) return Promise.resolve(ingat);
    const kunci = 'undangan-tamu-' + kode;

    const batas = new AbortController();
    const jam = setTimeout(() => batas.abort(), 5000);

    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=tamu&u=' + encodeURIComponent(kode),
                 { signal: batas.signal })
      .then(r => r.json())
      .then(j => {
        clearTimeout(jam);
        if (!j || !j.ok || !j.tamu) return null;
        const t = {
          code: String(j.tamu.kode || kode),
          name: String(j.tamu.nama || ''),
          seats: +j.tamu.kursi || 0,
          group: String(j.tamu.grup || '')
        };
        try { sessionStorage.setItem(kunci, JSON.stringify(t)); } catch (e) {}
        return t;
      })
      .catch(() => {
        clearTimeout(jam);
        this.gagalHubungi = true;   // dibedakan dari "kode tidak terdaftar"
        return null;
      });
  },

  /* ---------- keputusan masuk ---------- */
  mulai() {
    const kode = this.kodeUrl();
    const privat = this.aktif();

    // Kode cadangan panitia: tidak perlu terdaftar di mana pun.
    if (kode && this.bypass().indexOf(kode) >= 0) {
      this.granted = true;
      this.code = kode;
      return Promise.resolve(true);
    }

    // Kode yang sudah ada di daftar cadangan lokal langsung diloloskan, tanpa
    // menunggu jaringan. Namanya menyusul dari Sheet begitu jawabannya tiba,
    // jadi tamu tidak pernah menatap layar kosong walau Sheet sedang lambat.
    const lokal = kode ? this.dariLokal(kode) : null;
    if (lokal) {
      this.tamu = lokal;
      this.code = String(lokal.code);
      this.granted = true;
      if (this.sumber() !== 'lokal' && !lokal.name) this.namaMenyusul(kode);
      return Promise.resolve(true);
    }

    // Kode tidak dikenal daftar lokal: barulah bertanya ke server.
    return this.dariServer(kode).then(tamu => {
      this.tamu = tamu;
      this.code = tamu ? String(tamu.code) : '';

      // Server benar-benar tidak bisa dihubungi (bukan "kode salah"). Gangguan
      // di hari H tidak bisa diulang, jadi bawaannya tamu tetap dipersilakan
      // masuk dengan sapaan umum. Atur lewat access.saatServerMati.
      if (!tamu && this.gagalHubungi && privat && this.saatMati() !== 'tutup') {
        this.granted = true;
        this.darurat = true;
        return true;
      }

      this.granted = privat ? !!tamu : true;
      return this.granted;
    });
  },

  saatMati() {
    return String((CONFIG.access && CONFIG.access.saatServerMati) || 'buka').toLowerCase();
  },

  // Satu pintu ke sumber mana pun yang sedang dipakai.
  dariServer(kode) {
    if (!kode) return Promise.resolve(null);
    const dari = this.sumber();
    if (dari === 'db') return this.dariDb(kode);
    if (dari === 'sheet') return this.dariSheet(kode);
    return Promise.resolve(null);
  },

  // Nama tamu datang setelah undangan terlanjur tampil: perbarui sapaannya.
  namaMenyusul(kode) {
    this.dariServer(kode).then(t => {
      if (!t || !t.name) return;
      this.tamu = t;
      this.code = String(t.code);
      if (typeof Content !== 'undefined') Content._guest = null;   // buang hasil lama
      const el = document.getElementById('intro-guest');
      if (el) el.innerHTML = 'Kepada Yth.<br><b>' + U.esc(t.name) + '</b>';
      // Versi sederhana (simple.html) menandai sapaannya dengan atribut ini.
      const sapaan = document.querySelectorAll('[data-nama-tamu]');
      for (let i = 0; i < sapaan.length; i++) sapaan[i].textContent = t.name;
      if (typeof Net !== 'undefined' && Net.setName) Net.setName(t.name);
    });
  },

  // Halaman untuk yang tidak diundang: satu gambar, tanpa tulisan sama sekali.
  tutup() {
    const src = (CONFIG.access && CONFIG.access.image) || 'img/closed.png';
    document.body.className = 'gate-closed';
    document.body.innerHTML = '';
    const img = document.createElement('img');
    img.src = src;
    img.alt = '';
    img.decoding = 'async';
    document.body.appendChild(img);
  }
};
