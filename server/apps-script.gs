/**
 * BUKU TAMU DIGITAL — Google Apps Script
 * ---------------------------------------------------------------------------
 * Cara pasang (sekali saja, ~5 menit):
 *  1. Buat Google Sheet baru.
 *  2. Menu Extensions (Ekstensi) > Apps Script. Hapus isi Code.gs, tempel file ini.
 *  3. Ganti ADMIN_TOKEN di bawah dengan kata sandi panjang buatanmu sendiri.
 *  4. Jalankan fungsi initSheet() sekali (pilih di dropdown lalu Run) dan izinkan aksesnya.
 *     Ini membuat empat tab: RSVP (jawaban tamu), TAMU (daftar undangan),
 *     GEM (penemu pojokan rahasia), dan KUNJUNGAN (siapa yang sudah membuka).
 *  3b. Kalau memakai hadiah pojokan rahasia, atur GEM_BATAS dan GEM_HADIAH
 *     di bawah. Keduanya sengaja di sini, bukan di js/config.js, supaya isinya
 *     tidak bisa dibaca dari situs.
 *     Isi tab TAMU lewat tombol "Salin untuk Google Sheet" di undangan.html.
 *  5. Deploy > New deployment > pilih tipe "Web app".
 *       - Execute as        : Me
 *       - Who has access    : Anyone
 *     Salin URL-nya (diakhiri /exec).
 *  6. Tempel URL itu ke js/config.js  ->  rsvp.endpoint
 *     Token-nya JANGAN ditaruh di config.js. Token cuma dipakai waktu membuka admin.html.
 *
 * Kalau nanti kode ini diubah, ulangi Deploy > Manage deployments > Edit > New version,
 * supaya URL-nya tetap sama.
 * ---------------------------------------------------------------------------
 */

var SHEET_NAME  = 'RSVP';
var SHEET_TAMU  = 'TAMU';
var SHEET_GEM   = 'GEM';
var SHEET_BUKA  = 'KUNJUNGAN';
var ADMIN_TOKEN = 'ganti-dengan-kata-sandi-panjang-punyamu';

/* ---------------- HADIAH POJOKAN RAHASIA ("hidden gem") ----------------
   Teks hadiah dan batas waktunya tinggal DI SINI, bukan di js/config.js,
   karena berkas di situs bisa dibaca siapa pun. Yang ada di situs cuma
   percakapannya; isi hadiahnya baru dikirim setelah syaratnya lolos.

   GEM_BATAS diisi H-1: tamu yang baru sadar di hari H tidak perlu repot
   berburu, dan yang keliling dari jauh-jauh hari dapat bagian eksklusifnya.
   Formatnya 'YYYY-MM-DDTHH:mm:ss+07:00' (WIB +07, WITA +08, WIT +09).       */
var GEM_BATAS  = '2026-12-11T23:59:00+07:00';
var GEM_HADIAH = 'Tunjukkan kode ini ke meja pager ayu waktu kamu datang. ' +
                 'Ada satu bingkisan kecil yang kami siapkan khusus buat tamu ' +
                 'yang main sampai habis, dan kami bakal tahu persis kamu siapa.';
var GEM_TITIK  = ['gate', 'akad', 'resepsi', 'galeri', 'cerita', 'couple', 'kado', 'rsvp'];
var GEM_JEDA_DETIK = 180;   // jeda minimal sejak tamu pertama kali membuka undangan

var HEADERS = ['Waktu', 'Kode', 'Nama', 'Grup', 'Kehadiran', 'Jumlah', 'Ucapan', 'Revisi'];
var HEADERS_TAMU = ['Kode', 'Nama', 'Kursi', 'Grup', 'WA'];
var HEADERS_GEM = ['Kode Hadiah', 'Kode Tamu', 'Nama', 'Grup', 'Ditemukan', 'Ditukar', 'Oleh'];
var HEADERS_BUKA = ['Kode Tamu', 'Nama', 'Pertama Buka', 'Terakhir Buka', 'Jumlah'];

/* ------------------------------------------------------------------ utils */
function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(SHEET_NAME);
    sh.appendRow(HEADERS);
  }
  return sh;
}

