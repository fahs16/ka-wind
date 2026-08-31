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
    // URL Web App Google Apps Script buat nyimpen RSVP ke Google Sheet.
    // Cara bikinnya ada di server/apps-script.gs + README. Kosongin kalau belum siap.
    endpoint: '',
    deadline: '1 Desember 2026'
  },

  // ---------- REALTIME / MULTIPLAYER (opsional) ----------
  // provider: 'off'      -> mati, undangan jalan sendiri seperti biasa
  //           'local'    -> mode uji coba antar-tab di satu perangkat (tanpa akun apa pun)
  //           'supabase' -> beneran online, isi url + key dari dashboard Supabase
  net: {
    provider: 'off',
    url: '',                 // contoh: 'https://xxxxxxxx.supabase.co'
    key: '',                 // anon public key (aman ditaruh di sini, bukan service_role)
    room: 'taman-utama',     // ganti kalau mau ruangan terpisah
    maxPeers: 40,            // batas karakter tamu lain yang digambar sekaligus
    sendMs: 140,             // jeda minimal kirim posisi (naikkan kalau mau lebih hemat kuota)
    chat: {
      enabled: true,
      maxLen: 60,
      cooldownMs: 2500,      // jeda minimal antar pesan
      blocklist: []          // tambahan kata yang mau disensor, huruf kecil semua
    }
  },

  // ---------- QUOTE PEMBUKA ----------
  quote: {
    text: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
    source: 'QS. Ar-Rum: 21'
  },

  // ---------- TEMPAT FAVORIT (bonus, bukan bagian dari 8 titik misi) ----------
  // Tiga warung kesukaan kalian. Ganti nama & obrolannya sesuka hati.
  spots: {
    kopi: {
      name: 'Kopi Ukut',
      sign: 'KOPI UKUT',
      lines: [
        'Selamat datang di Kopi Ukut. Menu andalan: Kopi Susu Tetangga Sebelah.',
        'Konon hubungan ini berawal dari dua gelas kopi dingin yang kelamaan didiemin karena keasyikan ngobrol.',
        'Jadi ya... kopi punya andil besar di undangan yang lagi kamu buka ini.'
      ],
      action: 'Pesan kopi susu',
      reply: 'Satu kopi susu, gula normal, es jangan banyak-banyak. Gratis, ini kan undangan.'
    },
    refo: {
      name: 'Refo Coffee',
      sign: 'REFO',
      lines: [
        'Refo Coffee: markas WFC kami. Wifi kencang, colokan banyak, deadline tetap mepet.',
        'Meja pojok dekat jendela itu tempat favorit. Dia serius ngerjain revisi, aku pura-pura sibuk padahal cuma ngelihatin dia.',
        'Setengah dari rencana pernikahan ini disusun di meja itu, di antara dua laptop dan satu stopkontak rebutan.'
      ],
      action: 'Numpang wifi',
      reply: 'Password wifinya: kitanikahdulu. Huruf kecil semua, jangan disebar ke sebelah.'
    },
    bebek: {
      name: 'Nasi Bebek Cak Bagas',
      sign: 'NASI BEBEK',
      lines: [
        'Nasi Bebek Cak Bagas. Sambal koreknya level jujur, bukan level sok kuat.',
        'Di sinilah hampir semua perdebatan kami selesai. Susah lanjut berantem kalau dua-duanya lagi kepedesan.',
        'Kalau nanti di resepsi kamu lihat kami senyum-senyum sendiri pas lihat menu, ya karena ini.'
      ],
      action: 'Makan dulu',
      reply: 'Nasi bebek satu, sambal dipisah biar aman. Nambah nasi? Hari ini gratis.'
    }
  },

  // ---------- POJOKAN RAHASIA ----------
  // Tersembunyi di sudut peta, tidak ditandai. Hadiah buat tamu yang benar-benar keliling.
  secret: {
    name: 'Pohon Harapan',
    // Kode yang ditunjukkan tamu ke kalian di hari H. Ganti sesuka hati.
    code: 'KOPI-BEBEK-2026',
    lines: [
      'Eh... kamu nemu tempat ini? Serius? Nggak banyak yang jalan sampai pojokan sini.',
      'Ini tempat duduk-duduk kami waktu semuanya lagi berat: tabungan mepet, gedung penuh, keluarga banyak maunya.',
      'Setiap kali bingung, kami ke sini, diem-dieman sebentar, terus pulang dengan keputusan yang sama: lanjut.',
      'Karena kamu mau repot-repot keliling sampai ketemu, ini ada sesuatu buat kamu.'
    ],
    reward: 'Tunjukkan kode ini ke kami waktu salaman di hari H. Ada kejutan kecil, dan kami bakal tahu kamu benar-benar main sampai habis.'
  },

  // ---------- LAIN-LAIN ----------
  music: true,        // musik chiptune otomatis nyala setelah undangan dibuka
  liveStream: ''      // (opsional) link streaming, mis. 'https://youtube.com/live/xxxx'
};
