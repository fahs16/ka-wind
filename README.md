# Undangan Pernikahan — Pixel Adventure 🎮💍

Undangan pernikahan berbentuk **game petualangan 2D pixel-art**. Tamu tidak sekadar
men-scroll halaman: mereka menggerakkan karakter keliling taman, lalu menemukan sendiri
info akad, resepsi, galeri, cerita, amplop digital, dan form RSVP di 8 titik berbeda.

Dibangun 100% dengan **HTML + CSS + JavaScript murni**. Tanpa framework, tanpa build step,
tanpa satu pun file gambar atau audio — semua sprite digambar lewat kode dan musiknya
di-generate Web Audio secara real-time. Total ukuran < 100 KB.

---

## Cara menjalankan

Karena ini web statis biasa:

```bash
# cara paling gampang
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Bisa juga langsung klik dua kali `index.html` (semua fitur jalan kecuali font Google
yang butuh internet).

---

## Yang perlu kamu ubah: `js/config.js`

Cuma **satu file**. Semua teks, tanggal, lokasi, foto, dan rekening ada di sana:

| Bagian | Isinya |
|---|---|
| `couple` | Nama panggilan, nama lengkap, nama orang tua, tagar |
| `bigDay` | Tanggal & jam hari H (dipakai hitung mundur + file kalender) |
| `events` | Detail akad & resepsi + link Google Maps |
| `story` | Timeline cerita, muncul sebagai dialog di papan cerita |
| `gallery` | Daftar foto (`src` + caption) |
| `gifts` | Rekening bank / e-wallet + alamat kirim kado |
| `rsvp` | Nomor WhatsApp penerima konfirmasi + deadline |
| `quote` | Ayat/kutipan pembuka |

### Menambahkan foto

1. Buat folder `img/`, taruh foto di situ (disarankan potong jadi kotak, maks ~800px).
2. Isi `src` di `config.js`:

```js
gallery: [
  { src: 'img/foto1.jpg', caption: 'Pertama kali jalan berdua' },
  ...
]
```

Kalau `src` dikosongkan, otomatis tampil bingkai placeholder — jadi undangan tetap
bisa dipakai walau fotonya belum siap.

### Link personal per tamu

Tambahkan `?to=` di belakang URL:

```
https://situskamu.com/?to=Bapak%20Andi%20%26%20Keluarga
```

Nama itu muncul di layar pembuka, di sapaan gerbang, dan otomatis mengisi form RSVP.
(`%20` = spasi, `%26` = tanda &.)

---

## RSVP

Secara default RSVP tersimpan di perangkat tamu lalu dikirim lewat **WhatsApp** ke nomor
di `config.rsvp.whatsapp` (format internasional tanpa `+` dan tanpa `0` di depan,
contoh: `6281234567890`).

Kalau mau otomatis masuk **Google Sheet**, isi `config.rsvp.endpoint` dengan URL Apps Script:

1. Buat Google Sheet baru → menu **Extensions › Apps Script**.
2. Tempel kode ini:

```js
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.nama, d.hadir, d.jumlah, d.pesan]);
  return ContentService.createTextOutput('ok');
}
```

3. **Deploy › New deployment › Web app**, akses: *Anyone*. Salin URL-nya ke
   `config.rsvp.endpoint`.

---

## Cara publikasi (gratis)

**GitHub Pages** — Settings › Pages › Source: branch `main`, folder `/ (root)`.
**Netlify / Vercel / Cloudflare Pages** — drag & drop foldernya, tanpa konfigurasi apa pun.

---

## Kontrol

| Aksi | Desktop | HP |
|---|---|---|
| Jalan | Panah / WASD | Stik di kiri bawah |
| Interaksi | `E`, `Spasi`, `Enter` | Tombol `A` |
| Tutup panel | `Esc` | Tombol `×` |
| Musik on/off | `M` | Tombol ♪ di pojok kanan atas |

Tamu harus menemukan **8 titik** (bertanda `!`). Titik yang sudah dikunjungi berubah jadi
hati, progresnya disimpan di browser, dan setelah lengkap muncul pesan penutup + kembang api.
Penunjuk arah kecil di tepi layar mengarah ke 3 titik terdekat yang belum dikunjungi.

---

## Struktur file

```
index.html          kerangka halaman + layar pembuka
css/style.css       tampilan semua panel, HUD, kontrol sentuh
js/config.js        ← SEMUA DATA UNDANGAN ADA DI SINI
js/utils.js         helper (pixel, hash, hitung mundur)
js/font.js          font bitmap 3x5 untuk papan nama di dalam game
js/sprites.js       sprite karakter (tamu, mempelai) dari ASCII art
js/world.js         peta tile, daftar bangunan, tabrakan
js/paint.js         gambar tiap bangunan & dekorasi
js/audio.js         musik chiptune + efek suara (Web Audio)
js/dialogue.js      kotak dialog ala RPG
js/ui.js            panel besar & notifikasi
js/content.js       isi panel (acara, galeri, kado, RSVP, kalender)
js/game.js          loop game, kamera, input, misi, ending
```

### Menggeser atau menambah titik di peta

Semua bangunan didaftarkan di `World.buildObjects()` (`js/world.js`). Koordinat pakai
satuan tile lewat helper `T(n)` (1 tile = 16 px):

```js
this.add({
  id: 'kado', label: 'Kotak Kado', quest: true,
  x: T(43), y: T(23), w: T(3), h: T(3), base: T(26),
  solid: [{ x: T(43), y: T(25), w: T(3), h: T(1) }],  // area yang tidak bisa ditembus
  hot:    { x: T(43), y: T(26), w: T(3), h: T(2) },   // area berdiri untuk menekan E
  draw: (g, o, t) => Paint.giftBox(g, o, t)
});
```

Lalu daftarkan aksinya di objek `Actions` (`js/game.js`). Kalau `quest: true`, titik itu
ikut dihitung di progres 8 titik (ubah daftarnya di `QUEST_IDS`).

---

## Dukungan

Chrome, Safari (iOS 14+), Firefox, Edge. Layar sentuh & mouse/keyboard. Font Google
(Press Start 2P & VT323) otomatis fallback ke monospace kalau offline.
