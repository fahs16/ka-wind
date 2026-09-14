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

console.log('\n=== 12. tamu-all membawa status "sudah buka" ===');
// Tamu yang undangannya belum pernah dibuka sama sekali: ada di tab TAMU,
// tapi tidak punya baris di tab KUNJUNGAN.
sheetTamu_().appendRow(['sepi-1', 'Tamu Belum Buka', 2, 'Uji', '']);
const semua = get({ action: 'tamu-all', token: ADMIN_TOKEN }).tamu;
const andi = semua.filter(x => x.kode === 'andi-7k2p')[0];
const sepi = semua.filter(x => x.kode === 'sepi-1')[0];
cek('andi sudah buka', andi.sudahBuka, true);
cek('andi punya waktu buka', typeof andi.terakhirBuka === 'string' && andi.terakhirBuka.length > 0, true);
cek('kali buka > 0', andi.kaliBuka > 0, true);
cek('yang belum pernah buka -> false', sepi.sudahBuka, false);
cek('yang belum pernah buka -> tanpa waktu', sepi.terakhirBuka, '');
cek('nomor WA tetap ada buat panitia', andi.wa, '628120000001');

console.log('\n=== 12b. hadiah hanya di kunjungan pertama ===');
GEM_BATAS = '2026-12-11T23:59:00+07:00';   // pengujian 11 sengaja melewatkannya
sheetTamu_().appendRow(['sekali-1',  'Tamu Sekali',   2, 'Uji', '']);
sheetTamu_().appendRow(['duakali-1', 'Tamu Dua Kali', 2, 'Uji', '']);
const lamaTadi = new Date(Date.now() - 30 * 60000);
sheetBuka_().appendRow(['sekali-1',  'Tamu Sekali',   lamaTadi, new Date(), 1]);
sheetBuka_().appendRow(['duakali-1', 'Tamu Dua Kali', lamaTadi, new Date(), 3]);
const k1x = get({ action: 'gem-klaim', u: 'sekali-1', titik: SEMUA });
cek('kunjungan ke-1 dapat hadiah', k1x.ok, true);
const k3x = get({ action: 'gem-klaim', u: 'duakali-1', titik: SEMUA });
cek('kunjungan ke-3 ditolak', k3x.error, 'kurang-beruntung');
cek('jumlah kunjungan dilaporkan', k3x.kunjungan, 3);
cek('tidak ada hadiah bocor saat ditolak', k3x.hadiah, undefined);
// yang sudah punya tetap bisa melihat kodenya walau sudah berkali-kali buka
const sb2 = sheetBuka_();
for (let r = 2; r <= sb2.getLastRow(); r++) {
  if (String(sb2.getRange(r, 1).getValue()) === 'sekali-1') sb2.getRange(r, 5).setValue(9);
}
cek('pemegang kode tetap bisa lihat', get({ action: 'gem-klaim', u: 'sekali-1', titik: SEMUA }).kode, k1x.kode);
// batas dimatikan
GEM_MAKS_KUNJUNGAN = 0;
cek('batas 0 -> boleh', get({ action: 'gem-klaim', u: 'duakali-1', titik: SEMUA }).ok, true);
GEM_MAKS_KUNJUNGAN = 1;

console.log('\n=== 13. isi rahasia: cuma untuk tamu terdaftar ===');
sheetIsi_().appendRow(['gifts.address', 'Jl. Melati Raya No. 21, Bandung', 'alamat kado']);
sheetIsi_().appendRow(['rsvp.whatsapp', '6281234567890', 'WA mempelai']);
sheetIsi_().appendRow(['gifts.banks.0.number', '0012345678', 'nol di depan harus utuh']);
const isiOk = get({ action: 'isi', u: 'andi-7k2p' });
cek('tamu terdaftar -> ok', isiOk.ok, true);
cek('alamat terkirim', isiOk.isi['gifts.address'], 'Jl. Melati Raya No. 21, Bandung');
cek('nol di depan utuh', isiOk.isi['gifts.banks.0.number'], '0012345678');
cek('kode ngawur ditolak', get({ action: 'isi', u: 'bukan-tamu' }).error, 'tanpa-kode');
cek('tanpa kode ditolak', get({ action: 'isi' }).error, 'tanpa-kode');
cek('tidak ada isi bocor saat ditolak', get({ action: 'isi', u: 'bukan-tamu' }).isi, undefined);

console.log('\n=== 14. simpan daftar tamu dari undangan.html ===');
const postT = (obj) => JSON.parse(doPost({ parameter: {}, postData: { contents: JSON.stringify(obj) } }).getContent());
cek('tanpa token ditolak', postT({ jenis: 'tamu', tamu: [] }).error, 'token salah');
const sebelumT = bacaTamu_().length;
const simpan1 = postT({ jenis: 'tamu', token: ADMIN_TOKEN, tamu: [
  { kode: 'baru-aa111', nama: 'Tamu Baru Satu', kursi: 3, grup: 'Kantor', wa: '628111' },
  { kode: 'andi-7k2p', nama: 'Bapak Andi & Keluarga (diperbarui)', kursi: 5, grup: 'Keluarga', wa: '628120000001' }
]});
cek('baru', simpan1.baru, 1);
cek('diperbarui', simpan1.perbarui, 1);
cek('total bertambah 1', simpan1.total, sebelumT + 1);
const setelah = bacaTamu_();
cek('nama lama tertimpa', setelah.filter(x => x.kode === 'andi-7k2p')[0].nama, 'Bapak Andi & Keluarga (diperbarui)');
cek('kursi ikut diperbarui', setelah.filter(x => x.kode === 'andi-7k2p')[0].kursi, 5);
const ulang = postT({ jenis: 'tamu', token: ADMIN_TOKEN, tamu: [{ kode: 'baru-aa111', nama: 'Tamu Baru Satu', kursi: 3 }] });
cek('kirim ulang tidak menggandakan', ulang.total, simpan1.total);

console.log('\n=== 15. RSVP lewat doPost masuk ke tab RSVP ===');
const post = (obj) => JSON.parse(doPost({ parameter: {}, postData: { contents: JSON.stringify(obj) } }).getContent());
cek('kiriman pertama', post({ kode: 'andi-7k2p', nama: 'Bapak Andi', hadir: 'Hadir', jumlah: 4, pesan: 'Barakallah' }).ok, true);
cek('baris RSVP', sheet_().getLastRow(), 2);
cek('kiriman ulang memperbarui', post({ kode: 'andi-7k2p', nama: 'Bapak Andi', hadir: 'Masih ragu', jumlah: 2, pesan: '' }).updated, true);
cek('baris tetap 1', sheet_().getLastRow(), 2);
cek('nama kosong ditolak', post({ kode: 'andi-7k2p', nama: '  ' }).error, 'nama kosong');

console.log('\n=== 16. 300 tamu -> kode semua unik ===');
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
