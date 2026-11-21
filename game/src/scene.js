// The scene painter: a deterministic night-harbor illustration built from an item list grown
// from the level seed. Both panels draw the same item list; a difference item draws its variant
// on exactly one panel (its `side`), so the two pictures differ only where the differences live.
// The same seed always grows the same list, so both panels and every screenshot match.

import { makeRng, randRange, pickOne } from './rng.js';
import { PALETTE, PANEL } from './config.js';

const S = PANEL.size;
const SKY_H = S * 0.62;
const WATER_Y = S * 0.62;

/**
 * Grow the scene item list for a seed, then turn `count` of the mutable items into differences
 * (each with a variant and the side that shows it). Returns { items, diffs }.
 */
export function buildScene(seed, count) {
  const rng = makeRng(seed);
  const items = [
    { id: 'moon', x: 120, y: 96, r: 30 },
  ];
  for (let i = 0; i < 40; i += 1) {
    items.push({ id: 'star', x: randRange(rng, 14, S - 14), y: randRange(rng, 14, SKY_H - 20), r: randRange(rng, 0.9, 2.3), a: randRange(rng, 0.4, 1) });
  }
  items.push({ id: 'lighthouse', x: S - 110, base: WATER_Y + 20, h: 190 });
  items.push({ id: 'house', x: 56, y: SKY_H - 78, lit: 4 });
  items.push({ id: 'pier', y: S * 0.78 });
  items.push({ id: 'boat', x: 270, y: S * 0.72, s: 1, sail: true, hull: PALETTE.hull });
  items.push({ id: 'boat', x: 430, y: S * 0.86, s: 0.6, sail: true, hull: '#4a3420' });
  items.push({ id: 'gull', x: 210, y: 168, s: 1 });
  items.push({ id: 'gull', x: 246, y: 184, s: 0.7 });
  items.push({ id: 'buoy', x: 150, y: S * 0.92 });
  for (let i = 0; i < 6; i += 1) {
    items.push({ id: 'wave', x: randRange(rng, 0, S), y: WATER_Y + 14 + i * 24, w: randRange(rng, 34, 96) });
  }

  // Candidate difference carriers: stars far from the moon, boats, house windows, gulls, buoy,
  // lighthouse lamp. Difference points keep >=92 px apart so targets never overlap.
  const carriers = items.filter((it) => ['star', 'boat', 'house', 'gull', 'buoy', 'lighthouse'].includes(it.id));
  const diffs = [];
  let guard = 0;
  while (diffs.length < count && guard < count * 60) {
    guard += 1;
    const carrier = pickOne(rng, carriers);
    if (carrier.id === 'star' && Math.hypot(carrier.x - 120, carrier.y - 96) < 80) continue;
    if (diffs.some((d) => Math.hypot(d.x - carrier.x, d.y - carrier.y) < 92)) continue;
    if (diffs.some((d) => d.item === carrier)) continue;
    diffs.push(makeDifference(carrier, rng, diffs.length));
  }
  return { items, diffs };
}

/** One hidden change: a variant to draw on `side`, and where the player clicks on either panel. */
function makeDifference(item, rng, index) {
  const side = index % 2 === 0 ? 'left' : 'right';
  const variants = {
    star: ['gone', 'brighter', 'cross'],
    boat: ['no-sail', 'smaller', 'dark-hull'],
    house: ['dim-window'],
    gull: ['gone', 'solo'],
    buoy: ['gone', 'red'],
    lighthouse: ['lamp-off'],
  };
  const options = variants[item.id] || ['gone'];
  const variant = pickOne(rng, options);
  return { item, x: item.x, y: pointY(item), variant, side, index };
}

/** Click target height: floating things click where they are, ground items at their base. */
function pointY(item) {
  if (item.id === 'house') return item.y + 30;
  if (item.id === 'lighthouse') return item.base - item.h - 26;
  return item.y;
}

