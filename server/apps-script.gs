/**
 * BUKU TAMU DIGITAL — Google Apps Script
 * ---------------------------------------------------------------------------
 * Cara pasang (sekali saja, ~5 menit):
 *  1. Buat Google Sheet baru.
 *  2. Menu Extensions (Ekstensi) > Apps Script. Hapus isi Code.gs, tempel file ini.
 *  3. Ganti ADMIN_TOKEN di bawah dengan kata sandi panjang buatanmu sendiri.
 *  4. Jalankan fungsi initSheet() sekali (pilih di dropdown lalu Run) dan izinkan aksesnya.
 *     Ini membuat dua tab: RSVP (jawaban tamu) dan TAMU (daftar undangan).
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
var ADMIN_TOKEN = 'ganti-dengan-kata-sandi-panjang-punyamu';

var HEADERS = ['Waktu', 'Kode', 'Nama', 'Grup', 'Kehadiran', 'Jumlah', 'Ucapan', 'Revisi'];
var HEADERS_TAMU = ['Kode', 'Nama', 'Kursi', 'Grup', 'WA'];

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

  return 'Sheet RSVP dan TAMU siap dipakai.';
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

  // Daftar lengkap, khusus halaman rekap panitia.
  if (action === 'tamu-all') {
    if (p.token !== ADMIN_TOKEN) return json_({ ok: false, error: 'token salah' });
    return json_({ ok: true, tamu: bacaTamu_() });
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
