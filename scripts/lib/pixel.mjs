// Tiny pixel-art toolkit: paint sprites on a grid, then emit crisp SVG paths.

export class Pixels {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.grid = Array.from({ length: h }, () => Array(w).fill(null));
  }

  set(x, y, c) {
    if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.grid[y][x] = c;
    return this;
  }

  get(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h ? this.grid[y][x] : null;
  }

  // Fill every pixel whose centre sits inside the ellipse.
  ellipse(cx, cy, rx, ry, c) {
    return this.each((x, y) => inEllipse(x, y, cx, cy, rx, ry) && this.set(x, y, c));
  }

  // Shade the part of an ellipse NOT covered by the same ellipse nudged by (dx, dy).
  crescent(cx, cy, rx, ry, dx, dy, c) {
    return this.each((x, y) =>
      inEllipse(x, y, cx, cy, rx, ry) && !inEllipse(x, y, cx + dx, cy + dy, rx, ry) && this.set(x, y, c));
  }

  rect(x, y, w, h, c) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.set(i, j, c);
    return this;
  }

  dots(c, ...pts) {
    for (const [x, y] of pts) this.set(x, y, c);
    return this;
  }

  // Stamp ASCII art: each character is looked up in `key`, unknown characters are skipped.
  stamp(x0, y0, rows, key) {
    rows.forEach((row, j) => [...row].forEach((ch, i) => key[ch] && this.set(x0 + i, y0 + j, key[ch])));
    return this;
  }

  // Recolour pixels of one colour to another (handy for shading passes).
  recolor(from, to, test = () => true) {
    return this.each((x, y) => this.grid[y][x] === from && test(x, y) && this.set(x, y, to));
  }

  // Wrap the silhouette in a 1px outline.
  outline(c) {
    const edge = [];
    this.each((x, y) => {
      if (this.grid[y][x]) return;
      const touches = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
        const v = this.get(x + dx, y + dy);
        return v && v !== c;
      });
      if (touches) edge.push([x, y]);
    });
    for (const [x, y] of edge) this.grid[y][x] = c;
    return this;
  }

  each(fn) {
    for (let y = 0; y < this.h; y++) for (let x = 0; x < this.w; x++) fn(x, y);
    return this;
  }

  clone() {
    const p = new Pixels(this.w, this.h);
    p.grid = this.grid.map((row) => row.slice());
    return p;
  }

  // One <path> per colour, built from horizontal runs.
  toPaths() {
    const runs = new Map();
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; ) {
        const c = this.grid[y][x];
        if (!c) { x++; continue; }
        let n = 1;
        while (x + n < this.w && this.grid[y][x + n] === c) n++;
        runs.set(c, (runs.get(c) ?? '') + `M${x} ${y}h${n}v1h-${n}z`);
        x += n;
      }
    }
    return [...runs].map(([fill, d]) => `<path fill="${fill}" d="${d}"/>`).join('');
  }

  // Place the sprite at (x, y), each pixel `s` units wide.
  svg(x = 0, y = 0, s = 1, attrs = '') {
    return `<g transform="translate(${x} ${y}) scale(${s})" shape-rendering="crispEdges"${attrs ? ' ' + attrs : ''}>${this.toPaths()}</g>`;
  }
}

function inEllipse(x, y, cx, cy, rx, ry) {
  const dx = (x + 0.5 - cx) / rx;
  const dy = (y + 0.5 - cy) / ry;
  return dx * dx + dy * dy <= 1;
}

// ---------------------------------------------------------------------------
// Pixel font (5x7 caps + a few title glyphs). Proportional: each glyph has its own width.

