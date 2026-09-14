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

## v3.0.0 — commit `c219083`

Undangan biasa jadi halaman utama, dan 8 titik misi harus benar-benar
diselesaikan.

**Perubahan besar.** `index.html` sekarang berisi undangan biasa (dulu
`simple.html`), dan versi game pindah ke `game.html`. Link `?u=KODE` yang sudah
tersebar tetap jalan — sekarang mendarat di undangan biasa. Link lama dengan
`&simple=1` atau `&mudah=1` juga tetap jalan.

- Tautan **"Coba Versi Game"** di bawah undangan, dan **"Kembali ke undangan
  biasa"** di layar pembuka game. Link langsung ke game: `?u=KODE&game=1`.
- `undangan.html` sekarang mengeluarkan `{linkgame}` (dulu `{linksimple}`) dan
  centangannya jadi "semua link langsung ke versi game".
- **Titik misi tidak lagi selesai hanya karena didekati.** Tiap titik butuh
  tindakan yang sebenarnya: menekan Mulai Jalan, membuka Google Maps atau
  menyimpan kalender, menekan Lihat Profil, membaca papan cerita sampai halaman
  terakhir, menekan Sudah Lihat Semuanya di galeri, menyalin nomor rekening,
  dan mengirim RSVP.
- Papan cerita yang ditutup di tengah jalan **tidak** dihitung sudah dibaca:
  `Dialogue` sekarang membedakan "maju sampai habis" dari "ditutup".
- Tiap panel punya satu baris keterangan yang menyebutkan syaratnya, jadi tidak
  ada yang perlu ditebak.

## v2.6.0 — commit `32d9676`

Hadiah pojokan rahasia hanya bisa diambil di kunjungan pertama.

- Syarat kelima: jumlah kunjungan tamu itu saat mengklaim harus masih 1.
  Menutup jalur bocoran — tamu yang baru berburu setelah diberi tahu tamu lain
  undangannya sudah pernah dibuka sebelum itu, jadi yang keluar pesan "kurang
  beruntung", bukan hadiah.
- Angkanya diatur di `GEM_MAKS_KUNJUNGAN` (Apps Script) atau
  `pengaturan.gem_maks_kunjungan` (basis data). Isi `2`/`3` kalau terlalu galak,
  `0` untuk tanpa batas.
- Yang sudah terlanjur dapat kode tetap bisa membukanya berkali-kali; batas ini
  cuma berlaku saat mengklaim.
- Catatan jujurnya ikut ditulis di README: tamu yang cuma mengintip sebentar
  lalu baru main serius keesokan harinya ikut kehilangan kesempatan, padahal
  dia tidak curang.

## v2.5.0

Isi sensitif pindah ke server, dan daftar tamu jadi satu sumber.

- **Tab `ISI` / tabel `isi`**: nomor rekening, alamat rumah, nomor WA, dan nama
  lengkap orang tua bisa disimpan di server, bukan di `js/config.js` yang bisa
  diunduh siapa pun. Kuncinya jalur ke dalam CONFIG (`gifts.address`,
  `events.0.place`), nilainya ditimpakan setelah kode tamunya terbukti
  terdaftar. Yang tidak diisi di server tetap memakai isi `config.js`, jadi
  memindahkannya bisa sedikit demi sedikit.
- `undangan.html` mengeluarkan daftar kunci itu lengkap dengan nilai yang
  sekarang, siap tempel ke tab `ISI`.
- **Satu daftar tamu.** Daftar di `undangan.html` dan di Sheet dulu terpisah.
  Sekarang ada **Muat dari Server** dan **Simpan ke Server**: yang dianggap
  benar cuma yang di server. Kode tamu ikut termuat di kolom ke-5 sehingga
  link yang sudah terlanjur dikirim tidak pernah berubah.
- `js/isi.js` sengaja tidak memuat satu pun data itu, dan menolak membuat cabang
  baru di CONFIG — server cuma boleh mengisi tempat yang sudah disediakan.

## v2.4.0 — commit `cf6723f`

Kunci gerbang Netlify tinggal disalin, tidak perlu diketik manual.

- Panel **"Kunci gerbang Netlify"** di `undangan.html` mengeluarkan nilai
  `GUEST_CODES` siap tempel (seluruh kode tamu, dipisah koma) dan membuatkan
  `ADMIN_CODE` acak yang panjang. Dua-duanya ada tombol salin.
- Gerbang tepi itu satu-satunya kunci yang benar-benar mengunci: pemeriksaan di
  dalam browser cuma menyaring tampilan, dan `js/config.js` tetap bisa diunduh
  langsung selama gerbangnya belum hidup. Panelnya menjelaskan itu, lengkap
  dengan perintah `curl -I ... | grep x-undangan-gate` untuk memastikan.
- Peringatan yang mudah terlewat ikut ditulis di sana: menambah tamu berarti
  `GUEST_CODES` harus disalin ulang dan Netlify perlu redeploy, kalau tidak
  tamu baru kena 404 walaupun linknya benar.
- Jumlah kode dan panjang karakternya ditampilkan, dengan peringatan kalau
  sudah mendekati batas ukuran satu variabel Netlify.
