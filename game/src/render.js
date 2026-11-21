// All drawing that is not the scene itself: page frame, HUD (found counter, clock, level name),
// found markers and their pulse rings, the hint glow, wrong-click shake, and the title, level
// clear and time-up screens.

import { HUD, LEVELS, MARK, PALETTE, PANEL, VIEW } from './config.js';
import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, levelDefinition, remaining } from './state.js';
import { differencePoint, drawScene, sceneSize } from './scene.js';

function panelRect(side) {
  const x = PANEL.left + side * (PANEL.size + PANEL.gap);
  return { x, y: PANEL.top, w: PANEL.size, h: PANEL.size };
}

function roundFrame(g, r) {
  g.strokeStyle = 'rgba(232,236,244,0.25)';
  g.lineWidth = 2;
  g.strokeRect(r.x - 4, r.y - 4, r.w + 8, r.h + 8);
}

function hudBar(g, game) {
  g.fillStyle = 'rgba(10,15,28,0.85)';
  g.fillRect(0, 0, VIEW.width, HUD.height);
  const def = levelDefinition(game);
  g.fillStyle = PALETTE.text;
  g.font = '600 26px system-ui, sans-serif';
  g.fillText(`Level ${game.level + 1} — ${def.name}`, 40, 42);
  g.font = '400 17px system-ui, sans-serif';
  g.fillStyle = PALETTE.dim;
  g.fillText('Click every difference between the two pictures — either panel works.', 40, 72);
  const left = remaining(game);
  g.font = '700 30px system-ui, sans-serif';
  g.fillStyle = left === 0 ? PALETTE.good : PALETTE.text;
  g.fillText(`Differences left: ${left}`, VIEW.width - 560, 46);
  const clockColor = game.clock < 20 ? PALETTE.bad : PALETTE.text;
  g.fillStyle = clockColor;
  g.fillText(`Time: ${Math.ceil(game.clock)}s`, VIEW.width - 560, 78);
  g.fillStyle = PALETTE.hint;
  g.font = '400 16px system-ui, sans-serif';
  g.fillText(`Found ${game.totalFound}   Wrong ${game.wrongClicks}`, VIEW.width - 286, 74);
}

function hintGlow(g, game, side) {
  if (game.hintAt < 0) return;
  const diff = game.scene.diffs.find((d) => d.index === game.hintAt);
  if (!diff) return;
  const p = differencePoint(diff);
  const r = panelRect(side);
  g.save();
  g.translate(r.x, r.y);
  g.strokeStyle = PALETTE.hint;
  g.globalAlpha = 0.35 + 0.3 * Math.sin(game.clock * 4);
  g.lineWidth = 3;
  g.beginPath();
  g.arc(p.x, p.y, 34, 0, Math.PI * 2);
  g.stroke();
  g.restore();
  g.globalAlpha = 1;
}

function markers(g, game) {
  for (const index of game.found) {
    const diff = game.scene.diffs.find((d) => d.index === index);
    for (const side of [0, 1]) {
      const r = panelRect(side);
      const p = differencePoint(diff);
      g.save();
      g.translate(r.x, r.y);
      g.strokeStyle = PALETTE.good;
      g.lineWidth = 3;
      g.beginPath();
      g.arc(p.x, p.y, MARK.radius, 0, Math.PI * 2);
      g.stroke();
      g.globalAlpha = 0.15;
      g.fillStyle = PALETTE.good;
      g.fill();
      g.restore();
      g.globalAlpha = 1;
    }
  }
  for (const p of game.pulse) {
    const grow = MARK.radius + p.t * 90;
    const alpha = Math.max(0, 1 - p.t / (MARK.ringMs / 1000));
    const r = panelRect(0);
    g.save();
    g.translate(r.x, r.y);
    g.strokeStyle = PALETTE.good;
    g.globalAlpha = alpha;
    g.lineWidth = 3;
    g.beginPath();
    g.arc(p.x, p.y, grow, 0, Math.PI * 2);
    g.stroke();
    g.restore();
    g.globalAlpha = 1;
  }
}

