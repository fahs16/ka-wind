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
| `secret` | Percakapan pojokan rahasia (kode & teks hadiahnya ada di server) |
| `db` | URL & publishable key Supabase untuk tabel tamu/RSVP |
| `access` | Kunci undangan: hanya link personal `?u=KODE` yang bisa membuka |
| `view` | Jarak kamera (`zoom`) + ajakan memutar HP ke posisi mendatar |
| `salam` | Kalimat pembuka & penutup di undangan versi sederhana |
| `lagu` | Pilih lagu latar tiap versi (`taman` atau `romansa`) |

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

Tiga sumber, diatur di `js/config.js`. **Boleh satu, boleh berurutan** — yang pertama
mengenali kodenya dipakai, yang belum kamu pasang tinggal dilewati:

```js
guests: {
  source: 'sheet',            // bawaan: Google Sheet saja, tanpa basis data
  // source: 'db',            // basis data saja
  // source: ['sheet', 'db'], // tanya Sheet dulu, basis data kalau tidak ketemu
  // source: ['db', 'sheet'], // basis data dulu, Sheet sebagai cadangan
  endpoint: ''                // khusus mode 'sheet'; kosong = ikut rsvp.endpoint
}
```

Apa pun pilihannya, yang dikirim ke browser tamu selalu sama: jawaban atas satu
pertanyaan, *"siapa pemilik kode ini?"*, berisi satu tamu saja dan tanpa nomor WA.
`js/guests.js` dibiarkan kosong, jadi tidak ada berkas di situs yang memuat nama siapa pun.

Kenapa dibuat berurutan: kamu bisa jalan dengan Sheet lebih dulu tanpa menunggu apa pun,
lalu memasang basis data kapan pun sempat. Menambahkannya nanti cukup mengubah satu baris
ini — tamu yang kodenya sudah ada di Sheet tetap jalan, tamu baru tinggal dimasukkan ke
basis data. Yang sama berlaku untuk RSVP:

```js
rsvp: { provider: ['sheet', 'db'] }   // coba Sheet dulu; kalau gagal, simpan ke basis data
```

Untuk RSVP urutannya dicoba sampai **berhasil**, bukan sampai ketemu — jadi satu tujuan
yang lagi ngadat tidak membuat jawaban tamu hilang.

### `'sheet'` — Google Sheet (bawaan, tidak perlu memasang apa-apa lagi)

Daftar tinggal di tab `TAMU` pada Google Sheet kamu, diakses lewat Apps Script yang sudah
kamu pasang untuk RSVP. Nama tamu tidak ikut ter-upload ke situs. Jawabannya lebih lambat
daripada basis data (Apps Script perlu beberapa ratus milidetik) dan kena kuota harian
Google, tapi untuk ratusan tamu tidak terasa.

Cara mengisinya:

1. Jalankan `initSheet()` sekali di Apps Script — tab `TAMU` otomatis dibuat dengan
   kolom `Kode | Nama | Kursi | Grup | WA`.
2. Buka `undangan.html`, susun daftarnya, klik **Salin untuk Google Sheet**.
3. Tempel di tab `TAMU` mulai baris ke-2. Kolomnya langsung pas.
4. Klik **Salin Blok Ini** di panel `js/guests.js` (isinya kosong), timpa berkasnya,
   unggah ulang situsnya.

### `'db'` — basis data (paling cepat & paling ketat, perlu sekali pasang)

Semua tamu tinggal di tabel `tamu` di Supabase. Tabelnya **terkunci total**: Row Level
Security menyala tanpa satu pun policy, dan hak akses peran publik dicabut. Browser tamu
tidak bisa menyentuh tabelnya sama sekali.

Yang boleh dipanggil dari browser cuma dua fungsi:

| Fungsi | Yang dijawab |
|---|---|
| `cek_tamu(kode)` | **satu** baris tamu pemilik kode itu — kode, nama, jatah kursi, grup. Nomor WA tidak pernah ikut. Kode tak terdaftar dijawab kosong. |
| `simpan_rsvp(...)` | menyimpan jawaban kehadiran satu tamu |

Jadi pertanyaan yang bisa diajukan browser cuma *"siapa pemilik kode ini?"* — tidak ada
bentuk pertanyaan *"sebutkan semua tamu"*. `js/guests.js` dikosongkan, dan memang tidak
ada lagi berkas di situs yang memuat nama siapa pun.

Kunci Supabase yang terpampang di `js/config.js` adalah **publishable key**, yang
tugasnya memang terpampang. Yang menahan pintu bukan kuncinya, tapi aturan di server.
Coba sendiri setelah skemanya dipasang:

