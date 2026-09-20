-- =============================================================================
--  SKEMA DATABASE UNDANGAN  —  Supabase / PostgreSQL
--
--  Tujuannya satu: daftar tamu tidak pernah bisa dibaca publik.
--
--  Caranya: semua tabel dikunci (Row Level Security menyala, tanpa satu pun
--  policy, dan hak akses peran anon/authenticated dicabut). Browser tamu TIDAK
--  bisa menyentuh tabel sama sekali. Yang boleh dipanggil hanya beberapa fungsi
--  di bawah, dan tiap fungsi cuma mengembalikan sepotong data yang memang perlu:
--
--    cek_tamu(kode)     -> SATU baris tamu pemilik kode itu. Nomor WA tidak
--                          pernah ikut. Kode yang tidak terdaftar dijawab kosong.
--    simpan_rsvp(...)   -> menyimpan/memperbarui jawaban satu tamu.
--    rekap_rsvp(token)  -> seluruh rekap, hanya untuk panitia yang punya token.
--    daftar_tamu(token) -> seluruh daftar tamu (termasuk WA), hanya panitia.
--
--  Jadi walaupun kunci publik Supabase memang terpampang di js/config.js
--  (begitu memang desainnya), yang bisa dilakukan pemegang kunci itu cuma
--  "tanya satu kode" — bukan "unduh semua tamu".
--
--  JANGAN SIMPAN TOKEN ASLI DI BERKAS INI
--  Berkas ini ikut ter-upload bersama situsnya. Ganti tokennya di kotak SQL
--  Editor Supabase, bukan di sini, lalu biarkan berkas ini tetap memakai teks
--  contoh. (Gerbang Netlify sudah menutup seluruh folder server/, tapi jangan
--  bergantung pada satu lapis saja.)
--
--  CARA PAKAI
--    1. Buka Supabase -> SQL Editor -> New query.
--    2. Tempel SELURUH berkas ini, ganti baris TOKEN PANITIA di bawah, Run.
--    3. Tempel daftar tamu (dibuat lewat undangan.html -> "Salin SQL Tamu").
--    4. Di js/config.js pastikan guests.source = 'db' dan rsvp.provider = 'db'.
--
--  Aman dijalankan ulang: semuanya "if not exists" / "or replace", data lama
--  tidak terhapus.
-- =============================================================================

create extension if not exists pgcrypto;

-- =============================================================================
--  1. TABEL
-- =============================================================================

-- Daftar undangan. Satu baris per kartu undangan (boleh atas nama keluarga).
create table if not exists tamu (
  id        uuid primary key default gen_random_uuid(),
  kode      text not null,
  nama      text not null,
  kursi     smallint not null default 2 check (kursi between 0 and 20),
  grup      text not null default '',
  wa        text not null default '',   -- tidak pernah dikirim ke browser tamu
  catatan   text not null default '',
  dibuat    timestamptz not null default now()
);
-- Kode dibandingkan tanpa peduli besar-kecil huruf, jadi keunikannya juga.
create unique index if not exists tamu_kode_unik on tamu (lower(kode));

-- Jawaban kehadiran. Satu baris per tamu; jawaban baru menimpa yang lama dan
-- menaikkan nomor revisi, biar ketahuan kalau ada yang berubah pikiran.
create table if not exists rsvp (
  id          uuid primary key default gen_random_uuid(),
  tamu_id     uuid references tamu(id) on delete set null,
  kode        text not null default '',
  nama        text not null,
  hadir       text not null check (hadir in ('Hadir', 'Masih ragu', 'Tidak bisa hadir')),
  jumlah      smallint not null default 1 check (jumlah between 0 and 20),
  pesan       text not null default '',
  grup        text not null default '',
  revisi      integer not null default 1,
  dibuat      timestamptz not null default now(),
  diperbarui  timestamptz not null default now()
);
-- Tamu berkode: satu baris per kode. Tamu tanpa kode: satu baris per nama.
create unique index if not exists rsvp_kode_unik on rsvp (lower(kode)) where kode <> '';
create unique index if not exists rsvp_nama_unik on rsvp (lower(nama)) where kode = '';

-- Catatan siapa saja yang sudah membuka undangannya. Berguna buat mengingatkan
-- tamu yang belum melihat sama sekali.
create table if not exists kunjungan (
  tamu_id   uuid primary key references tamu(id) on delete cascade,
  pertama   timestamptz not null default now(),
  terakhir  timestamptz not null default now(),
  jumlah    integer not null default 1
);

