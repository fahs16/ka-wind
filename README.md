# Undangan Pernikahan — Pixel Adventure 🎮💍

Undangan pernikahan berbentuk **game petualangan 2D pixel-art**. Tamu tidak sekadar
men-scroll halaman: mereka menggerakkan karakter keliling taman, lalu menemukan sendiri
info akad, resepsi, galeri, cerita, amplop digital, dan form RSVP di 8 titik berbeda.

Dibangun 100% dengan **HTML + CSS + JavaScript murni**. Tanpa framework, tanpa build step,
tanpa satu pun file gambar atau audio — semua sprite digambar lewat kode dan musiknya
di-generate Web Audio secara real-time.

Tiga fitur tambahan yang sifatnya opsional dan bisa dinyalakan satu-satu:

| Fitur | Butuh apa | Kalau tidak dipakai |
|---|---|---|
| Link undangan personal per tamu | tidak butuh apa-apa | undangan tetap jalan dengan sapaan umum |
| Rekap kehadiran di Google Sheet | Google Sheet + Apps Script | RSVP dikirim lewat WhatsApp seperti biasa |
| Tamu saling terlihat & chat | akun Supabase (gratis) | undangan jalan mode sendirian |

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
| `spots` | Tiga warung favorit (Kopi Ukut, Refo Coffee, Nasi Bebek) + obrolannya |
| `secret` | Isi pojokan rahasia & kode hadiah yang ditunjukkan tamu di hari H |
| `access` | Kunci undangan: hanya link personal `?u=KODE` yang bisa membuka |

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

## Di mana daftar tamu disimpan

Ada dua pilihan, diatur di `js/config.js`:

```js
guests: {
  source: 'sheet',   // 'sheet' (bawaan) atau 'lokal'
  endpoint: ''       // kosong = ikut rsvp.endpoint
}
```

**`'sheet'` — nama tamu tidak ikut ter-publish (disarankan).** Daftar tinggal di tab
`TAMU` pada Google Sheet kamu. Saat tamu membuka `?u=and1`, browsernya cuma bertanya
*"siapa pemilik kode and1?"* dan server cuma menjawab satu tamu itu — nama, jatah kursi,
dan grupnya. Daftar lengkapnya tidak pernah keluar dari Sheet, dan nomor WA tidak pernah
dikirim ke browser sama sekali.

`js/guests.js` tetap ada tapi **hanya berisi kode**, tanpa nama. Gunanya sebagai cadangan:
kalau Sheet sedang tidak bisa dihubungi, tamu tetap bisa masuk — hanya sapaannya jadi umum.
Jadi Sheet yang ngadat tidak pernah mengunci tamu di luar pintu.

**`'lokal'` — cara lama.** Semua nama ada di `js/guests.js`. Praktis dan tanpa
ketergantungan jaringan, tapi siapa pun bisa membuka `situskamu.com/js/guests.js` dan
membaca seluruh daftar tamu.

### Mengisi tab TAMU

1. Jalankan `initSheet()` sekali di Apps Script — tab `TAMU` otomatis dibuat dengan
   kolom `Kode | Nama | Kursi | Grup | WA`.
2. Buka `undangan.html`, susun daftarnya, klik **Salin untuk Google Sheet**.
3. Tempel di tab `TAMU` mulai baris ke-2. Kolomnya langsung pas.
4. Klik **Unduh js/guests.js** (isinya kode saja) dan unggah ulang situsnya.

Halaman rekap `admin.html` otomatis menarik daftar tamu dari Sheet untuk tabel
"belum menjawab", jadi tidak perlu daftar terpisah lagi.

---

## Daftar undangan & link personal

Buka **`undangan.html`** di browser (halaman ini buat kamu, bukan buat tamu).

1. Isi alamat website undangan.
2. Paste daftar tamu, satu baris satu tamu:
   `Nama | jumlah kursi | grup | nomor WA` — kolom setelah nama boleh dikosongkan.
3. Klik **Buat Link**. Keluar tabel berisi link personal tiap tamu
   (`https://situskamu.com/?u=and1`), tombol salin link, teks WhatsApp siap kirim,
   dan tombol kirim WA langsung.
4. Klik **Unduh js/guests.js**, timpa file `js/guests.js` di repo, lalu unggah ulang situsnya.

Efek link personal di dalam undangan: nama tamu muncul di layar pembuka & sapaan gerbang,
form RSVP terisi otomatis, dan pilihan jumlah tamu dibatasi sesuai jatah kursinya.
Kode tamu juga ikut tercatat di database, jadi rekapnya rapi walau ada dua orang bernama sama.

Kalau ada tamu di luar daftar, link bebas `?to=Nama%20Tamu` tetap jalan seperti biasa.

