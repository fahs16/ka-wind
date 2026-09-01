/* =========================================================================
   DAFTAR KODE UNDANGAN (cadangan)

   Undangan ini disetel mengambil nama tamu dari Google Sheet
   (js/config.js -> guests.source: 'sheet'), jadi berkas ini SENGAJA hanya
   berisi kode. Nama, jatah kursi, grup, dan nomor WA tinggal di tab TAMU pada
   Sheet kamu, tidak ikut ter-upload, sehingga tidak bisa dibaca publik.

   Gunanya berkas ini: kalau Google Sheet sedang tidak bisa dihubungi (sinyal
   tamu jelek, kuota harian habis, skrip sedang diperbarui), tamu dengan kode
   yang terdaftar di sini tetap bisa masuk — hanya saja sapaannya jadi umum,
   tanpa nama.

   Isinya dibuat lewat undangan.html: tombol "Unduh js/guests.js".
   Kalau ingin kembali ke cara lama (nama disimpan di berkas ini dan ikut
   terbaca publik), ganti guests.source jadi 'lokal' di js/config.js.
   ========================================================================= */

const GUESTS = [
  { code: 'and1' },
  { code: 'rin2' },
  { code: 'dew3' },
  { code: 'kel4' }
];