-- Pengaturan hadiah pojokan rahasia ("hidden gem").
--
-- Teks hadiah dan batas waktunya sengaja tinggal DI SINI, bukan di js/config.js,
-- karena berkas di situs bisa dibaca siapa pun. Yang ada di situs cuma
-- percakapannya; isi hadiahnya baru dikirim server setelah syaratnya lolos.
create table if not exists pengaturan (
  id              smallint primary key default 1 check (id = 1),
  gem_batas       timestamptz,                 -- klaim ditutup setelah waktu ini
  gem_hadiah      text not null default '',    -- teks hadiah, tidak ada di berkas situs
  gem_titik       text[] not null default '{}',-- titik yang wajib dikunjungi dulu
  gem_jeda_detik  integer not null default 180,-- jeda minimal sejak undangan dibuka
  -- Batas jumlah kunjungan saat mengklaim. 1 = hanya boleh di kunjungan
  -- pertama, jadi tamu yang baru berburu setelah dapat bocoran dari tamu lain
  -- sudah terlambat. 0 = tanpa batas.
  gem_maks_kunjungan integer not null default 1,
  diperbarui      timestamptz not null default now()
);

-- Tamu yang berhasil menemukan pojokan rahasia. Satu tamu satu baris, dengan
-- satu kode unik yang ditukarkan ke pager ayu di hari H.
create table if not exists gem (
  id            uuid primary key default gen_random_uuid(),
  tamu_id       uuid not null references tamu(id) on delete cascade,
  kode          text not null,
  nama          text not null default '',
  grup          text not null default '',
  ditemukan     timestamptz not null default now(),
  ditukar       timestamptz,                   -- null = belum ditukar
  ditukar_oleh  text not null default ''
);
alter table pengaturan add column if not exists gem_maks_kunjungan integer not null default 1;

create unique index if not exists gem_tamu_unik on gem (tamu_id);
create unique index if not exists gem_kode_unik on gem (upper(kode));

-- Isi undangan yang tidak boleh ikut ter-publish.
--
-- js/config.js adalah berkas statis yang bisa diunduh siapa pun tanpa melewati
-- gerbang mana pun. Jadi nomor rekening, alamat rumah, nomor WA, dan nama
-- lengkap orang tua disimpan di sini, dan baru dikirim setelah tamunya terbukti
-- terdaftar.
--
-- 'kunci' berisi jalur ke dalam CONFIG, misalnya 'gifts.address' atau
-- 'events.0.place'. Daftar kuncinya bisa disalin dari undangan.html.
create table if not exists isi (
  kunci       text primary key,
  nilai       text not null default '',
  keterangan  text not null default '',
  diperbarui  timestamptz not null default now()
);

-- Token panitia (disimpan sebagai hash bcrypt, bukan teks asli).
create table if not exists panitia (
  id          smallint primary key default 1 check (id = 1),
  token_hash  text not null,
  diperbarui  timestamptz not null default now()
);

-- Catatan percobaan yang gagal, dipakai untuk mengerem penebak kode.
create table if not exists percobaan (
  id     bigserial primary key,
  jenis  text not null,
  saat   timestamptz not null default now()
);
create index if not exists percobaan_saat on percobaan (jenis, saat desc);

-- =============================================================================
--  2. KUNCI SEMUA TABEL
--     RLS menyala tanpa policy = tidak ada baris yang lolos untuk siapa pun
--     selain pemilik tabel. Hak aksesnya sekalian dicabut, supaya kalau nanti
--     ada yang tidak sengaja menambahkan policy, pintunya tetap tertutup.
-- =============================================================================

alter table tamu       enable row level security;
alter table rsvp       enable row level security;
alter table kunjungan  enable row level security;
alter table panitia    enable row level security;
alter table percobaan  enable row level security;
alter table pengaturan enable row level security;
alter table gem        enable row level security;
alter table isi        enable row level security;

revoke all on table tamu, rsvp, kunjungan, panitia, percobaan, pengaturan, gem, isi
  from anon, authenticated;
revoke all on sequence percobaan_id_seq from anon, authenticated;

-- =============================================================================
--  3. FUNGSI BANTU (internal, tidak boleh dipanggil dari browser)
-- =============================================================================