- Daftar periksa `DEPLOY.md` menambahkan dua uji: header gerbang harus `on`,
  dan `js/config.js` harus menjawab 404.

## v2.3.0 — commit `8060fb0`

Menutup kunci master yang selama ini tertulis di berkas publik, dan kolom
"sudah buka undangan" untuk mode Google Sheet.

- **`access.bypass` dikosongkan.** Isinya dulu `'fitrahnadia-panitia'`, tertulis
  apa adanya di `js/config.js` — berkas yang ikut ter-upload dan bisa dibuka
  siapa pun di `situskamu.com/js/config.js`. Siapa pun yang membacanya bisa
  membuka undangan lewat `?u=fitrahnadia-panitia` tanpa terdaftar di daftar
  tamu mana pun. Sekarang kosong, dan komentarnya menjelaskan kenapa sebaiknya
  tetap begitu: kalau panitia butuh akses, buat saja baris tamu biasa bernama
  "Panitia" yang kodenya tidak tertulis di berkas publik dan bisa dicabut.
- Saat undangan diloloskan karena server daftar tamu tidak terjawab
  (`access.saatServerMati`), sebabnya sekarang dicatat di console browser.
  Jadi kalau menemukan undangan terbuka padahal seharusnya terkunci, ketahuan
  itu gerbangnya yang jebol atau servernya yang tidak terjawab.
- **Mode Google Sheet: kolom "sudah buka undangan"** di tabel "belum menjawab"
  pada `admin.html`, sejajar dengan yang sudah ada di mode basis data.
  `action=tamu-all` sekarang menggabungkan tab `TAMU` dengan tab `KUNJUNGAN`.

## v2.2.2 — commit `c4855de`

- `tools/tes-apps-script.js` sekarang ikut menguji `doPost` (kiriman RSVP):
  tersimpan, kiriman ulang memperbarui baris yang sama alih-alih menambah baris
  baru, dan nama kosong ditolak. Sebelumnya tiruannya belum menyediakan
  `LockService`, jadi seluruh jalur RSVP tidak pernah tersentuh pengujian.

## v2.2.1 — commit `f3abfc6`

Perbaikan jalur Google Sheet untuk hadiah pojokan rahasia.

- **Tamu bisa nyangkut "terlalu cepat" selamanya.** Jeda minimal di jalur Sheet
  berpatokan pada baris di tab `KUNJUNGAN`, tapi kalau barisnya belum pernah ada
  — persis keadaan tamu yang sudah membuka undangannya sebelum tab itu dibuat —
  klaimnya ditolak tanpa pernah mencatat apa pun, jadi penolakannya berulang
  selamanya. Sekarang kunjungannya dicatat saat itu juga, dan tamunya cukup
  kembali beberapa menit lagi.
- **`tools/tes-apps-script.js`**: menjalankan `server/apps-script.gs` apa adanya
  di atas tiruan Google Sheet, jadi seluruh alur hadiah bisa diuji di komputer
  sendiri sebelum Deploy. 25 pemeriksaan, termasuk 300 klaim untuk memastikan
  kodenya tidak pernah tabrakan. Bug di atas ketahuan dari sini.

## v2.2.0 — commit `e0e75ef`

Hadiah pojokan rahasia: terkunci sampai semua titik selesai, kodenya unik per
tamu, dan tidak ada satu pun berkas di situs yang memuat hadiahnya.

- **Pintunya terkunci sampai 8 titik selesai.** Sebelum lengkap, pohonnya cuma
  bilang belum kenal kamu — dan browser tamu belum menghubungi server sama
  sekali, jadi tidak ada yang bisa diintip lebih awal.
- **Kode hadiahnya hilang dari `js/config.js`.** Dulu satu kode untuk semua dan
  tertulis di berkas yang bisa dibaca siapa pun. Sekarang kodenya dibuat server
  saat diklaim, unik per tamu (`GEM-B8CMNH`), dan teks hadiahnya juga tinggal di
  server. Membaca seluruh berkas js situs tidak memberi tahu apa hadiahnya.
- **Empat syarat diperiksa di sisi server**: kodenya tamu terdaftar, seluruh
  titik wajib dikunjungi, belum lewat batas waktu, dan sudah lewat jeda minimal
  sejak undangan pertama kali dibuka (bawaan 3 menit) supaya tidak bisa
  diselesaikan skrip dalam hitungan detik.
- **Batas waktu H-1.** Klaim ditutup sehari sebelum hari H, supaya tamu tidak
  sibuk berburu hadiah waktu acaranya berlangsung. Yang sudah terlanjur dapat
  kode tetap bisa membukanya kapan saja.
- **Penemunya tercatat** di tabel `gem` (basis data) atau tab `GEM` (Google
  Sheet), sinkron dengan data yang lain. Tab `KUNJUNGAN` baru di Sheet mencatat
  siapa yang sudah membuka undangannya, seperti tabel `kunjungan` di basis data.
- **Meja pager ayu di `admin.html`**: daftar penemu (bisa diunduh CSV) plus
  kotak penukaran. Ketik kode yang ditunjukkan tamu — kalau asli, namanya muncul
  dan kodenya langsung ditandai ditukar, jadi satu hadiah tidak keluar dua kali.