function sheetTamu_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_TAMU);
  if (!sh) {
    sh = ss.insertSheet(SHEET_TAMU);
    sh.appendRow(HEADERS_TAMU);
  }
  return sh;
}

/** Membaca seluruh daftar tamu. Hanya dipakai di dalam skrip ini. */
function bacaTamu_() {
  var sh = sheetTamu_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var data = sh.getRange(2, 1, last - 1, HEADERS_TAMU.length).getValues();
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var kode = str_(data[i][0]);
    if (!kode) continue;
    out.push({
      kode: kode,
      nama: str_(data[i][1]),
      kursi: Number(data[i][2]) || 0,
      grup: str_(data[i][3]),
      wa: str_(data[i][4])
    });
  }
  return out;
}

function sheetGem_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_GEM);
  if (!sh) {
    sh = ss.insertSheet(SHEET_GEM);
    sh.appendRow(HEADERS_GEM);
  }
  return sh;
}

function bacaGem_() {
  var sh = sheetGem_();
  var last = sh.getLastRow();
  if (last < 2) return [];
  var data = sh.getRange(2, 1, last - 1, HEADERS_GEM.length).getValues();
  var out = [];
  for (var i = 0; i < data.length; i++) {
    var kode = str_(data[i][0]);
    if (!kode) continue;
    out.push({
      baris: i + 2,
      kode: kode,
      kodeTamu: str_(data[i][1]),
      nama: str_(data[i][2]),
      grup: str_(data[i][3]),
      ditemukan: data[i][4] ? new Date(data[i][4]).toISOString() : '',
      ditukar: data[i][5] ? new Date(data[i][5]).toISOString() : '',
      ditukarOleh: str_(data[i][6])
    });
  }
  return out;
}

/* ------------------------------------------------------- catatan kunjungan
   Siapa saja yang sudah membuka undangannya. Dua gunanya: kalian tahu tamu
   mana yang belum melihat sama sekali, dan hadiah pojokan rahasia punya
   patokan "sudah berapa lama tamu ini keliling". */
function sheetBuka_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(SHEET_BUKA);
  if (!sh) {
    sh = ss.insertSheet(SHEET_BUKA);
    sh.appendRow(HEADERS_BUKA);
  }
  return sh;
}

function barisBuka_(kode) {
  var sh = sheetBuka_();
  var last = sh.getLastRow();
  if (last < 2) return null;
  var data = sh.getRange(2, 1, last - 1, HEADERS_BUKA.length).getValues();
  for (var i = 0; i < data.length; i++) {
    if (str_(data[i][0]).toLowerCase() === String(kode).toLowerCase()) {
      return { baris: i + 2, pertama: data[i][2] ? new Date(data[i][2]) : null,
               jumlah: Number(data[i][4]) || 0 };
    }
  }
  return null;
}

function catatBuka_(kode, nama) {
  var sh = sheetBuka_();
  var ada = barisBuka_(kode);
  var kini = new Date();
  if (ada) {
    sh.getRange(ada.baris, 4).setValue(kini);
    sh.getRange(ada.baris, 5).setValue(ada.jumlah + 1);
  } else {
    sh.appendRow([kode, nama, kini, kini, 1]);
  }
}

function bukaPertama_(kode) {
  var ada = barisBuka_(kode);
  return ada ? ada.pertama : null;
}

// Kode hadiah unik. Huruf yang gampang salah baca (0 O 1 I L) sengaja dibuang,
// karena kode ini nanti dibacakan ke pager ayu dari layar HP.
function kodeGem_(dipakai) {
  var HURUF = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  for (var coba = 0; coba < 40; coba++) {
    var k = 'GEM-';
    for (var i = 0; i < 6; i++) k += HURUF.charAt(Math.floor(Math.random() * HURUF.length));
    if (dipakai.indexOf(k) < 0) return k;
  }
  return '';
}

