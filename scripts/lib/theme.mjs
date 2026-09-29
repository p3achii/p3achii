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

// Small peach for otters to hold.
export function tinyPeach() {
  const p = new Pixels(9, 9);
  peachAt(p, 4.5, 5, 3.3);
  p.dots(T.foam, [3, 4]);
  p.dots(P.brown, [4, 1]);
  p.dots(P.teal, [5, 0], [6, 0], [5, 1]);
  return p.outline(P.dark);
}

// ---------------------------------------------------------------------------
// Sea otter floating on its back, hugging a peach (head on the right).
export function otterFloat() {
  const p = new Pixels(34, 16);
  const o = 1; // outline margin
  p.ellipse(o + 3.4, 11.4, 3.4, 1.5, T.fur); // tail
  p.ellipse(o + 6.2, 5.8, 1.7, 2.3, T.fur); // back feet up in the air
  p.ellipse(o + 9.4, 5.2, 1.7, 2.5, T.fur);
  p.dots(T.furDark, [o + 6, 4], [o + 9, 3], [o + 9, 4]);
  p.ellipse(o + 14, 10, 9.6, 3.9, T.fur); // body
  p.ellipse(o + 14.6, 8.6, 7.6, 2.4, T.latte); // belly
  p.ellipse(o + 25.6, 7.6, 5.3, 4.9, T.fur); // head
  p.ellipse(o + 26.8, 8.5, 3.8, 3.4, T.face); // pale face
  p.ellipse(o + 22.3, 3.9, 1.4, 1.3, T.fur); // ear
  p.dots(T.ink, [o + 25, 7], [o + 25, 8], [o + 28, 7], [o + 28, 8]); // eyes
  p.dots(T.ink, [o + 26, 9], [o + 27, 9]); // nose
  p.dots(T.furDark, [o + 26, 10], [o + 27, 10]);
  p.dots(T.blush, [o + 24, 9], [o + 29, 9]);
  // peach held on the belly, one paw each side
  peachAt(p, o + 17.6, 4.9, 2.5);
  p.dots(T.foam, [o + 16, 4]);
  p.dots(P.brown, [o + 17, 2]);
  p.dots(P.teal, [o + 18, 1], [o + 19, 1], [o + 18, 2]);
  p.ellipse(o + 14.6, 6.4, 1.3, 1.1, T.fur);
  p.ellipse(o + 20.6, 6.4, 1.3, 1.1, T.fur);
  return p.outline(P.dark);
}

export function otterFloatBlink() {
  const o = 1;
  const p = new Pixels(34, 16);
  p.dots(T.face, [o + 25, 7], [o + 28, 7]);
  p.dots(T.ink, [o + 24, 8], [o + 25, 8], [o + 28, 8], [o + 29, 8]);
  return p;
}

// ---------------------------------------------------------------------------
// Rakko-style sea otter sitting up, holding a peach.
export function otterSit() {
  const p = new Pixels(26, 28);
  p.ellipse(20.2, 23.6, 3.4, 1.5, T.fur); // tail
  p.ellipse(3.9, 9.6, 1.4, 1.4, T.fur); // little side ears
  p.ellipse(21.1, 9.6, 1.4, 1.4, T.fur);
  p.ellipse(12.5, 20.4, 7, 5.6, T.fur); // body
  p.ellipse(12.5, 21, 4.6, 4, T.latte); // belly
  p.ellipse(12.5, 10.6, 9, 7, T.fur); // head
  p.ellipse(12.5, 11.8, 6.8, 5.2, T.face); // pale face
  p.ellipse(12.5, 13.6, 3.4, 2.2, T.foam); // muzzle
  p.dots(T.ink, [8, 10], [8, 11], [9, 10], [9, 11], [16, 10], [16, 11], [17, 10], [17, 11]); // eyes
  p.dots(T.foam, [8, 10], [16, 10]);
  p.dots(T.ink, [12, 12], [13, 12], [12, 13], [13, 13]); // nose
  p.dots(T.furDark, [11, 14], [14, 14]); // mouth
  p.dots(T.sandDeep, [10, 13], [15, 13]); // whisker dots
  p.dots(T.blush, [6, 13], [7, 13], [18, 13], [19, 13]);
  // peach hugged at the chest
  peachAt(p, 12.5, 20.4, 2.7);
  p.dots(T.foam, [11, 19]);
  p.dots(P.brown, [12, 17]);
  p.dots(P.teal, [13, 16], [14, 16], [13, 17]);
  p.ellipse(9.1, 20.6, 1.5, 1.3, T.fur); // paws
  p.ellipse(15.9, 20.6, 1.5, 1.3, T.fur);
  p.ellipse(9.6, 25.6, 2.2, 1.2, T.furDark); // feet
  p.ellipse(15.4, 25.6, 2.2, 1.2, T.furDark);
  return p.outline(P.dark);
}

export function otterSitBlink() {
  const p = new Pixels(26, 28);
  p.dots(T.face, [8, 10], [9, 10], [16, 10], [17, 10]);
  p.dots(T.ink, [8, 11], [9, 11], [16, 11], [17, 11]);
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
