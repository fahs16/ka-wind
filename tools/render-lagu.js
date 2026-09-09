/* Render lagu chiptune di js/audio.js jadi file WAV.

   Berguna kalau kalian mau menempelkan lagunya di story Instagram, video
   save-the-date, atau sekadar mendengarkannya di luar browser. Situsnya
   sendiri tidak butuh file ini — musiknya dibangkitkan langsung di browser.

   Pakai:
     node tools/render-lagu.js romansa 2 lagu.wav
     node tools/render-lagu.js taman   2 lagu-taman.wav

   Argumen: nama lagu, jumlah putaran, dan nama berkas keluaran.
   Matematikanya sengaja meniru Web Audio: osilator square/triangle dengan
   amplop gain eksponensial, supaya hasilnya sama dengan yang terdengar di
   halaman undangan. */
const fs = require('fs');
global.window = {};
const jalur = require('path').join(__dirname, '..', 'js', 'audio.js');
const Chip = eval(fs.readFileSync(jalur, 'utf8') + '; Chip');

const SR = 44100;
const nama = process.argv[2] || 'romansa';
const putaran = +(process.argv[3] || 2);
Chip.lagu = nama;
const lagu = Chip.siapkan();
const stepDur = 60 / lagu.tempo / lagu.div;
const totalStep = lagu.panjang * putaran;
const ekor = 1.5;
const n = Math.ceil((totalStep * stepDur + ekor) * SR);
const buf = new Float64Array(n);

// gain master 0.5 * musicGain 0.6, sama seperti di browser
const MASTER = 0.5 * 0.6;

function bentuk(type, fase) {
  if (type === 'triangle') return 2 * Math.abs(2 * (fase - Math.floor(fase + 0.5))) - 1;
  return (fase - Math.floor(fase)) < 0.5 ? 1 : -1;   // square
}

function taruh(freq, at, dur, type, gain) {
  const mulai = Math.floor(at * SR);
  const panjang = Math.ceil((dur + 0.05) * SR);
  const naik = 0.012;
  for (let i = 0; i < panjang; i++) {
    const idx = mulai + i;
    if (idx >= n) break;
    const t = i / SR;
    // exponentialRampToValueAtTime: 0.0001 -> gain dalam 12 ms, lalu turun
    // balik ke 0.0001 pada t = dur
    let a;
    if (t < naik) a = 0.0001 * Math.pow(gain / 0.0001, t / naik);
    else if (t < dur) a = gain * Math.pow(0.0001 / gain, (t - naik) / (dur - naik));
    else a = 0;
    buf[idx] += bentuk(type, freq * t) * a * MASTER;
  }
}

for (let s = 0; s < totalStep; s++) {
  const at = s * stepDur;
  const pos = s % lagu.panjang;
  lagu.jalur.forEach(j => {
    const ev = j.steps[pos % j.steps.length];
    if (!ev) return;
    const p = j.sustain || Math.max(ev.len - 0.15, 0.6);
    taruh(Chip.freq(ev.n), at, stepDur * p, j.type, j.gain);
  });
}

// normalisasi lembut supaya tidak clipping tapi tetap terdengar
let puncak = 0;
for (let i = 0; i < n; i++) puncak = Math.max(puncak, Math.abs(buf[i]));
const skala = puncak > 0 ? 0.89 / puncak : 1;

const pcm = Buffer.alloc(n * 2);
for (let i = 0; i < n; i++) {
  let v = Math.max(-1, Math.min(1, buf[i] * skala));
  pcm.writeInt16LE(Math.round(v * 32767), i * 2);
}
const head = Buffer.alloc(44);
head.write('RIFF', 0); head.writeUInt32LE(36 + pcm.length, 4); head.write('WAVE', 8);
head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20);
head.writeUInt16LE(1, 22); head.writeUInt32LE(SR, 24); head.writeUInt32LE(SR * 2, 28);
head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34);
head.write('data', 36); head.writeUInt32LE(pcm.length, 40);
const keluar = process.argv[4] || ('lagu-' + nama + '.wav');
fs.writeFileSync(keluar, Buffer.concat([head, pcm]));
console.log(keluar, '|', (n / SR).toFixed(1) + 's', '| puncak sebelum normalisasi', puncak.toFixed(3),
  '| skala', skala.toFixed(2), '|', (fs.statSync(keluar).size / 1024 / 1024).toFixed(2) + ' MB');