---

## Mengunci undangan: hanya tamu yang diundang

Di `js/config.js`:

```js
access: {
  private: true,                        // false = siapa pun yang punya link bisa buka
  bypass: ['fitrahnadia-panitia'],      // kode cadangan buat kalian & panitia
  image: 'img/closed.png'               // yang dilihat pengunjung tanpa undangan
}
```

Saat `private: true`, undangan hanya terbuka lewat `?u=KODE` yang kodenya terdaftar di
`js/guests.js` (atau ada di daftar `bypass`). Selain itu yang muncul cuma satu gambar gerbang
terkunci &mdash; tanpa nama, tanggal, lokasi, tombol, atau musik. Link bebas `?to=NamaTamu`
otomatis tidak berlaku selama mode ini aktif.

> **Wajib:** buat daftar tamu asli lewat `undangan.html` dan unggah `js/guests.js`-nya
> **sebelum** menyalakan mode ini. Kalau tidak, yang bisa masuk cuma kode contoh bawaan.

### Kenapa berkas js/ bisa dibuka publik?

Karena ini situs statis: **semua yang dibutuhkan browser harus bisa diunduh browser**, dan
browser itu ada di perangkat tamu. `js/config.js` dan `js/guests.js` dibaca oleh halaman, jadi
siapa pun bisa mengetik `situskamu.com/js/guests.js` dan membacanya langsung. Ini berlaku untuk
semua situs statis, bukan cuma yang ini.

Artinya `js/access.js` yang berjalan di browser hanya **menyaring tampilan**, bukan mengunci
berkas. Untuk mengunci sungguhan, penjaganya harus berada di server, sebelum berkas dikirim.

### Kunci sungguhan di Netlify (disarankan)

`netlify/edge-functions/gate.js` melakukan itu: berjalan di server Netlify pada setiap
permintaan, sebelum berkas apa pun keluar. Tanpa kode yang sah, `js/`, `css/`, `img/preview.png`,
dan ketiga halaman panitia dijawab 404 — bukan sekadar disembunyikan.

Cara menyalakan, di **Netlify → Site configuration → Environment variables**:

| Variabel | Isi | Untuk |
|---|---|---|
| `GUEST_CODES` | `and1,rin2,dew3,...` | daftar kode tamu, dipisah koma |
| `ADMIN_CODE` | kata sandi panjang buatanmu | membuka `undangan.html`, `admin.html`, `preview.html` |

Lalu **Deploys → Trigger deploy**. Setelah aktif:

- Tamu membuka `situskamu.com/?u=and1` → kode disimpan sebagai cookie, seluruh isi undangan
  terbuka normal untuk dia.
- Kalian membuka `situskamu.com/admin.html?admin=KODE_ADMIN` sekali, lalu cookie-nya
  menempel sampai enam bulan.
- Pengunjung lain: halaman apa pun dibalas gambar gerbang terkunci, berkas apa pun dibalas 404.

**Selama `GUEST_CODES` masih kosong, gerbang ini sengaja dibiarkan terbuka** supaya salah
konfigurasi tidak mengunci kalian sendiri di hari H. Cek statusnya:

```bash
curl -I https://situskamu.netlify.app/ | grep x-undangan-gate
# on       -> gerbang aktif
# disabled -> GUEST_CODES belum diisi, situs masih terbuka
```

Daftar kode tinggal di variabel Netlify, **bukan** di dalam repo, jadi tidak ikut ter-publish.

### Kalau pindah ke hosting sendiri

Edge Function ini khusus Netlify. Di hosting biasa (Apache/nginx + PHP), logikanya sama:
periksa kode di query atau cookie, kalau tidak cocok kirim gambar gerbang dan 404 untuk berkas
lain. Yang penting pemeriksaannya di server, bukan di browser.

Kalau tidak mau repot, cara paling sederhana tetap ampuh: **jangan unggah** `undangan.html`,
`admin.html`, dan `preview.html` ke hosting — jalankan bertiga dari laptop saja
(`python3 -m http.server 8000`).

---

## Database kehadiran (Google Sheet)

RSVP masuk ke Google Sheet milikmu sendiri lewat Apps Script. Gratis, tanpa server.

1. Buat Google Sheet baru → menu **Extensions › Apps Script**.
2. Hapus isi `Code.gs`, tempel seluruh isi **`server/apps-script.gs`** dari repo ini.
3. Ganti `ADMIN_TOKEN` dengan kata sandi panjang buatanmu.
4. Jalankan fungsi `initSheet()` sekali (pilih di dropdown lalu **Run**), izinkan aksesnya.
5. **Deploy › New deployment › Web app** — *Execute as:* **Me**, *Who has access:* **Anyone**.
   Salin URL yang berakhiran `/exec`.
