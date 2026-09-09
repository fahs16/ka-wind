/* Undangan versi sederhana (simple.html).

   Isinya sama persis dengan versi game — sumbernya js/config.js yang sama —
   tapi disajikan sebagai undangan biasa: amplop tertutup dulu, lalu satu
   halaman gulir dengan huruf besar dan tombol besar. Tanpa kontrol, tanpa
   misi, tanpa yang perlu dipelajari.

   Gerbang aksesnya tetap sama: link personal ?u=KODE. Kalau kodenya tidak
   dikenal, halaman ini ikut tertutup seperti index.html. */

const Simple = {
  el: null, dibuka: false,

  /* ---------- Ornamen ---------- */
  // Monogram: dua inisial mempelai di dalam lingkaran berdaun.
  monogram() {
    const c = CONFIG.couple;
    const a = (c.groom.nick || '?').charAt(0).toUpperCase();
    const b = (c.bride.nick || '?').charAt(0).toUpperCase();
    return '<svg class="monogram" viewBox="0 0 100 100" role="img" aria-label="Monogram ' + a + ' dan ' + b + '">' +
      '<circle cx="50" cy="50" r="43" fill="none" stroke="#a8823c" stroke-width="1"/>' +
      '<circle cx="50" cy="50" r="38" fill="none" stroke="#e6d3ae" stroke-width="2.5"/>' +
      // Belah ketupat kecil di atas & bawah, motif yang sama dengan pemisah
      // antar bagian, biar satu bahasa.
      '<path d="M50 22l4 6-4 6-4-6z" fill="#a8365a"/>' +
      '<path d="M50 66l4 6-4 6-4-6z" fill="#a8365a"/>' +
      '<text x="50" y="60" text-anchor="middle" font-family="Cormorant Garamond, Georgia, serif" fill="#39262f">' +
        '<tspan font-size="32" font-weight="600">' + U.esc(a) + '</tspan>' +
        '<tspan font-size="19" fill="#a8365a" dx="3" dy="-2">&amp;</tspan>' +
        '<tspan font-size="32" font-weight="600" dx="3" dy="2">' + U.esc(b) + '</tspan>' +
      '</text>' +
    '</svg>';
  },

  // Pemisah antar bagian: setangkai daun kecil dengan berlian di tengah.
  pemisah() {
    return '<svg class="pemisah" viewBox="0 0 150 22" aria-hidden="true">' +
      '<g fill="none" stroke="#c9b189" stroke-width="1.3" stroke-linecap="round">' +
        '<path d="M6 11h50"/><path d="M94 11h50"/>' +
        '<path d="M58 11q6-7 12 0"/><path d="M92 11q-6 7-12 0"/>' +
      '</g>' +
      '<path d="M75 4l5 7-5 7-5-7z" fill="#a8365a"/>' +
    '</svg>';
  },

  /* ---------- Sampul ---------- */
  gambarSampul() {
    const c = CONFIG.couple;
    const tamu = Content.guest();
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    document.getElementById('sampul').innerHTML =
      '<div class="sampul-isi"><div class="bingkai">' +
        this.monogram() +
        '<p class="kicker">The Wedding Of</p>' +
        '<h1 class="nama">' + U.esc(c.groom.nick) + '</h1>' +
        '<p class="dan">&amp;</p>' +
        '<h1 class="nama">' + U.esc(c.bride.nick) + '</h1>' +
        '<p class="tanggal">' + U.esc(tgl) + '</p>' +
        '<div class="sapaan">Kepada Yth.<b data-nama-tamu>' +
          U.esc(tamu || 'Bapak / Ibu / Saudara/i') + '</b></div>' +
        '<button class="tombol utama besar" type="button" id="buka">Buka Undangan</button>' +
        '<p class="sampul-catatan">Ada musik lembut di dalamnya. ' +
          'Bisa dimatikan lewat tombol &#9834; di pojok kanan bawah.</p>' +
      '</div></div>';
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
  },

  /* ---------- Halaman isi ---------- */
  mulai() {
    this.el = document.getElementById('halaman');
    Toast.init();
    document.body.classList.remove('memeriksa');

    const c = CONFIG.couple;
    document.title = 'Undangan Pernikahan ' + c.groom.nick + ' & ' + c.bride.nick;
    Chip.use(((CONFIG.lagu && CONFIG.lagu.simple) || 'romansa'));

    this.gambarSampul();
    this.tebarKelopak();

    this.el.innerHTML =
      this.pembuka() +
      this.mempelai() +
      this.kutipan() +
      this.acara() +
      this.cerita() +
      this.galeri() +
      this.rsvp() +
      this.kado() +
      this.penutup();

    this.jalankanHitungMundur();
    this.pasangTombol();
  },

  pembuka() {
    const s = CONFIG.salam || {};
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return '<section class="bagian">' +
      (s.pembuka ? '<p class="salam">' + U.esc(s.pembuka) + '</p>' : '') +
      (s.niat ? '<p class="niat">' + U.esc(s.niat) + '</p>' : '') +
      '<p class="tanggal" style="margin-top:26px">' + U.esc(tgl) + '</p>' +
      '<div class="mundur" id="mundur">' +
        '<div><b id="m-h">0</b><span>hari</span></div>' +
        '<div><b id="m-j">0</b><span>jam</span></div>' +
        '<div><b id="m-m">0</b><span>menit</span></div>' +
        '<div><b id="m-d">0</b><span>detik</span></div>' +
      '</div>' +
      '<p class="lewat" id="lewat" hidden>Terima kasih sudah menjadi bagian dari hari kami.</p>' +
    '</section>';
  },

  mempelai() {
    const c = CONFIG.couple;
    const satu = o =>
      '<div class="mempelai">' +
        '<h3 class="nama">' + U.esc(o.nick) + '</h3>' +
        '<p class="penuh">' + U.esc(o.full) + '</p>' +
        (o.role ? '<p class="ortu">' + U.esc(o.role) + '</p>' : '') +
      '</div>';
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Mempelai</h2>' +
      satu(c.groom) + '<p class="amper">&amp;</p>' + satu(c.bride) +
    '</section>';
  },

  kutipan() {
    const q = CONFIG.quote;
    if (!q || !q.text) return '';
    return '<section class="bagian">' + this.pemisah() +
      '<blockquote class="kutipan">' + U.esc(q.text) +
        (q.source ? '<span>' + U.esc(q.source) + '</span>' : '') +
      '</blockquote></section>';
  },

  acara() {
    const s = CONFIG.salam || {};
    const kartu = CONFIG.events.map(ev =>
      '<div class="kartu">' +
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
      ? '<div class="kartu"><h3>Siaran Langsung</h3>' +
        '<div class="tombol-baris"><a class="tombol utama" href="' + U.esc(CONFIG.liveStream) +
        '" target="_blank" rel="noopener">Tonton dari Rumah</a></div></div>'
      : '';
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Rangkaian Acara</h2>' +
      (s.penutup ? '<p class="sub">' + U.esc(s.penutup) + '</p>' : '') +
      kartu + live +
    '</section>';
  },

  cerita() {
    if (!CONFIG.story || !CONFIG.story.length) return '';
    const item = CONFIG.story.map(s =>
      '<li><div class="tahun">' + U.esc(s.year) + '</div>' +
      '<h3>' + U.esc(s.title) + '</h3>' +
      '<p>' + U.esc(s.text) + '</p></li>').join('');
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Cerita Kami</h2>' +
      '<p class="sub">Sedikit tentang bagaimana kami sampai di titik ini.</p>' +
      '<ul class="cerita">' + item + '</ul>' +
    '</section>';
  },

  galeri() {
    if (!CONFIG.gallery || !CONFIG.gallery.length) return '';
    const item = CONFIG.gallery.map((g, i) => {
      const dalam = g.src
        ? '<img src="' + U.esc(g.src) + '" alt="' + U.esc(g.caption) + '" loading="lazy"' +
          ' onerror="this.parentNode.classList.add(\'kosong\');this.parentNode.textContent=\'Foto ' + (i + 1) + '\';">'
        : 'Foto ' + (i + 1);
      return '<figure><div class="bingkai-foto' + (g.src ? '' : ' kosong') + '">' + dalam + '</div>' +
        '<figcaption>' + U.esc(g.caption) + '</figcaption></figure>';
    }).join('');
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Galeri</h2>' +
      '<p class="sub">Beberapa potongan perjalanan kami.</p>' +
      '<div class="galeri">' + item + '</div>' +
    '</section>';
  },

  rsvp() {
    const simpan = Store.get();
    const info = Content.guestInfo();
    const maksKursi = U.clamp(info.seats || 5, 1, 10);
    const opsi = Array.from({ length: maksKursi }, (_, i) =>
      '<option value="' + (i + 1) + '"' +
      (simpan && +simpan.jumlah === i + 1 ? ' selected' : '') + '>' + (i + 1) + ' orang</option>').join('');
    const pilih = v => (simpan && simpan.hadir === v ? ' selected' : '');
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Konfirmasi Kehadiran</h2>' +
      '<p class="sub">Mohon diisi supaya kami bisa menyiapkan kursi dan konsumsi yang pas.' +
        (CONFIG.rsvp.deadline ? ' Ditunggu sebelum <b>' + U.esc(CONFIG.rsvp.deadline) + '</b>.' : '') + '</p>' +
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
      '<div class="hasil" id="rsvp-result"></div>' +
    '</section>';
  },

  kado() {
    const g = CONFIG.gifts;
    if (!g) return '';
    const bank = (g.banks || []).map(b =>
      '<div class="rekening">' +
        '<div class="bank">' + U.esc(b.bank) + '</div>' +
        '<div class="nomor">' + U.esc(b.number) + '</div>' +
        '<div class="atasnama">atas nama ' + U.esc(b.holder) + '</div>' +
        '<button class="tombol kecil" type="button" data-salin="' + U.esc(b.number) + '">Salin Nomor</button>' +
      '</div>').join('');
    const alamat = g.address
      ? '<div class="kartu tengah"><h3>Kirim Kado</h3><div class="isi">' + U.esc(g.address) + '</div>' +
        '<div class="tombol-baris"><button class="tombol kecil" type="button" data-salin="' +
        U.esc(g.address) + '">Salin Alamat</button></div></div>'
      : '';
    return '<section class="bagian">' + this.pemisah() +
      '<h2>Tanda Kasih</h2>' +
      '<p class="sub">Kehadiran Anda sudah lebih dari cukup. ' +
        'Tapi kalau ingin mengirim tanda kasih, ini pintunya.</p>' +
      bank + alamat +
    '</section>';
  },

  penutup() {
    const c = CONFIG.couple;
    const s = CONFIG.salam || {};
    return '<section class="bagian penutup">' + this.pemisah() +
      '<p class="kicker">Sampai jumpa di hari bahagia</p>' +
      this.monogram() +
      '<p class="nama">' + U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) + '</p>' +
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
    return 'index.html' + (kode ? '?u=' + encodeURIComponent(kode) : '');
  },

  /* ---------- Perilaku ---------- */
  tebarKelopak() {
    const kotak = document.getElementById('kelopak');
    if (!kotak) return;
    let html = '';
    for (let i = 0; i < 14; i++) {
      const kiri = Math.round(U.hash(i * 7 + 1, i * 3 + 5) * 100);
      const lama = (11 + U.hash(i, i * 2) * 12).toFixed(1);
      const tunda = (U.hash(i * 5, i + 3) * 14).toFixed(1);
      html += '<i style="left:' + kiri + '%;animation-duration:' + lama + 's;animation-delay:-' + tunda + 's"></i>';
    }
    kotak.innerHTML = html;
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

  pasangTombol() {
    document.getElementById('musik').addEventListener('click', () => this.setelMusik(!Chip.playing));

    this.el.addEventListener('click', e => {
      const salin = e.target.closest('[data-salin]');
      if (salin) { copyText(salin.getAttribute('data-salin'), 'Tersalin'); return; }
      const ics = e.target.closest('[data-ics]');
      if (ics) Content.downloadIcs(ics.getAttribute('data-ics'));
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

    if (CONFIG.rsvp.endpoint) {
      gambar('<p class="status">Sedang mengirim ke buku tamu...</p>');
      Rsvp.kirim(data).then(hasil => {
        gambar(hasil.ok
          ? '<p class="status baik">Tersimpan di buku tamu ' + U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) + '.</p>'
          : '<p class="status warn">Koneksi ke buku tamu gagal. Jawaban Anda tersimpan di HP ini &mdash; ' +
            'mohon kirim juga lewat tombol WhatsApp di bawah ya.</p>');
        kotak.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      });
    } else {
      gambar('');
    }
    kotak.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
};

window.addEventListener('DOMContentLoaded', () => {
  Access.mulai()
    .then(boleh => { boleh ? Simple.mulai() : Access.tutup(); })
    .catch(() => Access.tutup());
});
