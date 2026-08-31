/* Kotak dialog ala RPG: efek ketik, lanjut per halaman, tombol aksi di akhir. */

const Dialogue = {
  el: null, nameEl: null, textEl: null, faceEl: null, actEl: null, hintEl: null,
  pages: [], idx: 0, typing: false, full: '', shown: 0, timer: null,
  opts: {}, open: false,

  init() {
    this.el = document.getElementById('dialog');
    this.nameEl = this.el.querySelector('.dlg-name');
    this.textEl = this.el.querySelector('.dlg-text');
    this.faceEl = this.el.querySelector('.dlg-face');
    this.actEl = this.el.querySelector('.dlg-actions');
    this.hintEl = this.el.querySelector('.dlg-hint');
    this.el.addEventListener('click', e => {
      if (e.target.closest('.dlg-actions')) return;
      this.advance();
    });
  },

  show(pages, opts) {
    this.pages = Array.isArray(pages) ? pages : [pages];
    this.opts = opts || {};
    this.idx = 0;
    this.open = true;
    this.el.classList.remove('hidden');
    Game.syncControls();
    this.render();
  },

  render() {
    const p = this.pages[this.idx];
    this.nameEl.textContent = p.name || '';
    this.nameEl.style.display = p.name ? '' : 'none';
    this.actEl.innerHTML = '';
    this.actEl.classList.add('hidden');

    this.faceEl.innerHTML = '';
    if (p.face && Sprites.chars[p.face]) {
      const src = Sprites.chars[p.face].down[0];
      const c = document.createElement('canvas');
      c.width = 48; c.height = 64;
      const g = c.getContext('2d');
      g.imageSmoothingEnabled = false;
      g.drawImage(src, 0, 0, 48, 64);
      this.faceEl.appendChild(c);
      this.faceEl.style.display = '';
    } else {
      this.faceEl.style.display = 'none';
    }

    this.full = p.text || '';
    this.shown = 0;
    this.typing = true;
    this.textEl.textContent = '';
    this.hintEl.textContent = '';
    clearInterval(this.timer);
    this.timer = setInterval(() => {
      this.shown += 1;
      this.textEl.textContent = this.full.slice(0, this.shown);
      if (this.shown % 3 === 0) Chip.blip();
      if (this.shown >= this.full.length) this.finishTyping();
    }, 18);
  },

  finishTyping() {
    clearInterval(this.timer);
    this.typing = false;
    this.textEl.textContent = this.full;
    const last = this.idx >= this.pages.length - 1;
    if (last && this.opts.actions && this.opts.actions.length) {
      this.actEl.innerHTML = '';
      this.opts.actions.forEach(a => {
        const b = document.createElement('button');
        b.className = 'btn' + (a.primary ? ' btn-primary' : '');
        b.textContent = a.label;
        b.onclick = ev => { ev.stopPropagation(); Chip.confirm(); a.fn(); };
        this.actEl.appendChild(b);
      });
      const close = document.createElement('button');
      close.className = 'btn btn-ghost';
      close.textContent = 'Tutup';
      close.onclick = ev => { ev.stopPropagation(); this.close(); };
      this.actEl.appendChild(close);
      this.actEl.classList.remove('hidden');
      this.hintEl.textContent = '';
    } else {
      this.hintEl.textContent = last ? '▼ tutup' : '▼ lanjut';
    }
  },

  advance() {
    if (!this.open) return;
    if (this.typing) { this.finishTyping(); return; }
    if (this.actEl.classList.contains('hidden') === false) return; // tunggu pilih tombol
    if (this.idx < this.pages.length - 1) { this.idx++; this.render(); Chip.blip(); }
    else this.close();
  },

  close() {
    if (!this.open) return;
    clearInterval(this.timer);
    this.open = false;
    this.el.classList.add('hidden');
    Game.syncControls();
    if (this.opts.onDone) this.opts.onDone();
  }
};
