# Panduan Deploy — dari repo sampai link siap disebar

Perkiraan waktu: **15 menit** untuk versi paling sederhana (undangan online + RSVP via WhatsApp),
**45 menit** kalau sekalian pakai Google Sheet dan multiplayer.

Urutannya sengaja dibikin begini: isi data dulu → coba di laptop → baru online.
Jangan dibalik, karena memperbaiki data setelah link tersebar itu repot.

---

## Tahap 0 — Isi datanya dulu (WAJIB)

Undangan masih berisi data contoh: "Fitrah & Nadia", 12 Desember 2026, rekening dummy.
Kalau ini kesebar, malunya nanti.

### 0.1 `js/config.js`

| Yang diubah | Perhatikan |
|---|---|
| `couple` | nama panggilan, nama lengkap, nama orang tua, tagar |
| `bigDay` | format `'2026-12-12T08:00:00+07:00'`. WIB `+07:00`, WITA `+08:00`, WIT `+09:00` |
| `events` | akad & resepsi: hari, jam, nama gedung, alamat, link Google Maps |
| `story` | timeline cerita kalian |
| `gallery` | isi `src` kalau foto sudah siap, kosongkan kalau belum |
| `gifts` | nomor rekening & alamat kirim kado — **cek ulang digitnya** |
| `rsvp.whatsapp` | format `628xxx`, tanpa `+` dan tanpa `0` di depan |
| `quote` | ayat/kutipan pembuka |

Cara ambil link Google Maps yang benar: buka lokasinya di Google Maps → **Share** →
**Copy link**. Jangan pakai link hasil pencarian di address bar.

### 0.2 Foto

Buat folder `img/`, masukkan fotonya (potong jadi kotak, lebar ~800px, ukuran file di bawah 300 KB
biar cepat dibuka di HP), lalu isi di `config.js`:

```js
gallery: [
  { src: 'img/foto1.jpg', caption: 'Pertama kali jalan berdua' },
  ...
]
```

Kalau `src` dikosongkan, yang muncul bingkai placeholder — undangan tetap bisa dipakai.

### 0.3 Daftar tamu

Buka `undangan.html` di browser → paste daftar nama → **Buat Link** → **Unduh js/guests.js** →
timpa file `js/guests.js` di folder repo.

> **Soal nomor WA:** file `js/guests.js` ikut ter-upload dan bisa dibuka siapa pun lewat
> `situskamu.com/js/guests.js`. Karena itu generator **tidak menyertakan nomor WA** secara bawaan.
> Nomor WA-nya tetap ada di CSV hasil unduhan dan di tombol "Kirim WA" pada halaman generator,
> yang dua-duanya tidak ikut ke internet. Centang kotak merah di generator hanya kalau kamu
> memang rela nomor tamu jadi publik (efeknya: tombol "Ingatkan via WA" di `admin.html` aktif).

### 0.4 Coba di laptop dulu

```bash
cd ka-wind
python3 -m http.server 8000
# buka http://localhost:8000
```

Cek satu per satu: nama benar, tanggal benar, hitung mundur masuk akal, 8 titik bisa dibuka,
link Maps benar, nomor rekening benar. **Kalau halamannya putih polos**, buka Console browser
(F12 → Console) — 99% penyebabnya salah ketik di `config.js`, biasanya koma kurang atau
tanda kutip belum ditutup.

---

## Tahap 1 — Naikkan ke internet

### Pilihan A: GitHub Pages (paling ringkas, repo sudah ada di GitHub)

Hasilnya: `https://fahs16.github.io/ka-wind/`

**1. Gabungkan branch kerja ke `main`.** Lewat terminal:

```bash
git checkout main
git merge claude/custom-wedding-invitation-web-5guxg7
git push origin main
```

Atau lewat web: buka repo → **Compare & pull request** → **Merge pull request**.

**2. Nyalakan Pages.** Repo → **Settings** → **Pages** → bagian *Build and deployment*:

- Source: **Deploy from a branch**
- Branch: **main**, folder: **/ (root)**
- **Save**

