/* Semua bangunan & dekorasi digambar manual pakai kotak-kotak pixel. */

const Paint = {
  roof(g, x, y, w, rows, c1, c2) {
    const step = (w / 2 - 6) / rows;
    for (let i = 0; i < rows; i++) {
      const inset = Math.round(i * step);
      U.px(g, x + inset, y + i * 4, w - inset * 2, 4, i % 2 ? c2 : c1);
    }
    U.px(g, x - 3, y + rows * 4 - 4, w + 6, 4, c2);
  },

  window(g, x, y, w, h) {
    U.px(g, x - 1, y - 1, w + 2, h + 2, C.wood2);
    U.px(g, x, y, w, h, C.glass);
    U.px(g, x, y, w, 2, C.cream);
    U.px(g, x + w / 2 - 1, y, 2, h, C.wood2);
  },

  board(g, x, y, w, h, text, scale) {
    U.px(g, x - 1, y - 1, w + 2, h + 2, C.wood2);
    U.px(g, x, y, w, h, C.cream);
    Font.drawCentered(g, text, x + w / 2, y + (h - 5 * (scale || 1)) / 2, C.ink, scale || 1);
  },

  /* ---------------- Gerbang ---------------- */
  gate(g, o, t) {
    const x = o.x, y = o.y, w = o.w;
    // pilar
    [x + 4, x + w - 28].forEach(px0 => {
      U.px(g, px0, y + 14, 24, 50, C.stone2);
      U.px(g, px0 + 2, y + 14, 20, 50, C.stone);
      U.px(g, px0 - 2, y + 8, 28, 8, C.stone2);
      U.px(g, px0, y + 8, 24, 5, C.cream);
      for (let i = 0; i < 4; i++) U.px(g, px0 + 2, y + 22 + i * 10, 20, 1, C.stone2);
    });
    // balok atas + lengkung
    U.px(g, x + 2, y + 2, w - 4, 10, C.wood2);
    U.px(g, x + 4, y + 4, w - 8, 6, C.wood);
    U.px(g, x + 16, y + 12, 12, 6, C.wood2);
    U.px(g, x + w - 28, y + 12, 12, 6, C.wood2);
    // bunga rambat
    for (let i = 0; i < 11; i++) {
      const bx = x + 8 + i * 11, r = U.hash(i, 3);
      U.px(g, bx, y, 5, 4, C.leaf);
      U.px(g, bx + 1, y - 2, 3, 3, r > 0.5 ? C.rose : C.cream);
      U.px(g, bx + 2, y - 3, 1, 1, C.gold);
    }
    // papan gantung
    const sway = Math.sin(t * 1.4) * 1;
    U.px(g, x + w / 2 - 1, y + 12, 2, 5, C.wood2);
    this.board(g, x + w / 2 - 27 + sway, y + 17, 54, 13, 'WELCOME', 1);
  },

  /* ---------------- Gedung besar ---------------- */
  hall(g, o, t, kind) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    const bodyY = y + 52, bodyH = h - 52;
    U.px(g, x + 10, bodyY, w - 20, bodyH, C.shade);
    U.px(g, x + 12, bodyY, w - 24, bodyH - 2, C.cream);

    if (kind === 'akad') {
      // menara kecil + kubah
      U.px(g, x + 6, y + 18, 16, bodyH + 34, C.shade);
      U.px(g, x + 8, y + 18, 12, bodyH + 34, C.cream);
      U.px(g, x + 5, y + 14, 18, 5, C.leaf2);
      U.px(g, x + 10, y + 6, 8, 8, C.leaf);
      U.px(g, x + 13, y + 1, 2, 6, C.gold);
      this.roof(g, x + 24, y + 24, w - 34, 7, C.leaf, C.leaf2);
      // kubah utama
      U.px(g, x + w / 2 - 18, y + 20, 36, 8, C.leaf2);
      U.px(g, x + w / 2 - 14, y + 12, 28, 10, C.leaf);
      U.px(g, x + w / 2 - 8, y + 6, 16, 8, C.leaf);
      U.px(g, x + w / 2 - 2, y, 4, 7, C.gold);
      U.px(g, x + w / 2 - 5, y - 4, 10, 4, C.gold2);
    } else {
      this.roof(g, x + 6, y + 14, w - 12, 9, C.rose, C.rose2);
      // lampu tumblr di bawah atap
      for (let i = 0; i < 9; i++) {
        const lx = x + 16 + i * ((w - 32) / 8);
        const drop = 4 + Math.sin(i * 1.1) * 2;
        U.px(g, lx, y + 50, 1, drop, C.wood2);
        const on = (Math.floor(t * 2) + i) % 4 !== 0;
        U.px(g, lx - 1, y + 50 + drop, 3, 3, on ? C.gold : C.gold2);
      }
    }

    // jendela
    this.window(g, x + 26, bodyY + 16, 18, 22);
    this.window(g, x + w - 44, bodyY + 16, 18, 22);

    // pintu lengkung
    const dx = x + w / 2 - 15, dy = bodyY + 22;
    U.px(g, dx - 2, dy - 2, 34, bodyH - 20, C.wood2);
    U.px(g, dx, dy + 2, 30, bodyH - 24, C.wood);
    U.px(g, dx + 4, dy - 4, 22, 8, C.wood2);
    U.px(g, dx + 14, dy + 4, 2, bodyH - 26, C.wood2);
    U.px(g, dx + 8, dy + 24, 3, 3, C.gold);
    U.px(g, dx + 19, dy + 24, 3, 3, C.gold);
    // tangga
    U.px(g, x + w / 2 - 26, y + h - 6, 52, 4, C.stone);
    U.px(g, x + w / 2 - 30, y + h - 2, 60, 3, C.stone2);
    // papan nama
    this.board(g, x + w / 2 - 32, bodyY + 4, 64, 13, kind === 'akad' ? 'AKAD' : 'RESEPSI', 1);

    if (kind === 'resepsi') {
      // karangan bunga kanan-kiri pintu
      [dx - 16, dx + 42].forEach(fx => {
        U.px(g, fx, y + h - 20, 10, 16, C.stone);
        U.px(g, fx + 1, y + h - 30, 8, 12, C.leaf);
        U.px(g, fx, y + h - 34, 4, 5, C.rose);
        U.px(g, fx + 6, y + h - 33, 4, 4, C.cream);
      });
    }
  },

  /* ---------------- Pelaminan ---------------- */
  pelaminan(g, o, t) {
    const x = o.x, y = o.y, w = o.w, h = o.h, cx = x + w / 2;
    const floorY = y + h - 30;

    // rangka daun melengkung
    U.px(g, cx - 44, y + 30, 88, floorY - (y + 30), C.leaf2);
    U.px(g, cx - 38, y + 20, 76, 14, C.leaf2);
    U.px(g, cx - 30, y + 14, 60, 10, C.leaf2);
    U.px(g, cx - 20, y + 9, 40, 8, C.leaf2);
    // kain putih di dalamnya
    U.px(g, cx - 38, y + 34, 76, floorY - (y + 34), C.cream);
    U.px(g, cx - 32, y + 25, 64, 11, C.cream);
    U.px(g, cx - 24, y + 19, 48, 8, C.cream);
    U.px(g, cx - 15, y + 14, 30, 6, C.cream);
    // lipatan kain
    for (let i = -2; i <= 2; i++) U.px(g, cx + i * 14 - 1, y + 36, 2, floorY - (y + 38), C.shade);

    // bunga di sepanjang rangka
    const petals = [C.rose, C.cream, C.gold, C.rose2];
    for (let i = 0; i < 34; i++) {
      const a = (i / 33) * Math.PI;
      const bx = cx - Math.cos(a) * 43;
      const by = a < 0.35 || a > Math.PI - 0.35
        ? floorY - (i < 17 ? i : 33 - i) * 5
        : y + 30 - Math.sin(a) * 20;
      const col = petals[i % petals.length];
      U.px(g, bx - 2, by - 2, 5, 5, col);
      U.px(g, bx - 1, by - 1, 2, 2, C.cream);
      if (i % 3 === 0) U.px(g, bx + 2, by + 2, 3, 2, C.leaf);
    }

    // inisial mempelai
    const ini = (CONFIG.couple.groom.nick[0] || 'A') + ' & ' + (CONFIG.couple.bride.nick[0] || 'B');
    Font.drawCentered(g, ini, cx, y + 52, C.rose2, 2, 1);
    U.px(g, cx - 18, y + 68, 36, 1, C.gold2);

    // panggung
    U.px(g, x + 4, floorY, w - 8, 24, C.carpet2);
    U.px(g, x + 7, floorY, w - 14, 20, C.carpet);
    U.px(g, x + 4, floorY + 22, w - 8, 6, C.gold2);
    U.px(g, x + 4, floorY + 22, w - 8, 2, C.gold);

    // dua kursi
    [cx - 30, cx + 12].forEach(kx => {
      U.px(g, kx, floorY - 24, 18, 26, C.gold2);
      U.px(g, kx + 2, floorY - 22, 14, 22, C.gold);
      U.px(g, kx + 2, floorY - 8, 14, 8, C.cream);
      U.px(g, kx + 4, floorY - 19, 10, 8, C.cream);
    });

    // hiasan menggantung
    for (let i = 0; i < 7; i++) {
      const hx = cx - 36 + i * 12, d = 5 + Math.sin(t * 1.2 + i) * 2;
      U.px(g, hx, y + 34, 1, d, C.gold2);
      U.px(g, hx - 1, y + 34 + d, 3, 3, i % 2 ? C.gold : C.rose);
    }
  },

  /* ---------------- Galeri ---------------- */
  gallery(g, o, t) {
    const x = o.x, y = o.y, w = o.w, h = o.h;
    U.px(g, x + 8, y + 44, w - 16, h - 44, C.shade);
    U.px(g, x + 10, y + 44, w - 20, h - 46, C.cream);
    this.roof(g, x + 2, y + 12, w - 4, 8, C.gold, C.gold2);
    // etalase foto
    U.px(g, x + 18, y + 56, w - 36, 26, C.wood2);
    for (let i = 0; i < 3; i++) {
      const fx = x + 21 + i * ((w - 42) / 3 + 1);
      U.px(g, fx, y + 59, 20, 20, C.cream);
      U.px(g, fx + 2, y + 61, 16, 16, i === 1 ? C.sky : (i === 0 ? C.rose : C.leaf3));
      U.px(g, fx + 6, y + 66, 4, 4, C.cream);
      U.px(g, fx + 11, y + 66, 4, 4, C.cream);
      U.px(g, fx + 5, y + 72, 10, 2, C.cream);
    }
    // pintu
    U.px(g, x + w / 2 - 10, y + h - 24, 20, 24, C.wood2);
    U.px(g, x + w / 2 - 8, y + h - 22, 16, 22, C.wood);
    U.px(g, x + w / 2 + 3, y + h - 12, 2, 2, C.gold);
    this.board(g, x + w / 2 - 27, y + 30, 54, 13, 'GALERI', 1);
    // lampu kecil berkedip
    const on = Math.floor(t * 1.5) % 2 === 0;
    U.px(g, x + 12, y + 30, 3, 3, on ? C.gold : C.gold2);
    U.px(g, x + w - 15, y + 30, 3, 3, on ? C.gold2 : C.gold);
  },

  /* ---------------- Papan cerita ---------------- */
  storyBoard(g, o, t) {
    const x = o.x, y = o.y, w = o.w;
    U.px(g, x + 8, y + 26, 4, 22, C.wood2);
    U.px(g, x + w - 12, y + 26, 4, 22, C.wood2);
    U.px(g, x + 2, y + 6, w - 4, 26, C.wood2);
    U.px(g, x + 4, y + 8, w - 8, 22, C.cream);
    Font.drawCentered(g, 'CERITA', x + w / 2, y + 11, C.ink, 1);
    Font.drawCentered(g, 'KAMI', x + w / 2, y + 19, C.rose2, 1);
    const pulse = Math.sin(t * 3) > 0 ? 1 : 0;
    U.px(g, x + w / 2 - 2, y + 26 - pulse, 5, 3, C.rose);
    U.px(g, x + w / 2 - 1, y + 29 - pulse, 3, 1, C.rose2);
  },

  /* ---------------- Kotak kado ---------------- */
  giftBox(g, o, t) {
    const x = o.x, y = o.y;
    const bob = Math.sin(t * 2) * 1;
    // kotak kecil di samping
    U.px(g, x + 2, y + 32, 14, 14, C.sky);
    U.px(g, x + 2, y + 32, 14, 3, C.cream);
    U.px(g, x + 8, y + 32, 2, 14, C.cream);
    // kotak utama
    U.px(g, x + 14, y + 20 + bob, 30, 26, C.rose2);
    U.px(g, x + 16, y + 20 + bob, 26, 24, C.rose);
    U.px(g, x + 12, y + 14 + bob, 34, 8, C.rose2);
    U.px(g, x + 14, y + 14 + bob, 30, 6, C.rose);
    U.px(g, x + 26, y + 14 + bob, 6, 32, C.gold);
    U.px(g, x + 12, y + 24 + bob, 34, 4, C.gold);
    // pita
    U.px(g, x + 20, y + 6 + bob, 8, 8, C.gold);
    U.px(g, x + 30, y + 6 + bob, 8, 8, C.gold);
    U.px(g, x + 26, y + 8 + bob, 6, 6, C.gold2);
    Font.drawCentered(g, 'KADO', x + 29, y + 50, C.ink, 1);
  },

  /* ---------------- Kotak surat ---------------- */
  mailbox(g, o, t) {
    const x = o.x, y = o.y;
    U.px(g, x + 12, y + 26, 6, 22, C.wood2);
    U.px(g, x + 4, y + 12, 22, 18, C.rose2);
    U.px(g, x + 6, y + 14, 18, 14, C.rose);
    U.px(g, x + 4, y + 8, 22, 5, C.rose2);
    U.px(g, x + 8, y + 18, 14, 3, C.ink);
    // bendera
    const up = Math.sin(t * 2) > 0 ? 0 : 2;
    U.px(g, x + 25, y + 8 + up, 2, 12, C.wood2);
    U.px(g, x + 27, y + 8 + up, 7, 5, C.gold);
    Font.drawCentered(g, 'RSVP', x + 15, y + 32, C.ink, 1);
  },

  /* ---------------- Jukebox ---------------- */
  jukebox(g, o, t) {
    const x = o.x, y = o.y;
    U.px(g, x + 4, y + 10, 24, 38, C.wood2);
    U.px(g, x + 6, y + 12, 20, 34, C.wood);
    U.px(g, x + 5, y + 6, 22, 6, C.rose2);
    U.px(g, x + 8, y + 16, 16, 12, C.ink);
    U.px(g, x + 12, y + 19, 8, 6, C.stone2);
    [0, 1, 2].forEach(i => U.px(g, x + 9 + i * 6, y + 32, 4, 4, [C.rose, C.gold, C.sky][i]));
    U.px(g, x + 6, y + 40, 20, 3, C.gold2);
    if (Chip && Chip.playing) {
      for (let i = 0; i < 3; i++) {
        const p = (t * 0.9 + i * 0.33) % 1;
        const nx = x + 16 + Math.sin(p * 6 + i) * 8;
        const ny = y + 6 - p * 22;
        U.px(g, nx, ny, 3, 3, C.cream);
        U.px(g, nx + 2, ny - 4, 1, 5, C.cream);
      }
    }
  },

  /* ---------------- Menara jam ---------------- */
  clockTower(g, o) {
    const x = o.x, y = o.y, h = o.h;
    U.px(g, x + 4, y + 20, 24, h - 20, C.stone2);
    U.px(g, x + 6, y + 20, 20, h - 22, C.stone);
    U.px(g, x + 2, y + 14, 28, 7, C.rose2);
    U.px(g, x + 8, y + 6, 16, 9, C.rose);
    U.px(g, x + 14, y, 4, 7, C.gold);
    // muka jam
    const cx = x + 16, cy = y + 32;
    U.px(g, cx - 9, cy - 9, 18, 18, C.wood2);
    U.px(g, cx - 8, cy - 8, 16, 16, C.cream);
    const d = new Date();
    const hA = ((d.getHours() % 12) + d.getMinutes() / 60) / 12 * Math.PI * 2 - Math.PI / 2;
    const mA = d.getMinutes() / 60 * Math.PI * 2 - Math.PI / 2;
    g.strokeStyle = C.ink; g.lineWidth = 1;
    g.beginPath();
    g.moveTo(cx + 0.5, cy + 0.5); g.lineTo(cx + 0.5 + Math.cos(hA) * 4, cy + 0.5 + Math.sin(hA) * 4);
    g.moveTo(cx + 0.5, cy + 0.5); g.lineTo(cx + 0.5 + Math.cos(mA) * 6, cy + 0.5 + Math.sin(mA) * 6);
    g.stroke();
    U.px(g, cx, cy, 1, 1, C.rose2);
    for (let i = 0; i < 6; i++) U.px(g, x + 6, y + 46 + i * 6, 20, 1, C.stone2);
  },

  /* ---------------- Papan petunjuk ---------------- */
  signpost(g, o) {
    const x = o.x, y = o.y;
    U.px(g, x + 13, y + 10, 5, 38, C.wood2);
    this.board(g, x - 4, y + 12, 40, 11, 'MAPS', 1);
    this.board(g, x - 2, y + 26, 36, 11, 'INFO', 1);
    U.px(g, x + 8, y + 46, 16, 3, C.tuft);
  },

  /* ---------------- Air mancur ---------------- */
  fountain(g, o, t) {
    const x = o.x, y = o.y, w = o.w;
    const cx = x + w / 2, cy = y + 40;
    U.px(g, x + 2, y + 24, w - 4, 30, C.stone2);
    U.px(g, x + 6, y + 22, w - 12, 30, C.stone);
    U.px(g, x + 8, y + 26, w - 16, 22, C.water2);
    U.px(g, x + 10, y + 28, w - 20, 16, C.water);
    // riak
    for (let i = 0; i < 3; i++) {
      const p = (t * 0.6 + i * 0.33) % 1;
      U.px(g, cx - 12 * p, y + 32 + i * 5, 24 * p, 1, C.foam);
    }
    // tiang & pancuran
    U.px(g, cx - 4, y + 12, 8, 18, C.stone);
    U.px(g, cx - 8, y + 8, 16, 5, C.stone2);
    U.px(g, cx - 2, y + 2, 4, 7, C.foam);
    for (let i = 0; i < 8; i++) {
      const p = ((t * 1.6 + i * 0.125) % 1);
      const dx = Math.cos(i / 8 * Math.PI * 2) * (4 + p * 12);
      const dy = y + 6 + p * 22 - Math.sin(p * Math.PI) * 6;
      U.px(g, cx + dx, dy, 2, 2, p > 0.7 ? C.water : C.foam);
    }
    void cy;
  },

  /* ---------------- Dekorasi ---------------- */
  deco(g, d, t) {
    switch (d.type) {
      case 'tree': {
        const sakura = d.v > 0.972;
        const c1 = sakura ? '#f2a8c0' : C.leaf, c2 = sakura ? '#dd85a4' : C.leaf2, c3 = sakura ? '#ffd0e0' : C.leaf3;
        const sway = Math.sin(t * 0.9 + d.x * 0.05) * 1;
        U.px(g, d.x - 2, d.y - 12, 5, 12, C.trunk);
        U.px(g, d.x - 3, d.y - 3, 7, 3, '#63472f');
        U.px(g, d.x - 10 + sway, d.y - 24, 20, 12, c2);
        U.px(g, d.x - 8 + sway, d.y - 30, 16, 10, c1);
        U.px(g, d.x - 5 + sway, d.y - 34, 10, 6, c1);
        U.px(g, d.x - 4 + sway, d.y - 32, 5, 4, c3);
        U.px(g, d.x + 3 + sway, d.y - 26, 4, 3, c3);
        break;
      }
      case 'bush':
        U.px(g, d.x - 7, d.y - 8, 14, 8, C.leaf2);
        U.px(g, d.x - 5, d.y - 11, 10, 6, C.leaf);
        U.px(g, d.x - 3, d.y - 10, 3, 2, C.leaf3);
        break;
      case 'flower': {
        const col = d.v > 0.87 ? C.rose : (d.v > 0.855 ? C.gold : C.cream);
        U.px(g, d.x, d.y - 4, 1, 4, C.leaf2);
        U.px(g, d.x - 2, d.y - 7, 5, 3, col);
        U.px(g, d.x - 1, d.y - 8, 3, 4, col);
        U.px(g, d.x, d.y - 7, 1, 1, C.gold2);
        break;
      }
      case 'rock':
        U.px(g, d.x - 5, d.y - 5, 10, 5, C.stone2);
        U.px(g, d.x - 4, d.y - 7, 7, 3, C.stone);
        break;
      case 'lamp':
        U.px(g, d.x - 1, d.y - 22, 3, 22, C.wood2);
        U.px(g, d.x - 4, d.y - 30, 9, 9, C.ink);
        U.px(g, d.x - 3, d.y - 29, 7, 7, C.gold);
        U.px(g, d.x - 2, d.y - 28, 3, 3, C.cream);
        U.px(g, d.x - 5, d.y - 32, 11, 3, C.wood2);
        U.px(g, d.x - 4, d.y - 2, 9, 3, C.stone2);
        break;
      case 'bench':
        U.px(g, d.x - 12, d.y - 6, 24, 4, C.wood);
        U.px(g, d.x - 12, d.y - 14, 24, 3, C.wood);
        U.px(g, d.x - 12, d.y - 10, 3, 10, C.wood2);
        U.px(g, d.x + 9, d.y - 10, 3, 10, C.wood2);
        U.px(g, d.x - 10, d.y - 2, 3, 3, C.wood2);
        U.px(g, d.x + 7, d.y - 2, 3, 3, C.wood2);
        break;
    }
  }
};