- Klaim ulang mengembalikan kode yang sama, bukan kode baru, jadi tamu bisa
  membuka hadiahnya berkali-kali tanpa takut berubah.

## v2.1.0 — commit `acc2972`

Sumber daftar tamu jadi berurutan, dan bawaannya kembali ke Google Sheet.

- `guests.source` dan `rsvp.provider` sekarang boleh berisi urutan, bukan cuma
  satu nama: `['sheet', 'db']` berarti tanya Google Sheet dulu, basis data
  kalau kodenya tidak ketemu di sana. Untuk RSVP, urutannya dicoba sampai
  berhasil, jadi satu tujuan yang lagi ngadat tidak membuat jawaban tamu
  hilang.
- **Bawaannya kembali ke `'sheet'`.** Basis data jadi benar-benar opsional:
  undangan jalan apa adanya tanpa menjalankan `server/schema.sql` sama sekali,
  dan bisa dipasang kapan saja nanti dengan mengubah satu baris. Yang sudah
  memasang basis data tinggal menyetel `'db'` atau `['db', 'sheet']`.
- `js/guests.js` tetap kosong di semua mode kecuali `'lokal'`, jadi tidak ada
  berkas di situs yang memuat nama atau kode siapa pun. Gangguan server
  ditangani `access.saatServerMati`, bukan dengan menyalin kode ke situ.
- `undangan.html` menyiapkan keluaran untuk semua sumber yang disebut di
  config: panel SQL dan tombol Salin untuk Google Sheet muncul berbarengan
  kalau rantainya menyebut keduanya.
- `admin.html` menampilkan pemilih sumber kalau config menyebut dua-duanya,
  jadi rekap dari Sheet dan dari basis data bisa dilihat bergantian.

## v2.0.0 — commit `73c518e`

Daftar tamu pindah ke basis data. Tidak ada lagi berkas di situs yang memuat
nama siapa pun.

**Perubahan besar.** `js/guests.js` sekarang kosong dan `guests.source` berubah
jadi `'db'`. Undangan tidak akan mengenali tamu sebelum `server/schema.sql`
dijalankan di Supabase dan daftar tamunya dimasukkan. Langkahnya ada di
DEPLOY.md Tahap 2. Mode `'sheet'` dan `'lokal'` yang lama tetap jalan kalau
setelannya dikembalikan.

- **`server/schema.sql`** — skema lengkap: tabel `tamu`, `rsvp`, `kunjungan`,
  `panitia`, `percobaan`. Seluruh tabel dikunci (RLS menyala tanpa policy, hak
  akses peran publik dicabut), jadi browser tamu tidak bisa menyentuh tabelnya
  sama sekali.
- Yang boleh dipanggil dari browser tamu cuma dua fungsi: `cek_tamu(kode)` yang
  menjawab satu baris saja dan tidak pernah menyertakan nomor WA, dan
  `simpan_rsvp(...)`. Tidak ada bentuk pertanyaan "sebutkan semua tamu".
- Tiga fungsi panitia (`rekap_rsvp`, `daftar_tamu`, `statistik`) dijaga token
  yang disimpan sebagai hash bcrypt, bukan teks asli, dan tidak pernah ditulis
  di berkas mana pun.
- Rem penebak: 120 kode gagal dalam 5 menit membuat semua kode tak dikenal
  dijawab kosong; 10 token salah dalam 15 menit mengunci pintu panitia. Kode
  yang benar tidak ikut dihitung, jadi tamu asli tidak terkena.
- Jumlah tamu di RSVP dipagari jatah kursi masing-masing, jadi kode orang lain
  tidak bisa dipakai mendaftarkan serombongan orang.
- **Kode undangan sekarang 10 huruf** (`bapa-5mg4m`) — potongan nama plus lima
  huruf acak. Kode itu satu-satunya yang memisahkan tamu dari orang lewat, jadi
  diperlakukan seperti kata sandi. Kode diingat per nama di browser kamu, jadi
  membuka `undangan.html` lagi besok tidak mengubah link yang terlanjur dikirim.
- `undangan.html` mengeluarkan **SQL siap tempel** ke Supabase, dan isi
  `js/guests.js` versi kosong. Ada juga tombol "Buat Ulang Semua Kode".
- `admin.html` membaca rekap langsung dari basis data dengan token panitia,
  lengkap dengan penanda tamu mana yang **sudah membuka undangannya** (tabel
  `kunjungan`).
- Kalau server daftar tamu benar-benar tidak bisa dihubungi, tamu tetap
  dipersilakan masuk dengan sapaan umum (`access.saatServerMati: 'buka'`).
  Gangguan di hari H tidak bisa diulang; penebak kode tidak bisa memanfaatkan
  jalur ini karena cuma terbuka saat server memang mati. Setel `'tutup'` kalau
  mau ketat.
- Gerbang Netlify menutup seluruh folder `server/` untuk semua orang, supaya
  token yang tidak sengaja tersimpan di sana tidak ikut terbaca.

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
