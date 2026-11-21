# lumen-twins

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/agay12/lumen-twins/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/agay12/lumen-twins/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Lumen Twins** — an original spot-the-difference game set across three hand-drawn night
harbors (Old Harbor, Lantern Hill, Moon Ferry). Two near-identical canvases sit side by side;
every difference between them was placed by a seeded scene builder, so no two harbors hunt the
same. Click a difference on *either* picture to mark both; a wrong click costs 6 seconds of
tide clock. The HUD counts what is left, an idle hint ring pulses after 12 quiet seconds, and
WebAudio chimes score every find.

## Play it

```sh
node serve.ts          # serves game/ on http://localhost:8080
```

Open the URL in desktop Chrome — the game is plain static files, no network request, no build.

## How it is put together

| File | Job |
| --- | --- |
| `game/src/config.js` | every tunable: panel geometry, palette, level table, marker feel |
| `game/src/rng.js` | seeded mulberry32 source, so scenes are deterministic |
| `game/src/scene.js` | the item-list scene painter; each difference renders its variant on one panel |
| `game/src/state.js` | pure game state: levels, found set, clock, penalties, hint timer |
| `game/src/render.js` | HUD, markers, pulse rings, hint glow, title/clear/over screens |
| `game/src/input.js` | pointer + keyboard wiring |
| `game/src/audio.js` | oscillator blips (find, miss, clear, time-up) |
| `game/src/shots.js` | staged screenshot frames behind `?shot=` |
| `game/src/main.js` | bootstrap and the animation loop |

`?shot=start|play|clear` renders one staged frame synchronously for deterministic captures.

---

<sub>Entered on [make.fun](https://make.fun/?ref=jtd7n6hg&utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