6. Tempel URL itu ke `js/config.js` → `rsvp.endpoint`.

Satu tamu = satu baris. Kalau dia mengisi ulang, baris lamanya diperbarui (kolom `Revisi` bertambah),
jadi tidak ada data dobel. Kalau koneksi ke Sheet gagal, jawabannya tetap tersimpan di HP tamu
dan undangan otomatis menawarkan tombol kirim lewat WhatsApp.

**`ADMIN_TOKEN` jangan pernah ditulis di `js/config.js`** — file itu terbuka untuk semua tamu.
Token hanya diketik saat membuka halaman admin.

### Halaman rekap panitia

Buka **`admin.html`**, isi URL Apps Script + token, klik **Muat Data**:

- ringkasan: berapa undangan hadir, perkiraan jumlah orang, ragu, berhalangan;
- tabel semua jawaban + ucapan, bisa dicari;
- **Unduh CSV** buat dicetak atau dibagi ke panitia;
- daftar **siapa yang belum menjawab** (dicocokkan dengan `js/guests.js`),
  lengkap dengan tombol "Ingatkan via WA".

Token disimpan di `localStorage` browser kamu, tidak ikut masuk repo. Siapa pun yang
pegang token bisa membaca seluruh daftar tamu — jangan disebar di grup. Kalau mau lebih aman,
hapus `admin.html` & `undangan.html` sebelum diunggah, dan pakai keduanya dari komputermu saja.

---

## Multiplayer: tamu saling kelihatan (opsional)

Kalau dinyalakan, tamu yang membuka undangan di waktu yang sama akan saling melihat:
karakter tamu lain jalan-jalan di peta yang sama, ada nama di atas kepala, jumlah tamu
online di HUD, emote (❤ 👋 🎉 👏), dan chat singkat berbentuk balon di atas kepala.

### Coba dulu tanpa daftar akun

Tambahkan `?net=local` di URL, lalu buka dua tab di perangkat yang sama:

```
http://localhost:8000/?net=local&to=Andi
http://localhost:8000/?net=local&to=Rina
```

Mode ini memakai `BroadcastChannel`, jadi hanya nyambung antar-tab di satu perangkat —
cukup buat lihat rasanya sebelum memutuskan.

### Nyalakan beneran (Supabase, gratis)

