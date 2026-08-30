/* =========================================================================
   KONFIGURASI UNDANGAN  —  ini SATU-SATUNYA file yang perlu kamu ubah.
   Semua teks, tanggal, lokasi, foto, dan nomor rekening ada di sini.
   ========================================================================= */

const CONFIG = {
  // ---------- MEMPELAI ----------
  couple: {
    groom: {
      nick: 'Fitrah',
      full: 'Muhammad Fitrah Ramadhan',
      role: 'Putra pertama dari Bapak Suryana & Ibu Halimah',
      ig: 'fitrah'
    },
    bride: {
      nick: 'Nadia',
      full: 'Nadia Ayu Kirana',
      role: 'Putri kedua dari Bapak Hendra & Ibu Sri Wahyuni',
      ig: 'nadia'
    },
    hashtag: '#FitrahNadiaForever'
  },

  // ---------- HARI H (dipakai buat countdown) ----------
  // Format: YYYY-MM-DDTHH:mm:ss+07:00  (WIB = +07:00, WITA = +08:00, WIT = +09:00)
  bigDay: '2026-12-12T08:00:00+07:00',

  // ---------- RANGKAIAN ACARA ----------
  events: [
    {
      id: 'akad',
      name: 'AKAD NIKAH',
      day: 'Sabtu, 12 Desember 2026',
      time: '08.00 - 10.00 WIB',
      place: 'Masjid Agung Al-Hikmah',
      address: 'Jl. Melati Raya No. 21, Bandung, Jawa Barat',
      maps: 'https://maps.google.com/?q=Masjid+Agung+Al+Hikmah+Bandung'
    },
    {
      id: 'resepsi',
      name: 'RESEPSI',
      day: 'Sabtu, 12 Desember 2026',
      time: '11.00 - 15.00 WIB',
      place: 'Balai Kirana Ballroom',
      address: 'Jl. Cendana No. 8, Bandung, Jawa Barat',
      maps: 'https://maps.google.com/?q=Balai+Kirana+Ballroom+Bandung'
    }
  ],

  // ---------- CERITA CINTA ----------
  story: [
    { year: '2018', title: 'Satu Kelas, Beda Dunia',
      text: 'Ketemu pertama kali di kelas Algoritma. Dia duduk di depan, aku di pojok belakang. Nggak ada yang spesial — katanya.' },
    { year: '2020', title: 'Chat Jam 2 Pagi',
      text: 'Skripsi bikin kami sering begadang bareng. Dari tanya rumus, berubah jadi tanya kabar. Lalu tanya kapan pulang.' },
    { year: '2022', title: 'Jadian di Warung Kopi',
      text: 'Tanpa bunga, tanpa balon. Cuma dua gelas kopi dingin dan satu pertanyaan yang akhirnya kejawab: "Mau, nggak?"' },
    { year: '2024', title: 'Ketemu Keluarga',
      text: 'Deg-degan pertama kali sungkem ke orang tuanya. Ternyata yang paling cerewet malah ibu-ibu di dapur.' },
    { year: '2026', title: 'Bilang Iya Seumur Hidup',
      text: 'Dan sekarang, kami mau bilang "iya" sekali lagi — kali ini di depan kalian semua.' }
  ],

  // ---------- GALERI ----------
  // Isi "src" dengan path foto kamu, contoh: 'img/foto1.jpg'
  // Kalau dikosongin, otomatis tampil bingkai placeholder.
  gallery: [
    { src: '', caption: 'Pertama kali jalan berdua' },
    { src: '', caption: 'Trip ke Bromo, 2023' },
    { src: '', caption: 'Lamaran, Maret 2026' },
    { src: '', caption: 'Prewedding di Lembang' },
    { src: '', caption: 'Kopi favorit kami' },
    { src: '', caption: 'Sampai jumpa di hari H' }
  ],

  // ---------- HADIAH / AMPLOP DIGITAL ----------
  gifts: {
    banks: [
      { bank: 'BCA',     number: '1234567890', holder: 'Muhammad Fitrah Ramadhan' },
      { bank: 'MANDIRI', number: '0987654321', holder: 'Nadia Ayu Kirana' },
      { bank: 'DANA',    number: '081234567890', holder: 'Nadia Ayu Kirana' }
    ],
    address: 'Jl. Melati Raya No. 21, RT 03/RW 05, Bandung 40123 (a/n Fitrah, 0812-3456-7890)'
  },

  // ---------- RSVP ----------
  rsvp: {
    // Nomor WhatsApp penerima konfirmasi. Format internasional tanpa "+" dan tanpa "0" di depan.
    whatsapp: '6281234567890',
    // (Opsional) URL Google Apps Script / API buat nyimpen RSVP otomatis. Kosongin kalau nggak pakai.
    endpoint: '',
    deadline: '1 Desember 2026'
  },

  // ---------- QUOTE PEMBUKA ----------
  quote: {
    text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
    source: 'QS. Ar-Rum: 21'
  },

  // ---------- LAIN-LAIN ----------
  music: true,        // musik chiptune otomatis nyala setelah undangan dibuka
  liveStream: ''      // (opsional) link streaming, mis. 'https://youtube.com/live/xxxx'
};
