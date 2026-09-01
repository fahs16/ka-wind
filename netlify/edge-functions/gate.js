/* GERBANG SISI SERVER (Netlify Edge Function)
   ---------------------------------------------------------------------------
   Ini kunci yang sebenarnya. Berbeda dengan js/access.js yang berjalan di
   browser tamu, berkas ini berjalan di server Netlify SEBELUM berkas apa pun
   dikirim. Tanpa kode yang sah, server tidak mengirimkan js/config.js,
   js/guests.js, css, gambar preview, maupun halaman alat panitia sama sekali.

   CARA MENYALAKAN (Netlify > Site configuration > Environment variables):
     GUEST_CODES = and1,rin2,dew3,kel4        <- daftar kode tamu, dipisah koma
     ADMIN_CODE  = kata-sandi-panjang-kamu    <- untuk undangan.html & admin.html

   Selama GUEST_CODES masih kosong, gerbang ini sengaja DIBIARKAN TERBUKA supaya
   salah konfigurasi tidak mengunci kalian sendiri. Cek statusnya dengan:
     curl -I https://situskamu.netlify.app/ | grep x-undangan-gate
   Hasil "disabled" berarti gerbang belum aktif.
   --------------------------------------------------------------------------- */

const HALAMAN_PANITIA = ['/undangan.html', '/admin.html', '/preview.html'];
const SELALU_BOLEH = ['/img/closed.png', '/favicon.ico', '/robots.txt'];

/* Inti keputusan, sengaja dipisah supaya bisa diuji tanpa runtime Netlify. */
export function putuskan({ path, kodeUrl, kodeAdminUrl, cookie, codes, adminCode }) {
  const bersih = v => String(v || '').trim().toLowerCase();
  const daftar = (codes || []).map(bersih).filter(Boolean);
  const admin = bersih(adminCode);

  if (!daftar.length) return { aksi: 'lewat', gerbang: 'disabled' };

  const p = bersih(path);
  if (SELALU_BOLEH.indexOf(p) >= 0) return { aksi: 'lewat', gerbang: 'on' };

  const uUrl = bersih(kodeUrl);
  const aUrl = bersih(kodeAdminUrl);
  const uCookie = bersih(cookie && cookie.undangan_ok);
  const aCookie = bersih(cookie && cookie.undangan_admin);

  const adminOk = !!admin && (aUrl === admin || aCookie === admin);
  const tamuOk = adminOk || daftar.indexOf(uUrl) >= 0 || daftar.indexOf(uCookie) >= 0;

  if (HALAMAN_PANITIA.indexOf(p) >= 0) {
    if (!adminOk) return { aksi: 'hilang', gerbang: 'on' };
    return { aksi: 'lewat', gerbang: 'on', setAdmin: aUrl === admin ? admin : null };
  }

  if (tamuOk) {
    return { aksi: 'lewat', gerbang: 'on', setTamu: daftar.indexOf(uUrl) >= 0 ? uUrl : null };
  }

  // Halaman dibalas gambar polos; berkas lain seolah tidak ada.
  const halaman = p === '/' || p.endsWith('/') || /\.html?$/.test(p);
  return { aksi: halaman ? 'tertutup' : 'hilang', gerbang: 'on' };
}

/* ---------------- perekat ke runtime Netlify ---------------- */
const env = nama => {
  try { if (typeof Netlify !== 'undefined' && Netlify.env) return Netlify.env.get(nama) || ''; } catch (e) {}
  try { if (typeof Deno !== 'undefined' && Deno.env) return Deno.env.get(nama) || ''; } catch (e) {}
  return '';
};

const bacaCookie = baris => {
  const out = {};
  String(baris || '').split(';').forEach(bagian => {
    const i = bagian.indexOf('=');
    if (i > 0) out[bagian.slice(0, i).trim()] = decodeURIComponent(bagian.slice(i + 1).trim());
  });
  return out;
};

const HALAMAN_TERTUTUP = '<!doctype html><html lang="id"><head><meta charset="utf-8">' +
  '<meta name="viewport" content="width=device-width,initial-scale=1"><title>Undangan</title>' +
  '<style>html,body{margin:0;height:100%;background:#1d1420;display:flex;align-items:center;' +
  'justify-content:center;overflow:hidden}img{max-width:min(78vw,420px);max-height:78vh;' +
  'image-rendering:pixelated;user-select:none}</style></head><body>' +
  '<img src="/img/closed.png" alt=""></body></html>';

export default async (request, context) => {
  const url = new URL(request.url);
  const hasil = putuskan({
    path: decodeURIComponent(url.pathname),
    kodeUrl: url.searchParams.get('u') || url.searchParams.get('kode'),
    kodeAdminUrl: url.searchParams.get('admin'),
    cookie: bacaCookie(request.headers.get('cookie')),
    codes: env('GUEST_CODES').split(','),
    adminCode: env('ADMIN_CODE')
  });

  if (hasil.aksi === 'tertutup') {
    return new Response(HALAMAN_TERTUTUP, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store',
        'x-undangan-gate': 'closed',
        'x-robots-tag': 'noindex, nofollow'
      }
    });
  }

  if (hasil.aksi === 'hilang') {
    return new Response('Not Found', {
      status: 404,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'x-undangan-gate': 'blocked' }
    });
  }

  const asli = await context.next();
  const res = new Response(asli.body, asli);
  res.headers.set('x-undangan-gate', hasil.gerbang);
  const setel = (nama, nilai) => res.headers.append(
    'set-cookie',
    nama + '=' + encodeURIComponent(nilai) + '; Path=/; Max-Age=15552000; HttpOnly; Secure; SameSite=Lax'
  );
  if (hasil.setTamu) setel('undangan_ok', hasil.setTamu);
  if (hasil.setAdmin) setel('undangan_admin', hasil.setAdmin);
  return res;
};
