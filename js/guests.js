/* =========================================================================
   DAFTAR TAMU CADANGAN — sengaja dibiarkan KOSONG.

   Daftar tamu yang sebenarnya tinggal di luar situs ini: di tab TAMU pada
   Google Sheet kamu, atau di tabel `tamu` di Supabase (lihat guests.source
   di js/config.js). Keduanya cuma mau menjawab satu pertanyaan dari browser
   tamu — "siapa pemilik kode ini?" — dan cuma menjawab satu tamu itu, tanpa
   nomor WA.

   Berkas ini ikut ter-upload dan bisa dibuka siapa pun lewat
   situskamu.com/js/guests.js, jadi apa pun yang ditaruh di sini jadi
   konsumsi publik. Karena itu dibiarkan kosong.

   Dulu berkas ini dipakai sebagai cadangan kalau server sedang mati. Sekarang
   urusan itu ditangani access.saatServerMati di js/config.js, yang
   mempersilakan tamu masuk dengan sapaan umum tanpa membocorkan satu nama pun.

   Isi berkas ini kalau, dan hanya kalau, kamu memilih guests.source: 'lokal'.
   ========================================================================= */

const GUESTS = [];
