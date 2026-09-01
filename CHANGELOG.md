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