-- Benar kalau token yang dikirim cocok dengan hash yang tersimpan.
create or replace function panitia_ok(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  h text;
begin
  select token_hash into h from panitia where id = 1;
  -- Belum diisi = selalu tolak. Lebih baik panitia bingung daripada bocor.
  if h is null or coalesce(p_token, '') = '' then
    return false;
  end if;
  return h = crypt(p_token, h);
end
$$;

-- Rem sederhana: berapa kali sebuah jenis percobaan gagal belakangan ini.
create or replace function terlalu_sering(p_jenis text, p_batas integer, p_menit integer)
returns boolean
language sql
security definer
set search_path = public, pg_temp
as $$
  select count(*) >= p_batas
  from percobaan
  where jenis = p_jenis and saat > now() - make_interval(mins => p_menit);
$$;

create or replace function catat_gagal(p_jenis text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into percobaan (jenis) values (p_jenis);
  -- Buang jejak lama biar tabelnya tidak tumbuh selamanya.
  delete from percobaan where saat < now() - interval '1 day';
end
$$;

revoke all on function panitia_ok(text)                      from public, anon, authenticated;
revoke all on function terlalu_sering(text, integer, integer) from public, anon, authenticated;
revoke all on function catat_gagal(text)                      from public, anon, authenticated;

-- =============================================================================
--  4. FUNGSI UNTUK BROWSER TAMU
-- =============================================================================

-- Menanyakan SATU kode undangan.
--
-- Yang keluar cuma kode, nama, jatah kursi, dan grup. Nomor WA sengaja tidak
-- ikut: browser tamu tidak pernah punya alasan untuk tahu nomor tamu lain.
-- Kode yang tidak terdaftar dijawab kosong, tanpa membedakan "salah ketik" dan
-- "tidak diundang".
--
-- Penebak kode diladeni sampai batas tertentu saja: kalau dalam 5 menit sudah
-- ada 120 percobaan gagal, semua kode tak dikenal langsung dijawab kosong.
-- Tamu asli tidak terpengaruh, karena kode yang benar tidak ikut dihitung.
create or replace function cek_tamu(p_kode text)
returns table (kode text, nama text, kursi smallint, grup text)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_kode text := lower(btrim(coalesce(p_kode, '')));
  v_id   uuid;
begin
  if v_kode = '' or length(v_kode) > 64 then
    return;
  end if;

  select t.id into v_id from tamu t where lower(t.kode) = v_kode;

  if v_id is null then
    if not terlalu_sering('kode', 120, 5) then
      perform catat_gagal('kode');
    end if;
    return;
  end if;

  insert into kunjungan (tamu_id) values (v_id)
  on conflict (tamu_id) do update
    set terakhir = now(), jumlah = kunjungan.jumlah + 1;

  return query
    select t.kode, t.nama, t.kursi, t.grup
    from tamu t
    where t.id = v_id;
end
$$;

-- Menyimpan atau memperbarui jawaban kehadiran satu tamu.
--
-- Kalau kodenya terdaftar, jumlah tamu dipagari jatah kursinya sendiri, jadi
-- tidak ada yang bisa mendaftarkan 50 orang lewat kode orang lain.
create or replace function simpan_rsvp(
  p_kode   text,
  p_nama   text,
  p_hadir  text,
  p_jumlah integer,
  p_pesan  text
)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_kode   text     := lower(btrim(coalesce(p_kode, '')));
  v_nama   text     := btrim(coalesce(p_nama, ''));
  v_hadir  text     := btrim(coalesce(p_hadir, ''));
  v_pesan  text     := btrim(coalesce(p_pesan, ''));
  v_tamu   tamu%rowtype;
  v_jumlah smallint;
  v_revisi integer;
begin
  if v_nama = '' then
    return json_build_object('ok', false, 'error', 'nama kosong');
  end if;
  if v_hadir not in ('Hadir', 'Masih ragu', 'Tidak bisa hadir') then
    return json_build_object('ok', false, 'error', 'pilihan kehadiran tidak dikenal');
  end if;

  v_nama  := left(v_nama, 60);
  v_pesan := left(v_pesan, 400);

  if v_kode <> '' then
    select * into v_tamu from tamu t where lower(t.kode) = v_kode;
  end if;

  -- Jatah kursi jadi batas atas; tanpa kode, batasnya 10.
  v_jumlah := greatest(0, least(coalesce(p_jumlah, 1),
                                coalesce(v_tamu.kursi, 10)))::smallint;

  if v_tamu.id is not null then
    insert into rsvp (tamu_id, kode, nama, hadir, jumlah, pesan, grup)
    values (v_tamu.id, v_tamu.kode, v_nama, v_hadir, v_jumlah, v_pesan, v_tamu.grup)
    on conflict (lower(kode)) where kode <> ''
    do update set
      nama = excluded.nama, hadir = excluded.hadir, jumlah = excluded.jumlah,
      pesan = excluded.pesan, grup = excluded.grup,
      revisi = rsvp.revisi + 1, diperbarui = now()
    returning revisi into v_revisi;
  else
    -- Tanpa kode yang terdaftar: dicatat atas nama saja. Berguna kalau undangan
    -- disetel terbuka (access.private = false).
    insert into rsvp (kode, nama, hadir, jumlah, pesan)
    values ('', v_nama, v_hadir, v_jumlah, v_pesan)
    on conflict (lower(nama)) where kode = ''
    do update set
      hadir = excluded.hadir, jumlah = excluded.jumlah, pesan = excluded.pesan,
      revisi = rsvp.revisi + 1, diperbarui = now()
    returning revisi into v_revisi;
  end if;

  return json_build_object('ok', true, 'revisi', v_revisi, 'jumlah', v_jumlah);
end
$$;

-- Mengklaim hadiah pojokan rahasia.
--
-- Tiga syarat, semuanya diperiksa DI SINI, bukan di browser:
--   1. kodenya tamu terdaftar
--   2. seluruh titik wajib sudah dikunjungi
--   3. belum lewat batas waktu (H-1), dan sudah lewat jeda minimal sejak
--      undangan pertama kali dibuka — supaya tidak bisa diselesaikan dalam
--      hitungan detik oleh skrip
--
-- Kode hadiahnya dibuat di sini, unik per tamu, dan baru ada setelah syaratnya
-- lolos. Jadi tidak ada satu kode bersama yang bisa dibocorkan dari berkas js
-- lalu dipakai ramai-ramai: setiap orang punya kodenya sendiri, dan yang
-- memegang kode selalu tercatat namanya.
--
-- Aman dipanggil berkali-kali: tamu yang sudah punya kode menerima kode yang
-- sama, bukan kode baru.
create or replace function klaim_gem(p_kode text, p_titik text[])
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_kode    text := lower(btrim(coalesce(p_kode, '')));
  v_tamu    tamu%rowtype;
  v_set     pengaturan%rowtype;
  v_ada     gem%rowtype;
  v_buka    timestamptz;
  v_kali    integer;
  v_kurang  text[];
  v_baru    text;
  i         integer;
begin
  select * into v_set from pengaturan where id = 1;
  if v_set.id is null then
    return json_build_object('ok', false, 'error', 'belum-disetel');
  end if;

  if v_kode = '' then
    return json_build_object('ok', false, 'error', 'tanpa-kode');
  end if;
  select * into v_tamu from tamu t where lower(t.kode) = v_kode;
  if v_tamu.id is null then
    if not terlalu_sering('gem', 60, 5) then perform catat_gagal('gem'); end if;
    return json_build_object('ok', false, 'error', 'tanpa-kode');
  end if;

  -- Sudah pernah klaim: kembalikan kode yang sama, apa pun keadaannya.
  select * into v_ada from gem g where g.tamu_id = v_tamu.id;
  if v_ada.id is not null then
    return json_build_object(
      'ok', true, 'baru', false,
      'kode', v_ada.kode, 'hadiah', v_set.gem_hadiah,
      'ditemukan', v_ada.ditemukan, 'ditukar', v_ada.ditukar);
  end if;

  -- Batas waktu. Dicek sebelum syarat lain supaya pesannya jelas.
  if v_set.gem_batas is not null and now() > v_set.gem_batas then
    return json_build_object('ok', false, 'error', 'lewat-batas', 'batas', v_set.gem_batas);
  end if;

  -- Titik yang wajib dikunjungi.
  select array_agg(w) into v_kurang
  from unnest(v_set.gem_titik) w
  where w <> all (coalesce(p_titik, '{}'::text[]));
  if v_kurang is not null and array_length(v_kurang, 1) > 0 then
    return json_build_object('ok', false, 'error', 'belum-lengkap',
      'kurang', array_length(v_kurang, 1));
  end if;

  -- Hanya kunjungan pertama. Tamu yang baru berburu setelah mendengar bocoran
  -- dari undangan orang lain sudah terlambat: undangannya sendiri sudah pernah
  -- dibuka sebelum ini.
  select k.pertama, k.jumlah into v_buka, v_kali from kunjungan k where k.tamu_id = v_tamu.id;
  if v_set.gem_maks_kunjungan > 0 and coalesce(v_kali, 1) > v_set.gem_maks_kunjungan then
    return json_build_object('ok', false, 'error', 'kurang-beruntung',
      'kunjungan', v_kali, 'maks', v_set.gem_maks_kunjungan);
  end if;

  -- Jeda minimal sejak undangan pertama kali dibuka.
  if v_buka is null then
    v_buka := now();
    insert into kunjungan (tamu_id) values (v_tamu.id) on conflict do nothing;
  end if;
  if now() - v_buka < make_interval(secs => v_set.gem_jeda_detik) then
    return json_build_object('ok', false, 'error', 'terlalu-cepat',
      'tunggu_detik', ceil(extract(epoch from
        (v_buka + make_interval(secs => v_set.gem_jeda_detik)) - now())));
  end if;

  -- Kode unik. Huruf yang gampang salah baca (0 O 1 I L) sengaja dibuang,
  -- karena kode ini nanti dibacakan ke pager ayu dari layar HP.
  for i in 1..20 loop
    -- upper() harus jalan DULU: base64 punya huruf kecil 'o' dan 'i' yang kalau
    -- dibesarkan belakangan malah lolos jadi O dan I.
    v_baru := 'GEM-' || substr(translate(upper(encode(gen_random_bytes(9), 'base64')),
                                         '0O1IL+/=', 'GHJKMPQR'), 1, 6);
    begin
      insert into gem (tamu_id, kode, nama, grup)
      values (v_tamu.id, v_baru, v_tamu.nama, v_tamu.grup)
      returning * into v_ada;
      exit;
    exception when unique_violation then
      -- tabrakan kode: coba lagi. Tabrakan tamu: berarti barusan diklaim dari
      -- tab lain, ambil saja yang sudah ada.
      select * into v_ada from gem g where g.tamu_id = v_tamu.id;
      if v_ada.id is not null then exit; end if;
      v_ada := null;
    end;
  end loop;

  if v_ada.id is null then
    return json_build_object('ok', false, 'error', 'gagal-buat-kode');
  end if;

  return json_build_object(
    'ok', true, 'baru', true,
    'kode', v_ada.kode, 'hadiah', v_set.gem_hadiah,
    'ditemukan', v_ada.ditemukan, 'ditukar', null);
end
$$;

-- Isi undangan yang tidak ikut ter-publish. Dikirim HANYA kalau kodenya milik
-- tamu yang benar-benar terdaftar — sama pintunya dengan cek_tamu.
create or replace function isi_undangan(p_kode text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  select t.id into v_id from tamu t
  where lower(t.kode) = lower(btrim(coalesce(p_kode, '')));
  if v_id is null then
    return json_build_object('ok', false, 'error', 'tanpa-kode');
  end if;

  return json_build_object('ok', true, 'isi', coalesce((
    select json_object_agg(i.kunci, i.nilai) from isi i where i.nilai <> ''
  ), '{}'::json));
end
$$;

-- Keadaan hadiah untuk satu tamu, tanpa mengklaim apa pun. Dipakai browser
-- untuk tahu apakah pintunya masih terbuka, dan sisa waktunya berapa.
create or replace function status_gem(p_kode text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_tamu tamu%rowtype;
  v_set  pengaturan%rowtype;
  v_ada  gem%rowtype;
begin
  select * into v_set from pengaturan where id = 1;
  if v_set.id is null then return json_build_object('ok', false, 'error', 'belum-disetel'); end if;

  select * into v_tamu from tamu t where lower(t.kode) = lower(btrim(coalesce(p_kode, '')));
  if v_tamu.id is not null then
    select * into v_ada from gem g where g.tamu_id = v_tamu.id;
  end if;

  return json_build_object(
    'ok', true,
    'batas', v_set.gem_batas,
    'tutup', (v_set.gem_batas is not null and now() > v_set.gem_batas),
    'wajib', array_length(v_set.gem_titik, 1),
    'maksKunjungan', v_set.gem_maks_kunjungan,
    'punya', (v_ada.id is not null),
    'kode', v_ada.kode,
    'hadiah', case when v_ada.id is not null then v_set.gem_hadiah else null end,
    'ditukar', v_ada.ditukar);
end
$$;

-- =============================================================================
--  5. FUNGSI UNTUK PANITIA (dikunci token)
--
--  Ketiganya menjawab dengan bungkus json { ok, ... } dan TIDAK pernah melempar
--  error. Ini bukan soal selera: kalau fungsi melempar exception, seluruh
--  pekerjaannya ikut dibatalkan Postgres — termasuk catatan "token salah" yang
--  baru saja ditulis. Rem penebak token jadi tidak pernah menghitung apa pun.
--  Dengan menjawab biasa, catatannya tersimpan dan remnya benar-benar bekerja.
-- =============================================================================

-- Token salah dijeda setengah detik dan dicatat. Sesudah 10 kali salah dalam 15
-- menit, semua percobaan ditolak sampai jendelanya lewat.
create or replace function tolak_panitia(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if terlalu_sering('token', 10, 15) then
    return json_build_object('ok', false, 'error',
      'terlalu banyak percobaan, coba lagi 15 menit lagi');
  end if;
  if not panitia_ok(p_token) then
    perform pg_sleep(0.5);
    perform catat_gagal('token');
    return json_build_object('ok', false, 'error', 'token panitia salah');
  end if;
  return null;   -- null = token benar, silakan lanjut
end
$$;

revoke all on function tolak_panitia(text) from public, anon, authenticated;

-- Rekap seluruh jawaban kehadiran.
create or replace function rekap_rsvp(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tolak json := tolak_panitia(p_token);
begin
  if tolak is not null then return tolak; end if;

  return json_build_object('ok', true, 'baris', coalesce((
    select json_agg(json_build_object(
      'kode', r.kode, 'nama', r.nama, 'grup', r.grup, 'hadir', r.hadir,
      'jumlah', r.jumlah, 'pesan', r.pesan, 'revisi', r.revisi,
      'dibuat', r.dibuat, 'diperbarui', r.diperbarui
    ) order by r.diperbarui desc)
    from rsvp r
  ), '[]'::json));
end
$$;

-- Daftar tamu lengkap, termasuk nomor WA dan status "sudah buka undangan".
create or replace function daftar_tamu(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tolak json := tolak_panitia(p_token);
begin
  if tolak is not null then return tolak; end if;

  return json_build_object('ok', true, 'baris', coalesce((
    select json_agg(json_build_object(
      'kode', t.kode, 'nama', t.nama, 'kursi', t.kursi, 'grup', t.grup,
      'wa', t.wa,
      'sudahBuka', (k.tamu_id is not null),
      'terakhirBuka', k.terakhir,
      'sudahRsvp', (r.id is not null)
    ) order by t.nama)
    from tamu t
    left join kunjungan k on k.tamu_id = t.id
    left join rsvp r      on r.tamu_id = t.id
  ), '[]'::json));
end
$$;

-- Angka ringkas buat dipajang di halaman panitia.
create or replace function statistik(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tolak json := tolak_panitia(p_token);
begin
  if tolak is not null then return tolak; end if;

  return json_build_object(
    'ok',             true,
    'tamu',           (select count(*) from tamu),
    'sudahBuka',      (select count(*) from kunjungan),
    'sudahJawab',     (select count(*) from rsvp),
    'hadir',          (select count(*) from rsvp where hadir = 'Hadir'),
    'ragu',           (select count(*) from rsvp where hadir = 'Masih ragu'),
    'tidakHadir',     (select count(*) from rsvp where hadir = 'Tidak bisa hadir'),
    'totalOrang',     (select coalesce(sum(jumlah), 0) from rsvp where hadir = 'Hadir'),
    'kursiDisiapkan', (select coalesce(sum(kursi), 0) from tamu)
  );
end
$$;

-- Daftar tamu yang berhasil menemukan pojokan rahasia, buat pager ayu.
create or replace function daftar_gem(p_token text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tolak json := tolak_panitia(p_token);
  v_set pengaturan%rowtype;
begin
  if tolak is not null then return tolak; end if;
  select * into v_set from pengaturan where id = 1;

  return json_build_object(
    'ok', true,
    'batas', v_set.gem_batas,
    'tutup', (v_set.gem_batas is not null and now() > v_set.gem_batas),
    'baris', coalesce((
      select json_agg(json_build_object(
        'kode', g.kode, 'nama', g.nama, 'grup', g.grup,
        'kodeTamu', t.kode,
        'ditemukan', g.ditemukan, 'ditukar', g.ditukar, 'ditukarOleh', g.ditukar_oleh
      ) order by g.ditemukan)
      from gem g join tamu t on t.id = g.tamu_id
    ), '[]'::json));
end
$$;

-- Menandai satu kode sudah ditukar di meja pager ayu.
-- Menukar dua kali ditolak, supaya satu hadiah tidak keluar dua kali.
create or replace function tukar_gem(p_token text, p_kode text, p_oleh text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  tolak json := tolak_panitia(p_token);
  v_ada gem%rowtype;
begin
  if tolak is not null then return tolak; end if;

  select * into v_ada from gem g where upper(g.kode) = upper(btrim(coalesce(p_kode, '')));
  if v_ada.id is null then
    return json_build_object('ok', false, 'error', 'kode hadiah tidak dikenal');
  end if;
  if v_ada.ditukar is not null then
    return json_build_object('ok', false, 'error', 'sudah ditukar',
      'nama', v_ada.nama, 'ditukar', v_ada.ditukar, 'ditukarOleh', v_ada.ditukar_oleh);
  end if;

  update gem set ditukar = now(), ditukar_oleh = left(btrim(coalesce(p_oleh, '')), 40)
  where id = v_ada.id
  returning * into v_ada;

  return json_build_object('ok', true, 'nama', v_ada.nama, 'grup', v_ada.grup,
    'ditukar', v_ada.ditukar);
end
$$;

-- Buku tamu yang tampil di undangan: ucapan tamu lain, apa adanya.
-- Pintunya sama dengan isi_undangan — harus kode tamu yang terdaftar. Yang
-- keluar cuma nama, ucapan, kehadiran, dan waktunya; kode undangan, grup,
-- jumlah kursi, dan nomor WA tamu lain tidak pernah ikut.
create or replace function daftar_ucapan(p_kode text)
returns json
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ada  boolean;
  v_hit  json;
  v_isi  json;
begin
  select exists(select 1 from tamu t where lower(t.kode) = lower(btrim(coalesce(p_kode, ''))))
  into v_ada;
  if not v_ada then
    return json_build_object('ok', false, 'error', 'tanpa-kode');
  end if;

  select json_build_object(
    'total',  count(*),
    'ucapan', count(*) filter (where btrim(coalesce(r.pesan, '')) <> ''),
    'hadir',  count(*) filter (where lower(r.hadir) not like 'tidak%' and lower(r.hadir) not like '%ragu%'),
    'ragu',   count(*) filter (where lower(r.hadir) like '%ragu%'),
    'tidak',  count(*) filter (where lower(r.hadir) like 'tidak%')
  ) into v_hit from rsvp r;

  select coalesce(json_agg(json_build_object(
    'nama', d.nama, 'pesan', d.pesan, 'hadir', d.hadir, 'waktu', d.waktu
  ) order by d.waktu desc), '[]'::json) into v_isi
  from (
    select r.nama, r.pesan, r.hadir, r.waktu
    from rsvp r
    where btrim(coalesce(r.pesan, '')) <> ''
    order by r.waktu desc
    limit 300
  ) d;

  return json_build_object('ok', true, 'jumlah', v_hit, 'daftar', v_isi);
end
$$;

-- =============================================================================
--  6. SIAPA BOLEH MEMANGGIL APA
-- =============================================================================

revoke all on function cek_tamu(text)                                   from public;
revoke all on function simpan_rsvp(text, text, text, integer, text)     from public;
revoke all on function rekap_rsvp(text)                                 from public;
revoke all on function daftar_tamu(text)                                from public;
revoke all on function statistik(text)                                  from public;
revoke all on function klaim_gem(text, text[])                          from public;
revoke all on function status_gem(text)                                 from public;
revoke all on function isi_undangan(text)                               from public;
revoke all on function daftar_gem(text)                                 from public;
revoke all on function tukar_gem(text, text, text)                      from public;
revoke all on function daftar_ucapan(text)                              from public;

grant execute on function cek_tamu(text)                               to anon, authenticated;
grant execute on function simpan_rsvp(text, text, text, integer, text) to anon, authenticated;
-- Tiga di bawah ini tetap terbuka untuk anon, tapi isinya dijaga token.
grant execute on function rekap_rsvp(text)                             to anon, authenticated;
grant execute on function daftar_tamu(text)                            to anon, authenticated;
grant execute on function statistik(text)                              to anon, authenticated;
grant execute on function klaim_gem(text, text[])                      to anon, authenticated;
grant execute on function status_gem(text)                             to anon, authenticated;
grant execute on function isi_undangan(text)                           to anon, authenticated;
grant execute on function daftar_gem(text)                             to anon, authenticated;
grant execute on function tukar_gem(text, text, text)                  to anon, authenticated;
grant execute on function daftar_ucapan(text)                           to anon, authenticated;

-- =============================================================================
--  7. TOKEN PANITIA  —  GANTI BARIS DI BAWAH INI
--
--  Pakai kalimat panjang yang tidak bisa ditebak, minimal 20 huruf. Token ini
--  yang nanti diketik di admin.html. Yang tersimpan cuma hash-nya, jadi kalau
--  lupa tinggal jalankan ulang baris ini dengan token baru.
--
--  Sekali lagi: gantinya di kotak SQL Editor, JANGAN disimpan balik ke berkas
--  ini lalu ikut ter-upload.
-- =============================================================================

insert into panitia (id, token_hash)
values (1, crypt('GANTI-JADI-TOKEN-PANJANG-KAMU-SENDIRI', gen_salt('bf')))
on conflict (id) do update
  set token_hash = excluded.token_hash, diperbarui = now();

-- =============================================================================
--  8. HADIAH POJOKAN RAHASIA  —  GANTI TIGA BARIS DI BAWAH INI
--
--  Teks hadiah dan batas waktunya tinggal di sini, bukan di js/config.js,
--  supaya tidak bisa dibaca dari situs. Batasnya diisi H-1: tamu yang baru
--  sadar di hari H tidak perlu repot berburu, dan yang keliling dari jauh-jauh
--  hari dapat bagian eksklusifnya.
--
--  Isi waktunya pakai zona kalian (WIB = +07, WITA = +08, WIT = +09).
--
--  gem_maks_kunjungan = 1 berarti hadiah HANYA bisa diambil pada kunjungan
--  pertama tamu itu. Gunanya menutup jalur bocoran: yang baru berburu setelah
--  diberi tahu tamu lain, undangannya sudah pernah dibuka sebelum itu, jadi
--  sudah terlambat.
--
--  Perlu disadari: tamu yang sekadar mengintip sebentar lalu menutup undangan,
--  dan baru main serius keesokan harinya, ikut kehilangan kesempatan. Isi 2
--  atau 3 kalau menurut kalian itu terlalu galak, atau 0 untuk tanpa batas.
-- =============================================================================

insert into pengaturan (id, gem_batas, gem_hadiah, gem_titik, gem_jeda_detik, gem_maks_kunjungan)
values (
  1,
  '2026-12-11 23:59:00+07',        -- H-1 buat hari H 12 Desember 2026
  'Tunjukkan kode ini ke meja pager ayu waktu kamu datang. Ada satu bingkisan ' ||
  'kecil yang kami siapkan khusus buat tamu yang main sampai habis, dan kami ' ||
  'bakal tahu persis kamu siapa.',
  array['gate','akad','resepsi','galeri','cerita','couple','kado','rsvp'],
  180,                              -- jeda minimal sejak undangan dibuka (detik)
  1                                 -- hanya boleh diklaim di kunjungan ke-1
)
on conflict (id) do update set
  gem_batas          = excluded.gem_batas,
  gem_hadiah         = excluded.gem_hadiah,
  gem_titik          = excluded.gem_titik,
  gem_jeda_detik     = excluded.gem_jeda_detik,
  gem_maks_kunjungan = excluded.gem_maks_kunjungan,
  diperbarui         = now();

-- =============================================================================
--  9. CONTOH ISI (hapus/ganti dengan daftar tamu kamu sendiri)
--
--  Daftar aslinya dibuat lewat undangan.html -> tombol "Salin SQL Tamu",
--  lalu tinggal ditempel di sini.
-- =============================================================================

-- insert into tamu (kode, nama, kursi, grup, wa) values
--   ('and1-7k2p', 'Bapak Andi & Keluarga', 4, 'Keluarga', '6281200000001'),
--   ('rin2-q94m', 'Rina',                  2, 'Teman',    '6281200000002')
-- on conflict (lower(kode)) do update set
--   nama = excluded.nama, kursi = excluded.kursi,
--   grup = excluded.grup, wa = excluded.wa;
