// Input: pointer clicks translated into game actions — begin, find, miss, next level, retry —
// with the sounds each outcome deserves. Keyboard gets Space as the menu confirm key.

import { SCREEN_CLEAR, SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE, advance, clickScene, startLevel } from './state.js';
import { toScene } from './render.js';
import { playClear, playFind, playMiss, playOver } from './audio.js';

/** Wire one canvas to one game state; returns nothing, handlers live on the element. */
export function attachInput(canvas, game) {
  function act(px, py) {
    if (game.screen === SCREEN_TITLE) {
      startLevel(game, 0);
      return;
    }
    if (game.screen === SCREEN_CLEAR) {
      playClear();
      advance(game);
      return;
    }
    if (game.screen === SCREEN_OVER) {
      playOver();
      startLevel(game, game.level);
      return;
    }
    for (const side of [0, 1]) {
      const p = toScene(game, side, px, py);
      if (!p) continue;
      const result = clickScene(game, p.x, p.y);
      if (result.kind === 'found') {
        if (game.screen === SCREEN_CLEAR) playClear();
        else playFind();
      } else {
        playMiss();
      }
      return;
    }
  }

  canvas.addEventListener('pointerdown', (event) => {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    act((event.clientX - rect.left) * scale, (event.clientY - rect.top) * scale);
  });

  canvas.addEventListener('keydown', (event) => {
    if (event.code !== 'Space') return;
    event.preventDefault();
    if (game.screen === SCREEN_TITLE) startLevel(game, 0);
    else if (game.screen === SCREEN_CLEAR) advance(game);
    else if (game.screen === SCREEN_OVER) startLevel(game, game.level);
  });
}
