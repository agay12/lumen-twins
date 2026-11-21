// Screenshot staging behind ?shot=start|play|clear: each named shot drives the real state
// machine to a moment a real player sees — the title, a mid-hunt frame on the second harbor
// with three finds marked and a hint glowing, and a cleared level — so every screenshot is a
// genuine render of the game's own code, and the same shot always draws the same frame.

import { SCREEN_CLEAR, SCREEN_PLAY, SCREEN_TITLE, startLevel } from './state.js';
import { drawFrame, render } from './render.js';

/** Stage `game` for the named shot and paint it; returns the screen that was drawn. */
export function stageShot(name, g, game) {
  if (name === 'play') {
    startLevel(game, 1);
    const foundIds = game.scene.diffs.slice(0, 3).map((d) => d.index);
    game.found.push(...foundIds);
    game.totalFound = 3 + game.level * 6;
    game.clock = 47.4;
    game.hintAt = game.scene.diffs[4].index;
    game.pulse = [{ x: game.scene.diffs[2].x, y: game.scene.diffs[2].y, t: 0.12 }];
    game.screen = SCREEN_PLAY;
    drawFrame(g, game, true);
    return SCREEN_PLAY;
  }
  if (name === 'clear') {
    startLevel(game, 0);
    for (const d of game.scene.diffs) game.found.push(d.index);
    game.totalFound = game.scene.diffs.length;
    game.wrongClicks = 1;
    game.clock = 41.2;
    game.screen = SCREEN_CLEAR;
    render(g, game);
    return SCREEN_CLEAR;
  }
  game.screen = SCREEN_TITLE;
  render(g, game);
  return SCREEN_TITLE;
}