**3. Tunggu 1–3 menit.** Refresh halaman Settings → Pages, nanti muncul kotak hijau berisi
alamat situsnya. Kalau masih 404, tunggu sebentar lagi — proses pertama memang paling lama.

Repo ini sudah menyertakan file `.nojekyll`, jadi tidak perlu setelan tambahan.

**Update setelah live:** cukup `git push` ke `main`, Pages otomatis membangun ulang dalam
1–2 menit. Kalau perubahannya belum kelihatan di HP, itu cache browser — lihat bagian Masalah Umum.

### Pilihan B: Netlify (paling gampang buat domain sendiri)

1. Buka [app.netlify.com/drop](https://app.netlify.com/drop)
2. **Seret folder `ka-wind`** ke halaman itu. Selesai, langsung dapat alamat.
3. Ganti alamat acaknya: **Site configuration → Change site name** → misal `fitrah-nadia`
   → jadi `https://fitrah-nadia.netlify.app`

Kalau mau tiap `git push` otomatis ter-deploy: **Add new site → Import an existing project →
GitHub** → pilih repo `ka-wind` → branch `main` → build command dikosongkan → publish
directory diisi `.` → **Deploy**.

### Pilihan C: Cloudflare Pages

**Workers & Pages → Create → Pages → Connect to Git** → pilih repo → framework preset **None**,
build command kosong, output directory `.` → **Save and Deploy**.

### Mana yang dipilih?

| | GitHub Pages | Netlify | Cloudflare Pages |
|---|---|---|---|
| Repo sudah di GitHub | ✅ tinggal nyalakan | perlu connect | perlu connect |
| Alamat bawaan | `user.github.io/ka-wind/` | `nama.netlify.app` | `nama.pages.dev` |
| Domain sendiri | bisa, DNS manual | paling gampang | paling gampang |
| Kecepatan di Indonesia | bagus | bagus | paling bagus |

Semuanya gratis untuk kebutuhan ini. Kalau bingung: **GitHub Pages**.

---

## Tahap 2 — Basis data tamu & RSVP (opsional, ~5 menit)

**Boleh dilewati.** Bawaannya undangan ini membaca daftar tamu dari Google Sheet
(Tahap 2b), jadi tidak ada yang terkunci kalau bagian ini belum dikerjakan.

Kerjakan kalau mau jawabannya lebih cepat (Apps Script perlu beberapa ratus
milidetik; basis data puluhan milidetik) dan tidak kena kuota harian Google.
Bisa dipasang kapan saja, termasuk setelah undangan tersebar: ganti
`guests.source` jadi `['sheet', 'db']` dan dua-duanya jalan berdampingan —
Sheet ditanya dulu, basis data kalau kodenya tidak ketemu di sana.

1. Buka **[supabase.com](https://supabase.com)** → proyek kamu (bikin baru kalau belum,
   gratis) → **SQL Editor** → **New query**.
2. Tempel seluruh isi **`server/schema.sql`**.
3. Cari bagian 7 di berkas itu dan ganti tokennya:
   ```sql
   values (1, crypt('GANTI-JADI-TOKEN-PANJANG-KAMU-SENDIRI', gen_salt('bf')))
   ```
   Pakai kalimat panjang yang tidak bisa ditebak. Token ini yang nanti diketik di
   `admin.html`; yang tersimpan di basis data cuma hash-nya.
4. Tekan **Run**. Aman dijalankan ulang kapan saja.
5. **Settings → API**, salin **Project URL** dan **publishable key** (yang diawali
   `sb_publishable_` atau `anon public`). Tempel ke `js/config.js`:
   ```js
   db: { url: 'https://xxxx.supabase.co', key: 'sb_publishable_xxxx' }
   ```
   Kosongkan keduanya kalau sudah diisi di `net` — nanti ikut yang itu.

   Sekalian atur hadiah pojokan rahasia di **bagian 8** `server/schema.sql`: batas waktunya
   (isi H-1) dan teks hadiahnya. Keduanya sengaja di sana, bukan di `js/config.js`, supaya
   tidak bisa dibaca dari situs.

   Lalu arahkan sumbernya ke basis data:
   ```js
   guests: { source: ['sheet', 'db'] },   // atau 'db' saja kalau Sheet mau dipensiunkan
   rsvp:   { provider: ['sheet', 'db'] }
   ```

   > **Jangan pernah** menaruh `service_role` key atau password database di berkas ini.
   > Yang boleh cuma publishable key, dan itu memang dirancang untuk terlihat publik.
6. Buka `undangan.html`, susun daftar tamu, klik **Salin SQL Tamu** → tempel ke SQL
   Editor → **Run**.
7. Masih di `undangan.html`, klik **Salin Blok Ini** di panel `js/guests.js` (isinya
   kosong), timpa berkasnya, unggah ulang situsnya.

Cek cepat bahwa pintunya benar-benar terkunci — ini harus menjawab *permission denied*:

```bash
curl "https://xxxx.supabase.co/rest/v1/tamu?select=*" -H "apikey: PUBLISHABLE_KEY"
```

---

## Tahap 2b — Google Sheet buat daftar tamu & rekap kehadiran (~10 menit)

Ini jalur bawaannya. Daftar tamu dan jawaban RSVP sama-sama masuk ke Google Sheet lewat
Apps Script, dan nama tamu tidak ikut ter-upload ke situs.

Tanpa ini, RSVP tetap jalan lewat WhatsApp. Dengan ini, jawaban tamu masuk otomatis ke Sheet.

1. Buat Google Sheet baru.
2. **Extensions → Apps Script**. Hapus isi `Code.gs`, tempel seluruh isi `server/apps-script.gs`.
3. Ganti `ADMIN_TOKEN` dengan kata sandi panjang buatanmu.
   **Ganti di editor Apps Script, jangan di file dalam repo** — file repo ikut ter-publish.
4. Pilih fungsi `initSheet` di dropdown atas → **Run** → izinkan aksesnya
   (akan ada layar peringatan Google: **Advanced → Go to … (unsafe)** → **Allow**.
   Ini wajar karena skripnya buatan sendiri, bukan aplikasi terverifikasi).
5. **Deploy → New deployment → Web app**:
   - Description: bebas
   - Execute as: **Me**
   - Who has access: **Anyone** ← kalau salah di sini, RSVP-nya pasti gagal
   - **Deploy**, lalu salin URL yang berakhiran `/exec`
6. Tempel URL itu ke `js/config.js` → `rsvp.endpoint`, lalu push ulang.

**Kalau nanti kode Apps Script diubah:** Deploy → **Manage deployments** → ikon pensil →
Version: **New version** → Deploy. Kalau bikin deployment baru, URL-nya berubah dan harus
diganti lagi di config.

**Rekapnya** dibuka di `situskamu.com/admin.html` — isi URL `/exec` + token, klik Muat Data.

---

## Tahap 3 — Multiplayer (opsional, ~10 menit)

Mau lihat rasanya dulu tanpa daftar akun? Buka dua tab:
`situskamu.com/?net=local&to=Andi` dan `situskamu.com/?net=local&to=Rina`.

Kalau sreg, pasang beneran:

1. Daftar di [supabase.com](https://supabase.com) → **New project** (region terdekat: Singapore).
2. **Project Settings → API** → salin **Project URL** dan **anon public key**.
3. Isi di `js/config.js`:

```js
net: {
  provider: 'supabase',
  url: 'https://xxxxxxxx.supabase.co',
  key: 'eyJhbGciOi...',      // anon public key, BUKAN service_role
  room: 'taman-utama'
}
```

Tidak perlu membuat tabel apa pun. Push ulang, lalu tes dari dua HP berbeda.

**Sebelum blast ke ratusan orang:** naikkan `net.sendMs` ke `400`–`600` biar hemat kuota,
atau matikan dulu (`provider: 'off'`) dan nyalakan lagi beberapa hari kemudian.
Kalau kuota habis, undangan tidak rusak — otomatis balik ke mode sendirian.

---

## Tahap 4 — Domain sendiri (opsional)

Domain `.my.id` sekitar Rp 15–30 ribu/tahun (Domainesia, Niagahoster, Rumahweb),
`.com` sekitar Rp 150 ribu/tahun.

**Netlify / Cloudflare Pages:** menu **Domains → Add domain**, lalu ikuti instruksi DNS-nya.
Paling gampang, HTTPS otomatis.

**GitHub Pages:** Settings → Pages → **Custom domain** → isi domainnya → Save.
Lalu di panel DNS penyedia domain, tambahkan:

```
A     @    185.199.108.153
A     @    185.199.109.153
A     @    185.199.110.153
A     @    185.199.111.153
CNAME www  fahs16.github.io
```

Tunggu sampai 24 jam (biasanya jauh lebih cepat), lalu centang **Enforce HTTPS**.

---

## Tahap 5 — Uji sebelum disebar

Jangan lewati bagian ini. Urutannya:

- [ ] Buka di **HP beneran**, bukan cuma laptop. Coba Android dan iPhone kalau ada.
- [ ] Stik dan tombol A muncul di HP, karakternya bisa jalan.
- [ ] Ke-8 titik bisa **diselesaikan** sampai muncul layar penutup + kembang api.
      Ingat: tiap titik baru tercentang setelah tombolnya ditekan, bukan sekadar didekati.
- [ ] Link Google Maps membuka lokasi yang benar (klik beneran, jangan cuma dilihat).
- [ ] Nomor rekening benar sampai digit terakhir. Tombol salin berfungsi.
- [ ] Buka satu **link personal** (`?u=kode`) — nama tamu muncul di layar pembuka.
- [ ] Kirim **RSVP percobaan**, cek masuk ke Sheet, lalu **hapus baris percobaannya**.
- [ ] Buka `admin.html`, ketik token panitia, pastikan rekap & daftar tamu muncul.
- [ ] Uji hadiah pojokan rahasia: buka satu link tamu, selesaikan 8 titik, ambil hadiahnya,
      lalu tukar kodenya di `admin.html` &mdash; setelah itu hapus baris ujinya.
- [ ] Pastikan `GEM_BATAS` (atau `gem_batas`) sudah diisi H-1, bukan hari H.
- [ ] Jalankan `curl` cek pintu terkunci di Tahap 2 &mdash; harus *permission denied*.
- [ ] `curl -I https://situskamu.netlify.app/ | grep x-undangan-gate` &mdash; harus `on`,
      bukan `disabled`. Kalau `disabled`, seluruh berkas situs masih bisa diunduh siapa pun.
- [ ] `curl https://situskamu.netlify.app/js/config.js` &mdash; harus 404, bukan isi berkasnya.
- [ ] Buka satu link dengan kode ngawur (`?u=ngasal123`) &mdash; harus cuma gambar polos.
- [ ] Buka versi sederhana (`?u=kode&simple=1`), pastikan hurufnya besar, tombol peta jalan,
      dan RSVP dari sana juga masuk ke Sheet.
- [ ] Kirim link ke diri sendiri via WhatsApp, cek gambar preview-nya muncul (lihat catatan di bawah).
- [ ] Minta 2–3 orang mencoba dari HP mereka sebelum disebar luas.

### Preview di WhatsApp

Kartu preview-nya sudah ada di `img/preview.png` (1200×630) dan meta tag-nya sudah terpasang
di `index.html`. Dua hal yang perlu kamu lakukan:

1. **Ganti domainnya kalau pindah.** Saat ini sudah diarahkan ke `https://ka-wind.netlify.app/`.
   Kalau nanti pindah ke hosting sendiri, sesuaikan dua baris ini di `<head>` pada `index.html`:

```html
<meta property="og:image" content="https://situskamu.com/img/preview.png">
<meta property="og:url" content="https://situskamu.com/">
```

   Alamatnya harus lengkap (`https://...`), bukan `img/preview.png` saja.

2. **Buat ulang gambarnya setelah nama/tanggal diganti.** Buka `preview.html`, nama dan tanggal
   diambil otomatis dari `config.js`, lalu klik **Unduh img/preview.png** dan timpa file lamanya.

WhatsApp menyimpan preview lama cukup lama — saat menguji, tambahkan `?v=2` di belakang link
supaya dianggap link baru.

---

## Tahap 6 — Sebelum menekan "kirim ke semua"

Cek keamanan sebentar:

- [ ] `ADMIN_TOKEN` asli **tidak** ada di dalam repo (cuma di editor Apps Script).
      Cek cepat: `grep -rn "ADMIN_TOKEN" server/` — nilainya harus masih teks contoh.
- [ ] Yang ada di `config.js` adalah **anon public key** Supabase, bukan `service_role`.
- [ ] `js/guests.js` yang ter-upload tidak berisi nomor WA tamu (kecuali kamu memang mau).
- [ ] Halaman panitia (`undangan.html`, `admin.html`, `preview.html`) sudah dikunci. Pilih salah satu:
      isi `GUEST_CODES` + `ADMIN_CODE` di Environment variables Netlify (gerbang sisi server,
      lihat README), **atau** jangan unggah ketiga berkas itu dan jalankan dari laptop saja.
- [ ] Cek gerbang benar-benar aktif:
      `curl -I https://situskamu.netlify.app/ | grep x-undangan-gate` → harus `on`, bukan `disabled`.

Lalu sebar: buka `undangan.html`, klik **Kirim WA** per tamu, atau **Salin Pesan** kalau mau
ditempel manual.

---

## Masalah umum

| Gejala | Penyebab & solusi |
|---|---|
| 404 setelah menyalakan Pages | Belum selesai membangun (tunggu 3 menit), atau branch/folder salah. Pastikan **main** + **/ (root)**, dan `index.html` ada di akar repo |
| Halaman putih polos | Salah ketik di `config.js` atau `guests.js`. Buka Console (F12) — pesannya menunjuk baris yang salah. Biasanya koma kurang atau kutip belum ditutup |
| Perubahan tidak muncul di HP | Cache. Tutup semua tab lalu buka lagi, atau tes dengan `?v=2` di belakang alamat. Di Chrome desktop: Ctrl+Shift+R |
| RSVP: "Koneksi ke buku tamu gagal" | Urutan cek: (1) URL berakhiran `/exec`? (2) *Who has access* = **Anyone**? (3) sudah **New version** setelah mengubah skrip? (4) URL sudah masuk `config.js` dan sudah di-push? |
| Data tidak masuk Sheet tapi tidak ada error | Tab Sheet-nya bukan bernama `RSVP`, atau `initSheet()` belum pernah dijalankan |
| `admin.html`: "token salah" | Token di halaman admin harus **sama persis** dengan `ADMIN_TOKEN` di Apps Script, termasuk besar-kecil huruf. Jangan ada spasi ikut ter-copy |
| Musik tidak bunyi di iPhone | Normal — browser HP baru mengizinkan suara setelah ada sentuhan, dan itu terjadi saat tombol "Buka Undangan" ditekan. Cek juga saklar senyap di samping iPhone |
| Huruf tampak kotak-kotak | Font Google gagal dimuat (sinyal jelek/diblokir). Undangan otomatis pakai font cadangan, tidak rusak |
| Tamu lain tidak kelihatan | `provider` masih `'off'`, key salah ketik, atau `room` berbeda. Coba `?net=local` di dua tab untuk memastikan bagian gamenya normal |
| Karakter tersangkut | Laporkan posisinya — bisa jadi ada area tabrakan yang perlu diperbaiki |

---

## Ringkasan alamat penting

| Halaman | Untuk siapa | Alamat |
|---|---|---|
| Undangan | tamu | `situskamu.com/` |
| Undangan personal | tamu | `situskamu.com/?u=and1` |
| Undangan versi game | tamu | `situskamu.com/?u=and1&game=1` |
| Generator link | kamu | `situskamu.com/undangan.html` |
| Kartu preview WA | kamu | `situskamu.com/preview.html` |
| Rekap RSVP | kamu | `situskamu.com/admin.html` |
| Basis data | kamu | Supabase &rsaquo; Table Editor / SQL Editor |
| Mode uji multiplayer | kamu | `situskamu.com/?net=local` |
