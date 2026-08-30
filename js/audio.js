/* Musik & efek suara chiptune — dibangkitkan Web Audio, tanpa file mp3. */

const Chip = {
  ctx: null, master: null, musicGain: null,
  playing: false, step: 0, nextTime: 0, timer: null,
  tempo: 104, // BPM

  NOTES: { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 },

  melody: [
    'E4', 'G4', 'C5', null, 'C5', null, 'B4', null,
    'D5', null, 'B4', null, 'G4', null, null, null,
    'A4', 'C5', 'E5', null, 'E5', null, 'D5', null,
    'C5', null, 'A4', null, 'F4', null, null, null,
    'E4', 'G4', 'C5', null, 'E5', null, 'D5', null,
    'B4', null, 'D5', null, 'G4', null, null, null,
    'A4', 'C5', 'F5', null, 'E5', null, 'C5', null,
    'G4', null, 'E4', null, 'C4', null, null, null
  ],
  bassRoots: ['C2', 'G2', 'A2', 'F2', 'C2', 'G2', 'F2', 'C2'],

  freq(name) {
    const m = /^([A-G]#?)(-?\d)$/.exec(name);
    if (!m) return 440;
    const semi = this.NOTES[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (semi - 69) / 12);
  },

  ensure() {
    if (this.ctx) return true;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.5;
    this.master.connect(this.ctx.destination);
    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.value = 0.6;
    this.musicGain.connect(this.master);
    return true;
  },

  tone(freq, at, dur, type, gain, dest) {
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type || 'square';
    o.frequency.setValueAtTime(freq, at);
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(gain, at + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(dest || this.master);
    o.start(at); o.stop(at + dur + 0.05);
  },

  /* ---- musik latar ---- */
  start() {
    if (!this.ensure() || this.playing) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.playing = true;
    this.nextTime = this.ctx.currentTime + 0.08;
    this.timer = setInterval(() => this.schedule(), 25);
  },

  stop() {
    this.playing = false;
    if (this.timer) { clearInterval(this.timer); this.timer = null; }
  },

  toggle() {
    if (this.playing) this.stop(); else this.start();
    return this.playing;
  },

  schedule() {
    if (!this.playing) return;
    const stepDur = 60 / this.tempo / 2; // not 1/8
    while (this.nextTime < this.ctx.currentTime + 0.2) {
      const s = this.step % this.melody.length;
      const n = this.melody[s];
      if (n) this.tone(this.freq(n), this.nextTime, stepDur * 1.6, 'square', 0.075, this.musicGain);
      if (s % 4 === 0) {
        const root = this.bassRoots[Math.floor(s / 8) % this.bassRoots.length];
        const f = this.freq(root) * (s % 8 === 0 ? 1 : 1.5);
        this.tone(f, this.nextTime, stepDur * 1.8, 'triangle', 0.13, this.musicGain);
      }
      if (s % 8 === 4) this.tone(this.freq('C6'), this.nextTime, 0.05, 'square', 0.02, this.musicGain);
      this.nextTime += stepDur;
      this.step++;
    }
  },

  /* ---- efek ---- */
  blip() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    this.tone(660 + Math.random() * 120, t, 0.04, 'square', 0.05);
  },
  confirm() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    [523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, t + i * 0.06, 0.14, 'square', 0.07));
  },
  open() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    [392, 523.25].forEach((f, i) => this.tone(f, t + i * 0.05, 0.12, 'square', 0.06));
  },
  fanfare() {
    if (!this.ensure()) return;
    const t = this.ctx.currentTime;
    const seq = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    seq.forEach((f, i) => this.tone(f, t + i * 0.13, 0.3, 'square', 0.08));
    [130.81, 196, 261.63].forEach((f, i) => this.tone(f, t + i * 0.26, 0.5, 'triangle', 0.1));
  }
};