function moon(g, it) {
  g.fillStyle = PALETTE.moon;
  g.beginPath();
  g.arc(it.x, it.y, it.r, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = 'rgba(20,30,50,0.35)';
  g.beginPath();
  g.arc(it.x + it.r * 0.3, it.y - it.r * 0.2, it.r * 0.22, 0, Math.PI * 2);
  g.fill();
}

function star(g, it, variant) {
  if (variant === 'gone') return;
  g.globalAlpha = variant === 'brighter' ? 1 : it.a;
  g.fillStyle = PALETTE.star;
  g.beginPath();
  g.arc(it.x, it.y, variant === 'brighter' ? it.r * 1.9 : it.r, 0, Math.PI * 2);
  g.fill();
  if (variant === 'cross') {
    g.strokeStyle = PALETTE.star;
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(it.x - 5, it.y); g.lineTo(it.x + 5, it.y);
    g.moveTo(it.x, it.y - 5); g.lineTo(it.x, it.y + 5);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function lighthouse(g, it, variant) {
  const lampOff = variant === 'lamp-off';
  g.fillStyle = '#3a3f52';
  g.fillRect(it.x - 26, it.base - it.h, 52, it.h);
  g.fillStyle = '#5a6178';
  for (let band = 0; band < 3; band += 1) {
    g.fillRect(it.x - 26, it.base - it.h + (it.h / 3) * band + 6, 52, it.h / 6);
  }
  g.fillStyle = '#2c3145';
  g.fillRect(it.x - 34, it.base - it.h - 16, 68, 18);
  g.fillStyle = lampOff ? '#4a4252' : PALETTE.lamp;
  g.beginPath();
  g.arc(it.x, it.base - it.h - 26, 13, 0, Math.PI * 2);
  g.fill();
  if (!lampOff) {
    g.save();
    g.globalAlpha = 0.16;
    g.fillStyle = PALETTE.lamp;
    g.beginPath();
    g.moveTo(it.x, it.base - it.h - 26);
    g.lineTo(it.x - 150, it.base - it.h - 84);
    g.lineTo(it.x - 150, it.base - it.h + 32);
    g.closePath();
    g.fill();
    g.restore();
  }
}

function house(g, it, variant) {
  g.fillStyle = '#33261c';
  g.fillRect(it.x, it.y, 96, 60);
  g.fillStyle = '#1d150f';
  g.beginPath();
  g.moveTo(it.x - 8, it.y);
  g.lineTo(it.x + 48, it.y - 26);
  g.lineTo(it.x + 104, it.y);
  g.closePath();
  g.fill();
  const lit = variant === 'dim-window' ? 3 : it.lit;
  for (let i = 0; i < 4; i += 1) {
    g.fillStyle = i < lit ? PALETTE.lamp : '#3d3f4d';
    g.fillRect(it.x + 10 + (i % 2) * 46, it.y + 14 + Math.floor(i / 2) * 28, 22, 18);
  }
}

function pier(g, it) {
  g.fillStyle = '#241b12';
  g.fillRect(0, it.y, S * 0.42, 10);
  for (let i = 0; i < 4; i += 1) g.fillRect(24 + i * 52, it.y, 8, 46);
}

function boat(g, it, variant) {
  const s = variant === 'smaller' ? it.s * 0.72 : it.s;
  const sail = variant === 'no-sail' ? false : it.sail;
  const hull = variant === 'dark-hull' ? '#1f1712' : it.hull;
  g.fillStyle = hull;
  g.beginPath();
  g.moveTo(it.x - 42 * s, it.y);
  g.lineTo(it.x + 42 * s, it.y);
  g.lineTo(it.x + 30 * s, it.y + 18 * s);
  g.lineTo(it.x - 30 * s, it.y + 18 * s);
  g.closePath();
  g.fill();
  g.strokeStyle = '#241a12';
  g.lineWidth = 2 * s;
  g.beginPath();
  g.moveTo(it.x, it.y);
  g.lineTo(it.x, it.y - 46 * s);
  g.stroke();
  if (sail) {
    g.fillStyle = PALETTE.sail;
    g.beginPath();
    g.moveTo(it.x + 2 * s, it.y - 44 * s);
    g.lineTo(it.x + 34 * s, it.y - 6 * s);
    g.lineTo(it.x + 2 * s, it.y - 6 * s);
    g.closePath();
    g.fill();
  }
}

function gull(g, it, variant) {
  if (variant === 'gone') return;
  const s = (variant === 'solo' ? 1.15 : it.s) * 1.5;
  g.strokeStyle = '#c9cfdd';
  g.lineWidth = 2.6;
  g.beginPath();
  g.moveTo(it.x - 9 * s, it.y);
  g.quadraticCurveTo(it.x - 4 * s, it.y - 6 * s, it.x, it.y);
  g.quadraticCurveTo(it.x + 4 * s, it.y - 6 * s, it.x + 9 * s, it.y);
  g.stroke();
}

function buoy(g, it, variant) {
  if (variant === 'gone') return;
  g.fillStyle = variant === 'red' ? PALETTE.bad : PALETTE.hint;
  g.beginPath();
  g.moveTo(it.x, it.y - 16);
  g.lineTo(it.x + 9, it.y);
  g.lineTo(it.x - 9, it.y);
  g.closePath();
  g.fill();
}

function wave(g, it) {
  g.fillStyle = 'rgba(240,245,255,0.06)';
  g.fillRect(it.x, it.y, it.w, 2);
}

const PAINTERS = { moon, star, lighthouse, house, pier, boat, gull, buoy, wave };

/** Draw one full panel. `variantOn` true renders every difference's variant here. */
export function drawScene(g, scene, variantOn) {
  const byItem = new Map(scene.diffs.map((d) => [d.item, d]));
  g.fillStyle = PALETTE.panelSky;
  g.fillRect(0, 0, S, SKY_H);
  g.fillStyle = PALETTE.water;
  g.fillRect(0, WATER_Y, S, S - WATER_Y);
  g.fillStyle = PALETTE.waterAlt;
  g.fillRect(0, WATER_Y, S, 6);
  for (const item of scene.items) {
    const diff = byItem.get(item);
    const variant = diff && diff.side === (variantOn ? 'right' : 'left') ? diff.variant : undefined;
    PAINTERS[item.id](g, item, variant);
  }
}

/** Where a difference's click target sits, in scene-local coordinates. */
export function differencePoint(d) {
  return { x: d.x, y: d.y };
}

export function sceneSize() {
  return S;
}
