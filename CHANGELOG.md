# Riwayat Versi

Dipakai untuk menandai titik aman kalau perlu kembali ke versi sebelumnya.

Cara paling cepat kembali ke versi lama: buka **Netlify → Deploys**, cari deploy
yang mau dipakai, klik **Publish deploy**. Situs langsung kembali ke versi itu
tanpa menyentuh repositori sama sekali.

Kalau mau kembali lewat git:

```bash
git revert -m 1 <commit-merge>   # membatalkan satu merge, riwayat tetap utuh
git push origin main
```

---

## v1.6.0 — commit `70e84c4`

Versi sederhana jadi terasa seperti undangan pernikahan, plus lagu baru.

- **Tampilan `simple.html` dirombak.** Sebelumnya cuma halaman teks rapi tanpa
  suasana. Sekarang amplop tertutup dulu — bingkai emas, monogram inisial
  mempelai, sapaan nama tamu — lalu isinya terbuka lewat tombol
  "Buka Undangan". Bagian barunya: salam pembuka, blok mempelai lengkap dengan
  nama orang tua, dan salam penutup. Antar bagian dipisah ornamen dedaunan,
  ada kelopak jatuh pelan di latar (mati sendiri kalau perangkat disetel hemat
  gerak), dan hurufnya tetap besar seperti sebelumnya.
- **Halamannya ganti nama jadi `simple.html`** (dulu `mudah.html`), begitu juga
  `css/simple.css` dan `js/simple.js`. Parameternya `?simple=1`; `?mudah=1`
  tetap dilayani supaya link yang terlanjur tersebar tidak mati.
- **Lagu baru: "Romansa"** — balada 8-bit orisinal, F mayor, 72 BPM, 16 birama,
  tiga jalur (melodi square, arpeggio, bas triangle). Dipakai di versi
  sederhana; menyala saat tamu menekan "Buka Undangan" dan bisa dimatikan lewat
  tombol di pojok kanan bawah.
- Mesin musiknya dirapikan supaya bisa memuat lebih dari satu lagu. Lagu game
  yang lama tetap sama persis, sekarang bernama "taman". Pilih lagu tiap versi
  lewat `config.lagu`.
- `tools/render-lagu.js`: ubah lagu chiptune jadi berkas WAV, buat ditempel di
  story atau video save-the-date. Situsnya sendiri tetap nol berkas audio.
- Kalimat salam pembuka/penutup diatur di `config.salam`, bisa diganti atau
  dikosongkan.

## v1.5.0 — commit `9a0e25d`

Versi sederhana untuk tamu yang tidak main game, plus dua perbaikan rasa pakai.

- **`mudah.html`**: undangan versi satu halaman gulir — huruf besar, tombol besar,
  tanpa kontrol, tanpa suara. Isinya dari `js/config.js` yang sama, jadi cukup
  mengubah satu file untuk dua versi. Gerbang akses `?u=KODE` tetap berlaku.
- Tamu bisa pindah versi dua arah: tautan di layar pembuka versi game, tombol
  "Coba Versi Game" di bawah halaman sederhana, dan link langsung
  `?u=KODE&mudah=1`. Kode tamu ikut terbawa jadi tidak ditanya ulang.
- `undangan.html` dapat kode template `{linkmudah}` dan centangan untuk membuat
  seluruh daftar langsung mengarah ke versi sederhana.
- Kolom chat tidak lagi tertutup keyboard HP. Posisi bilah chat dan panel isian
  sekarang mengikuti tinggi keyboard, jadi kolomnya langsung kelihatan begitu
  ikon chat ditekan tanpa perlu mengetik dulu.
- Radius interaksi dirapikan. Sebelumnya dihitung dari satu kotak pembungkus
  seluruh objek, jadi berdiri di bawah pohon satu-dua petak di belakang gedung
  sudah memunculkan prompt. Sekarang dihitung per bagian: petak sambutan di
  depan objek menjangkau sekitar satu petak, badan objek cukup disenggol.
  Terukur turun dari 69 jadi 7 titik pohon yang ikut memicu prompt, tanpa ada
  objek yang jadi sulit dijangkau.
