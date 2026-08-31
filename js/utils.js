/* Helper kecil dipakai di seluruh game. */

const U = {
  clamp(v, a, b) { return v < a ? a : (v > b ? b : v); },

  // Fill rect dengan koordinat dibulatkan -> ketajaman pixel terjaga.
  px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  },

  // Hash deterministik: peta selalu sama tiap kali dibuka.
  hash(x, y) {
    let n = (x * 374761393 + y * 668265263) ^ 0x5bf03635;
    n = (n ^ (n >>> 13)) * 1274126177;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
  },

  rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  },

  // Jarak terdekat dari sebuah titik ke sisi kotak. 0 kalau titiknya di dalam.
  rectDist(px, py, r) {
    const dx = Math.max(r.x - px, 0, px - (r.x + r.w));
    const dy = Math.max(r.y - py, 0, py - (r.y + r.h));
    return Math.hypot(dx, dy);
  },

  // Gabungan beberapa kotak jadi satu kotak pembungkus.
  unionRect(list) {
    if (!list || !list.length) return null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    list.forEach(r => {
      x0 = Math.min(x0, r.x); y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.w); y1 = Math.max(y1, r.y + r.h);
    });
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  },

  pointInRect(px, py, r, pad) {
    pad = pad || 0;
    return px >= r.x - pad && px <= r.x + r.w + pad && py >= r.y - pad && py <= r.y + r.h + pad;
  },

  // Bikin canvas offscreen dari "gambar ASCII".
  // rows: array string, palette: { karakter: warna }, '.' = transparan.
  sprite(rows, palette, scale) {
    scale = scale || 1;
    const w = Math.max.apply(null, rows.map(r => r.length));
    const h = rows.length;
    const c = document.createElement('canvas');
    c.width = w * scale; c.height = h * scale;
    const g = c.getContext('2d');
    for (let y = 0; y < h; y++) {
      const row = rows[y];
      for (let x = 0; x < row.length; x++) {
        const col = palette[row[x]];
        if (!col) continue;
        g.fillStyle = col;
        g.fillRect(x * scale, y * scale, scale, scale);
      }
    }
    return c;
  },

  flip(canvas) {
    const c = document.createElement('canvas');
    c.width = canvas.width; c.height = canvas.height;
    const g = c.getContext('2d');
    g.translate(canvas.width, 0);
    g.scale(-1, 1);
    g.drawImage(canvas, 0, 0);
    return c;
  },

  esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, m => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]
    ));
  },

  query(name) {
    const m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search);
    return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : '';
  },

  // Sisa waktu menuju hari H.
  countdown(target) {
    let ms = new Date(target).getTime() - Date.now();
    if (isNaN(ms)) return null;
    const past = ms < 0;
    ms = Math.abs(ms);
    const d = Math.floor(ms / 86400000);
    const h = Math.floor(ms / 3600000) % 24;
    const m = Math.floor(ms / 60000) % 60;
    const s = Math.floor(ms / 1000) % 60;
    return { d, h, m, s, past };
  }
};
