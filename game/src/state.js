// Game state machine: levels, the found-difference set, the countdown clock, wrong-click
// penalties and the idle hint timer. Pure state plus transitions; rendering reads it, nothing
// else mutates it.

import { LEVELS, MARK, RULES } from './config.js';
import { buildScene, differencePoint } from './scene.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CLEAR = 'clear';
export const SCREEN_OVER = 'over';

const IDLE_NONE = -1;

/** A fresh state for a run of the whole level ladder. */
export function createGame() {
  return {
    screen: SCREEN_TITLE,
    level: 0,
    totalFound: 0,
    wrongClicks: 0,
    levelStart: 0,
    clock: 0,
    lastActivity: 0,
    hintAt: IDLE_NONE,
    found: [],
    scene: null,
    shake: 0,
    pulse: [],
  };
}

/** Load a level: build its scene, reset the clock and the found set. */
export function startLevel(game, index) {
  const def = LEVELS[Math.min(index, LEVELS.length - 1)];
  game.level = index;
  game.scene = buildScene(def.seed, def.differences);
  game.found = [];
  game.clock = def.seconds;
  game.lastActivity = 0;
  game.hintAt = IDLE_NONE;
  game.screen = SCREEN_PLAY;
  game.shake = 0;
  game.pulse = [];
}

export function levelDefinition(game) {
  return LEVELS[Math.min(game.level, LEVELS.length - 1)];
}

export function remaining(game) {
  return game.scene.diffs.length - game.found.length;
}

/** A click in scene-local coordinates; returns what happened so the caller can react. */
export function clickScene(game, x, y) {
  game.lastActivity = 0;
  const hit = game.scene.diffs.findIndex((d) => {
    if (game.found.includes(d.index)) return false;
    const p = differencePoint(d);
    return Math.hypot(p.x - x, p.y - y) <= MARK.tolerance;
  });
  if (hit >= 0) {
    const diff = game.scene.diffs[hit];
    game.found.push(diff.index);
    game.totalFound += 1;
    game.pulse.push({ x: diff.x, y: diff.y, t: 0 });
    if (remaining(game) === 0) {
      game.screen = SCREEN_CLEAR;
    }
    return { kind: 'found', diff };
  }
  game.wrongClicks += 1;
  game.clock = Math.max(1, game.clock - RULES.wrongPenalty);
  game.shake = 0.5;
  return { kind: 'miss' };
}

/** Advance the clock, the idle-hint timer and the transient effects by dt seconds. */
export function tick(game, dt) {
  game.clock = Math.max(0, game.clock - dt);
  if (game.screen === SCREEN_PLAY) {
    game.lastActivity += dt;
    if (game.lastActivity >= RULES.idleHintAfter && game.hintAt === IDLE_NONE) {
      const next = game.scene.diffs.find((d) => !game.found.includes(d.index));
      if (next) game.hintAt = next.index;
    }
    if (game.clock === 0) game.screen = SCREEN_OVER;
  }
  game.shake = Math.max(0, game.shake - dt);
  for (const p of game.pulse) p.t += dt;
  game.pulse = game.pulse.filter((p) => p.t < MARK.ringMs / 1000);
}

/** Advance to the next level, or back to the title once the ladder is done. */
export function advance(game) {
  if (game.level + 1 >= LEVELS.length) {
    game.screen = SCREEN_TITLE;
    game.finished = true;
  } else {
    startLevel(game, game.level + 1);
  }
}