function initSheet() {
  var sh = sheet_();
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#f0e5d2');
  sh.setFrozenRows(1);
  sh.autoResizeColumns(1, HEADERS.length);

  var st = sheetTamu_();
  if (st.getLastRow() === 0) st.appendRow(HEADERS_TAMU);
  st.getRange(1, 1, 1, HEADERS_TAMU.length).setFontWeight('bold').setBackground('#e6dcc6');
  st.setFrozenRows(1);
  st.autoResizeColumns(1, HEADERS_TAMU.length);

  var sg = sheetGem_();
  if (sg.getLastRow() === 0) sg.appendRow(HEADERS_GEM);
  sg.getRange(1, 1, 1, HEADERS_GEM.length).setFontWeight('bold').setBackground('#efe0c2');
  sg.setFrozenRows(1);
  sg.autoResizeColumns(1, HEADERS_GEM.length);

  var sb = sheetBuka_();
  if (sb.getLastRow() === 0) sb.appendRow(HEADERS_BUKA);
  sb.getRange(1, 1, 1, HEADERS_BUKA.length).setFontWeight('bold').setBackground('#dfe8d0');
  sb.setFrozenRows(1);
  sb.autoResizeColumns(1, HEADERS_BUKA.length);

  return 'Sheet RSVP, TAMU, GEM, dan KUNJUNGAN siap dipakai.';
}

function str_(v) { return v === null || v === undefined ? '' : String(v).trim(); }

/* ------------------------------------------------------- simpan jawaban */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);

    var d = JSON.parse(e.postData.contents || '{}');
    var nama = str_(d.nama).slice(0, 80);
    if (!nama) return json_({ ok: false, error: 'nama kosong' });

    var row = [
      new Date(),
      str_(d.kode).slice(0, 24),
      nama,
      str_(d.grup).slice(0, 40),
      str_(d.hadir).slice(0, 24),
      Number(d.jumlah) || 1,
      str_(d.pesan).slice(0, 500),
      0
    ];

    var sh = sheet_();
    if (sh.getLastRow() === 0) sh.appendRow(HEADERS);

    // Satu tamu = satu baris. Kalau dia mengisi ulang, baris lamanya diperbarui.
    var found = 0;
    var last = sh.getLastRow();
    if (last > 1) {
      var data = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      for (var i = 0; i < data.length; i++) {
        var sameCode = row[1] && str_(data[i][1]).toLowerCase() === row[1].toLowerCase();
        var sameName = !row[1] && str_(data[i][2]).toLowerCase() === nama.toLowerCase();
        if (sameCode || sameName) { found = i + 2; break; }
      }
    }

    if (found) {
      row[7] = (Number(sh.getRange(found, 8).getValue()) || 0) + 1;
      sh.getRange(found, 1, 1, HEADERS.length).setValues([row]);
    } else {
      sh.appendRow(row);
    }

    return json_({ ok: true, updated: !!found });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (e2) {}
  }
}

