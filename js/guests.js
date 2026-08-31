/* =========================================================================
   DAFTAR UNDANGAN
   Tiap tamu punya kode unik. Link undangannya:  https://situskamu.com/?u=KODE

   Jangan tulis manual satu-satu — buka "undangan.html" di browser, paste
   daftar namanya, lalu salin hasilnya ke sini.

   Kolom:
     code  : kode unik di URL (huruf kecil & angka, tanpa spasi)
     name  : nama yang muncul di undangan ("Bapak Andi & Keluarga")
     seats : jatah kursi, otomatis mengisi pilihan jumlah tamu di form RSVP
     group : pengelompokan buat rekap panitia (Keluarga / Kantor / Teman / dll)
     wa    : (opsional) nomor WhatsApp buat tombol pengingat di admin.html

   PERHATIAN PRIVASI: file ini ikut ter-upload dan bisa dibuka siapa pun lewat
   alamat situskamu.com/js/guests.js. Jangan taruh nomor WA tamu di sini kecuali
   kamu memang tidak keberatan nomornya jadi publik. Generator di undangan.html
   sudah membuang kolom "wa" secara bawaan.
   ========================================================================= */

const GUESTS = [
  { code: 'and1', name: 'Bapak Andi & Keluarga',  seats: 4, group: 'Keluarga' },
  { code: 'rin2', name: 'Rina Kartika',           seats: 2, group: 'Kantor'   },
  { code: 'dew3', name: 'Dewi & Partner',         seats: 2, group: 'Teman'    },
  { code: 'kel4', name: 'Keluarga Besar Wijaya',  seats: 6, group: 'Keluarga' }
];
