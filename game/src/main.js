// Bootstrap: size the canvas to the fixed 1280x720 view, create the game state, wire input and
// run the requestAnimationFrame loop. A ?shot=<name> parameter renders one staged screenshot
// frame synchronously and stops, for deterministic captures.

import { VIEW } from './config.js';
import { SCREEN_CLEAR, SCREEN_OVER, createGame, tick } from './state.js';
import { render } from './render.js';
import { attachInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.width;
canvas.height = VIEW.height;
const g = canvas.getContext('2d');
const game = createGame();
let clearedShown = false;

attachInput(canvas, game);

const shot = new URLSearchParams(window.location.search).get('shot');
if (shot) {
  stageShot(shot, g, game);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (game.screen === SCREEN_CLEAR && !clearedShown) {
      clearedShown = true;
    } else if (game.screen !== SCREEN_CLEAR) {
      clearedShown = false;
    }
    tick(game, dt);
    render(g, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
