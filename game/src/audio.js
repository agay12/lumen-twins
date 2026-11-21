// Sound: short WebAudio blips made from oscillators, so the game loads no audio file and makes
// no network request. The context is created on the first click (browsers block autoplay).

let ctx = null;

function audio() {
  if (!ctx) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function blip(freq, start, length, type, gainPeak) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ac.currentTime + start);
  gain.gain.exponentialRampToValueAtTime(gainPeak, ac.currentTime + start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + length);
  osc.connect(gain).connect(ac.destination);
  osc.start(ac.currentTime + start);
  osc.stop(ac.currentTime + start + length + 0.02);
}

/** A find: two rising notes, warm and short. */
export function playFind() {
  blip(660, 0, 0.12, 'triangle', 0.18);
  blip(990, 0.09, 0.16, 'triangle', 0.14);
}

/** A miss: one dull low thud. */
export function playMiss() {
  blip(150, 0, 0.18, 'sawtooth', 0.12);
}

/** A cleared level: a quick three-note arpeggio. */
export function playClear() {
  blip(523, 0, 0.14, 'sine', 0.16);
  blip(659, 0.12, 0.14, 'sine', 0.16);
  blip(784, 0.24, 0.22, 'sine', 0.16);
}

/** The clock running out: a falling pair. */
export function playOver() {
  blip(392, 0, 0.2, 'sine', 0.14);
  blip(262, 0.18, 0.3, 'sine', 0.14);
}
