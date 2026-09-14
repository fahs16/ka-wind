/* Pengujian server/apps-script.gs — jalankan di komputer sendiri.

       node tools/tes-apps-script.js

   Yang diperiksa: hadiah pojokan rahasia dari ujung ke ujung. Syarat 8 titik,
   jeda minimal, batas waktu H-1, kode unik per tamu, klaim ulang, dan meja
   penukaran pager ayu.

   Kodenya dijalankan apa adanya di atas tiruan Sheet (tools/_stub-apps-script.js),
   jadi kalau lolos di sini, yang kamu tempel ke Apps Script juga benar. Hasilnya
   keluar sebagai daftar OK/GAGAL, dan keluar dengan status bukan-nol kalau ada
   yang gagal.

   Jalankan setiap kali kamu mengubah server/apps-script.gs, sebelum Deploy.   */

const fs = require('fs');
const { bikinLingkungan } = require('./_stub-apps-script.js');
const env = bikinLingkungan();
const src = fs.readFileSync(require('path').join(__dirname, '..', 'server', 'apps-script.gs'), 'utf8');
eval(src);                                   // memuat doGet, initSheet, dll

const get = (p) => JSON.parse(doGet({ parameter: p }).getContent());
const SEMUA = 'gate,akad,resepsi,galeri,cerita,couple,kado,rsvp';
const errs = [];
const cek = (nama, dapat, harus) => {
  const ok = JSON.stringify(dapat) === JSON.stringify(harus);
  if (!ok) errs.push(nama + ': dapat ' + JSON.stringify(dapat) + ', harusnya ' + JSON.stringify(harus));
  console.log((ok ? '  OK   ' : '  GAGAL') + '  ' + nama + ' -> ' + JSON.stringify(dapat));
};

console.log('=== siapkan sheet ===');
console.log(' ', initSheet());
sheetTamu_().appendRow(['andi-7k2p', 'Bapak Andi & Keluarga', 4, 'Keluarga', '628120000001']);
sheetTamu_().appendRow(['rina-q94m', 'Rina Kartika', 2, 'Teman', '628120000002']);
console.log('  tab yang dibuat:', Object.keys(env.sheets).join(', '));

console.log('\n=== 1. gem-status sebelum punya: tidak membocorkan hadiah ===');
const st = get({ action: 'gem-status', u: 'andi-7k2p' });
cek('punya', st.punya, false);
cek('hadiah bocor?', st.hadiah, null);
cek('wajib', st.wajib, 8);
cek('tutup', st.tutup, false);

console.log('\n=== 2. action=tamu mencatat kunjungan ===');
get({ action: 'tamu', u: 'andi-7k2p' });
cek('baris KUNJUNGAN', sheetBuka_().getLastRow(), 2);

console.log('\n=== 3. titik belum lengkap -> ditolak ===');
cek('kurang', get({ action: 'gem-klaim', u: 'andi-7k2p', titik: 'gate,akad' }).error, 'belum-lengkap');

console.log('\n=== 4. lengkap tapi baru buka -> terlalu cepat ===');
cek('jeda', get({ action: 'gem-klaim', u: 'andi-7k2p', titik: SEMUA }).error, 'terlalu-cepat');

console.log('\n=== 5. tamu yang belum pernah tercatat: harus ikut dicatat, bukan nyangkut ===');
const sebelum = sheetBuka_().getLastRow();
cek('rina ditolak dulu', get({ action: 'gem-klaim', u: 'rina-q94m', titik: SEMUA }).error, 'terlalu-cepat');
cek('rina ikut tercatat', sheetBuka_().getLastRow(), sebelum + 1);

console.log('\n=== 6. mundurkan waktu buka -> klaim berhasil ===');
const sb = sheetBuka_();
for (let r = 2; r <= sb.getLastRow(); r++) {
  sb.getRange(r, 3).setValue(new Date(Date.now() - 30 * 60000));
}
const k1 = get({ action: 'gem-klaim', u: 'andi-7k2p', titik: SEMUA });
cek('ok', k1.ok, true);
cek('baru', k1.baru, true);
console.log('  kode  :', k1.kode, '| format benar:', /^GEM-[A-HJ-NP-Z2-9]{6}$/.test(k1.kode));
console.log('  hadiah:', String(k1.hadiah).slice(0, 55) + '...');

