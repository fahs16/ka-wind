/* Hadiah pojokan rahasia ("hidden gem").

   Yang perlu diketahui soal berkas ini: DI SINI TIDAK ADA HADIAHNYA.

   Kode hadiah dan teks hadiahnya dibuat di server (server/schema.sql untuk
   basis data, server/apps-script.gs untuk Google Sheet), dan baru dikirim
   setelah server sendiri memastikan tiga hal:

     1. kodenya tamu terdaftar
     2. seluruh titik wajib sudah dikunjungi
     3. belum lewat batas waktu, dan tamunya sudah cukup lama keliling

   Jadi membaca berkas ini sampai habis tidak memberi tahu apa hadiahnya,
   dan tidak ada satu kode bersama yang bisa dibocorkan lalu dipakai
   ramai-ramai: setiap tamu dapat kodenya sendiri, dan yang memegang kode
   selalu tercatat namanya.

   Yang paling jujur untuk dikatakan: progres "8 titik" itu sendiri disimpan
   di perangkat tamu, jadi orang yang niat bisa saja mengaku sudah keliling.
   Yang tidak bisa dipalsukan adalah identitasnya — kode hadiah selalu terikat
   ke satu nama di daftar undangan kalian, dan namanya masuk ke catatan. */

const Gem = {
  KUNCI: 'undangan-gem',

  /* ---------- ke mana bertanya ---------- */
  // Ikut rantai sumber daftar tamu, karena hadiah ini memang bersandar pada
  // daftar itu. Bisa ditimpa lewat CONFIG.gem.provider kalau perlu.
  rantai() {
    const khusus = (CONFIG.gem && CONFIG.gem.provider);
    const v = khusus !== undefined && khusus !== null && khusus !== ''
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

  aktif() { return this.siap().length > 0; },

  alamatSheet() {
    return String((CONFIG.guests && CONFIG.guests.endpoint) || CONFIG.rsvp.endpoint || '').trim();
  },

  tanyaSheet(action, params) {
    const url = this.alamatSheet();
    if (!url) return Promise.reject(new Error('endpoint kosong'));
    const q = Object.keys(params)
      .map(k => k + '=' + encodeURIComponent(params[k])).join('&');
    const henti = new AbortController();
    const jam = setTimeout(() => henti.abort(), 9000);
    return fetch(url + (url.indexOf('?') >= 0 ? '&' : '?') + 'action=' + action + '&' + q,
                 { signal: henti.signal })
      .then(r => { clearTimeout(jam); return r.json(); },
            e => { clearTimeout(jam); throw e; });
  },

  /* ---------- ingatan di perangkat tamu ----------
     Supaya kode yang sudah didapat tetap bisa dilihat walau sinyalnya hilang.
     Ini cuma salinan; yang sah tetap catatan di server. */
  simpan(hasil) {
    try { localStorage.setItem(this.KUNCI, JSON.stringify(hasil)); } catch (e) {}
  },
  tersimpan() {
    try { return JSON.parse(localStorage.getItem(this.KUNCI) || 'null'); } catch (e) { return null; }
  },

  /* ---------- panggilan ---------- */
  kodeTamu() {
    return (typeof Access !== 'undefined' && Access.code)
      ? Access.code
      : (U.query('u') || U.query('kode')).trim();
  },

  satu(ke, action, titik) {
    const kode = this.kodeTamu();
    if (ke === 'db') {
      const nama = action === 'gem-klaim' ? 'klaim_gem' : 'status_gem';
      const arg = action === 'gem-klaim'
        ? { p_kode: kode, p_titik: titik || [] }
        : { p_kode: kode };
      return Db.panggil(nama, arg, 9000);
    }
    const p = { u: kode };
    if (action === 'gem-klaim') p.titik = (titik || []).join(',');
    return this.tanyaSheet(action, p);
  },

  // Selalu berhasil sebagai Promise. { ok: false, error: 'jaringan' } kalau
  // semua sumber tidak bisa dihubungi.
  panggil(action, titik) {
    const daftar = this.siap();
    if (!daftar.length) return Promise.resolve({ ok: false, error: 'belum-disetel' });

    const coba = (i, terakhir) => {
      if (i >= daftar.length) return Promise.resolve(terakhir || { ok: false, error: 'jaringan' });
      return this.satu(daftar[i], action, titik)
        .then(j => {
          // Jawaban "tidak" yang sah dari server dipakai apa adanya; cuma
          // gangguan jaringan yang membuat sumber berikutnya dicoba.
          if (j && (j.ok || j.error)) return j;
          return coba(i + 1, j);
        })
        .catch(() => coba(i + 1, terakhir));
    };
    return coba(0, null);
  },

  status() { return this.panggil('gem-status', null); },
  klaim(titik) {
    return this.panggil('gem-klaim', titik).then(j => {
      if (j && j.ok) this.simpan(j);
      return j;
    });
  }
};