1. Daftar di [supabase.com](https://supabase.com), buat project baru.
2. Masuk **Project Settings › API**, salin **Project URL** dan **anon public key**.
3. Isi di `js/config.js`:

```js
net: {
  provider: 'supabase',
  url: 'https://xxxxxxxx.supabase.co',
  key: 'eyJhbGciOi...',        // anon public key
  room: 'taman-utama'
}
```

Tidak perlu bikin tabel apa pun — fitur ini cuma memakai **Realtime broadcast + presence**,
tidak menyimpan data sama sekali. Chat bersifat sementara: lewat beberapa detik, hilang,
dan tidak tersimpan di mana pun.

> **anon public key** memang dirancang untuk ditaruh di kode yang dilihat publik.
> Yang tidak boleh ditaruh di sini adalah **service_role key**.

### Soal kuota & keramaian

Free tier Supabase: 200 koneksi bersamaan dan 2 juta pesan realtime per bulan. Tiap pesan
posisi disebar ke semua orang yang sedang online, jadi makin ramai makin cepat kuotanya
terpakai. Yang sudah dipasang untuk menghemat:

- posisi hanya dikirim kalau karakternya benar-benar bergerak (diam = 1 pesan tiap 3 detik);
- jeda kirim otomatis melar mengikuti jumlah tamu online (140 ms saat sepi → 1 detik saat ramai);
- atur sendiri lewat `net.sendMs` di config kalau mau lebih hemat lagi.

Kalau kuota habis atau koneksinya gagal, undangan **tidak rusak** — otomatis balik ke mode
sendirian dan semua fitur lain tetap jalan. Kalau blast undangan ke ratusan orang sekaligus,
paling aman: matikan dulu (`provider: 'off'`), atau naikkan `sendMs` ke 400–600.

### Soal chat

Chat lewat dari beberapa lapis pengaman: panjang maksimal 60 karakter, jeda 2,5 detik antar
pesan, maksimal 3 pesan per 10 detik, tautan & nomor telepon panjang dibuang otomatis, plus
filter kata kasar (termasuk versi angka seperti `g0bl0k`). Tambah daftar katamu sendiri di
`net.chat.blocklist`, atau matikan chat sepenuhnya dengan `net.chat.enabled: false`
(emote tetap jalan).

Jujur saja: penyaringan ini jalan di sisi browser, jadi orang yang benar-benar niat iseng
masih mungkin menembusnya. Kalau undangan disebar sangat luas dan kamu tidak mau ambil
risiko, pakai emote saja.

---

## Versi & cara kembali ke versi lama

Setiap perubahan yang masuk `main` dicatat di [CHANGELOG.md](CHANGELOG.md) beserta
nomor versi dan commit-nya. Berkas `VERSION` berisi versi yang sedang aktif.

Kalau ada yang rusak setelah pembaruan, jalan tercepat adalah **Netlify → Deploys →
pilih deploy sebelumnya → Publish deploy**. Situs langsung kembali dalam hitungan detik.

---

## Cara publikasi (gratis)

Panduan lengkapnya ada di **[DEPLOY.md](DEPLOY.md)** — dari mengisi data, memilih hosting,
memasang Google Sheet & Supabase, sampai daftar uji sebelum undangannya disebar.

Versi singkatnya:

**GitHub Pages** — merge ke `main`, lalu Settings › Pages › Source: *Deploy from a branch*,
branch `main`, folder `/ (root)`. Hasilnya `https://<user>.github.io/ka-wind/`.
**Netlify / Cloudflare Pages** — seret foldernya ke [app.netlify.com/drop](https://app.netlify.com/drop),
atau connect repo dengan build command kosong dan output directory `.`

---

## Kontrol

| Aksi | Desktop | HP |
|---|---|---|
| Jalan | Panah / WASD | Stik di kiri bawah |
| Interaksi | `E`, `Spasi`, `Enter` | Tombol `A` |
| Tutup percakapan | `Esc` atau tombol `×` di kotak dialog | Tombol `×` |
| Tutup panel | `Esc` | Tombol `×` |
| Musik on/off | `M` | Tombol ♪ di pojok kanan atas |
| Kirim emote | `1` `2` `3` `4` | Tombol ❤ 👋 🎉 👏 |
| Tulis chat | `T` | Tombol 💬 |

(Dua baris terakhir hanya muncul kalau mode realtime dinyalakan.)

Tamu harus menemukan **8 titik** (bertanda `!`). Titik yang sudah dikunjungi berubah jadi
hati, progresnya disimpan di browser, dan setelah lengkap muncul pesan penutup + kembang api.
Penunjuk arah kecil di tepi layar mengarah ke 3 titik terdekat yang belum dikunjungi.

Objek bisa didekati **dari sisi mana pun** — kanan, kiri, depan, atau belakang — selama masih
dalam radius sekitar satu setengah petak. Tidak ada titik berdiri khusus yang harus dicari.

### Bonus yang tidak ditandai di peta

- **Tiga warung favorit**: Kopi Ukut, Refo Coffee, dan Nasi Bebek. Muncul sebagai kedai biasa
  tanpa tanda `!`. Begitu satu ditemukan, penghitung ☕ muncul di HUD. Isinya diatur di
  `config.spots` — ganti jadi tempat nongkrong kalian sendiri.
- **Pojokan rahasia** di sudut kiri-bawah peta, tertutup barisan pohon dengan satu celah sempit
  dan jejak batu samar sebagai petunjuk. Tamu yang menemukannya dapat **kode hadiah** untuk
  ditunjukkan ke mempelai di hari H. Atur teks dan kodenya di `config.secret`.

---

## Struktur file

```
index.html            undangan yang dibuka tamu
undangan.html         alat panitia: bikin link personal per tamu
admin.html            alat panitia: rekap RSVP dari Google Sheet
preview.html          alat panitia: bikin kartu preview WhatsApp
img/preview.png       gambar yang muncul saat link dibagikan
server/apps-script.gs  kode yang ditempel ke Google Apps Script
css/style.css         tampilan undangan
css/tools.css         tampilan dua halaman alat panitia
js/config.js          ← SEMUA DATA UNDANGAN ADA DI SINI
js/guests.js          ← DAFTAR TAMU (dibuat lewat undangan.html)
js/utils.js           helper (pixel, hash, hitung mundur)
js/font.js            font bitmap 3x5 untuk papan nama di dalam game
js/sprites.js         sprite karakter (tamu, mempelai) dari ASCII art
js/world.js           peta tile, daftar bangunan, tabrakan
js/paint.js           gambar tiap bangunan & dekorasi
js/audio.js           musik chiptune + efek suara (Web Audio)
js/dialogue.js        kotak dialog ala RPG
js/ui.js              panel besar & notifikasi
js/content.js         isi panel (acara, galeri, kado, RSVP, kalender)
js/net.js             realtime: tamu lain, emote, chat, penyaring kata
js/game.js            loop game, kamera, input, misi, ending
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
