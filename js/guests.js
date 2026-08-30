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
     wa    : (opsional) nomor WhatsApp buat kirim undangan & tagih RSVP
   ========================================================================= */

const GUESTS = [
  { code: 'and1', name: 'Bapak Andi & Keluarga',   seats: 4, group: 'Keluarga', wa: '6281200000001' },
  { code: 'rin2', name: 'Rina Kartika',            seats: 2, group: 'Kantor',   wa: '6281200000002' },
  { code: 'dew3', name: 'Dewi & Partner',          seats: 2, group: 'Teman',    wa: '' },
  { code: 'kel4', name: 'Keluarga Besar Wijaya',   seats: 6, group: 'Keluarga', wa: '' }
];