```bash
curl "https://xxxx.supabase.co/rest/v1/tamu?select=*" -H "apikey: PUBLISHABLE_KEY"
# -> permission denied for table tamu
```

**Kode undangan itu kata sandi.** Karena itu `undangan.html` sekarang membuat kode
sepanjang 10 huruf (`bapa-5mg4m`): potongan nama supaya kamu bisa mengenalinya, lalu
5 huruf acak. Server juga punya rem: kalau ada 120 tebakan gagal dalam 5 menit, semua
kode tak dikenal langsung dijawab kosong sampai reda. Tamu asli tidak terpengaruh,
karena kode yang benar tidak ikut dihitung.

Bonus dari punya basis data: tercatat juga **siapa yang sudah membuka undangannya**
(tabel `kunjungan`), jadi `admin.html` bisa menunjukkan tamu mana yang belum melihat
sama sekali.

Perlu menjalankan `server/schema.sql` sekali di SQL Editor Supabase — caranya di bawah,
langkah lengkapnya di `DEPLOY.md` Tahap 2. Selama itu belum dilakukan, biarkan
`guests.source` di `'sheet'`; undangannya jalan seperti biasa.

### `'lokal'` — cara lama

Semua nama ada di `js/guests.js`. Praktis dan tanpa ketergantungan jaringan, tapi siapa
pun bisa membuka `situskamu.com/js/guests.js` dan membaca seluruh daftar tamu. Cuma
masuk akal kalau undangannya memang tidak dikunci.

### Kalau servernya sedang mati

Gangguan di hari H tidak bisa diulang, jadi bawaannya tamu tetap dipersilakan masuk —
hanya sapaannya jadi umum, tanpa nama:

```js
access: { saatServerMati: 'buka' }   // 'tutup' kalau mau benar-benar ketat
```

Jalur ini cuma terbuka kalau server memang tidak bisa dihubungi, jadi penebak kode tidak
bisa memanfaatkannya.

---

## Memasang basis data (opsional, sekali, ~5 menit)

1. Buka proyek Supabase kamu &rsaquo; **SQL Editor** &rsaquo; **New query**.
2. Tempel seluruh isi **`server/schema.sql`**.
3. Ganti baris token panitia di bagian 7 dengan kalimat panjang buatanmu sendiri:
   ```sql
   values (1, crypt('GANTI-JADI-TOKEN-PANJANG-KAMU-SENDIRI', gen_salt('bf')))
   ```
   Token ini yang nanti diketik di `admin.html`. Yang tersimpan cuma hash-nya.
4. Tekan **Run**. Aman dijalankan ulang kapan saja — data lama tidak terhapus.
5. Di `js/config.js`, isi `db.url` & `db.key` (atau kosongkan supaya ikut `net`).
6. Buka `undangan.html`, susun daftar tamu, klik **Salin SQL Tamu**, tempel ke SQL
   Editor, **Run**.
7. Klik **Salin Blok Ini** di panel `js/guests.js` (isinya jadi kosong), timpa berkasnya,
   unggah ulang situsnya.

Apa saja yang dibuat: tabel `tamu`, `rsvp`, `kunjungan`, `panitia`, `percobaan`; lima
fungsi (`cek_tamu`, `simpan_rsvp`, `rekap_rsvp`, `daftar_tamu`, `statistik`); dan
penguncian RLS untuk seluruh tabel. Semuanya berkomentar di `server/schema.sql`.

### Melihat isinya

- **`admin.html`** — rekap RSVP, statistik, dan daftar tamu yang belum menjawab
  (lengkap dengan penanda "sudah buka undangan"). Cukup ketik token panitia.
- **Supabase &rsaquo; Table Editor** — kalian sendiri masuk sebagai pemilik proyek, jadi
  bisa melihat dan mengubah semuanya langsung dari sana.

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

## Versi sederhana untuk tamu yang tidak main game

Selain versi game, ada **`simple.html`**: undangan biasa yang tinggal digulir. Amplop tertutup
dulu dengan monogram dan bingkai emas, lalu isinya terbuka: salam pembuka, mempelai beserta
orang tua, ayat, rangkaian acara, cerita, galeri, RSVP, tanda kasih, dan salam penutup. Huruf
besar, tombol besar, tidak ada yang perlu dipelajari.

Isinya diambil dari `js/config.js` yang sama persis, jadi kamu tetap cuma mengubah satu file dan
kedua versi ikut berubah. Kalimat salamnya diatur di `config.salam` &mdash; ganti atau kosongkan
(`''`) kalau tidak cocok dengan keluarga kalian.

Tiga cara tamu sampai ke sana:

