// SVG building blocks shared by build-assets.mjs and contributions.mjs.
import { Pixels, pixelLabel, round } from './pixel.mjs';
import { FONT_MONO, P, T } from './theme.mjs';

export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function doc(w, h, { title, desc, style = '', defs = '', body }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<style>
.mono { font-family: ${FONT_MONO}; }
${style}
@media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
</style>
<defs>${defs}</defs>
${body}
</svg>
`;
}

export const DOTS = `<pattern id="dots" width="18" height="18" patternUnits="userSpaceOnUse"><rect x="8" y="8" width="2" height="2" fill="${T.sandDeep}" opacity=".6"/></pattern>`;

// Cream sketchbook panel with a hard brown drop shadow.
export function panel(x, y, w, h, { fill = P.cream, r = 18, dots = true } = {}) {
  return `<rect x="${x + 7}" y="${y + 7}" width="${w}" height="${h}" rx="${r}" fill="${P.brown}"/>
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"/>
${dots ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#dots)"/>` : ''}
<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${P.dark}" stroke-width="3"/>`;
}

// Title tab that sits on a panel's top border.
export function tab(x, y, text, { fill = P.teal, color = P.cream, size = 3 } = {}) {
  const pad = 14;
  const label = pixelLabel(text, { x: x + pad, y: y + 9, size, fill: color });
  const w = label.width + pad * 2;
  const h = 7 * size + 18;
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${fill}" stroke="${P.dark}" stroke-width="3"/>${label.svg}`;
}

export function sparkle(color) {
  return new Pixels(7, 7).stamp(0, 0, ['...#...', '...#...', '..###..', '#######', '..###..', '...#...', '...#...'], { '#': color });
}

export function heart(color = T.peach) {
  return new Pixels(7, 6).stamp(0, 0, ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'], { '#': color });
}

export function cloud() {
  const p = new Pixels(32, 13);
  p.ellipse(10, 8, 6.5, 4.2, T.foam);
  p.ellipse(18, 6, 7.4, 5.2, T.foam);
  p.ellipse(25, 8.6, 5.4, 3.6, T.foam);
  p.rect(5, 9, 23, 3, T.foam);
  p.recolor(T.foam, '#F3E6DC', (x, y) => y >= 10);
  return p.outline('#DCC6B5');
}

// Smooth sine-ish wave band: crest at base-amp, trough at base+amp.
export function wave(base, amp, len, { width = 900, bottom = 320, open = false } = {}) {
  const from = -len;
  const to = width + len * 2;
  let d = `M${from} ${base}`;
  for (let x = from; x < to; x += len) d += ` Q${x + len / 4} ${base - amp} ${x + len / 2} ${base} T${x + len} ${base}`;
  return open ? d : `${d} L${to} ${bottom} L${from} ${bottom} Z`;
}

export const drift = (len, dur, dir = -1) =>
  `<animateTransform attributeName="transform" type="translate" from="0 0" to="${dir * len} 0" dur="${dur}s" repeatCount="indefinite"/>`;

// Discrete SMIL helper: cycle through `values`, spending an equal slice on each.
export function cycle(attr, values, dur, { type } = {}) {
  const kt = values.map((_, i) => round(i / values.length)).join(';');
  const tag = type ? 'animateTransform' : 'animate';
  return `<${tag} attributeName="${attr}"${type ? ` type="${type}"` : ''} values="${values.join(';')}" keyTimes="${kt}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`;
}