const GLYPHS = {
  A: '01110 10001 10001 11111 10001 10001 10001',
  B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01110 10001 10000 10000 10000 10001 01110',
  D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111',
  F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01110 10001 10000 10111 10001 10001 01111',
  H: '10001 10001 10001 11111 10001 10001 10001',
  I: '111 010 010 010 010 010 111',
  J: '00111 00010 00010 00010 00010 10010 01100',
  K: '10001 10010 10100 11000 10100 10010 10001',
  L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001',
  N: '10001 10001 11001 10101 10011 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110',
  P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101',
  R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110',
  T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110',
  V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010',
  X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 10001 01010 00100 00100 00100',
  Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110',
  1: '010 110 010 010 010 010 111',
  2: '01110 10001 00001 00010 00100 01000 11111',
  3: '01110 10001 00001 00110 00001 10001 01110',
  4: '00010 00110 01010 10010 11111 00010 00010',
  5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110',
  7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110',
  9: '01110 10001 10001 01111 00001 00010 01100',
  '!': '1 1 1 1 1 0 1',
  '.': '0 0 0 0 0 0 1',
  ',': '00 00 00 00 00 01 10',
  ':': '0 1 0 0 0 1 0',
  "'": '1 1 0 0 0 0 0',
  '-': '0000 0000 0000 1111 0000 0000 0000',
  '+': '00000 00100 00100 11111 00100 00100 00000',
  '/': '00001 00010 00010 00100 01000 01000 10000',
  '*': '00100 00100 01110 11111 01110 00100 00100',
  '~': '00000 00000 01000 10101 00010 00000 00000',
  '<': '0001 0010 0100 1000 0100 0010 0001',
  '>': '1000 0100 0010 0001 0010 0100 1000',
  '#': '01010 11111 01010 01010 11111 01010 00000',
  '♥': '00000 01010 11111 11111 01110 00100 00000',
  '♪': '00110 00101 00101 00100 01100 11100 01000',
  // lowercase, drawn on a 9-row box (rows 7-8 are descenders)
  a: '00000 00000 01110 00001 01111 10001 01111 00000 00000',
  c: '00000 00000 01111 10000 10000 10000 01111 00000 00000',
  h: '10000 10000 10110 11001 10001 10001 10001 00000 00000',
  i: '010 000 110 010 010 010 111 000 000',
  p: '00000 00000 11110 10001 10001 10001 11110 10000 10000',
};

function glyph(ch) {
  const src = GLYPHS[ch] ?? GLYPHS[ch.toUpperCase()];
  if (src === undefined) throw new Error(`pixel font has no glyph for ${JSON.stringify(ch)}`);
  return src.split(' ').map((row) => [...row].map((b) => b === '1'));
}

// Returns { d, width } in font units (1 unit = 1 pixel of the font).
// `bold` smears each glyph one column to the right for a chunkier title look.
export function pixelText(text, { bold = false, tracking = 1 } = {}) {
  let x = 0;
  let d = '';
  for (const ch of text) {
    if (ch === ' ') { x += 3 + tracking; continue; }
    let rows = glyph(ch);
    if (bold) rows = rows.map((r) => [...r, false].map((on, i) => on || (i > 0 && r[i - 1])));
    const w = rows[0].length;
    rows.forEach((row, y) => {
      for (let i = 0; i < w; ) {
        if (!row[i]) { i++; continue; }
        let n = 1;
        while (i + n < w && row[i + n]) n++;
        d += `M${x + i} ${y}h${n}v1h-${n}z`;
        i += n;
      }
    });
    x += w + tracking;
  }
  return { d, width: Math.max(0, x - tracking) };
}

// Pixel text as an SVG path. `size` is the height of one font pixel.
export function pixelLabel(text, { x = 0, y = 0, size = 3, fill, bold = false, anchor = 'start', attrs = '' } = {}) {
  const { d, width } = pixelText(text, { bold });
  const w = width * size;
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  return {
    width: w,
    svg: `<path transform="translate(${round(left)} ${round(y)}) scale(${size})" shape-rendering="crispEdges" fill="${fill}" d="${d}"${attrs ? ' ' + attrs : ''}/>`,
  };
}

export const round = (n) => Math.round(n * 100) / 100;
