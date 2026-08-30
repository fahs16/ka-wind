/* Dunia game: peta tile, bangunan, dekorasi, dan tabrakan.
   Semuanya digambar pakai kode (nggak ada file gambar sama sekali). */

const TILE = 16;
const MAP_W = 56;
const MAP_H = 40;
const T = n => n * TILE;

const C = {
  grass: '#7cb36b', grass2: '#72a962', tuft: '#5f9152',
  path: '#dfd0ab', path2: '#cdbc95', plaza: '#ece2cb', plaza2: '#dcd0b4',
  water: '#5fb3d6', water2: '#4a97bd', foam: '#bfe6f2',
  carpet: '#c8536b', carpet2: '#a83f55',
  wood: '#8b5e3c', wood2: '#6b452b',
  cream: '#fdf6e9', shade: '#e8dbc2', ink: '#3a2b2f',
  rose: '#e2758f', rose2: '#c95c78', gold: '#f0c674', gold2: '#d3a44e',
  leaf: '#4e8c4a', leaf2: '#3d6f3a', leaf3: '#68a860', trunk: '#7a563a',
  stone: '#c9c3bb', stone2: '#a8a29a', glass: '#8fd0e8', sky: '#a8dcef'
};

const World = {
  tiles: null,
  solid: null,
  ground: null,     // canvas hasil "bake" lapisan tanah
  objects: [],      // bangunan & benda yang bisa diajak interaksi
  decos: [],        // pohon, bunga, batu, lampu
  npcs: [],

  /* ---------- Peta ---------- */
  init() {
    this.tiles = new Uint8Array(MAP_W * MAP_H);
    this.solid = new Uint8Array(MAP_W * MAP_H);
    this.paintGround();
    this.buildObjects();
    this.scatterDecos();
    this.bakeGround();
  },

  idx(tx, ty) { return ty * MAP_W + tx; },
  set(tx, ty, v) { if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) this.tiles[this.idx(tx, ty)] = v; },
  get(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return 3;
    return this.tiles[this.idx(tx, ty)];
  },
  fill(tx, ty, w, h, v) {
    for (let y = ty; y < ty + h; y++) for (let x = tx; x < tx + w; x++) this.set(x, y, v);
  },

  paintGround() {
    // 0 rumput, 1 rumput tua, 2 jalan setapak, 3 air, 4 plaza, 5 karpet
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        this.set(x, y, U.hash(x, y) > 0.86 ? 1 : 0);
      }
    }
    // kolam
    this.fill(3, 3, 9, 7, 3);
    this.fill(45, 31, 8, 6, 3);
    // jalan utama & cabang
    this.fill(26, 10, 4, 28, 2);
    this.fill(10, 18, 38, 2, 2);
    this.fill(16, 28, 26, 2, 2);
    this.fill(11, 19, 3, 9, 2);   // ke galeri
    this.fill(40, 19, 3, 10, 2);  // ke kotak kado & jalur bawah
    this.fill(12, 13, 2, 6, 2);   // ke gedung akad
    this.fill(42, 13, 2, 6, 2);   // ke gedung resepsi
    // plaza air mancur
    this.fill(22, 16, 13, 8, 4);
    // karpet menuju pelaminan
    this.fill(26, 10, 4, 6, 5);
  },

  bakeGround() {
    const c = document.createElement('canvas');
    c.width = MAP_W * TILE; c.height = MAP_H * TILE;
    const g = c.getContext('2d');
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) this.drawTile(g, x, y);
    }
    this.ground = c;
  },

  drawTile(g, tx, ty) {
    const t = this.get(tx, ty), x = T(tx), y = T(ty), r = U.hash(tx, ty), r2 = U.hash(tx + 91, ty + 17);
    if (t === 3) {
      U.px(g, x, y, TILE, TILE, C.water);
      if (r > 0.6) U.px(g, x + 3, y + 5, 6, 2, C.water2);
      if (r2 > 0.75) U.px(g, x + 8, y + 10, 5, 2, C.foam);
      // tepian kolam
      if (this.get(tx, ty - 1) !== 3) U.px(g, x, y, TILE, 3, C.foam);
      return;
    }
    if (t === 2 || t === 4) {
      const a = t === 2 ? C.path : C.plaza, b = t === 2 ? C.path2 : C.plaza2;
      U.px(g, x, y, TILE, TILE, a);
      if (r > 0.55) U.px(g, x + 2 + Math.floor(r * 8), y + 3 + Math.floor(r2 * 9), 2, 2, b);
      if (t === 4) { U.px(g, x, y, TILE, 1, b); U.px(g, x, y, 1, TILE, b); }
      return;
    }
    if (t === 5) {
      U.px(g, x, y, TILE, TILE, C.carpet);
      U.px(g, x, y + 6, TILE, 2, C.carpet2);
      if (this.get(tx - 1, ty) !== 5) U.px(g, x, y, 2, TILE, C.gold);
      if (this.get(tx + 1, ty) !== 5) U.px(g, x + 14, y, 2, TILE, C.gold);
      return;
    }
    U.px(g, x, y, TILE, TILE, t === 1 ? C.grass2 : C.grass);
    if (r > 0.55) {
      const dx = Math.floor(r * 10), dy = Math.floor(r2 * 11);
      U.px(g, x + dx, y + dy, 3, 1, C.tuft);
      U.px(g, x + dx + 1, y + dy - 1, 1, 1, C.tuft);
    }
    if (r2 > 0.94) { // bunga liar
      const col = r > 0.5 ? C.gold : C.cream;
      U.px(g, x + 6, y + 7, 2, 2, col);
      U.px(g, x + 7, y + 9, 1, 2, C.leaf2);
    }
  },

  /* ---------- Tabrakan ---------- */
  markSolid(x, y, w, h) {
    const x0 = Math.floor(x / TILE), x1 = Math.floor((x + w - 1) / TILE);
    const y0 = Math.floor(y / TILE), y1 = Math.floor((y + h - 1) / TILE);
    for (let ty = y0; ty <= y1; ty++) {
      for (let tx = x0; tx <= x1; tx++) {
        if (tx >= 0 && ty >= 0 && tx < MAP_W && ty < MAP_H) this.solid[this.idx(tx, ty)] = 1;
      }
    }
  },

  isSolidPx(x, y) {
    const tx = Math.floor(x / TILE), ty = Math.floor(y / TILE);
    if (tx < 0 || ty < 0 || tx >= MAP_W || ty >= MAP_H) return true;
    if (this.get(tx, ty) === 3) return true;
    return this.solid[this.idx(tx, ty)] === 1;
  },

  /* ---------- Objek & bangunan ---------- */
  add(o) {
    o.base = o.base || (o.y + o.h);
    if (o.solid) o.solid.forEach(s => this.markSolid(s.x, s.y, s.w, s.h));
    this.objects.push(o);
    return o;
  },

  buildObjects() {
    const self = this;

    // 1. Gerbang masuk
    this.add({
      id: 'gate', label: 'Gerbang Undangan', quest: true,
      x: T(24), y: T(35), w: T(8), h: T(4), base: T(39),
      solid: [{ x: T(24), y: T(37), w: T(2), h: T(2) }, { x: T(30), y: T(37), w: T(2), h: T(2) }],
      hot: { x: T(26), y: T(37), w: T(4), h: T(2) },
      draw: (g, o, t) => Paint.gate(g, o, t)
    });

    // 2. Gedung akad
    this.add({
      id: 'akad', label: 'Gedung Akad Nikah', quest: true,
      x: T(8), y: T(4), w: T(10), h: T(9), base: T(13),
      solid: [{ x: T(8), y: T(7), w: T(10), h: T(6) }],
      hot: { x: T(11), y: T(13), w: T(4), h: T(2) },
      draw: (g, o, t) => Paint.hall(g, o, t, 'akad')
    });

    // 3. Gedung resepsi
    this.add({
      id: 'resepsi', label: 'Balai Resepsi', quest: true,
      x: T(38), y: T(4), w: T(10), h: T(9), base: T(13),
      solid: [{ x: T(38), y: T(7), w: T(10), h: T(6) }],
      hot: { x: T(41), y: T(13), w: T(4), h: T(2) },
      draw: (g, o, t) => Paint.hall(g, o, t, 'resepsi')
    });

    // 4. Pelaminan + mempelai
    this.add({
      id: 'couple', label: 'Pelaminan', quest: true,
      x: T(24), y: T(2), w: T(9), h: T(8), base: T(10),
      solid: [{ x: T(24), y: T(4), w: T(9), h: T(6) }],
      hot: { x: T(25), y: T(11), w: T(6), h: T(3) },
      draw: (g, o, t) => Paint.pelaminan(g, o, t)
    });

    // 5. Galeri foto
    this.add({
      id: 'galeri', label: 'Galeri Foto', quest: true,
      x: T(9), y: T(19), w: T(7), h: T(7), base: T(26),
      solid: [{ x: T(9), y: T(22), w: T(7), h: T(4) }],
      hot: { x: T(11), y: T(26), w: T(3), h: T(2) },
      draw: (g, o, t) => Paint.gallery(g, o, t)
    });

    // 6. Papan cerita
    this.add({
      id: 'cerita', label: 'Papan Cerita Kami', quest: true,
      x: T(18), y: T(25), w: T(3), h: T(3), base: T(28),
      solid: [{ x: T(18), y: T(27), w: T(3), h: T(1) }],
      hot: { x: T(18), y: T(28), w: T(3), h: T(2) },
      draw: (g, o, t) => Paint.storyBoard(g, o, t)
    });

    // 7. Kotak kado
    this.add({
      id: 'kado', label: 'Kotak Kado', quest: true,
      x: T(43), y: T(23), w: T(3), h: T(3), base: T(26),
      solid: [{ x: T(43), y: T(25), w: T(3), h: T(1) }],
      hot: { x: T(43), y: T(26), w: T(3), h: T(2) },
      draw: (g, o, t) => Paint.giftBox(g, o, t)
    });

    // 8. Kotak surat RSVP
    this.add({
      id: 'rsvp', label: 'Kotak Surat RSVP', quest: true,
      x: T(33), y: T(31), w: T(2), h: T(3), base: T(34),
      solid: [{ x: T(33), y: T(33), w: T(2), h: T(1) }],
      hot: { x: T(33), y: T(34), w: T(2), h: T(2) },
      draw: (g, o, t) => Paint.mailbox(g, o, t)
    });

    // --- bonus, tidak masuk hitungan misi ---
    this.add({
      id: 'jukebox', label: 'Jukebox',
      x: T(22), y: T(31), w: T(2), h: T(3), base: T(34),
      solid: [{ x: T(22), y: T(33), w: T(2), h: T(1) }],
      hot: { x: T(22), y: T(34), w: T(2), h: T(2) },
      draw: (g, o, t) => Paint.jukebox(g, o, t)
    });

    this.add({
      id: 'jam', label: 'Menara Hitung Mundur',
      x: T(32), y: T(16), w: T(2), h: T(5), base: T(21),
      solid: [{ x: T(32), y: T(20), w: T(2), h: T(1) }],
      hot: { x: T(32), y: T(21), w: T(2), h: T(2) },
      draw: (g, o, t) => Paint.clockTower(g, o, t)
    });

    this.add({
      id: 'petunjuk', label: 'Papan Petunjuk',
      x: T(31), y: T(33), w: T(2), h: T(3), base: T(36),
      solid: [{ x: T(31), y: T(35), w: T(1), h: T(1) }],
      hot: { x: T(31), y: T(36), w: T(2), h: T(2) },
      draw: (g, o, t) => Paint.signpost(g, o, t)
    });

    // Air mancur (dekor besar, tetap padat)
    this.add({
      id: 'fountain', label: 'Air Mancur',
      x: T(26), y: T(17), w: T(4), h: T(4), base: T(21),
      solid: [{ x: T(26), y: T(18), w: T(4), h: T(3) }],
      hot: { x: T(26), y: T(21), w: T(4), h: T(2) },
      draw: (g, o, t) => Paint.fountain(g, o, t)
    });

    // Mempelai berdiri di depan pelaminan
    this.npcs.push({ key: 'groom', x: T(26) + 14, y: T(11) + 8, dir: 'down' });
    this.npcs.push({ key: 'bride', x: T(29) + 6, y: T(11) + 8, dir: 'down' });
    void self;
  },

  scatterDecos() {
    const blocked = (tx, ty) => {
      if (this.get(tx, ty) !== 0 && this.get(tx, ty) !== 1) return true;
      if (this.solid[this.idx(tx, ty)]) return true;
      // beri jarak dari jalan & bangunan
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const t = this.get(tx + dx, ty + dy);
        if (t === 2 || t === 4 || t === 5) return true;
        if (this.solid[this.idx(U.clamp(tx + dx, 0, MAP_W - 1), U.clamp(ty + dy, 0, MAP_H - 1))]) return true;
      }
      return false;
    };

    for (let ty = 1; ty < MAP_H - 1; ty++) {
      for (let tx = 1; tx < MAP_W - 1; tx++) {
        const r = U.hash(tx * 3 + 7, ty * 5 + 11);
        const border = tx < 3 || ty < 3 || tx > MAP_W - 4 || ty > MAP_H - 4;
        if (blocked(tx, ty)) continue;
        if (border && this.get(tx, ty) !== 3 && r > 0.35) {
          this.addTree(tx, ty); continue;
        }
        if (r > 0.93) this.addTree(tx, ty);
        else if (r > 0.88) this.decos.push({ type: 'bush', x: T(tx) + 8, y: T(ty) + 14, base: T(ty) + 14 });
        else if (r > 0.845) this.decos.push({ type: 'flower', x: T(tx) + 8, y: T(ty) + 12, base: T(ty) + 12, v: r });
        else if (r > 0.835) this.decos.push({ type: 'rock', x: T(tx) + 8, y: T(ty) + 13, base: T(ty) + 13 });
      }
    }

    // Lampu taman di sepanjang jalan utama
    [14, 22, 30, 34].forEach(ty => {
      this.decos.push({ type: 'lamp', x: T(25) + 6, y: T(ty) + 14, base: T(ty) + 14 });
      this.decos.push({ type: 'lamp', x: T(30) + 10, y: T(ty) + 14, base: T(ty) + 14 });
      this.markSolid(T(25) + 2, T(ty) + 8, 8, 6);
      this.markSolid(T(30) + 6, T(ty) + 8, 8, 6);
    });

    // Bangku taman menghadap air mancur
    [[T(23) + 4, T(21) + 8], [T(31) + 4, T(21) + 8]].forEach(p => {
      this.decos.push({ type: 'bench', x: p[0], y: p[1], base: p[1] });
      this.markSolid(p[0] - 12, p[1] - 8, 24, 8);
    });
  },

  addTree(tx, ty) {
    this.decos.push({ type: 'tree', x: T(tx) + 8, y: T(ty) + 15, base: T(ty) + 15, v: U.hash(tx, ty) });
    this.markSolid(T(tx) + 3, T(ty) + 8, 10, 8);
  },

  objectById(id) { return this.objects.find(o => o.id === id); }
};