function centered(g, text, y, font, color) {
  g.font = font;
  g.fillStyle = color;
  const w = g.measureText(text).width;
  g.fillText(text, (VIEW.width - w) / 2, y);
}

function titleScreen(g) {
  g.fillStyle = PALETTE.night;
  g.fillRect(0, 0, VIEW.width, VIEW.height);
  centered(g, 'LUMEN TWINS', VIEW.height / 2 - 60, '800 64px system-ui, sans-serif', PALETTE.lamp);
  centered(g, 'A spot-the-difference hunt across three night harbors', VIEW.height / 2, '400 22px system-ui, sans-serif', PALETTE.text);
  centered(g, 'Find every change between the twin pictures before the tide clock runs out', VIEW.height / 2 + 40, '400 18px system-ui, sans-serif', PALETTE.dim);
  centered(g, 'Click a difference on either picture  •  a wrong click costs 6 seconds', VIEW.height / 2 + 78, '400 16px system-ui, sans-serif', PALETTE.hint);
  centered(g, 'Click anywhere to begin', VIEW.height / 2 + 130, '600 20px system-ui, sans-serif', PALETTE.text);
}

function clearScreen(g, game) {
  drawFrame(g, game, false);
  g.fillStyle = 'rgba(10,15,28,0.78)';
  g.fillRect(0, VIEW.height / 2 - 110, VIEW.width, 220);
  const def = LEVELS[game.level];
  centered(g, `${def.name} cleared!`, VIEW.height / 2 - 40, '800 44px system-ui, sans-serif', PALETTE.good);
  centered(g, `${game.totalFound} differences found, ${game.wrongClicks} wrong clicks`, VIEW.height / 2 + 6, '400 20px system-ui, sans-serif', PALETTE.text);
  centered(g, game.level + 1 < LEVELS.length ? 'Click for the next harbor' : 'Click to finish the night', VIEW.height / 2 + 52, '600 18px system-ui, sans-serif', PALETTE.lamp);
}

function overScreen(g, game) {
  drawFrame(g, game, false);
  g.fillStyle = 'rgba(10,15,28,0.78)';
  g.fillRect(0, VIEW.height / 2 - 110, VIEW.width, 220);
  centered(g, 'The tide came in…', VIEW.height / 2 - 40, '800 44px system-ui, sans-serif', PALETTE.bad);
  centered(g, `You found ${game.found.length} of ${game.scene.diffs.length} on ${levelDefinition(game).name}`, VIEW.height / 2 + 6, '400 20px system-ui, sans-serif', PALETTE.text);
  centered(g, 'Click to try the harbor again', VIEW.height / 2 + 52, '600 18px system-ui, sans-serif', PALETTE.text);
}

/** Both scene panels, their frames, HUD, markers and hint glow — the play view. */
export function drawFrame(g, game, hint) {
  g.fillStyle = PALETTE.night;
  g.fillRect(0, 0, VIEW.width, VIEW.height);
  const shake = game.shake > 0 ? Math.sin(game.shake * 60) * 6 : 0;
  g.save();
  g.translate(shake, 0);
  for (const side of [0, 1]) {
    const r = panelRect(side);
    g.save();
    g.translate(r.x, r.y);
    drawScene(g, game.scene, side === 1);
    g.restore();
    roundFrame(g, r);
  }
  hudBar(g, game);
  markers(g, game);
  if (hint) {
    hintGlow(g, game, 0);
    hintGlow(g, game, 1);
  }
  g.restore();
}

/** Paint the current screen onto the canvas context. */
export function render(g, game) {
  if (game.screen === SCREEN_TITLE) return titleScreen(g);
  if (game.screen === SCREEN_PLAY) return drawFrame(g, game, true);
  if (game.screen === SCREEN_CLEAR) return clearScreen(g, game);
  if (game.screen === SCREEN_OVER) return overScreen(g, game);
}

/** Map a page click into scene-local coordinates for a side, or null when outside a panel. */
export function toScene(game, side, px, py) {
  const r = panelRect(side);
  const size = sceneSize();
  if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return null;
  return { x: px - r.x, y: py - r.y, size };
}
