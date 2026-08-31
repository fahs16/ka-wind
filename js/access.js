/* Gerbang akses: undangan hanya terbuka lewat link personal ?u=KODE.
   Pengunjung tanpa undangan cuma melihat satu gambar polos tanpa teks apa pun.

   CATATAN JUJUR: pemeriksaan ini berjalan di browser tamu, jadi sifatnya
   menyaring, bukan mengunci. Lihat bagian "Batas dari penyaringan ini" di
   README untuk cara mengunci sungguhan lewat sisi server. */

const Access = {
  granted: false,
  code: '',

  aktif() { return !!(CONFIG && CONFIG.access && CONFIG.access.private); },

  // Kode dari URL: ?u=KODE (atau ?kode=KODE)
  kodeUrl() {
    return (U.query('u') || U.query('kode')).trim().toLowerCase().slice(0, 32);
  },

  check() {
    if (!this.aktif()) { this.granted = true; return true; }

    const kode = this.kodeUrl();
    if (!kode) return false;

    const bypass = ((CONFIG.access && CONFIG.access.bypass) || [])
      .map(c => String(c).trim().toLowerCase())
      .filter(Boolean);
    if (bypass.indexOf(kode) >= 0) {
      this.granted = true;
      this.code = kode;
      return true;
    }

    if (typeof GUESTS !== 'undefined' && Array.isArray(GUESTS)) {
      const ada = GUESTS.some(g => String(g.code).trim().toLowerCase() === kode);
      if (ada) {
        this.granted = true;
        this.code = kode;
        return true;
      }
    }
    return false;
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
    // Tidak ada nama, tanggal, tombol, musik, atau pesan kesalahan yang dimunculkan.
  }
};