| Cara | Kapan dipakai |
|---|---|
| Tautan **"Buka versi sederhana"** di layar pembuka | tamu sudah terlanjur buka versi game |
| Link `?u=KODE&simple=1` | kamu tahu dari awal tamunya kurang nyaman main game |
| Tombol **"Coba Versi Game"** di bawah halaman sederhana | tamu berubah pikiran |

Kode tamu ikut terbawa saat pindah versi, jadi gerbang aksesnya tidak menanyakan ulang, dan RSVP
dari kedua versi masuk ke baris Google Sheet yang sama.

Di `undangan.html` ada kode `{linksimple}` untuk template pesan WhatsApp, plus centangan
**"Buat semua link langsung ke versi sederhana"** kalau daftar yang sedang kamu tempel memang
khusus om, tante, dan sepuh.

---

## Musik

Tidak ada satu pun berkas audio di proyek ini. Musiknya dibangkitkan langsung di browser lewat
Web Audio, jadi tidak menambah beban unduhan sama sekali. Ada dua lagu, keduanya orisinal:

| Lagu | Dipakai di | Rasanya |
|---|---|---|
| `taman` | versi game | riang, C mayor, 104 BPM |
| `romansa` | versi sederhana | balada 8-bit, F mayor, 72 BPM, 16 birama |

Pilih lagunya di `js/config.js`:

```js
music: true,                                   // false = matikan musik sama sekali
lagu: { game: 'taman', simple: 'romansa' }     // boleh ditukar
```

Di versi game, musik menyala otomatis begitu undangan dibuka. Di versi sederhana, musik menyala
saat tamu menekan **Buka Undangan** (browser melarang suara sebelum halaman disentuh) dan bisa
dimatikan lewat tombol &#9834; di pojok kanan bawah.

### Menulis lagu sendiri

Not-notnya ada di `js/audio.js`, ditulis sebagai daftar `['nada', panjang dalam langkah]`.
Tambahkan lagu baru di `Chip.songs`, lalu tunjuk namanya dari `config.lagu`.

### Menjadikannya berkas audio

Kalau mau menempelkan lagunya di story Instagram atau video save-the-date:

```bash
node tools/render-lagu.js romansa 2 lagu.wav
```

Argumennya: nama lagu, jumlah putaran, nama berkas keluaran. Hasilnya WAV; situsnya sendiri
tidak memakai berkas ini.

---

## Hadiah pojokan rahasia (hidden gem)

Pojokan rahasia di sudut peta baru mau bicara setelah tamu mengunjungi **seluruh 8 titik**.
Sebelum itu pohonnya diam saja &mdash; dan yang penting, browser tamu belum menghubungi server
sama sekali, jadi tidak ada apa pun yang bisa diintip lebih awal.

Setelah lengkap, tamu menekan **Ambil hadiahnya** dan server mengeluarkan **satu kode unik
khusus untuk dia**, misalnya `GEM-B8CMNH`. Kode itu ditunjukkan ke meja **pager ayu** di hari H.

### Kenapa ini tidak bisa dibocorkan dari berkas js

Dulu kodenya satu untuk semua dan ditulis di `js/config.js` &mdash; siapa pun yang membuka
`situskamu.com/js/config.js` bisa membacanya lalu menyebarkannya. Sekarang tidak ada lagi
kode di berkas mana pun:

| Apa | Di mana |
|---|---|
| Percakapan pohonnya | `config.secret.lines` (memang boleh dibaca) |
| **Kode hadiah** | dibuat server saat diklaim, unik per tamu |
| **Teks hadiah** | `server/schema.sql` bagian 8, atau `GEM_HADIAH` di `server/apps-script.gs` |
| **Batas waktu** | sama, `gem_batas` / `GEM_BATAS` |

Server memeriksa empat hal sebelum mengeluarkan kode, dan semuanya di sisi server:

1. kodenya tamu terdaftar di daftar undangan
2. seluruh titik wajib sudah dikunjungi
3. belum lewat batas waktu
4. sudah lewat jeda minimal sejak undangan pertama kali dibuka (bawaan 3 menit), supaya
   tidak bisa diselesaikan dalam hitungan detik oleh skrip

Satu hal yang jujur perlu diketahui: progres "8 titik" itu sendiri disimpan di perangkat tamu,
jadi orang yang niat masih bisa mengaku sudah keliling. Yang **tidak** bisa dipalsukan adalah
identitasnya &mdash; kode hadiah selalu terikat ke satu nama di daftar undangan kalian, dan
namanya langsung masuk catatan. Jadi kalaupun ada yang curang, dia curang atas namanya sendiri,
dan kalian tahu persis siapa.

### Batas waktu H-1

