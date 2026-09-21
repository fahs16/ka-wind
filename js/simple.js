/* Undangan utama — versi sederhana (index.html).

   Isinya sama persis dengan versi game — sumbernya js/config.js yang sama —
   tapi disajikan sebagai undangan pernikahan biasa: amplop tertutup dulu,
   lalu satu halaman gulir. Tanpa kontrol, tanpa misi, tanpa yang perlu
   dipelajari.

   Semua ornamen di sini digambar sendiri pakai SVG, bukan foto, karena
   undangan ini harus tetap terlihat layak walaupun galerinya masih kosong.

   Gerbang aksesnya tetap sama: link personal ?u=KODE. Kalau kodenya tidak
   dikenal, halaman ini ikut tertutup seperti game.html. */

const Simple = {
  el: null, dibuka: false, fotoAktif: -1,

  /* =====================================================================
     Ornamen — satu bahasa gambar untuk seluruh halaman: garis tipis emas,
     daun zaitun, mawar kecil, dan belah ketupat sebagai titik.
     ===================================================================== */

  // Sehelai daun zaitun. Selalu dipakai lewat pembungkus <g transform>.
  daun: '<path d="M0 0C4-6 13-6 17 0 13 6 4 6 0 0Z" fill="#e7eddf" stroke="#7d8f6a" ' +
        'stroke-width="1.1"/><path d="M1 0h15" stroke="#7d8f6a" stroke-width=".9"/>',

  // Setangkai mawar: lingkaran dengan dua pusaran di dalamnya.
  mawar(x, y, besar) {
    return '<g transform="translate(' + x + ',' + y + ') scale(' + besar + ')">' +
      '<circle r="7" fill="#f3dde3" stroke="#a8365a" stroke-width="1.2"/>' +
      '<path d="M-3.6 1.4a3.9 3.9 0 1 1 4.6 3.5" fill="none" stroke="#a8365a" stroke-width="1.2"/>' +
      '<path d="M-1.5-2.2a2 2 0 1 1 2.6 1.8" fill="none" stroke="#a8365a" stroke-width="1"/>' +
    '</g>';
  },

  /* --------- Untaian bunga gantung ---------
     Ini yang bikin halamannya terasa undangan, bukan ornamen garis tipis:
     rangkaian bunga yang menjuntai dari sudut atas, seperti wisteria.

     Digambar prosedural, bukan foto — jadi tidak ada berkas gambar yang perlu
     diunduh, ukurannya bebas diperbesar tanpa pecah, dan warnanya tetap satu
     keluarga dengan sisa halaman. Acaknya memakai U.hash yang hasilnya sama
     setiap kali, supaya rangkaiannya tidak berubah-ubah tiap halaman dibuka. */

  KELOPAK: ['#fbe7ee', '#f3d3df', '#e9b9cd', '#dda3bc', '#ffffff'],
  DEDAUNAN: ['#cfdcbe', '#b6cba0', '#9db98a', '#e4ecd8'],

  // Titik di sepanjang kurva Bezier kubik. Dipakai untuk menempelkan bunga
  // mengikuti lengkung tangkainya, bukan sekadar berjajar lurus ke bawah.
  bezier(p, t) {
    const u = 1 - t;
    return {
      x: u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
      y: u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7]
    };
  },

  // Satu untai yang menjuntai: tangkai melengkung, bunga menggerombol di
  // pangkal lalu mengecil ke ujung, dan beberapa helai daun di atasnya.
  untai(x, panjang, benih) {
    const ac = (a, b) => U.hash(benih * 31 + a, benih * 17 + b);
    const goyang = 14 + ac(1, 2) * 20;
    const p = [x, -6,
               x + goyang, panjang * 0.32,
               x - goyang * 1.3, panjang * 0.68,
               x + goyang * 0.35, panjang];

    let keluar = '<path d="M' + p[0] + ' ' + p[1] + 'C' + p[2] + ' ' + p[3] + ' ' +
      p[4] + ' ' + p[5] + ' ' + p[6] + ' ' + p[7] + '" fill="none" stroke="#9a7c66" ' +
      'stroke-width="' + (1.6 + ac(3, 4) * 1.4).toFixed(1) + '" stroke-linecap="round" opacity=".75"/>';

    // Daun besar di pangkal untaian.
    for (let i = 0; i < 5; i++) {
      const t = 0.03 + i * 0.075;
      const q = this.bezier(p, t);
      const besar = (0.75 + ac(i, 9) * 0.55).toFixed(2);
      const putar = Math.round(ac(i, 11) * 360);
      keluar += '<g transform="translate(' + q.x.toFixed(1) + ',' + q.y.toFixed(1) +
        ') rotate(' + putar + ') scale(' + besar + ')" opacity=".85">' + this.daun + '</g>';
    }

    // Gerombolan bunga. Makin ke ujung makin kecil dan makin rapat, persis
    // seperti untaian wisteria sungguhan.
    // Rapat dan bertumpuk di pangkal, menipis ke ujung. Tumpukannya yang
    // bikin untaiannya terbaca sebagai rumpun bunga, bukan manik di tali.
    const jumlah = 13 + Math.round(ac(5, 6) * 5);
    for (let i = 0; i < jumlah; i++) {
      const t = 0.1 + (i / jumlah) * 0.9;
      const q = this.bezier(p, t);
      const dasar = 15 * (1 - t * 0.76);
      for (let k = 0; k < 5; k++) {
        const r = dasar * (0.5 + ac(i * 3 + k, 13) * 0.6);
        const dx = (ac(i * 5 + k, 15) - 0.5) * dasar * 1.7;
        const dy = (ac(i * 7 + k, 19) - 0.5) * dasar * 1.2;
        const warna = this.KELOPAK[Math.floor(ac(i + k, 23) * this.KELOPAK.length) % this.KELOPAK.length];
        keluar += '<ellipse cx="' + (q.x + dx).toFixed(1) + '" cy="' + (q.y + dy).toFixed(1) +
          '" rx="' + r.toFixed(1) + '" ry="' + (r * 0.82).toFixed(1) + '" fill="' + warna +
          '" opacity="' + (0.55 + ac(i * 2 + k, 27) * 0.4).toFixed(2) + '"/>';
      }
    }
    return keluar;
  },

  // Satu rangkaian sudut: dahan melintang di atas, lalu untaian-untaian yang
  // menjuntai dengan panjang berbeda-beda.
  rangkaian(lebar, tinggi, benih) {
    const ac = (a, b) => U.hash(benih * 41 + a, benih * 23 + b);
    // Dahan utama membentang dari pojok, sedikit melengkung ke bawah.
    let keluar = '<path d="M-10 16Q' + (lebar * 0.45) + ' ' + (tinggi * 0.1) + ' ' +
      (lebar + 10) + ' ' + (tinggi * 0.32) + '" fill="none" stroke="#8a6f5c" ' +
      'stroke-width="4" stroke-linecap="round" opacity=".8"/>';

    // Kanopi daun yang rapat menempel di dahannya — dua baris supaya pangkal
    // rangkaiannya terasa padat, bukan cuma satu garis daun.
    for (let i = 0; i < 34; i++) {
      const u = (i % 17) / 16;
      const baris = Math.floor(i / 17);
      const x = -12 + u * (lebar + 24) + (ac(i, 2) - 0.5) * 22;
      const y = 14 + u * (tinggi * 0.22) - Math.sin(u * Math.PI) * tinggi * 0.06 +
        baris * 16 + (ac(i, 4) - 0.5) * 18;
      const besar = (1 + ac(i, 3) * 1.1).toFixed(2);
      const warna = this.DEDAUNAN[Math.floor(ac(i, 5) * this.DEDAUNAN.length) % this.DEDAUNAN.length];
      keluar += '<g transform="translate(' + x.toFixed(1) + ',' + y.toFixed(1) + ') rotate(' +
        Math.round(ac(i, 7) * 360) + ') scale(' + besar + ')">' +
        '<path d="M0 0C4-6 13-6 17 0 13 6 4 6 0 0Z" fill="' + warna +
        '" stroke="#7d8f6a" stroke-width="1"/></g>';
    }

    const untaian = 10;
    for (let i = 0; i < untaian; i++) {
      const x = lebar * (0.04 + (i / (untaian - 1)) * 0.92) + (ac(i, 12) - 0.5) * 18;
      // Panjangnya dibikin beragam: kebanyakan pendek, beberapa menjuntai jauh.
      // Lalu diruncingkan ke arah tengah halaman — paling panjang menggantung
      // di pojok, makin pendek menjauh darinya. Tanpa ini dua rangkaian sudut
      // bertemu di tengah dan menutupi monogramnya.
      const runcing = 1 - 0.72 * Math.pow(x / lebar, 1.3);
      const panjang = tinggi * (0.3 + Math.pow(ac(i, 9), 1.8) * 0.72) * runcing;
      keluar += '<g transform="translate(0,' + (14 + (x / lebar) * tinggi * 0.2).toFixed(1) + ')">' +
        this.untai(x, panjang, benih * 7 + i) + '</g>';
    }
    return keluar;
  },

  // Dibungkus jadi alamat data: gambar ini dipakai sebagai latar lewat CSS,
  // bukan ditanam sebagai ratusan elemen di dalam halaman. Satu rangkaian
  // isinya ~250 bentuk — kalau jadi elemen sungguhan, halamannya jadi berat.
  rangkaianUrl(lebar, tinggi, benih) {
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + lebar + '" height="' + tinggi +
      '" viewBox="0 0 ' + lebar + ' ' + tinggi + '">' +
      '<defs><filter id="l" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feGaussianBlur stdDeviation=".45"/></filter>' +
      '<filter id="k" x="-30%" y="-30%" width="160%" height="160%">' +
        '<feGaussianBlur stdDeviation="3.2"/></filter></defs>' +
      // Lapis belakang yang kabur memberi kesan cat air, bukan stiker.
      '<g filter="url(#k)" opacity=".5">' + this.rangkaian(lebar, tinggi, benih + 1) + '</g>' +
      '<g filter="url(#l)">' + this.rangkaian(lebar, tinggi, benih) + '</g>' +
    '</svg>';
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';
  },

  // Monogram: dua inisial mempelai di tengah karangan daun.
  monogram() {
    const c = CONFIG.couple;
    const a = (c.groom.nick || '?').charAt(0).toUpperCase();
    const b = (c.bride.nick || '?').charAt(0).toUpperCase();
    // Daun disusun menyusuri lingkaran, kiri dan kanan simetris, dan sengaja
    // dibiarkan renggang di puncak supaya belah ketupatnya kelihatan.
    let karangan = '';
    for (const sisi of [1, -1]) {
      for (let i = 0; i < 8; i++) {
        const derajat = 32 + i * 16;
        const rad = derajat * Math.PI / 180;
        const x = (50 + sisi * Math.sin(rad) * 43).toFixed(1);
        const y = (50 - Math.cos(rad) * 43).toFixed(1);
        karangan += '<g transform="translate(' + x + ',' + y + ') rotate(' +
          (sisi * derajat + 90).toFixed(0) + ') scale(.46)">' + this.daun + '</g>';
      }
    }
    return '<svg class="monogram" viewBox="0 0 100 100" role="img" aria-label="Monogram ' + a + ' dan ' + b + '">' +
      '<circle cx="50" cy="50" r="36" fill="none" stroke="#e6d3ae" stroke-width="2.5"/>' +
      '<circle cx="50" cy="50" r="31" fill="none" stroke="#a8823c" stroke-width=".8"/>' +
      karangan +
      '<path d="M50 4l4.5 7-4.5 7-4.5-7z" fill="#a8365a"/>' +
      '<text x="50" y="61" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" fill="#39262f">' +
        '<tspan font-size="30" font-weight="600">' + U.esc(a) + '</tspan>' +
        '<tspan font-size="18" fill="#a8365a" dx="2" dy="-2">&amp;</tspan>' +
        '<tspan font-size="30" font-weight="600" dx="2" dy="2">' + U.esc(b) + '</tspan>' +
      '</text>' +
    '</svg>';
  },

  // Rangkaian bunga untuk sudut bingkai sampul. Digambar sekali menghadap
  // sudut kiri-atas; tiga sudut sisanya tinggal dicerminkan lewat CSS.
  sudutBunga() {
    let daun = '';
    // Daun ditempel di sepanjang tangkai, berselang-seling kiri-kanan.
    const titik = [[22, 74, 150], [30, 58, 205], [44, 44, 160], [58, 32, 215], [70, 24, 165]];
    for (let i = 0; i < titik.length; i++) {
      daun += '<g transform="translate(' + titik[i][0] + ',' + titik[i][1] + ') rotate(' +
        titik[i][2] + ') scale(.62)">' + this.daun + '</g>';
    }
    return '<svg class="sudut" viewBox="0 0 110 110" aria-hidden="true">' +
      '<path d="M8 104C14 72 34 40 82 18" fill="none" stroke="#7d8f6a" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M8 104C26 86 40 58 46 22" fill="none" stroke="#c9b189" stroke-width="1.1" stroke-linecap="round"/>' +
      daun +
      this.mawar(16, 88, 1.15) + this.mawar(37, 64, .85) + this.mawar(62, 33, .7) +
    '</svg>';
  },

  // Pemisah antar bagian. Tiga corak supaya halaman panjang tidak terasa
  // mengulang gambar yang sama terus-menerus.
  pemisah(jenis) {
    const garis = '<g fill="none" stroke="#c9b189" stroke-width="1.2" stroke-linecap="round">' +
      '<path d="M6 12h46"/><path d="M118 12h46"/></g>';
    if (jenis === 'mawar') {
      return '<svg class="pemisah" viewBox="0 0 170 24" aria-hidden="true">' + garis +
        '<g transform="translate(70,12) rotate(200) scale(.75)">' + this.daun + '</g>' +
        '<g transform="translate(100,12) rotate(20) scale(.75)">' + this.daun + '</g>' +
        this.mawar(85, 12, 1.05) +
      '</svg>';
    }
    if (jenis === 'daun') {
      return '<svg class="pemisah" viewBox="0 0 170 24" aria-hidden="true">' + garis +
        '<g transform="translate(60,12) rotate(196) scale(.8)">' + this.daun + '</g>' +
        '<g transform="translate(110,12) rotate(16) scale(.8)">' + this.daun + '</g>' +
        '<path d="M85 4l4.5 8-4.5 8-4.5-8z" fill="#a8365a"/>' +
      '</svg>';
    }
    return '<svg class="pemisah" viewBox="0 0 170 24" aria-hidden="true">' + garis +
      '<path d="M85 3l5 9-5 9-5-9z" fill="none" stroke="#a8823c" stroke-width="1.2"/>' +
      '<path d="M85 7.5l2.5 4.5-2.5 4.5-2.5-4.5z" fill="#a8365a"/>' +
      '<circle cx="64" cy="12" r="2" fill="#e6d3ae"/><circle cx="106" cy="12" r="2" fill="#e6d3ae"/>' +
    '</svg>';
  },

  // Sulur merambat untuk tepi kiri dan kanan layar. Digambar sebagai satu
  // petak yang ujung atas dan bawahnya bertemu di titik yang sama, jadi bisa
  // diulang ke bawah tanpa kelihatan sambungannya.
  sulur() {
    let daun = '';
    const titik = [[20, 14, 300], [20, 46, 130], [20, 78, 300], [20, 110, 130],
                   [20, 142, 300], [20, 174, 130]];
    for (const t of titik) {
      daun += '<g transform="translate(' + t[0] + ',' + t[1] + ') rotate(' + t[2] +
        ') scale(.58)">' + this.daun + '</g>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 192" width="40" height="192">' +
      '<path d="M20 0C8 24 32 40 20 64 8 88 32 104 20 128 8 152 32 168 20 192" ' +
        'fill="none" stroke="#7d8f6a" stroke-width="1.3" stroke-linecap="round"/>' +
      daun + this.mawar(20, 32, .62) + this.mawar(20, 96, .62) + this.mawar(20, 160, .62) +
    '</svg>';
  },

  ikonIg() {
    return '<svg class="ikon-ig" viewBox="0 0 24 24" aria-hidden="true">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.7">' +
      '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/>' +
      '<circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/>' +
      '</g></svg>';
  },

  // Cip kartu, dipakai di kartu rekening supaya bentuknya seperti kartu ATM.
  ikonCip() {
    return '<svg class="cip" viewBox="0 0 34 26" aria-hidden="true">' +
      '<rect x=".9" y=".9" width="32.2" height="24.2" rx="4" fill="#efd9a8" stroke="#a8823c" stroke-width="1.1"/>' +
      '<g fill="none" stroke="#a8823c" stroke-width="1.1">' +
      '<path d="M12 1v24M22 1v24M1 9h11M22 9h11M1 17h11M22 17h11"/>' +
      '<rect x="12" y="8" width="10" height="10" rx="2"/></g></svg>';
  },

  // Lambang kecil di kepala kartu acara: kubah untuk akad, cincin untuk
  // resepsi. Dipilih dari nama acaranya sendiri supaya tidak perlu setelan
  // tambahan di config.js.
  ikonAcara(ev) {
    const nama = ((ev.id || '') + ' ' + (ev.name || '')).toLowerCase();
    const akad = nama.indexOf('akad') >= 0 || nama.indexOf('nikah') >= 0 ||
                 nama.indexOf('ijab') >= 0 || nama.indexOf('pemberkatan') >= 0;
    const isi = akad
      ? '<path d="M13 26a11 11 0 0 1 22 0"/><path d="M13 26v15M35 26v15"/>' +
        '<path d="M20 41v-7a4 4 0 0 1 8 0v7"/><path d="M24 15v-5"/>' +
        '<path d="M7 41V27h4v14M37 41V27h4v14"/><path d="M5 41h38"/>'
      : '<circle cx="19" cy="28" r="9"/><circle cx="31" cy="28" r="9"/>' +
        '<path d="M31 19l3-5 3 5-3 4z"/><path d="M12 14l1.5 3 3 1.5-3 1.5L12 23l-1.5-3L7.5 18.5 10.5 17z"/>';
    return '<svg class="ikon" viewBox="0 0 48 48" aria-hidden="true">' +
      '<g fill="none" stroke="#a8823c" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
      isi + '</g></svg>';
  },

  /* =====================================================================
     Sampul — amplop tertutup
     ===================================================================== */
  gambarSampul() {
    const c = CONFIG.couple;
    const tamu = Content.guest();
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const sudut = this.sudutBunga();
    document.getElementById('sampul').innerHTML =
      // Untaiannya dipasang di dalam kartunya, bukan di tepi layar, supaya di
      // layar lebar tetap menggantung di pojok kartu dan bukan melayang jauh.
      '<div class="sampul-isi">' +
        '<span class="untaian-sampul kiri"></span><span class="untaian-sampul kanan"></span>' +
        '<div class="bingkai">' +
        '<div class="sudut-bunga">' + sudut + sudut + sudut + sudut + '</div>' +
        this.monogram() +
        '<p class="kicker">The Wedding Of</p>' +
        '<h1 class="nama tulis">' + U.esc(c.groom.nick) + '</h1>' +
        '<p class="dan">&amp;</p>' +
        '<h1 class="nama tulis">' + U.esc(c.bride.nick) + '</h1>' +
        '<p class="tanggal">' + U.esc(tgl) + '</p>' +
        '<div class="sapaan"><span>Kepada Yth.</span><b data-nama-tamu>' +
          U.esc(tamu || 'Bapak / Ibu / Saudara/i') + '</b></div>' +
        '<button class="tombol utama besar" type="button" id="buka">' +
          '<svg class="ikon-tombol" viewBox="0 0 24 24" aria-hidden="true">' +
            '<g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">' +
            '<rect x="2.5" y="5.5" width="19" height="13" rx="1.5"/><path d="M2.5 7l9.5 7 9.5-7"/></g>' +
          '</svg>Buka Undangan</button>' +
        '<p class="sampul-catatan">Ada musik lembut di dalamnya. ' +
          'Bisa dimatikan lewat tombol &#9834; di pojok kanan bawah.</p>' +
      '</div></div>';
    const gantung = this.rangkaianUrl(460, 340, 11);
    document.querySelectorAll('.untaian-sampul').forEach(t => { t.style.backgroundImage = gantung; });
    document.getElementById('buka').addEventListener('click', () => this.buka());
  },

  buka() {
    if (this.dibuka) return;
    this.dibuka = true;
    document.getElementById('sampul').classList.add('pergi');
    document.body.classList.add('dibuka');
    // Sentuhan tamu barusan yang bikin browser mengizinkan suara.
    if (CONFIG.music !== false) this.setelMusik(true);
    window.scrollTo(0, 0);
    this.amatiBagian();
  },

  /* =====================================================================
     Halaman isi
     ===================================================================== */
  mulai() {
    this.el = document.getElementById('halaman');
    Toast.init();
    document.body.classList.remove('memeriksa');

    const c = CONFIG.couple;
    document.title = 'Undangan Pernikahan ' + c.groom.nick + ' & ' + c.bride.nick;
    Chip.use(((CONFIG.lagu && CONFIG.lagu.simple) || 'romansa'));

    this.gambarSampul();
    this.tebarKelopak();
    this.gambarHiasan();

    this.el.innerHTML =
      this.sorot() +
      this.pembuka() +
      this.mempelai() +
      this.kutipan() +
      this.acara() +
      this.cerita() +
      this.galeri() +
      this.rsvp() +
      this.ucapan() +
      this.kado() +
      this.penutup();

    this.jalankanHitungMundur();
    this.pasangTombol();
    this.pasangKomidi();
    this.muatUcapan();
  },

  // Kerangka satu bagian, supaya jarak dan susunan judulnya seragam.
  bungkus(o) {
    return '<section class="bagian' + (o.kelas ? ' ' + o.kelas : '') + '">' +
      (o.pemisah === false ? '' : this.pemisah(o.pemisah)) +
      (o.kicker ? '<p class="tulisan-tangan">' + U.esc(o.kicker) + '</p>' : '') +
      (o.judul ? '<h2>' + U.esc(o.judul) + '</h2>' : '') +
      (o.sub ? '<p class="sub">' + U.esc(o.sub) + '</p>' : '') +
      o.isi +
    '</section>';
  },

  // Bagian teratas: nama besar, tanggal, dan hitung mundur.
  sorot() {
    const c = CONFIG.couple;
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    // Tanggal dalam angka, dipisah titik — dipakai sebagai penanda besar di
    // bawah nama, sementara tanggal panjangnya tetap ada di kartu acara.
    const angka = isNaN(d) ? '' : [d.getDate(), d.getMonth() + 1, d.getFullYear()]
      .map(n => String(n).padStart(2, '0')).join(' . ');
    return '<section class="bagian sorot">' +
      '<div class="lengkung sorot-lengkung">' +
        '<p class="kicker">Undangan Pernikahan</p>' +
        '<h1 class="nama tulis">' + U.esc(c.groom.nick) + '</h1>' +
        '<div class="amper-garis"><span>&amp;</span></div>' +
        '<h1 class="nama tulis">' + U.esc(c.bride.nick) + '</h1>' +
        '<p class="tanggal-angka">' + U.esc(angka) + '</p>' +
        '<p class="tanggal">' + U.esc(tgl) + '</p>' +
      '</div>' +
      '<div class="mundur" id="mundur">' +
        '<div><b id="m-h">0</b><span>hari</span></div>' +
        '<div><b id="m-j">0</b><span>jam</span></div>' +
        '<div><b id="m-m">0</b><span>menit</span></div>' +
        '<div><b id="m-d">0</b><span>detik</span></div>' +
      '</div>' +
      '<p class="lewat" id="lewat" hidden>Terima kasih sudah menjadi bagian dari hari kami.</p>' +
      '<div class="gulir" aria-hidden="true"><span></span></div>' +
    '</section>';
  },

  pembuka() {
    const s = CONFIG.salam || {};
    if (!s.pembuka && !s.niat) return '';
    return this.bungkus({
      kelas: 'pita', pemisah: 'daun',
      isi: (s.pembuka ? '<p class="salam">' + U.esc(s.pembuka) + '</p>' : '') +
           (s.niat ? '<p class="niat">' + U.esc(s.niat) + '</p>' : '')
    });
  },

  mempelai() {
    const c = CONFIG.couple;
    const satu = o => {
      const awal = (o.nick || '?').charAt(0).toUpperCase();
      // Potretnya berbentuk lengkung seperti pintu — kalau fotonya belum ada,
      // yang mengisi inisialnya, bukan kotak kosong bertuliskan "foto".
      const potret = o.foto
        ? '<img src="' + U.esc(o.foto) + '" alt="' + U.esc(o.nick) + '" loading="lazy">'
        : '<span>' + U.esc(awal) + '</span>';
      return '<div class="mempelai">' +
        '<div class="lengkung medali">' + potret + '</div>' +
        '<h3 class="nama tulis">' + U.esc(o.nick) + '</h3>' +
        '<p class="penuh">' + U.esc(o.full) + '</p>' +
        (o.role ? '<p class="ortu">' + U.esc(o.role) + '</p>' : '') +
        (o.ig ? '<a class="ig" href="https://instagram.com/' + encodeURIComponent(o.ig) +
          '" target="_blank" rel="noopener" aria-label="Instagram ' + U.esc(o.nick) + '">' +
          this.ikonIg() + '</a>' : '') +
      '</div>';
    };
    return this.bungkus({
      kelas: 'mempelai-bagian', pemisah: 'mawar',
      kicker: 'Bismillah', judul: 'Mempelai',
      sub: 'Dengan memohon rahmat dan ridho Allah, kami bermaksud menyelenggarakan pernikahan:',
      isi: satu(c.groom) + '<div class="amper-garis"><span>&amp;</span></div>' + satu(c.bride)
    });
  },

  kutipan() {
    const q = CONFIG.quote;
    if (!q || !q.text) return '';
    return this.bungkus({
      kelas: 'pita', pemisah: 'titik',
      isi: '<blockquote class="kutipan">' +
        '<span class="petik" aria-hidden="true">&ldquo;</span>' +
        U.esc(q.text) +
        (q.source ? '<span class="asal">' + U.esc(q.source) + '</span>' : '') +
      '</blockquote>'
    });
  },

  acara() {
    const s = CONFIG.salam || {};
    const kartu = CONFIG.events.map(ev =>
      '<div class="kartu acara lengkung">' +
        this.ikonAcara(ev) +
        '<h3>' + U.esc(ev.name) + '</h3>' +
        '<div class="baris"><span class="label">Hari</span><span class="isi"><b>' + U.esc(ev.day) + '</b></span></div>' +
        '<div class="baris"><span class="label">Jam</span><span class="isi">' + U.esc(ev.time) + '</span></div>' +
        '<div class="baris"><span class="label">Tempat</span><span class="isi"><b>' + U.esc(ev.place) + '</b></span></div>' +
        '<div class="baris"><span class="label">Alamat</span><span class="isi">' + U.esc(ev.address) + '</span></div>' +
        '<div class="tombol-baris">' +
          '<a class="tombol utama" href="' + U.esc(ev.maps) + '" target="_blank" rel="noopener">Lihat Peta Lokasi</a>' +
          '<button class="tombol" type="button" data-ics="' + U.esc(ev.id) + '">Simpan ke Kalender HP</button>' +
        '</div>' +
      '</div>').join('');
    const live = CONFIG.liveStream
      ? '<div class="kartu tengah"><h3>Siaran Langsung</h3>' +
        '<div class="tombol-baris"><a class="tombol utama" href="' + U.esc(CONFIG.liveStream) +
        '" target="_blank" rel="noopener">Tonton dari Rumah</a></div></div>'
      : '';
    return this.bungkus({
      kelas: 'gelap', pemisah: 'daun', kicker: 'Save the Date', judul: 'Rangkaian Acara',
      sub: s.penutup || '', isi: kartu + live
    });
  },

  cerita() {
    if (!CONFIG.story || !CONFIG.story.length) return '';
    const item = CONFIG.story.map(s =>
      '<li><div class="tahun">' + U.esc(s.year) + '</div>' +
      '<h3>' + U.esc(s.title) + '</h3>' +
      '<p>' + U.esc(s.text) + '</p></li>').join('');
    return this.bungkus({
      kelas: 'pita', pemisah: 'mawar',
      kicker: 'Our Story', judul: 'Cerita Kami',
      sub: 'Sedikit tentang bagaimana kami sampai di titik ini.',
      isi: '<ul class="cerita">' + item + '</ul>'
    });
  },

  galeri() {
    if (!CONFIG.gallery || !CONFIG.gallery.length) return '';
    const item = CONFIG.gallery.map((g, i) => {
      const dalam = g.src
        ? '<img src="' + U.esc(g.src) + '" alt="' + U.esc(g.caption) + '" loading="lazy"' +
          ' onerror="this.parentNode.classList.add(\'kosong\');this.parentNode.textContent=\'Foto ' + (i + 1) + '\';">'
        : 'Foto ' + (i + 1);
      // Hanya foto sungguhan yang bisa diperbesar; bingkai kosong dibiarkan diam.
      const buka = g.src ? ' data-foto="' + i + '" tabindex="0" role="button" aria-label="Perbesar ' +
        U.esc(g.caption) + '"' : '';
      return '<figure class="slide"><div class="bingkai-foto lengkung' + (g.src ? '' : ' kosong') + '"' +
        buka + '>' + dalam + '</div>' +
        '<figcaption>' + U.esc(g.caption) + '</figcaption></figure>';
    }).join('');
    const titik = CONFIG.gallery.map((g, i) =>
      '<button class="titik" type="button" data-ke="' + i + '" aria-label="Foto ke-' + (i + 1) + '"></button>'
    ).join('');
    // Komidi putar memakai scroll-snap bawaan browser, bukan pustaka: geserannya
    // jadi mulus dan ikut inersia jari tanpa satu baris pun kode gulir sendiri.
    return this.bungkus({
      pemisah: 'titik', kicker: 'Moments', judul: 'Galeri',
      sub: 'Geser untuk melihat potongan perjalanan kami.',
      isi: '<div class="komidi">' +
          '<div class="rel" id="galeri-rel">' + item + '</div>' +
          '<button class="komidi-geser kiri" type="button" data-slide="-1" aria-label="Foto sebelumnya">&#8249;</button>' +
          '<button class="komidi-geser kanan" type="button" data-slide="1" aria-label="Foto berikutnya">&#8250;</button>' +
        '</div>' +
        '<div class="titik-baris" id="galeri-titik">' + titik + '</div>'
    });
  },

  rsvp() {
    const simpan = Store.get();
    const info = Content.guestInfo();
    const maksKursi = U.clamp(info.seats || 5, 1, 10);
    const opsi = Array.from({ length: maksKursi }, (_, i) =>
      '<option value="' + (i + 1) + '"' +
      (simpan && +simpan.jumlah === i + 1 ? ' selected' : '') + '>' + (i + 1) + ' orang</option>').join('');
    const pilih = v => (simpan && simpan.hadir === v ? ' selected' : '');
    return this.bungkus({
      kelas: 'pita', pemisah: 'mawar',
      kicker: 'RSVP', judul: 'Konfirmasi Kehadiran',
      sub: 'Mohon diisi supaya kami bisa menyiapkan kursi dan konsumsi yang pas.' +
        (CONFIG.rsvp.deadline ? ' Ditunggu sebelum ' + CONFIG.rsvp.deadline + '.' : ''),
      isi: '<div class="kartu isian-kartu">' +
        '<form id="rsvp-form" class="isian">' +
          '<label>Nama Anda' +
            '<input name="nama" required maxlength="60" autocomplete="name" ' +
            'value="' + U.esc(simpan ? simpan.nama : (info.name || '')) + '" placeholder="Nama lengkap"></label>' +
          '<label>Bisa hadir?<select name="hadir">' +
            '<option' + pilih('Hadir') + '>Hadir</option>' +
            '<option' + pilih('Masih ragu') + '>Masih ragu</option>' +
            '<option' + pilih('Tidak bisa hadir') + '>Tidak bisa hadir</option>' +
          '</select></label>' +
          '<label>Datang berapa orang?' +
            (info.seats ? ' <span class="jatah">(jatah Anda ' + info.seats + ' kursi)</span>' : '') +
            '<select name="jumlah">' + opsi + '</select></label>' +
          '<label>Ucapan &amp; doa' +
            '<textarea name="pesan" rows="4" maxlength="400" placeholder="Tulis doa terbaik Anda...">' +
            U.esc(simpan ? simpan.pesan : '') + '</textarea></label>' +
          '<button class="tombol utama" type="submit">Kirim Konfirmasi</button>' +
        '</form>' +
      '</div>' +
      '<div class="hasil" id="rsvp-result"></div>'
    });
  },

  // Buku tamu: ucapan yang ditulis tamu lain di formulir RSVP, ditampilkan
  // balik di halaman. Kerangkanya digambar sekarang dan isinya menyusul dari
  // server — jadi kalau servernya diam, yang diam cuma bagian ini.
  ucapan() {
    if (!Ucapan.aktif()) return '';
    return this.bungkus({
      pemisah: 'titik', kicker: 'Wishes', judul: 'Ucapan & Doa',
      sub: 'Doa yang dikirim tamu-tamu lain untuk kami.',
      isi:
        '<div class="hitungan" id="ucapan-hitung">' +
          '<div><b>&mdash;</b><span>ucapan</span></div>' +
          '<div><b>&mdash;</b><span>hadir</span></div>' +
          '<div><b>&mdash;</b><span>berhalangan</span></div>' +
        '</div>' +
        '<div class="ucapan-daftar" id="ucapan-daftar">' +
          '<p class="ucapan-kabar">Sedang memuat buku tamu&hellip;</p>' +
        '</div>' +
        '<button class="tombol" type="button" id="ucapan-lagi" hidden>Lihat Lebih Banyak</button>'
    });
  },

  kado() {
    const g = CONFIG.gifts;
    if (!g) return '';
    const bank = (g.banks || []).map(b =>
      '<div class="rekening">' +
        '<div class="atm-atas">' +
          '<span class="bank">' + U.esc(b.bank) + '</span>' + this.ikonCip() +
        '</div>' +
        '<div class="nomor">' + U.esc(b.number) + '</div>' +
        '<div class="atm-bawah">' +
          '<span class="atasnama">' + U.esc(b.holder) + '</span>' +
          '<button class="tombol kecil" type="button" data-salin="' + U.esc(b.number) + '">Salin</button>' +
        '</div>' +
      '</div>').join('');
    const alamat = g.address
      ? '<div class="kartu tengah"><h3>Kirim Kado</h3><div class="isi">' + U.esc(g.address) + '</div>' +
        '<div class="tombol-baris"><button class="tombol kecil" type="button" data-salin="' +
        U.esc(g.address) + '">Salin Alamat</button></div></div>'
      : '';
    return this.bungkus({
      pemisah: 'daun', kicker: 'Wedding Gift', judul: 'Tanda Kasih',
      sub: 'Kehadiran Anda sudah lebih dari cukup. ' +
        'Tapi kalau ingin mengirim tanda kasih, ini pintunya.',
      isi: bank + alamat
    });
  },

  penutup() {
    const c = CONFIG.couple;
    const s = CONFIG.salam || {};
    return '<section class="bagian penutup">' + this.pemisah('mawar') +
      '<p class="kicker">Sampai jumpa di hari bahagia</p>' +
      this.monogram() +
      '<p class="nama tulis">' + U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) + '</p>' +
      (c.hashtag ? '<p class="tagar">' + U.esc(c.hashtag) + '</p>' : '') +
      (s.salamPenutup ? '<p class="salam-penutup">' + U.esc(s.salamPenutup) + '</p>' : '') +
      '<div class="tukar">Ada versi lain undangan ini: sebuah game kecil ' +
        'untuk jalan-jalan di taman kami.' +
        '<a class="tombol" href="' + U.esc(this.linkGame()) + '">Coba Versi Game</a>' +
      '</div>' +
    '</section>';
  },

  // Kode tamu ikut dibawa supaya pindah versi tidak kena gerbang akses lagi.
  linkGame() {
    const kode = (U.query('u') || U.query('kode')).trim();
    return 'game.html' + (kode ? '?u=' + encodeURIComponent(kode) : '');
  },

  /* =====================================================================
     Perilaku
     ===================================================================== */

  // Rangkaian bunga samar di dua sudut layar. Dipaku ke layar, bukan ke
  // halaman, supaya tidak ikut tergulir dan tidak menambah tinggi halaman.
  gambarHiasan() {
    const kotak = document.getElementById('hiasan');
    if (!kotak) return;
    kotak.innerHTML =
      '<span class="untaian kiri"></span><span class="untaian kanan"></span>' +
      '<span class="tepi kiri"></span><span class="tepi kanan"></span>';
    // Semua hiasan dipasang sebagai latar, bukan sebagai ribuan elemen SVG
    // di dalam halaman — satu rangkaian saja isinya ratusan bentuk.
    const sulur = 'url("data:image/svg+xml,' + encodeURIComponent(this.sulur()) + '")';
    kotak.querySelectorAll('.tepi').forEach(t => { t.style.backgroundImage = sulur; });
    const untaian = this.rangkaianUrl(420, 300, 3);
    kotak.querySelectorAll('.untaian').forEach(t => { t.style.backgroundImage = untaian; });
  },

  tebarKelopak() {
    const kotak = document.getElementById('kelopak');
    if (!kotak) return;
    let html = '';
    for (let i = 0; i < 24; i++) {
      const kiri = Math.round(U.hash(i * 7 + 1, i * 3 + 5) * 100);
      // Tiga lapis kedalaman. Yang jauh jatuh lebih lambat — itu saja sudah
      // cukup untuk memberi kesan ruang tanpa gambar latar tambahan.
      const lapis = i % 3 === 0 ? 'jauh' : (i % 3 === 1 ? '' : 'dekat');
      const dasar = lapis === 'jauh' ? 19 : (lapis === 'dekat' ? 10 : 14);
      const lama = (dasar + U.hash(i, i * 2) * 9).toFixed(1);
      const tunda = (U.hash(i * 5, i + 3) * 22).toFixed(1);
      const goyang = (5 + U.hash(i * 3, i + 7) * 4).toFixed(1);
      html += '<i class="' + lapis + '" style="left:' + kiri + '%;animation-duration:' + lama + 's,' +
        goyang + 's;animation-delay:-' + tunda + 's,-' + tunda + 's"></i>';
    }
    kotak.innerHTML = html;
  },

  // Tiap bagian baru muncul pelan saat tergulir ke layar. Kalau browsernya
  // tidak punya IntersectionObserver, semua bagian langsung ditampilkan —
  // isinya tidak boleh hilang cuma karena hiasannya tidak jalan.
  amatiBagian() {
    const bagian = this.el.querySelectorAll('.bagian');
    const langsung = () => bagian.forEach(b => b.classList.add('tampak'));
    if (!('IntersectionObserver' in window) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return langsung();
    const mata = new IntersectionObserver(masuk => {
      masuk.forEach(m => {
        if (!m.isIntersecting) return;
        m.target.classList.add('tampak');
        mata.unobserve(m.target);
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    bagian.forEach(b => mata.observe(b));
  },

  setelMusik(nyala) {
    const tombol = document.getElementById('musik');
    if (nyala) Chip.start(); else Chip.stop();
    tombol.classList.toggle('mati', !Chip.playing);
    tombol.setAttribute('aria-pressed', Chip.playing ? 'true' : 'false');
  },

  jalankanHitungMundur() {
    const kotak = document.getElementById('mundur');
    const lewat = document.getElementById('lewat');
    const tik = () => {
      const cd = U.countdown(CONFIG.bigDay);
      if (!cd) { kotak.hidden = true; return; }
      if (cd.past) {
        kotak.hidden = true;
        if (lewat) lewat.hidden = false;
        return;
      }
      document.getElementById('m-h').textContent = cd.d;
      document.getElementById('m-j').textContent = cd.h;
      document.getElementById('m-m').textContent = cd.m;
      document.getElementById('m-d').textContent = cd.s;
    };
    tik();
    setInterval(tik, 1000);
  },

  /* ---------- Galeri komidi putar ---------- */
  // Geserannya diserahkan ke scroll-snap bawaan browser; yang ditangani di
  // sini cuma tombol panah, titik penanda, dan menjaga titiknya tetap ikut
  // posisi gulir — termasuk waktu tamu menggeser pakai jari.
  pasangKomidi() {
    const rel = document.getElementById('galeri-rel');
    const baris = document.getElementById('galeri-titik');
    if (!rel || !baris) return;
    const slide = () => Array.from(rel.querySelectorAll('.slide'));

    const sekarang = () => {
      const s = slide();
      if (!s.length) return 0;
      const tengah = rel.scrollLeft + rel.clientWidth / 2;
      let pilih = 0, dekat = Infinity;
      s.forEach((el, i) => {
        const jarak = Math.abs(el.offsetLeft + el.offsetWidth / 2 - tengah);
        if (jarak < dekat) { dekat = jarak; pilih = i; }
      });
      return pilih;
    };

    const tandai = () => {
      const i = sekarang();
      baris.querySelectorAll('.titik').forEach((t, k) => t.classList.toggle('aktif', k === i));
      const s = slide();
      rel.parentNode.querySelector('.komidi-geser.kiri').disabled = i <= 0;
      rel.parentNode.querySelector('.komidi-geser.kanan').disabled = i >= s.length - 1;
    };

    this.keFoto = ke => {
      const s = slide();
      const i = U.clamp(ke, 0, s.length - 1);
      rel.scrollTo({ left: s[i].offsetLeft - (rel.clientWidth - s[i].offsetWidth) / 2,
                     behavior: 'smooth' });
    };

    // Gulirnya dipantau dengan jeda: kalau ditandai tiap piksel, titiknya
    // berkedip-kedip waktu jari masih menggeser.
    let jam = 0;
    rel.addEventListener('scroll', () => {
      clearTimeout(jam);
      jam = setTimeout(tandai, 90);
    }, { passive: true });
    window.addEventListener('resize', () => { clearTimeout(jam); jam = setTimeout(tandai, 150); });
    tandai();
  },

  /* ---------- Buku tamu ---------- */
  bukuTamu: { daftar: [], tampil: 0 },

  muatUcapan() {
    if (!Ucapan.aktif()) return Promise.resolve();
    return Ucapan.muat().then(h => {
      const daftarEl = document.getElementById('ucapan-daftar');
      if (!daftarEl) return;
      if (!h.ok) {
        // Buku tamunya tidak bisa dibaca sekarang. Bagian ini dipadamkan
        // diam-diam; tamu tidak perlu dibebani pesan kesalahan teknis.
        const bagian = daftarEl.closest('.bagian');
        if (bagian) bagian.hidden = true;
        return;
      }
      const j = h.jumlah || {};
      const kotak = document.getElementById('ucapan-hitung');
      if (kotak) {
        const angka = kotak.querySelectorAll('b');
        angka[0].textContent = j.ucapan || 0;
        angka[1].textContent = j.hadir || 0;
        angka[2].textContent = (j.tidak || 0) + (j.ragu || 0);
      }
      this.bukuTamu.daftar = (h.daftar || []).filter(u => Ucapan.layak(u.pesan));
      this.bukuTamu.tampil = 0;
      this.tambahUcapan();
    });
  },

  // Ditampilkan sepotong-sepotong supaya bagiannya tidak jadi gulungan
  // sepanjang halaman kalau ucapannya sudah ratusan.
  tambahUcapan() {
    const daftarEl = document.getElementById('ucapan-daftar');
    const lagi = document.getElementById('ucapan-lagi');
    if (!daftarEl) return;
    const semua = this.bukuTamu.daftar;
    if (!semua.length) {
      daftarEl.innerHTML = '<p class="ucapan-kabar">Belum ada ucapan. ' +
        'Jadilah yang pertama lewat formulir di atas.</p>';
      if (lagi) lagi.hidden = true;
      return;
    }
    const per = U.clamp((CONFIG.ucapan && CONFIG.ucapan.perHalaman) || 5, 1, 50);
    const sampai = Math.min(semua.length, this.bukuTamu.tampil + per);
    const potong = semua.slice(0, sampai);
    daftarEl.innerHTML = potong.map(u => {
      const hadir = String(u.hadir || '').toLowerCase();
      const label = hadir.indexOf('tidak') === 0 ? 'Berhalangan'
                  : hadir.indexOf('ragu') >= 0 ? 'Masih ragu' : 'Hadir';
      const kelas = hadir.indexOf('tidak') === 0 ? ' tidak'
                  : hadir.indexOf('ragu') >= 0 ? ' ragu' : '';
      const awal = (String(u.nama || '?').trim().charAt(0) || '?').toUpperCase();
      return '<article class="ucapan">' +
        '<div class="ucapan-kepala">' +
          '<span class="ucapan-awal">' + U.esc(awal) + '</span>' +
          '<div class="ucapan-siapa">' +
            '<b>' + U.esc(u.nama || 'Tamu') + '</b>' +
            '<span class="ucapan-kapan">' + U.esc(Ucapan.kapan(u.waktu)) + '</span>' +
          '</div>' +
          '<span class="lencana' + kelas + '">' + label + '</span>' +
        '</div>' +
        '<p class="ucapan-isi">' + U.esc(u.pesan) + '</p>' +
      '</article>';
    }).join('');
    this.bukuTamu.tampil = sampai;
    if (lagi) {
      lagi.hidden = sampai >= semua.length;
      lagi.textContent = 'Lihat Lebih Banyak (' + (semua.length - sampai) + ' lagi)';
    }
  },

  /* ---------- Foto diperbesar ---------- */
  bukaLampu(i) {
    const foto = (CONFIG.gallery || [])[i];
    if (!foto || !foto.src) return;
    this.fotoAktif = i;
    const lampu = document.getElementById('lampu');
    lampu.querySelector('img').src = foto.src;
    lampu.querySelector('img').alt = foto.caption || '';
    lampu.querySelector('figcaption').textContent = foto.caption || '';
    lampu.hidden = false;
    document.body.classList.add('terkunci');
    lampu.querySelector('.lampu-tutup').focus();
  },

  tutupLampu() {
    document.getElementById('lampu').hidden = true;
    document.body.classList.remove('terkunci');
    this.fotoAktif = -1;
  },

  // Lompat ke foto berikutnya yang benar-benar punya gambar.
  geserLampu(arah) {
    const galeri = CONFIG.gallery || [];
    for (let n = 1; n <= galeri.length; n++) {
      const i = (this.fotoAktif + arah * n + galeri.length * n) % galeri.length;
      if (galeri[i] && galeri[i].src) return this.bukaLampu(i);
    }
  },

  pasangTombol() {
    document.getElementById('musik').addEventListener('click', () => this.setelMusik(!Chip.playing));

    this.el.addEventListener('click', e => {
      const salin = e.target.closest('[data-salin]');
      if (salin) { copyText(salin.getAttribute('data-salin'), 'Tersalin'); return; }
      const ics = e.target.closest('[data-ics]');
      if (ics) { Content.downloadIcs(ics.getAttribute('data-ics')); return; }
      const foto = e.target.closest('[data-foto]');
      if (foto) { this.bukaLampu(+foto.getAttribute('data-foto')); return; }
      if (e.target.closest('#ucapan-lagi')) { this.tambahUcapan(); return; }
      const geser = e.target.closest('[data-slide]');
      if (geser && this.keFoto) {
        const rel = document.getElementById('galeri-rel');
        const s = Array.from(rel.querySelectorAll('.slide'));
        const tengah = rel.scrollLeft + rel.clientWidth / 2;
        let kini = 0, dekat = Infinity;
        s.forEach((el, i) => {
          const jarak = Math.abs(el.offsetLeft + el.offsetWidth / 2 - tengah);
          if (jarak < dekat) { dekat = jarak; kini = i; }
        });
        this.keFoto(kini + (+geser.getAttribute('data-slide')));
        return;
      }
      const titik = e.target.closest('[data-ke]');
      if (titik && this.keFoto) this.keFoto(+titik.getAttribute('data-ke'));
    });

    // Bingkai foto bukan <button>, jadi papan ketik harus dilayani sendiri.
    this.el.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const foto = e.target.closest('[data-foto]');
      if (!foto) return;
      e.preventDefault();
      this.bukaLampu(+foto.getAttribute('data-foto'));
    });

    const lampu = document.getElementById('lampu');
    lampu.addEventListener('click', e => {
      const geser = e.target.closest('[data-geser]');
      if (geser) { this.geserLampu(+geser.getAttribute('data-geser')); return; }
      // Klik di luar fotonya berarti minta ditutup.
      if (e.target.closest('figure') && !e.target.closest('.lampu-tutup')) return;
      this.tutupLampu();
    });
    document.addEventListener('keydown', e => {
      if (lampu.hidden) return;
      if (e.key === 'Escape') this.tutupLampu();
      if (e.key === 'ArrowRight') this.geserLampu(1);
      if (e.key === 'ArrowLeft') this.geserLampu(-1);
    });

    this.el.addEventListener('submit', e => {
      if (e.target.id !== 'rsvp-form') return;
      e.preventDefault();
      this.kirimRsvp(e.target);
    });
  },

  kirimRsvp(form) {
    const data = Rsvp.dari(form);
    if (!data.nama) return;
    Store.set(data);
    Chip.confirm();

    const c = CONFIG.couple;
    const wa = Rsvp.waLink(data);
    const kotak = document.getElementById('rsvp-result');
    const gambar = status =>
      kotak.innerHTML = '<div class="kartu tengah">' +
        '<h3>Terkirim</h3>' +
        '<div class="isi">Terima kasih, ' + U.esc(data.nama) + '. Jawaban Anda sudah kami catat.</div>' +
        status +
        '<div class="tombol-baris"><a class="tombol utama" href="' + wa +
          '" target="_blank" rel="noopener">Kirim juga lewat WhatsApp</a></div>' +
      '</div>';

    if (Rsvp.aktif()) {
      gambar('<p class="status">Sedang mengirim ke buku tamu...</p>');
      Rsvp.kirim(data).then(hasil => {
        gambar(hasil.ok
          ? '<p class="status baik">Tersimpan di buku tamu ' + U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) + '.</p>'
          : '<p class="status warn">Koneksi ke buku tamu gagal. Jawaban Anda tersimpan di HP ini &mdash; ' +
            'mohon kirim juga lewat tombol WhatsApp di bawah ya.</p>');
        kotak.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        // Buku tamu dimuat ulang supaya ucapan yang barusan dikirim langsung
        // kelihatan di bawah, bukan baru muncul kalau halamannya dibuka lagi.
        if (hasil.ok) this.muatUcapan();
      });
    } else {
      gambar('');
    }
    kotak.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  // ?game=1 langsung dibelokkan ke versi game, supaya satu link undangan tetap
  // cukup buat tamu yang memang mau main.
  if (U.query('game') === '1') { location.replace('game.html' + location.search); return; }

  Access.mulai()
    .then(boleh => {
      if (!boleh) { Access.tutup(); return; }
      // Isi yang tidak boleh ter-publish diambil dulu, baru halaman digambar.
      // Kalau servernya diam, CONFIG dibiarkan apa adanya dan undangan tetap
      // tampil — hanya isinya yang seadanya.
      return Isi.muat().then(() => Simple.mulai());
    })
    .catch(() => Access.tutup());
});
