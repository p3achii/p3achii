// Shared palette + pixel sprites used by every generated SVG.
import { Pixels } from './pixel.mjs';

// The five brand colours.
export const P = {
  teal: '#016180',
  blue: '#4A8CB0',
  cream: '#F8EDE5',
  brown: '#8C5C47',
  dark: '#4C2C17',
};

// Tints mixed from the brand colours (plus a peach, because p3achii).
export const T = {
  paper: '#FBF4EE',
  sand: '#EBDACB',
  sandDeep: '#DCC4B1',
  foam: '#FFF9F4',
  sky: '#D3E6F0',
  mist: '#A9CDE1',
  deep: '#014A62',
  latte: '#C8997E',
  fur: '#8C5C47',
  furDark: '#6B4331',
  face: '#F3E0D0',
  peach: '#F4A48A',
  peachShade: '#DC7D68',
  blush: '#EFA193',
  ink: '#2A160A',
};

export const FONT_MONO = `ui-monospace, 'SFMono-Regular', 'Cascadia Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

const peachAt = (p, cx, cy, r) => {
  p.ellipse(cx, cy, r, r * 0.94, T.peach);
  p.crescent(cx, cy, r, r * 0.94, -1, -1, T.peachShade);
};

// ---------------------------------------------------------------------------
// Peach mascot — the "p3achii" avatar.
export function peach({ face = true } = {}) {
  const p = new Pixels(22, 22);
  p.ellipse(11, 12.4, 9.2, 8.6, T.peach);
  p.crescent(11, 12.4, 9.2, 8.6, -2, -2, T.peachShade);
  p.dots(T.peachShade, [11, 5], [11, 6], [10, 7]); // cleft
  p.dots(T.foam, [5, 9], [5, 10], [6, 8], [7, 7]); // shine
  p.dots(P.brown, [11, 3], [11, 4]); // stem
  p.stamp(12, 1, ['.TT.', 'TTTT', 'TTT.', '.T..'], { T: P.teal }); // leaf
  if (face) {
    p.dots(T.ink, [8, 12], [8, 13], [14, 12], [14, 13]); // eyes
    p.dots(T.ink, [10, 15], [11, 16], [12, 15]); // little "w" smile
    p.dots(T.blush, [6, 14], [7, 14], [15, 14], [16, 14]);
  }
  return p.outline(P.dark);
}

export function peachBlink() {
  // eyelids drawn over peach() to blink
  const p = new Pixels(22, 22);
  p.dots(T.peach, [8, 12], [14, 12]);
  p.dots(T.ink, [8, 13], [14, 13], [7, 13], [15, 13]);
  return p;
}

// Small peach icon (tagline bullet, record label).
export function tinyPeach() {
  const p = new Pixels(9, 9);
  peachAt(p, 4.5, 5, 3.3);
  p.dots(T.foam, [3, 4]);
  p.dots(P.brown, [4, 1]);
  p.dots(P.teal, [5, 0], [6, 0], [5, 1]);
  return p.outline(P.dark);
}

// ---------------------------------------------------------------------------
// Rakko (Chiikawa) fan-art: round cream fluffball with a star scar, big open eyes,
// white scarf + cape and a sword hilt over the shoulder.
const R = {
  body: '#FEF3E0',
  shade: '#F3E0C6',
  fluff: '#D9B893',
  ink: '#2B211B',
  cloth: '#FFFFFF',
  clothShade: '#E7E0D9',
  star: '#D9BE97',
  blush: '#F8C3CC',
  hilt: '#7A7370',
};

export function rakko() {
  const p = new Pixels(30, 30);
  const [cx, cy, r] = [15, 14.5, 10.8];

  // behind the body: sword hilt, ears, feet and the cape's flared edges
  p.stamp(0, 13, ['KK.....', 'KGK....', 'KGGK...', '.KGGK..', '..KGGK.'], { K: R.ink, G: R.hilt }); // sword hilt
  p.ellipse(4.3, 11.5, 1.8, 1.8, R.ink);
  p.ellipse(25.7, 11.5, 1.8, 1.8, R.ink);
  p.ellipse(11.4, 25, 1.7, 1.25, R.ink);
  p.ellipse(18.6, 25, 1.7, 1.25, R.ink);
  for (let y = 19; y <= 25; y++) {
    for (let x = 4 - Math.floor((y - 19) / 2); x <= 9; x++) {
      const c = x === 9 || y === 25 ? R.clothShade : R.cloth;
      p.set(x, y, c);
      p.set(29 - x, y, c);
    }
  }
  p.ellipse(cx, cy, r, r, R.body);
  p.crescent(cx, cy, r, r, -1.4, -1.4, R.shade);

  // scarf across the chest, a pixel wider than the body
  for (let y = 16; y <= 19; y++) {
    let xl = 0;
    while (![R.body, R.shade].includes(p.get(xl, y))) xl++;
    for (let x = xl - 1; x <= 30 - xl; x++) p.set(x, y, y === 16 || y === 19 ? R.ink : y === 18 ? R.clothShade : R.cloth);
  }
  p.ellipse(6, 21, 1.3, 1.3, R.ink); // little black arms
  p.ellipse(24, 21, 1.3, 1.3, R.ink);

  // face
  p.stamp(5, 5, ['..K..', '..S..', 'KSSSK', '..S..', '..K..'], { K: R.ink, S: R.star }); // star scar
  p.stamp(10, 10, ['WK', 'KK', 'KK'], { K: R.ink, W: R.cloth }); // open, shiny eyes
  p.stamp(18, 10, ['WK', 'KK', 'KK'], { K: R.ink, W: R.cloth });
  p.dots(R.ink, [12, 8], [17, 8]); // serious little brows
  p.rect(6, 13, 3, 2, R.blush);
  p.rect(21, 13, 3, 2, R.blush);
  p.dots(R.ink, [14, 13], [15, 13], [13, 14], [16, 14], [14, 15], [15, 15]); // nose + open mouth
  p.dots(R.blush, [14, 14], [15, 14]);

  const before = p.clone();
  p.outline(R.ink);
  // fluffy edge: every other short arc of the body's outline is drawn soft instead of dark
  p.each((x, y) => {
    if (before.get(x, y) || p.get(x, y) !== R.ink) return;
    const touchesBody = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => [R.body, R.shade].includes(p.get(x + dx, y + dy)));
    const arc = Math.floor((Math.atan2(y + 0.5 - cy, x + 0.5 - cx) + Math.PI) / (Math.PI / 12));
    if (touchesBody && arc % 2) p.set(x, y, R.fluff);
  });
  return p;
}

export function rakkoBlink() {
  const p = new Pixels(30, 30);
  p.rect(10, 10, 2, 2, R.body).rect(18, 10, 2, 2, R.body);
  p.rect(10, 12, 2, 1, R.ink).rect(18, 12, 2, 1, R.ink);
  return p;
}

// ---------------------------------------------------------------------------
// Wooper (fan-art sprite): round blue head, pink fishbone gills, paddle tail.
const W = {
  body: '#8CC3E0',
  shade: '#5F9EC4',
  shine: '#CBE5F2',
  line: '#123E55',
  gill: '#D48DBB',
  gillShade: '#AC6597',
  stripe: '#2B6A92',
  mouth: '#6E2436',
  tongue: '#EC8F99',
};

export function wooper() {
  const p = new Pixels(30, 24);
  const gill = ['G..G...', '.G..G..', 'gGGGGGG', '.G..G..', 'G..G...'];
  p.stamp(1, 5, gill, { G: W.gill, g: W.gillShade });
  p.stamp(22, 5, gill.map((r) => [...r].reverse().join('')), { G: W.gill, g: W.gillShade });
  p.ellipse(20.6, 18.6, 3.9, 2.6, W.body); // tail
  p.crescent(20.6, 18.6, 3.9, 2.6, 0, -1.2, W.shade);
  p.ellipse(12.2, 21.6, 1.9, 1.2, W.body); // feet
  p.ellipse(17.8, 21.6, 1.9, 1.2, W.body);
  p.ellipse(15, 18, 4.6, 4, W.body); // body
  p.dots(W.stripe, [13, 16], [14, 16], [15, 16], [16, 16], [13, 18], [14, 18], [15, 18], [16, 18], [14, 20], [15, 20]);
  p.ellipse(15, 9, 8.6, 7, W.body); // head
  p.crescent(15, 9, 8.6, 7, 0, -1.4, W.shade);
  p.ellipse(11.4, 5.2, 3, 1.4, W.shine);
  p.dots(W.line, [11, 8], [12, 8], [11, 9], [12, 9], [17, 8], [18, 8], [17, 9], [18, 9]); // eyes
  p.dots(T.foam, [11, 8], [17, 8]);
  p.dots(W.mouth, [14, 11], [15, 11]); // little open mouth
  p.dots(W.tongue, [14, 12], [15, 12]);
  return p.outline(W.line);
}

export function wooperBlink() {
  const p = new Pixels(30, 24);
  p.dots(W.body, [11, 8], [12, 8], [17, 8], [18, 8]);
  p.dots(W.line, [11, 9], [12, 9], [17, 9], [18, 9]);
  return p;
}

// ---------------------------------------------------------------------------
// Inventory icons (16x16).
export function iconPalette() {
  const p = new Pixels(16, 16);
  p.ellipse(8, 8.4, 7, 6, T.sand);
  p.crescent(8, 8.4, 7, 6, -1, -1, T.sandDeep);
  p.ellipse(10.6, 11.6, 1.6, 1.4, null); // thumb hole
  p.dots(P.teal, [4, 6], [5, 6], [4, 7], [5, 7]);
  p.dots(P.blue, [7, 4], [8, 4], [7, 5], [8, 5]);
  p.dots(T.peach, [11, 5], [12, 5], [11, 6], [12, 6]);
  p.dots(P.brown, [4, 10], [5, 10], [4, 11], [5, 11]);
  return p.outline(P.dark);
}

export function iconCube() {
  const p = new Pixels(16, 16);
  p.stamp(1, 1, [
    '......##......',
    '....##TT##....',
    '..##TTTTTT##..',
    '##TTTTTTTTTT##',
    '#BB##TTTT##DD#',
    '#BBBB####DDDD#',
    '#BBBBBB#DDDDD#',
    '#BBBBBB#DDDDD#',
    '#BBBBBB#DDDDD#',
    '#BBBBBB#DDDDD#',
    '.##BBBB#DDD##.',
    '...##BB#D##...',
    '.....###......',
  ], { '#': P.dark, T: T.mist, B: P.blue, D: P.teal });
  return p;
}

export function iconLive2D() {
  // a face on a deformation mesh
  const p = new Pixels(16, 16);
  p.ellipse(8, 8.5, 6.6, 6.4, T.face);
  p.outline(P.dark);
  for (let i = 3; i <= 13; i += 3) p.each((x, y) => (x === i || y === i + 1) && p.get(x, y) === T.face && p.set(x, y, T.mist));
  p.dots(T.ink, [5, 8], [5, 9], [10, 8], [10, 9]);
  p.dots(T.blush, [4, 11], [11, 11]);
  p.dots(P.teal, [1, 1], [14, 1], [1, 14], [14, 14], [8, 0]); // rig pins
  return p;
}

export function iconCake() {
  const p = new Pixels(12, 12);
  p.stamp(0, 0, [
    '.....F......',
    '.....Y......',
    '....#K#.....',
    '.##########.',
    '#CCCCCCCCCC#',
    '#PCPPCPPCPP#',
    '#PPPPPPPPPP#',
    '#BBBBBBBBBB#',
    '#CCCCCCCCCC#',
    '#BBBBBBBBBB#',
    '.##########.',
  ], { F: T.peach, Y: '#F6D28B', K: P.blue, '#': P.dark, C: T.foam, P: T.peach, B: P.brown });
  return p;
}
