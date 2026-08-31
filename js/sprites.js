/* Sprite karakter 12x16, digambar dari "ASCII art" lalu diwarnai per-tokoh.
   h=rambut  s=kulit  e=mata  o=garis gelap  c=baju  d=baju gelap  p=celana/rok  a=aksen */

const CharArt = {
  down: [
    [ '...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhh..', '..hssssssh..',
      '..hsessesh..', '..hssoossh..', '..hssssssh..', '...ccsscc...',
      '..cccaaccc..', '..cccaaccc..', '.sccccccccs.', '.sccddddccs.',
      '...pppppp...', '...pp..pp...', '...pp..pp...', '...oo..oo...' ],
    [ '...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhh..', '..hssssssh..',
      '..hsessesh..', '..hssoossh..', '..hssssssh..', '...ccsscc...',
      '..cccaaccc..', '..cccaaccc..', '.sccccccccs.', '.sccddddccs.',
      '...pppppp...', '...pppppp...', '..pp....pp..', '..oo....oo..' ]
  ],
  up: [
    [ '...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..',
      '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..', '...cccccc...',
      '..cccccccc..', '..cccccccc..', '.sccccccccs.', '.sccddddccs.',
      '...pppppp...', '...pp..pp...', '...pp..pp...', '...oo..oo...' ],
    [ '...hhhhhh...', '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..',
      '..hhhhhhhh..', '..hhhhhhhh..', '..hhhhhhhh..', '...cccccc...',
      '..cccccccc..', '..cccccccc..', '.sccccccccs.', '.sccddddccs.',
      '...pppppp...', '...pppppp...', '..pp....pp..', '..oo....oo..' ]
  ],
  right: [
    [ '...hhhh.....', '..hhhhhh....', '..hhhssh....', '..hhsssh....',
      '..hhsess....', '..hhssso....', '..hhssss....', '...cccc.....',
      '..cccccc....', '..cccccc....', '..ccccccs...', '..cddddcs...',
      '...pppp.....', '...pppp.....', '...pp.p.....', '...oo.o.....' ],
    [ '...hhhh.....', '..hhhhhh....', '..hhhssh....', '..hhsssh....',
      '..hhsess....', '..hhssso....', '..hhssss....', '...cccc.....',
      '..cccccc....', '..cccccc....', '..ccccccs...', '..cddddcs...',
      '...pppp.....', '...pppp.....', '..pp..pp....', '..oo..oo....' ]
  ]
};

const Palettes = {
  tamu:  { h: '#3a2b23', s: '#f2c49b', e: '#2b1d2e', o: '#2b1d2e', c: '#4a7ec9', d: '#38609c', p: '#3b3a4d', a: '#f0c674' },
  groom: { h: '#241a16', s: '#f2c49b', e: '#2b1d2e', o: '#2b1d2e', c: '#333a57', d: '#252b42', p: '#333a57', a: '#e2758f' },
  bride: { h: '#3a2b23', s: '#fbd3ae', e: '#2b1d2e', o: '#2b1d2e', c: '#fdf6e9', d: '#e6d9c0', p: '#fdf6e9', a: '#e2758f' },
  anak:  { h: '#5a3b26', s: '#f2c49b', e: '#2b1d2e', o: '#2b1d2e', c: '#7fb069', d: '#639153', p: '#8c6b4f', a: '#fdf6e9' },
  // variasi warna buat tamu lain yang sedang online
  tamu2: { h: '#1f1a17', s: '#c98d5e', e: '#2b1d2e', o: '#2b1d2e', c: '#d98452', d: '#b96a3e', p: '#4a4458', a: '#fdf6e9' },
  tamu3: { h: '#4a2f2a', s: '#8d5a3c', e: '#2b1d2e', o: '#2b1d2e', c: '#8f7bc4', d: '#7364a8', p: '#33304a', a: '#f0c674' },
  tamu4: { h: '#6b4a2f', s: '#f7d9b8', e: '#2b1d2e', o: '#2b1d2e', c: '#4f9d8a', d: '#3d7d6e', p: '#5c4a3a', a: '#e2758f' }
};

const Sprites = {
  chars: {},

  init() {
    Object.keys(Palettes).forEach(key => {
      const pal = Palettes[key];
      const set = { down: [], up: [], right: [], left: [] };
      ['down', 'up', 'right'].forEach(dir => {
        CharArt[dir].forEach(rows => set[dir].push(U.sprite(rows, pal)));
      });
      set.left = set.right.map(U.flip);
      this.chars[key] = set;
    });
  },

  // x,y = titik kaki (tengah bawah) karakter di dunia.
  drawChar(ctx, key, dir, frame, x, y) {
    const set = this.chars[key] || this.chars.tamu;
    const img = (set[dir] || set.down)[frame % 2];
    const bob = frame % 2 === 1 ? 0 : 0;
    ctx.drawImage(img, Math.round(x - 6), Math.round(y - 16 + bob));
  },

  // Bayangan lonjong di bawah karakter/objek.
  shadow(ctx, x, y, w) {
    ctx.fillStyle = 'rgba(30,24,20,0.20)';
    ctx.beginPath();
    ctx.ellipse(Math.round(x), Math.round(y), w / 2, Math.max(2, w / 4), 0, 0, Math.PI * 2);
    ctx.fill();
  }
};