- Papan petunjuk digeser sepetak dari pilar gerbang; petak sambutannya dulu
  menindih pilar sehingga keduanya saling rebutan prompt.

## v1.4.0 — commit `1f8ac98`

Nyaman dibuka dari HP: kamera dimundurkan dan mode mendatar dirapikan.

- Kamera tidak lagi menempel ke pemain. Di HP tegak yang terlihat naik dari
  sekitar 8x17 petak jadi 12x26 petak, jadi jalan dan bangunan berikutnya
  kelihatan tanpa harus jalan dulu. Layar desktop tidak berubah.
- `CONFIG.view.zoom` untuk menggeser selera jarak kamera (1 = bawaan,
  di atas 1 lebih dekat, di bawah 1 lebih jauh).
- Ajakan "USE LANDSCAPE MODE FOR BEST EXPERIENCE" muncul sekali di HP yang
  masih tegak, lengkap dengan tombol untuk memutar layar otomatis (Android)
  dan tombol untuk melewatinya. Bisa dimatikan lewat
  `CONFIG.view.sarankanLandscape`.
- Mode mendatar dirapikan: stik, tombol A, HUD, kotak dialog, dan panel besar
  diperkecil supaya tidak menutupi peta, dan semuanya ikut menghindari poni
  atau kamera layar.
- Notifikasi kecil tidak lagi menimpa teks panel yang sedang terbuka.

## v1.3.0 — commit `e04d9e9`

Daftar tamu pindah ke Google Sheet, supaya namanya tidak ikut ter-publish.

- Tab `TAMU` baru di Sheet berisi kode, nama, jatah kursi, grup, dan nomor WA.
- Browser tamu hanya menanyakan satu kode dan server hanya menjawab satu tamu
  itu; daftar lengkap tidak pernah keluar dari Sheet, dan nomor WA tidak pernah
  dikirim ke browser.
- `js/guests.js` kini cukup berisi kode saja, sebagai cadangan kalau Sheet
  sedang tidak bisa dihubungi. Kode yang dikenal daftar cadangan langsung
  diloloskan tanpa menunggu jaringan (terukur 27 ms), namanya menyusul begitu
  jawaban Sheet tiba.
- Halaman rekap panitia menarik daftar tamu langsung dari Sheet lewat token.
- Generator menambah tombol "Salin untuk Google Sheet" yang menghasilkan baris
  siap tempel ke tab `TAMU`.
- Layar sengaja kosong selama identitas diperiksa, jadi tidak ada nama atau
  detail acara yang sempat terlihat pengunjung tanpa undangan.

## v1.2.0 — commit `f0d6aba`

Undangan dikunci untuk tamu terundang.

- Mode privat: hanya link `?u=KODE` yang terdaftar bisa membuka undangan;
  selain itu yang muncul cuma gambar gerbang terkunci tanpa teks apa pun.
- Gerbang sisi server untuk Netlify (`netlify/edge-functions/gate.js`): tanpa
  kode sah, berkas `js/`, `css/`, gambar preview, dan halaman panitia dibalas
  404 — bukan sekadar disembunyikan.
- Buku tamu Google Sheet dan multiplayer Supabase disambungkan.
- Perbaikan: tombol W/A/S/D dan spasi tidak lagi tertelan permainan saat tamu
  mengetik di formulir RSVP.
- Header cache agar perbaikan langsung terlihat tamu.

## v1.1.0 — commit `11b4c05`

- Tombol tutup di setiap percakapan.
- Interaksi bisa dari segala arah dalam radius tertentu, bukan satu titik berdiri.
- Pojokan rahasia berhadiah di sudut peta, tanpa penanda.
- Tiga warung favorit: Kopi Ukut, Refo Coffee, Nasi Bebek.

## v1.0.0 — commit `09fabc2`

- Undangan berbentuk game petualangan pixel-art dengan 8 titik misi.
- Multiplayer realtime, emote, dan chat singkat.
- RSVP ke Google Sheet, daftar undangan personal, halaman rekap panitia.
- Panduan deploy dan kartu preview WhatsApp.