console.log('\n=== 7. klaim ulang -> kode SAMA ===');
const k2 = get({ action: 'gem-klaim', u: 'andi-7k2p', titik: SEMUA });
cek('kode sama', k2.kode, k1.kode);
cek('baru=false', k2.baru, false);
cek('baris GEM tetap 1', sheetGem_().getLastRow(), 2);

console.log('\n=== 8. tamu lain -> kode berbeda ===');
const k3 = get({ action: 'gem-klaim', u: 'rina-q94m', titik: SEMUA });
cek('ok', k3.ok, true);
console.log('  kode rina:', k3.kode, '| beda:', k3.kode !== k1.kode);

console.log('\n=== 9. kode tamu ngawur ===');
cek('tolak', get({ action: 'gem-klaim', u: 'bukan-tamu', titik: SEMUA }).error, 'tanpa-kode');

console.log('\n=== 10. daftar & tukar (panitia) ===');
cek('tanpa token', get({ action: 'gem-list' }).error, 'token salah');
const list = get({ action: 'gem-list', token: ADMIN_TOKEN });
cek('jumlah penemu', list.baris.length, 2);
const t1 = get({ action: 'gem-tukar', token: ADMIN_TOKEN, gem: k1.kode.toLowerCase(), oleh: 'Mbak Sari' });
cek('tukar (huruf kecil)', t1.ok, true);
cek('nama', t1.nama, 'Bapak Andi & Keluarga');
cek('tukar dua kali', get({ action: 'gem-tukar', token: ADMIN_TOKEN, gem: k1.kode, oleh: 'X' }).error, 'sudah ditukar');
cek('kode ngawur', get({ action: 'gem-tukar', token: ADMIN_TOKEN, gem: 'GEM-NGAWUR', oleh: 'X' }).error, 'kode hadiah tidak dikenal');

console.log('\n=== 11. batas waktu lewat ===');
GEM_BATAS = new Date(Date.now() - 60000).toISOString();
sheetTamu_().appendRow(['telat-1', 'Tamu Telat', 2, '', '']);
sheetBuka_().appendRow(['telat-1', 'Tamu Telat', new Date(Date.now() - 30 * 60000), new Date(), 1]);
cek('tamu baru ditolak', get({ action: 'gem-klaim', u: 'telat-1', titik: SEMUA }).error, 'lewat-batas');
cek('pemegang lama tetap bisa', get({ action: 'gem-klaim', u: 'andi-7k2p', titik: SEMUA }).kode, k1.kode);
cek('status tutup', get({ action: 'gem-status', u: 'telat-1' }).tutup, true);

console.log('\n=== 12. 300 tamu -> kode semua unik ===');
GEM_BATAS = '2026-12-11T23:59:00+07:00';
const kodes = {};
let gagal = 0;
for (let i = 0; i < 300; i++) {
  const k = 'uji-' + i;
  sheetTamu_().appendRow([k, 'Tamu ' + i, 2, 'Uji', '']);
  sheetBuka_().appendRow([k, 'Tamu ' + i, new Date(Date.now() - 30 * 60000), new Date(), 1]);
  const j = get({ action: 'gem-klaim', u: k, titik: SEMUA });
  if (!j.ok || kodes[j.kode]) gagal++;
  kodes[j.kode] = 1;
}
cek('tabrakan/gagal', gagal, 0);
cek('kode unik', Object.keys(kodes).length, 300);
cek('huruf membingungkan', Object.keys(kodes).filter(k => /[0O1IL]/.test(k)).length, 0);

console.log('\n' + (errs.length ? 'GAGAL:\n' + errs.join('\n') : 'SEMUA LOLOS'));
process.exit(errs.length ? 1 : 0);
