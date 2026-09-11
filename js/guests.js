/* =========================================================================
   DAFTAR KODE UNDANGAN (cadangan)

   Undangan ini disetel mengambil daftar tamu dari basis data
   (js/config.js -> guests.source: 'db'), jadi berkas ini SENGAJA KOSONG.

   Semua nama, jatah kursi, grup, dan nomor WA tinggal di tabel `tamu` di
   Supabase. Tabelnya terkunci: browser tamu cuma boleh memanggil satu fungsi,
   cek_tamu(kode), yang jawabannya satu baris saja dan tanpa nomor WA. Tidak
   ada cara mengunduh daftarnya, dan tidak ada berkas di situs ini yang
   memuatnya — termasuk berkas yang sedang kamu baca.

   Isi berkas ini kalau, dan hanya kalau, kamu memilih guests.source: 'lokal'
   di js/config.js. Perlu diingat, mode itu membuat seluruh isi berkas ini bisa
   dibaca siapa pun lewat situskamu.com/js/guests.js.
   ========================================================================= */

const GUESTS = [];
