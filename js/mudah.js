/* Versi sederhana undangan (mudah.html).

   Isinya sama persis dengan versi game — sumbernya js/config.js yang sama —
   tapi disajikan sebagai satu halaman gulir: huruf besar, tombol besar, tanpa
   kontrol, tanpa misi, tanpa suara. Buat tamu yang tidak terbiasa main game.

   Gerbang aksesnya tetap sama: link personal ?u=KODE. Kalau kodenya tidak
   dikenal, halaman ini ikut tertutup seperti index.html. */

const Mudah = {
  el: null,

  mulai() {
    this.el = document.getElementById('halaman');
    Toast.init();
    document.body.classList.remove('memeriksa');

    const c = CONFIG.couple;
    document.title = 'Undangan Pernikahan ' + c.groom.nick + ' & ' + c.bride.nick;

    this.el.innerHTML =
      this.sampul() +
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

  /* ---------- Bagian-bagian ---------- */
  sampul() {
    const c = CONFIG.couple;
    const tamu = Content.guest();
    const d = new Date(CONFIG.bigDay);
    const tgl = isNaN(d) ? '' : d.toLocaleDateString('id-ID',
      { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    return '<section class="bagian sampul">' +
      '<p class="kicker">The Wedding Of</p>' +
      '<h1 class="nama">' + U.esc(c.groom.nick) + '</h1>' +
      '<p class="dan">&amp;</p>' +
      '<h1 class="nama">' + U.esc(c.bride.nick) + '</h1>' +
      '<p class="tanggal">' + U.esc(tgl) + '</p>' +
      '<div class="mundur" id="mundur">' +
        '<div><b id="m-h">0</b><span>hari</span></div>' +
        '<div><b id="m-j">0</b><span>jam</span></div>' +
        '<div><b id="m-m">0</b><span>menit</span></div>' +
        '<div><b id="m-d">0</b><span>detik</span></div>' +
      '</div>' +
      '<p class="lewat" id="lewat" hidden>Terima kasih sudah menjadi bagian dari hari kami.</p>' +
      '<div class="sapaan">Kepada Yth.<b data-nama-tamu>' +
        U.esc(tamu || 'Bapak / Ibu / Saudara/i') + '</b></div>' +
    '</section>';
  },

  kutipan() {
    const q = CONFIG.quote;
    if (!q || !q.text) return '';
    return '<section class="bagian">' +
      '<blockquote class="kutipan">' + U.esc(q.text) +
        (q.source ? '<span>' + U.esc(q.source) + '</span>' : '') +
      '</blockquote></section>';
  },

  acara() {
    const c = CONFIG.couple;
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
    return '<section class="bagian">' +
      '<h2>Rangkaian Acara</h2>' +
      '<p class="sub">Merupakan suatu kehormatan bagi kami apabila ' +
        U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) +
        ' dapat bertemu langsung dengan Anda di hari itu.</p>' +
      kartu + live +
    '</section>';
  },

  cerita() {
    if (!CONFIG.story || !CONFIG.story.length) return '';
    const item = CONFIG.story.map(s =>
      '<li><div class="tahun">' + U.esc(s.year) + '</div>' +
      '<h3>' + U.esc(s.title) + '</h3>' +
      '<p>' + U.esc(s.text) + '</p></li>').join('');
    return '<section class="bagian">' +
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
      return '<figure><div class="bingkai' + (g.src ? '' : ' kosong') + '">' + dalam + '</div>' +
        '<figcaption>' + U.esc(g.caption) + '</figcaption></figure>';
    }).join('');
    return '<section class="bagian">' +
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
    return '<section class="bagian">' +
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
      ? '<div class="kartu"><h3>Kirim Kado</h3><div class="isi">' + U.esc(g.address) + '</div>' +
        '<div class="tombol-baris"><button class="tombol kecil" type="button" data-salin="' +
        U.esc(g.address) + '">Salin Alamat</button></div></div>'
      : '';
    return '<section class="bagian">' +
      '<h2>Tanda Kasih</h2>' +
      '<p class="sub">Kehadiran Anda sudah lebih dari cukup. Tapi kalau ingin mengirim tanda kasih, ini pintunya.</p>' +
      bank + alamat +
    '</section>';
  },

  penutup() {
    const c = CONFIG.couple;
    const orangTua = [c.groom, c.bride].map(o =>
      '<div class="kartu"><h3>' + U.esc(o.nick) + '</h3>' +
      '<div class="isi"><b>' + U.esc(o.full) + '</b></div>' +
      (o.role ? '<div class="isi">' + U.esc(o.role) + '</div>' : '') + '</div>').join('');
    return '<section class="bagian penutup">' +
      '<h2>Turut Mengundang</h2>' + orangTua +
      '<p class="kicker" style="margin-top:32px">Sampai jumpa di hari bahagia</p>' +
      '<p class="nama">' + U.esc(c.groom.nick) + ' &amp; ' + U.esc(c.bride.nick) + '</p>' +
      (c.hashtag ? '<p class="tagar">' + U.esc(c.hashtag) + '</p>' : '') +
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

    const c = CONFIG.couple;
    const wa = Rsvp.waLink(data);
    const kotak = document.getElementById('rsvp-result');
    const gambar = status =>
      kotak.innerHTML = '<div class="kartu">' +
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
    .then(boleh => { boleh ? Mudah.mulai() : Access.tutup(); })
    .catch(() => Access.tutup());
});
