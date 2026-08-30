/* Panel besar (galeri, RSVP, kado) + notifikasi kecil. */

const Modal = {
  el: null, titleEl: null, bodyEl: null, open: false, onClose: null,

  init() {
    this.el = document.getElementById('modal');
    this.titleEl = this.el.querySelector('.modal-title');
    this.bodyEl = this.el.querySelector('.modal-body');
    this.el.querySelector('.modal-close').onclick = () => this.close();
    this.el.addEventListener('mousedown', e => { if (e.target === this.el) this.close(); });
  },

  show(title, html, onClose) {
    this.titleEl.textContent = title;
    this.bodyEl.innerHTML = html;
    this.el.classList.remove('hidden');
    this.el.scrollTop = 0;
    this.bodyEl.scrollTop = 0;
    this.open = true;
    this.onClose = onClose || null;
    Game.syncControls();
    Chip.open();
  },

  close() {
    if (!this.open) return;
    this.el.classList.add('hidden');
    this.open = false;
    Game.syncControls();
    const cb = this.onClose; this.onClose = null;
    if (cb) cb();
  }
};

const Toast = {
  el: null, timer: null,
  init() { this.el = document.getElementById('toast'); },
  show(msg, ms) {
    this.el.textContent = msg;
    this.el.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.el.classList.remove('show'), ms || 2200);
  }
};

function copyText(text, label) {
  const done = () => Toast.show((label || 'Disalin') + ': ' + text);
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => fallback());
  } else fallback();
  function fallback() {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { Toast.show('Salin manual: ' + text); }
    document.body.removeChild(ta);
  }
}
