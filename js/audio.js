/* Musik & efek suara chiptune — dibangkitkan Web Audio, tanpa file mp3.

   Format lagu
   -----------
   div     : jumlah langkah per ketuk (2 = grid seperdelapan)
   tracks  : jalur-jalur yang dimainkan bersamaan
     type    : bentuk gelombang ('square' tajam ala NES, 'triangle' buat bas)
     gain    : keras suara jalur itu
     sustain : panjang bunyi tiap not dalam langkah. Kalau dikosongkan, not
               dibunyikan sepanjang jatahnya sendiri (legato, buat balada).
     notes   : deretan ['nada', panjang dalam langkah]; null = diam.
   Semua jalur dalam satu lagu harus punya total langkah yang sama supaya
   tetap seirama waktu berulang. */

const Chip = {
  ctx: null, master: null, musicGain: null,
  playing: false, step: 0, nextTime: 0, timer: null,
  lagu: 'taman',

  NOTES: { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 },

  songs: {
    /* ---------------------------------------------------------------
       "Taman" — lagu latar versi game. Riang, jalan kaki, C mayor.
       --------------------------------------------------------------- */
    taman: {
      tempo: 104, div: 2,
      tracks: [
        { type: 'square', gain: 0.075, sustain: 1.6, notes: [
          ['E4', 1], ['G4', 1], ['C5', 2], ['C5', 2], ['B4', 2], ['D5', 2], ['B4', 2], ['G4', 4],
          ['A4', 1], ['C5', 1], ['E5', 2], ['E5', 2], ['D5', 2], ['C5', 2], ['A4', 2], ['F4', 4],
          ['E4', 1], ['G4', 1], ['C5', 2], ['E5', 2], ['D5', 2], ['B4', 2], ['D5', 2], ['G4', 4],
          ['A4', 1], ['C5', 1], ['F5', 2], ['E5', 2], ['C5', 2], ['G4', 2], ['E4', 2], ['C4', 4]
        ] },
        { type: 'triangle', gain: 0.13, sustain: 1.8, notes: [
          ['C2', 4], ['G2', 4], ['G2', 4], ['D3', 4],
          ['A2', 4], ['E3', 4], ['F2', 4], ['C3', 4],
          ['C2', 4], ['G2', 4], ['G2', 4], ['D3', 4],
          ['F2', 4], ['C3', 4], ['C2', 4], ['G2', 4]
        ] },
        { type: 'square', gain: 0.02, sustain: 0.18, notes: [
          [null, 4], ['C6', 4], [null, 4], ['C6', 4], [null, 4], ['C6', 4], [null, 4], ['C6', 4],
          [null, 4], ['C6', 4], [null, 4], ['C6', 4], [null, 4], ['C6', 4], [null, 4], ['C6', 4]
        ] }
      ]
    },

    /* ---------------------------------------------------------------
       "Romansa" — balada 8-bit orisinal buat halaman undangan.
       F mayor, 72 BPM, 16 birama. Melodi naik pelan di bait, memuncak di
       birama 9-10, lalu pulang ke tonik. Iringannya arpeggio seperempat
       yang tenang plus bas segitiga satu not per birama.

       Akor per birama:
         F   C/E  Dm  Bb  |  F   C   Bb  C
         Dm  Bb   F   C   |  Dm  Bb  C   F
       --------------------------------------------------------------- */
    romansa: {
      tempo: 72, div: 2,
      tracks: [
        // melodi
        { type: 'square', gain: 0.07, notes: [
          ['A4', 2], ['C5', 2], ['D5', 3], [null, 1],      // 1  F
          ['C5', 2], ['A4', 2], ['G4', 4],                 // 2  C/E
          ['A4', 2], ['D5', 2], ['F5', 3], [null, 1],      // 3  Dm
          ['E5', 2], ['D5', 2], ['C5', 4],                 // 4  Bb

          ['C5', 2], ['F5', 2], ['E5', 3], [null, 1],      // 5  F
          ['D5', 2], ['C5', 2], ['A4', 4],                 // 6  C
          ['D5', 2], ['F5', 2], ['G5', 3], [null, 1],      // 7  Bb
          ['F5', 2], ['E5', 2], ['D5', 4],                 // 8  C

          ['A5', 3], ['G5', 1], ['F5', 4],                 // 9  Dm  (puncak)
          ['G5', 3], ['F5', 1], ['D5', 4],                 // 10 Bb
          ['F5', 2], ['E5', 2], ['C5', 4],                 // 11 F
          ['E5', 2], ['D5', 2], ['C5', 4],                 // 12 C

          ['D5', 2], ['F5', 2], ['A5', 3], [null, 1],      // 13 Dm
          ['G5', 2], ['F5', 2], ['D5', 4],                 // 14 Bb
          ['E5', 2], ['D5', 2], ['C5', 2], ['A#4', 2],     // 15 C
          ['A4', 4], ['F4', 4]                             // 16 F  (pulang)
        ] },

        // arpeggio pengiring
        { type: 'square', gain: 0.035, notes: [
          ['F3', 2], ['A3', 2], ['C4', 2], ['A3', 2],      // 1  F
          ['E3', 2], ['G3', 2], ['C4', 2], ['G3', 2],      // 2  C/E
          ['D3', 2], ['F3', 2], ['A3', 2], ['F3', 2],      // 3  Dm
          ['A#3', 2], ['D4', 2], ['F4', 2], ['D4', 2],     // 4  Bb

          ['F3', 2], ['A3', 2], ['C4', 2], ['A3', 2],      // 5  F
          ['C3', 2], ['E3', 2], ['G3', 2], ['E3', 2],      // 6  C
          ['A#3', 2], ['D4', 2], ['F4', 2], ['D4', 2],     // 7  Bb
          ['C3', 2], ['E3', 2], ['G3', 2], ['E3', 2],      // 8  C

          ['D3', 2], ['F3', 2], ['A3', 2], ['F3', 2],      // 9  Dm
          ['A#3', 2], ['D4', 2], ['F4', 2], ['D4', 2],     // 10 Bb
          ['F3', 2], ['A3', 2], ['C4', 2], ['A3', 2],      // 11 F
          ['C3', 2], ['E3', 2], ['G3', 2], ['E3', 2],      // 12 C

          ['D3', 2], ['F3', 2], ['A3', 2], ['F3', 2],      // 13 Dm
          ['A#3', 2], ['D4', 2], ['F4', 2], ['D4', 2],     // 14 Bb
          ['C3', 2], ['E3', 2], ['G3', 2], ['E3', 2],      // 15 C
          ['F3', 2], ['A3', 2], ['C4', 2], ['A3', 2]       // 16 F
        ] },

        // bas
        { type: 'triangle', gain: 0.11, sustain: 6.5, notes: [
          ['F2', 8], ['E2', 8], ['D2', 8], ['A#2', 8],
          ['F2', 8], ['C2', 8], ['A#2', 8], ['C2', 8],
          ['D2', 8], ['A#2', 8], ['F2', 8], ['C2', 8],
          ['D2', 8], ['A#2', 8], ['C2', 8], ['F2', 8]
        ] }
      ]
    }
  },

  freq(name) {
    const m = /^([A-G]#?)(-?\d)$/.exec(name);
    if (!m) return 440;
    const semi = this.NOTES[m[1]] + (parseInt(m[2], 10) + 1) * 12;
    return 440 * Math.pow(2, (semi - 69) / 12);
  },

  // Deretan ['nada', panjang] diratakan jadi satu langkah per petak, supaya
  // penjadwalnya cukup melihat "ada yang mulai di langkah ini atau tidak".
  ratakan(notes) {
    const out = [];
    notes.forEach(pair => {
      const nada = pair[0], panjang = pair[1];
      out.push(nada ? { n: nada, len: panjang } : null);
      for (let i = 1; i < panjang; i++) out.push(null);
    });
    return out;
  },

  siapkan() {
    const s = this.songs[this.lagu] || this.songs.taman;
    if (!s.siap) {
      s.jalur = s.tracks.map(t => ({
        type: t.type, gain: t.gain, sustain: t.sustain, steps: this.ratakan(t.notes)
      }));
      s.panjang = Math.max.apply(null, s.jalur.map(j => j.steps.length));
      s.siap = true;
    }
    return s;
  },

  // Ganti lagu latar. Kalau sedang berbunyi, langsung pindah dari awal.
  use(nama) {
    if (!nama || !this.songs[nama] || nama === this.lagu) return;
    this.lagu = nama;
    this.step = 0;
    if (this.playing && this.ctx) this.nextTime = this.ctx.currentTime + 0.08;
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
    const lagu = this.siapkan();
    const stepDur = 60 / lagu.tempo / lagu.div;
    while (this.nextTime < this.ctx.currentTime + 0.2) {
      const s = this.step % lagu.panjang;
      for (let i = 0; i < lagu.jalur.length; i++) {
        const jalur = lagu.jalur[i];
        const ev = jalur.steps[s % jalur.steps.length];
        if (!ev) continue;
        // Not balada dibunyikan sepanjang jatahnya (dikurangi sedikit supaya
        // ada jeda napas); lagu yang punya 'sustain' pakai panjang tetap.
        const panjang = jalur.sustain || Math.max(ev.len - 0.15, 0.6);
        this.tone(this.freq(ev.n), this.nextTime, stepDur * panjang, jalur.type, jalur.gain, this.musicGain);
      }
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
