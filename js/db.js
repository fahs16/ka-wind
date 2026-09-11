/* Sambungan ke basis data undangan (Supabase / PostgREST).

   Browser tamu TIDAK pernah menyentuh tabel. Yang dipanggil cuma beberapa
   fungsi yang sudah disiapkan di server (lihat server/schema.sql), dan tiap
   fungsi hanya menjawab sepotong data yang memang perlu:

     cek_tamu(kode)  -> satu baris tamu pemilik kode itu, tanpa nomor WA
     simpan_rsvp(..) -> menyimpan jawaban kehadiran satu tamu

   Dua fungsi panitia (rekap_rsvp, daftar_tamu, statistik) juga lewat sini,
   tapi isinya dijaga token yang cuma dipegang kalian, tidak pernah ditulis
   di berkas mana pun.

   Kunci yang dipakai di sini adalah publishable key Supabase — memang
   dirancang untuk terpampang di kode yang dilihat publik. Yang menahan
   pintu bukan kuncinya, melainkan aturan di server. */

const Db = {
  BATAS_MS: 6000,

  setelan() {
    const d = (typeof CONFIG !== 'undefined' && CONFIG.db) || {};
    const n = (typeof CONFIG !== 'undefined' && CONFIG.net) || {};
    return {
      // Kalau db.url/key dikosongkan, pakai Supabase yang sama dengan realtime.
      url: String(d.url || n.url || '').trim().replace(/\/+$/, ''),
      key: String(d.key || n.key || '').trim()
    };
  },

  aktif() {
    const s = this.setelan();
    return !!(s.url && s.key);
  },

  panggil(fungsi, args, batasMs) {
    const s = this.setelan();
    if (!s.url || !s.key) return Promise.reject(new Error('database belum disetel di config.js'));

    const henti = new AbortController();
    const jam = setTimeout(() => henti.abort(), batasMs || this.BATAS_MS);
    const bersih = () => clearTimeout(jam);

    return fetch(s.url + '/rest/v1/rpc/' + fungsi, {
      method: 'POST',
      headers: {
        apikey: s.key,
        Authorization: 'Bearer ' + s.key,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(args || {}),
      signal: henti.signal
    }).then(
      r => {
        bersih();
        if (!r.ok) {
          return r.text().then(t => {
            throw new Error('HTTP ' + r.status + ' ' + String(t).slice(0, 200));
          });
        }
        return r.json();
      },
      e => { bersih(); throw e; }
    );
  },

  /* ---------- dipanggil browser tamu ---------- */

  // Menanyakan satu kode. null = kodenya tidak terdaftar.
  cekTamu(kode, batasMs) {
    return this.panggil('cek_tamu', { p_kode: kode }, batasMs).then(baris => {
      const t = Array.isArray(baris) ? baris[0] : null;
      if (!t) return null;
      return {
        code: String(t.kode || kode),
        name: String(t.nama || ''),
        seats: +t.kursi || 0,
        group: String(t.grup || '')
      };
    });
  },

  simpanRsvp(data) {
    return this.panggil('simpan_rsvp', {
      p_kode: data.kode || '',
      p_nama: data.nama || '',
      p_hadir: data.hadir || '',
      p_jumlah: parseInt(data.jumlah, 10) || 1,
      p_pesan: data.pesan || ''
    }).then(j => ({
      ok: !!(j && j.ok),
      error: (j && j.error) || '',
      revisi: (j && j.revisi) || 0
    }));
  },

  /* ---------- dipanggil halaman panitia ---------- */
  // Ketiganya menjawab { ok: true, ... } atau { ok: false, error: '...' }.
  statistik(token) { return this.panggil('statistik', { p_token: token }, 15000); },
  rekap(token)     { return this.panggil('rekap_rsvp', { p_token: token }, 15000); },
  daftarTamu(token){ return this.panggil('daftar_tamu', { p_token: token }, 15000); }
};
