// Central tuning table for Lumen Twins: panel geometry, palette, level design and marker feel.
// Every other module reads its numbers from here so difficulty changes stay in one place.

export const VIEW = { width: 1280, height: 720 };

// Two scene panels side by side with a gutter between them, under a HUD bar and above a hint bar.
export const PANEL = { size: 540, gap: 24, left: 40, top: 130 };
export const HUD = { height: 96 };

export const PALETTE = {
  night: '#101828',
  panelSky: '#1c2a44',
  panelSkyAlt: '#22335a',
  ink: '#0a0f1c',
  star: '#f4d58d',
  moon: '#f2e9c9',
  lamp: '#ffbf5e',
  lampAlt: '#e8a13c',
  water: '#1d3a5f',
  waterAlt: '#17304f',
  hull: '#7a4a2b',
  sail: '#d8cfc0',
  good: '#59d97a',
  bad: '#e5484d',
  hint: '#59c1d9',
  text: '#e8ecf4',
  dim: '#8b93a7',
};

export const MARK = {
  radius: 26,
  tolerance: 30,
  ringMs: 900,
};

export const LEVELS = [
  { seed: 20261121, differences: 6, seconds: 100, name: 'Old Harbor' },
  { seed: 77412, differences: 8, seconds: 110, name: 'Lantern Hill' },
  { seed: 90210, differences: 10, seconds: 120, name: 'Moon Ferry' },
];

// A wrong click costs seconds, and an idle stretch unlocks a free hint pulse.
export const RULES = { wrongPenalty: 6, idleHintAfter: 12 };

export const KIND_STAR = 'star';
export const KIND_LAMP = 'lamp';
export const KIND_BOAT = 'boat';
export const KIND_WINDOW = 'window';
export const KIND_BIRD = 'bird';