Klaim ditutup sehari sebelum hari H. Tujuannya supaya tamu tidak sibuk berburu hadiah waktu
acaranya berlangsung &mdash; yang keliling dari jauh-jauh hari dapat bagian eksklusifnya.

Yang **sudah** terlanjur dapat kode tetap bisa membukanya kapan saja setelah batas lewat;
yang ditutup cuma klaim baru.

Atur batasnya di:

```sql
-- server/schema.sql bagian 8
gem_batas = '2026-12-11 23:59:00+07'    -- H-1 untuk hari H 12 Desember
```

```js
// server/apps-script.gs
var GEM_BATAS = '2026-12-11T23:59:00+07:00';
```

### Meja pager ayu

Buka `admin.html`, isi token, lalu gulir ke **Pojokan Rahasia**. Ada dua hal di sana:

- **Daftar penemu** &mdash; siapa saja yang dapat, kapan, sudah ditukar atau belum. Bisa
  diunduh sebagai CSV buat dibawa ke meja.
- **Kotak penukaran** &mdash; ketik kode yang ditunjukkan tamu. Kalau asli, muncul namanya dan
  kodenya langsung ditandai sudah ditukar, jadi **satu hadiah tidak bisa keluar dua kali**.
  Huruf besar-kecil tidak masalah.

Catatannya tersimpan di tabel `gem` (basis data) atau tab `GEM` (Google Sheet), jadi sinkron
dengan data yang lain.

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

Objek bisa didekati **dari sisi mana pun** — kanan, kiri, depan, atau belakang. Petak sambutan di
depan objek (pintu, meja, mulut warung) menjangkau sekitar satu petak; badan objek sendiri cukup
disenggol dari sisi mana saja. Radiusnya sengaja tidak lebih lebar dari itu, supaya berdiri di
bawah pohon di belakang gedung tidak ikut memunculkan prompt. Atur lewat `reach` dan `reachBadan`
di `js/world.js` kalau mau lebih longgar.

### Bonus yang tidak ditandai di peta

- **Tiga warung favorit**: Kopi Ukut, Refo Coffee, dan Nasi Bebek. Muncul sebagai kedai biasa
  tanpa tanda `!`. Begitu satu ditemukan, penghitung ☕ muncul di HUD. Isinya diatur di
  `config.spots` — ganti jadi tempat nongkrong kalian sendiri.
- **Pojokan rahasia** di sudut kiri-bawah peta, tertutup barisan pohon dengan satu celah sempit
  dan jejak batu samar sebagai petunjuk. Baru mau bicara setelah tamu mengunjungi
  **seluruh 8 titik**, dan hadiahnya berupa **kode unik per tamu**. Selengkapnya di bawah.

---

## Struktur file

```
index.html            undangan yang dibuka tamu (versi game)
simple.html           undangan versi sederhana: satu halaman gulir, huruf besar
undangan.html         alat panitia: bikin link personal per tamu
admin.html            alat panitia: rekap RSVP dari Google Sheet
preview.html          alat panitia: bikin kartu preview WhatsApp
img/preview.png       gambar yang muncul saat link dibagikan
server/schema.sql      skema basis data — tempel sekali ke SQL Editor Supabase
server/apps-script.gs  kode yang ditempel ke Google Apps Script (mode 'sheet')
tools/render-lagu.js  ubah lagu chiptune jadi berkas WAV (opsional)
css/style.css         tampilan undangan versi game
css/simple.css        tampilan undangan versi sederhana
css/tools.css         tampilan dua halaman alat panitia
js/config.js          ← SEMUA DATA UNDANGAN ADA DI SINI
js/guests.js          daftar tamu cadangan — KOSONG di mode basis data
js/utils.js           helper (pixel, hash, hitung mundur)
js/font.js            font bitmap 3x5 untuk papan nama di dalam game
js/sprites.js         sprite karakter (tamu, mempelai) dari ASCII art
js/world.js           peta tile, daftar bangunan, tabrakan
js/paint.js           gambar tiap bangunan & dekorasi
js/audio.js           dua lagu chiptune + efek suara (Web Audio, tanpa file audio)
js/dialogue.js        kotak dialog ala RPG
js/ui.js              panel besar & notifikasi
js/content.js         isi panel (acara, galeri, kado, RSVP, kalender)
js/db.js              sambungan ke basis data (cek tamu, simpan RSVP, rekap)
js/gem.js             hadiah pojokan rahasia (isinya TIDAK memuat hadiahnya)
js/net.js             realtime: tamu lain, emote, chat, penyaring kata
js/game.js            loop game, kamera, input, misi, ending
js/simple.js          penyusun halaman versi sederhana
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