/* --------------------------------------------------------- baca jawaban */
function doGet(e) {
  var p = (e && e.parameter) || {};
  var action = p.action || 'ping';

  if (action === 'ping') {
    return json_({ ok: true, service: 'buku-tamu', waktu: new Date().toISOString() });
  }

  // Mencari SATU tamu berdasarkan kode undangannya.
  // Sengaja tidak pernah mengembalikan seluruh daftar, dan nomor WA tidak ikut
  // dikirim, supaya data tamu lain tidak bisa dipanen dari sisi browser.
  if (action === 'tamu') {
    var kode = str_(p.u || p.kode).toLowerCase();
    if (!kode) return json_({ ok: false, error: 'kode kosong' });
    var semua = bacaTamu_();
    for (var i = 0; i < semua.length; i++) {
      if (semua[i].kode.toLowerCase() === kode) {
        catatBuka_(semua[i].kode, semua[i].nama);
        return json_({
          ok: true,
          tamu: {
            kode: semua[i].kode,
            nama: semua[i].nama,
            kursi: semua[i].kursi,
            grup: semua[i].grup
          }
        });
      }
    }
    return json_({ ok: false, error: 'tidak terdaftar' });
  }

  /* ---------------- HADIAH POJOKAN RAHASIA ----------------
     Syaratnya diperiksa DI SINI, bukan di browser: kodenya tamu terdaftar,
     seluruh titik wajib sudah dikunjungi, belum lewat batas waktu, dan sudah
     lewat jeda minimal sejak undangan pertama kali dibuka.

     Kode hadiahnya dibuat di sini dan unik per tamu, jadi tidak ada satu kode
     bersama yang bisa dibocorkan dari berkas js lalu dipakai ramai-ramai. */
  if (action === 'gem-status' || action === 'gem-klaim') {
    var kodeTamu = str_(p.u || p.kode).toLowerCase();
    var batas = GEM_BATAS ? new Date(GEM_BATAS) : null;
    var tutup = !!(batas && new Date() > batas);

    var tamu = null, semuaTamu = bacaTamu_();
    for (var t = 0; t < semuaTamu.length; t++) {
      if (semuaTamu[t].kode.toLowerCase() === kodeTamu) { tamu = semuaTamu[t]; break; }
    }

    var daftarGem = bacaGem_(), punya = null;
    if (tamu) {
      for (var g = 0; g < daftarGem.length; g++) {
        if (daftarGem[g].kodeTamu.toLowerCase() === tamu.kode.toLowerCase()) { punya = daftarGem[g]; break; }
      }
    }

    if (action === 'gem-status') {
      return json_({
        ok: true,
        batas: batas ? batas.toISOString() : null,
        tutup: tutup,
        wajib: GEM_TITIK.length,
        punya: !!punya,
        kode: punya ? punya.kode : null,
        hadiah: punya ? GEM_HADIAH : null,
        ditukar: punya ? (punya.ditukar || null) : null
      });
    }

    // ---- klaim ----
    if (!tamu) return json_({ ok: false, error: 'tanpa-kode' });

    // Sudah pernah klaim: kembalikan kode yang sama, apa pun keadaannya.
    if (punya) {
      return json_({ ok: true, baru: false, kode: punya.kode, hadiah: GEM_HADIAH,
                     ditemukan: punya.ditemukan, ditukar: punya.ditukar || null });
    }
    if (tutup) return json_({ ok: false, error: 'lewat-batas', batas: batas.toISOString() });

    var titik = str_(p.titik).toLowerCase().split(',');
    var kurang = 0;
    for (var w = 0; w < GEM_TITIK.length; w++) {
      if (titik.indexOf(GEM_TITIK[w]) < 0) kurang++;
    }
    if (kurang > 0) return json_({ ok: false, error: 'belum-lengkap', kurang: kurang });

    // Jeda minimal sejak tamu pertama kali membuka undangan. Baris RSVP belum
    // tentu ada, jadi patokannya baris kunjungan di tab GEM sendiri: kalau
    // belum pernah tercatat, catat sekarang dan minta tamu kembali sebentar lagi.
    var pertama = bukaPertama_(tamu.kode);
    if (!pertama) {
      // Belum pernah tercatat — bisa terjadi kalau tamu ini sudah membuka
      // undangannya sebelum tab KUNJUNGAN dibuat. Catat sekarang, lalu minta
      // dia kembali sebentar lagi. Tanpa ini, tamunya nyangkut selamanya.
      catatBuka_(tamu.kode, tamu.nama);
      return json_({ ok: false, error: 'terlalu-cepat', tunggu_detik: GEM_JEDA_DETIK });
    }
    var lewat = (new Date().getTime() - pertama.getTime()) / 1000;
    if (lewat < GEM_JEDA_DETIK) {
      return json_({ ok: false, error: 'terlalu-cepat',
                     tunggu_detik: Math.ceil(GEM_JEDA_DETIK - lewat) });
    }

    var dipakai = [];
    for (var d = 0; d < daftarGem.length; d++) dipakai.push(daftarGem[d].kode);
    var kodeBaru = kodeGem_(dipakai);
    if (!kodeBaru) return json_({ ok: false, error: 'gagal-buat-kode' });

    var saat = new Date();
    sheetGem_().appendRow([kodeBaru, tamu.kode, tamu.nama, tamu.grup, saat, '', '']);
    return json_({ ok: true, baru: true, kode: kodeBaru, hadiah: GEM_HADIAH,
                   ditemukan: saat.toISOString(), ditukar: null });
  }

  if (action === 'gem-list') {
    if (p.token !== ADMIN_TOKEN) return json_({ ok: false, error: 'token salah' });
    var bt = GEM_BATAS ? new Date(GEM_BATAS) : null;
    return json_({ ok: true, batas: bt ? bt.toISOString() : null,
                   tutup: !!(bt && new Date() > bt), baris: bacaGem_() });
  }

  if (action === 'gem-tukar') {
    if (p.token !== ADMIN_TOKEN) return json_({ ok: false, error: 'token salah' });
    var cari = str_(p.gem).toUpperCase();
    var semuaGem = bacaGem_();
    for (var x = 0; x < semuaGem.length; x++) {
      if (semuaGem[x].kode.toUpperCase() !== cari) continue;
      if (semuaGem[x].ditukar) {
        return json_({ ok: false, error: 'sudah ditukar', nama: semuaGem[x].nama,
                       ditukar: semuaGem[x].ditukar, ditukarOleh: semuaGem[x].ditukarOleh });
      }
      var kini = new Date();
      var sg = sheetGem_();
      sg.getRange(semuaGem[x].baris, 6).setValue(kini);
      sg.getRange(semuaGem[x].baris, 7).setValue(str_(p.oleh).slice(0, 40));
      return json_({ ok: true, nama: semuaGem[x].nama, grup: semuaGem[x].grup,
                     ditukar: kini.toISOString() });
    }
    return json_({ ok: false, error: 'kode hadiah tidak dikenal' });
  }

  // Daftar lengkap, khusus halaman rekap panitia.
  if (action === 'tamu-all') {
    if (p.token !== ADMIN_TOKEN) return json_({ ok: false, error: 'token salah' });
    // Digabung dengan tab KUNJUNGAN supaya halaman panitia bisa menunjukkan
    // tamu mana yang undangannya belum pernah dibuka sama sekali.
    var semuaTamu = bacaTamu_();
    var buka = {};
    var sb = sheetBuka_();
    var lastB = sb.getLastRow();
    if (lastB > 1) {
      var db = sb.getRange(2, 1, lastB - 1, HEADERS_BUKA.length).getValues();
      for (var i = 0; i < db.length; i++) {
        var k = str_(db[i][0]).toLowerCase();
        if (k) buka[k] = { terakhir: db[i][3] ? new Date(db[i][3]).toISOString() : '',
                           jumlah: Number(db[i][4]) || 0 };
      }
    }
    for (var j = 0; j < semuaTamu.length; j++) {
      var b = buka[semuaTamu[j].kode.toLowerCase()];
      semuaTamu[j].sudahBuka = !!b;
      semuaTamu[j].terakhirBuka = b ? b.terakhir : '';
      semuaTamu[j].kaliBuka = b ? b.jumlah : 0;
    }
    return json_({ ok: true, tamu: semuaTamu });
  }

  if (action === 'stats' || action === 'list') {
    var sh = sheet_();
    var last = sh.getLastRow();
    var rows = [];
    if (last > 1) {
      var data = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
      for (var i = 0; i < data.length; i++) {
        rows.push({
          waktu: data[i][0] ? new Date(data[i][0]).toISOString() : '',
          kode: str_(data[i][1]),
          nama: str_(data[i][2]),
          grup: str_(data[i][3]),
          hadir: str_(data[i][4]),
          jumlah: Number(data[i][5]) || 0,
          pesan: str_(data[i][6]),
          revisi: Number(data[i][7]) || 0
        });
      }
    }

    var stats = { total: rows.length, hadir: 0, ragu: 0, tidak: 0, orang: 0 };
    rows.forEach(function (r) {
      var h = r.hadir.toLowerCase();
      if (h.indexOf('tidak') === 0) stats.tidak++;
      else if (h.indexOf('ragu') >= 0) stats.ragu++;
      else { stats.hadir++; stats.orang += r.jumlah; }
    });

    if (action === 'stats') return json_({ ok: true, stats: stats });   // publik, angka saja
    if (p.token !== ADMIN_TOKEN) return json_({ ok: false, error: 'token salah' });
    return json_({ ok: true, stats: stats, rows: rows });
  }

  return json_({ ok: false, error: 'action tidak dikenal' });
}
