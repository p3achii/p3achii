// The seaside title banner, dressed for the season.
import { Pixels, pixelLabel, pixelText, round } from './pixel.mjs';
import { DOTS, cloud, doc, drift, esc, sparkle, wave } from './svg.mjs';
import { P, T, tinyPeach, wooper, wooperBlink } from './theme.mjs';

// ---------------------------------------------------------------------------
// seasonal dressing

const petal = () => new Pixels(3, 3).stamp(0, 0, ['.pP', 'pPP', 'Pp.'], { P: '#F7C3CD', p: '#EC9FB1' });
const leaf = (c) => new Pixels(5, 5).stamp(0, 0, ['..L..', 'LLLLL', '.LLL.', 'LL.LL', '..s..'], { L: c, s: P.dark });
const flake = () => new Pixels(3, 3).stamp(0, 0, ['.b.', 'bWb', '.b.'], { W: '#FFFFFF', b: '#C4DAE6' });
const gull = (up) => new Pixels(7, 3).stamp(0, 0, up ? ['S.....S', '.S...S.', '..SSS..'] : ['.......', 'SSS.SSS', '...S...'], { S: P.dark });

function orb(colors) {
  const [outer, inner, shine] = colors;
  return new Pixels(28, 28).ellipse(14, 14, 13.6, 13.6, outer).ellipse(14, 14, 10.5, 10.5, inner).ellipse(11.5, 10.5, 4, 3.4, shine);
}

function moon() {
  return new Pixels(28, 28)
    .ellipse(14, 14, 13.6, 13.6, '#FBF5EC').crescent(14, 14, 13.6, 13.6, -2, -2, '#EDE3D6')
    .ellipse(9, 9, 2.4, 2.2, '#E8DCCD').ellipse(18, 17, 3.2, 2.8, '#E8DCCD').ellipse(10, 20, 1.6, 1.5, '#E8DCCD');
}

const SEASONS = {
  spring: {
    label: 'SPRING', badge: '#E38FA2', sky: ['#FCF4F2', '#F8DDDF'], ring: '#F1A7B4',
    orb: orb(['#F6BCC3', '#F9CCD1', '#FBDDE0']), particle: petal, count: 22, fall: [9, 15], sway: 16, drift: -90,
  },
  summer: {
    label: 'SUMMER', badge: P.blue, sky: ['#E3F0F6', '#FBEEE2'], ring: '#F4B07C',
    orb: orb(['#F8BE88', '#FAD0A3', '#FCE2C2']), particle: null, count: 0,
  },
  autumn: {
    label: 'AUTUMN', badge: T.peachShade, sky: [T.paper, '#F6DFCF'], ring: T.peach,
    orb: orb(['#F7BDA2', '#F9CDB5', '#FBDDCB']), particle: 'leaves', count: 14, fall: [10, 16], sway: 22, drift: -70,
  },
  winter: {
    label: 'WINTER', badge: P.teal, sky: ['#E1EAF0', '#F4EEEA'], ring: '#C4DAE6',
    orb: moon(), particle: flake, count: 30, fall: [11, 19], sway: 10, drift: -20, stars: true,
  },
};

// small deterministic PRNG so a season always looks the same
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function particles(season, W) {
  const s = SEASONS[season];
  const random = rng(season);
  const leafColors = [T.peachShade, P.brown, T.latte, '#D0794F'];
  let out = '';
  for (let i = 0; i < s.count; i++) {
    const sprite = s.particle === 'leaves' ? leaf(leafColors[i % leafColors.length]) : s.particle();
    const dur = round(s.fall[0] + random() * (s.fall[1] - s.fall[0]));
    const swayDur = round(1.6 + random() * 1.6);
    out += `<g class="fall" style="animation-duration:${dur}s;animation-delay:${round(-random() * dur)}s"><g class="sway" style="animation-duration:${swayDur}s;animation-delay:${round(-random() * swayDur)}s">${sprite.svg(round(20 + random() * (W + 60)), 0, 3)}</g></g>`;
  }
  return out;
}

function gulls() {
  return [[70, 38, -4], [96, 34, -19], [58, 29, -12]].map(([y, dur, delay], i) =>
    `<g class="fly" style="animation-duration:${dur}s;animation-delay:${delay}s"><g transform="translate(0 ${y})">
      <g class="flapA" style="animation-delay:${-i * 0.2}s">${gull(true).svg(0, 0, 3)}</g>
      <g class="flapB" style="animation-delay:${-i * 0.2}s">${gull(false).svg(0, 0, 3)}</g></g></g>`).join('');
}

// ---------------------------------------------------------------------------
// Typewriter effect. Every character is its own <text>, centred in a fixed-width cell and
// switched on/off with a discrete SMIL opacity animation — no clip paths, which iOS Safari
// doesn't animate inside SVG images (it showed every line at once).
function typewriter(lines, { x, y, size, color, cursor }) {
  const cw = size * 0.6;
  const typeDt = 0.075;
  const eraseDt = 0.03;
  const hold = 2;
  const gap = 0.45;
  let t = 0;
  const segs = lines.map((line) => {
    const chars = [...line];
    const seg = { chars, n: chars.length, start: t };
    t += seg.n * typeDt + hold + seg.n * eraseDt + gap;
    return seg;
  });
  const dur = round(t);
  const kt = (sec) => (sec / t).toFixed(5);
  const cursorEvents = [[0, 0]];
  let glyphs = '';
  for (const s of segs) {
    const eraseAt = s.start + s.n * typeDt + hold;
    for (let k = 1; k <= s.n; k++) cursorEvents.push([s.start + k * typeDt, k]);
    for (let k = 1; k <= s.n; k++) cursorEvents.push([eraseAt + k * eraseDt, s.n - k]);
    s.chars.forEach((ch, k) => {
      if (ch === ' ') return;
      const on = s.start + (k + 1) * typeDt;
      const off = eraseAt + (s.n - k) * eraseDt; // erased from the end of the line
      glyphs += `<text x="${round(x + (k + 0.5) * cw)}" y="${y}" opacity="0"><animate attributeName="opacity" values="0;1;0" keyTimes="0;${kt(on)};${kt(off)}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>${esc(ch)}</text>`;
    });
  }
  const body = `<g class="mono" font-size="${size}" fill="${color}" text-anchor="middle">${glyphs}</g>
<g>${`<animateTransform attributeName="transform" type="translate" values="${cursorEvents.map((e) => `${round(e[1] * cw)} 0`).join(';')}" keyTimes="${cursorEvents.map((e) => kt(e[0])).join(';')}" dur="${dur}s" calcMode="discrete" repeatCount="indefinite"/>`}<rect class="caret" x="${x + 2}" y="${round(y - size * 0.82)}" width="${round(cw * 0.8)}" height="${size}" fill="${cursor}"/></g>`;
  return { defs: '', body };
}

// ---------------------------------------------------------------------------

export function header(profile, season = 'autumn') {
  const S = SEASONS[season];
  if (!S) throw new Error(`unknown season: ${season}`);
  const W = 900;
  const H = 300;
  const fx = 2, fy = 2, fw = 888, fh = 288;

  // wobbly pixel title, one hopping group per letter (shadow + face)
  const size = 10;
  let lx = 58;
  const ly = 40;
  let letters = '';
  [...profile.name].forEach((ch, i) => {
    const { d, width } = pixelText(ch, { bold: true });
    letters += `<g class="hop" style="animation-delay:${round(-i * 0.16)}s"><path transform="translate(${lx + 6} ${ly + 6}) scale(${size})" fill="${T.peach}" d="${d}"/><path transform="translate(${lx} ${ly}) scale(${size})" fill="${P.dark}" d="${d}"/></g>`;
    lx += (width + 1) * size;
  });

  const typing = typewriter(profile.taglines, { x: 98, y: 190, size: 22, color: P.dark, cursor: P.teal });

  const clouds = [
    { y: 34, s: 3, dur: 70, delay: -8 },
    { y: 98, s: 2, dur: 95, delay: -60 },
    { y: 58, s: 2, dur: 82, delay: -33 },
  ].map((c) => `<g class="cloud" style="animation-duration:${c.dur}s;animation-delay:${c.delay}s">${cloud().svg(0, c.y, c.s)}</g>`).join('');

  const twinkles = [
    [532, 44, P.teal, 0], [610, 96, T.peachShade, -0.8], [548, 128, P.blue, -1.6], [30, 150, P.blue, -1.1],
    ...(S.stars ? [[660, 30, P.blue, -0.4], [470, 150, P.teal, -1.9], [860, 120, P.blue, -1.3], [390, 24, T.peachShade, -2.4]] : []),
  ].map(([x, y, c, d]) => `<g class="twinkle" style="animation-delay:${d}s">${sparkle(c).svg(x, y, 3)}</g>`).join('');

  const glint = (list, fill) => list
    .map(([x, y, w], i) => `<rect class="glint" style="animation-delay:${round(-i * 0.55)}s" x="${x}" y="${y}" width="${w}" height="3" rx="1.5" fill="${fill}"/>`).join('');
  const glintsMid = glint([[712, 244, 36], [750, 250, 22], [700, 252, 16], [770, 246, 26]], T.foam);
  const glintsFront = glint([[726, 274, 30], [764, 282, 18], [704, 286, 14], ...(season === 'summer' ? [[120, 278, 26], [300, 284, 18], [460, 276, 22]] : [])], T.sky);

  const floater = `<g transform="translate(606 198)">
  <g class="bob">
    <ellipse class="ripple" cx="60" cy="60" rx="66" ry="7" fill="none" stroke="${T.foam}" stroke-width="2.5"/>
    <ellipse class="ripple" style="animation-delay:-1.4s" cx="60" cy="60" rx="66" ry="7" fill="none" stroke="${T.foam}" stroke-width="2.5"/>
    ${wooper().svg(0, 0, 4)}
    <g class="blink">${wooperBlink().svg(0, 0, 4)}</g>
  </g>
</g>`;

  const bubbles = [[150, 0], [300, -1.2], [455, -2.5], [812, -0.6], [640, -3.1]]
    .map(([x, d]) => `<rect class="bubble" style="animation-delay:${d}s" x="${x}" y="286" width="6" height="6" rx="3" fill="none" stroke="${T.foam}" stroke-width="1.6"/>`).join('');

  const badgeText = pixelLabel(S.label, { x: 0, y: 0, size: 2, fill: T.foam });
  const badgeW = badgeText.width + 26;
  const bx = fx + fw - 18 - badgeW;
  const badge = `<g transform="translate(${bx} 18)"><rect width="${badgeW}" height="28" rx="14" fill="${S.badge}" stroke="${P.dark}" stroke-width="2.5"/>
  <g transform="translate(13 7)">${badgeText.svg}</g></g>`;

  const style = `
.hop { animation: hop 2.6s ease-in-out infinite; }
@keyframes hop { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-7px); } }
.cloud { animation: cloud linear infinite; }
@keyframes cloud { from { transform: translateX(${W + 20}px); } to { transform: translateX(-110px); } }
.twinkle { animation: twinkle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twinkle { 0%, 100% { opacity: .25; transform: scale(.6); } 50% { opacity: 1; transform: scale(1); } }
.caret { animation: caret 1s steps(1) infinite; }
@keyframes caret { 50% { opacity: 0; } }
.bob { animation: bob 3.2s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 80%; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-2.5deg); } 50% { transform: translateY(6px) rotate(2.5deg); } }
.blink { opacity: 0; animation: blink 4.5s infinite; }
@keyframes blink { 0%, 90%, 96%, 100% { opacity: 0; } 91%, 95% { opacity: 1; } }
.ripple { opacity: 0; animation: ripple 2.8s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes ripple { 0% { opacity: .9; transform: scale(.55); } 100% { opacity: 0; transform: scale(1.25); } }
.glint { animation: glint 2.2s ease-in-out infinite; }
@keyframes glint { 0%, 100% { opacity: .15; } 50% { opacity: .9; } }
.bubble { opacity: 0; animation: bubble 4.2s ease-in infinite; }
@keyframes bubble { 0% { opacity: 0; transform: translateY(0); } 20% { opacity: .9; } 100% { opacity: 0; transform: translateY(-44px); } }
.sunring { animation: sunring 4s ease-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes sunring { 0% { opacity: .7; transform: scale(.9); } 100% { opacity: 0; transform: scale(1.35); } }
.fall { animation: fall linear infinite; }
@keyframes fall { from { transform: translate(0, -30px); } to { transform: translate(${S.drift ?? 0}px, ${H + 20}px); } }
.sway { animation: sway ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes sway { from { transform: translateX(-${S.sway ?? 0}px) rotate(-35deg); } to { transform: translateX(${S.sway ?? 0}px) rotate(35deg); } }
.fly { animation: fly linear infinite; }
@keyframes fly { from { transform: translateX(-40px); } to { transform: translateX(${W + 20}px); } }
.flapA { animation: flap .5s steps(1) infinite; }
.flapB { animation: flap .5s steps(1) -.25s infinite; }
@keyframes flap { 50% { opacity: 0; } }`;

  const defs = `
<clipPath id="frame"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="22"/></clipPath>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${S.sky[0]}"/><stop offset="1" stop-color="${S.sky[1]}"/></linearGradient>
${DOTS}
${typing.defs}`;

  const body = `
<rect x="${fx + 7}" y="${fy + 7}" width="${fw}" height="${fh}" rx="22" fill="${P.brown}"/>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <circle class="sunring" cx="768" cy="176" r="74" fill="none" stroke="${S.ring}" stroke-width="3"/>
  <circle class="sunring" style="animation-delay:-2s" cx="768" cy="176" r="74" fill="none" stroke="${S.ring}" stroke-width="3"/>
  ${S.orb.svg(698, 106, 5)}
  ${clouds}
  ${season === 'summer' ? gulls() : ''}
  ${twinkles}
  ${letters}
  ${tinyPeach().svg(58, 166, 3)}
  ${typing.body}
  <g>${drift(120, 9)}<path d="${wave(226, 6, 120)}" fill="${T.mist}"/></g>
  <g>${drift(160, 12, 1)}<path d="${wave(242, 7, 160)}" fill="${P.blue}"/><path d="${wave(242, 7, 160, { open: true })}" fill="none" stroke="${T.sky}" stroke-width="2.5" opacity=".7"/></g>
  ${glintsMid}
  ${floater}
  <g>${drift(190, 8)}<path d="${wave(264, 8, 190)}" fill="${P.teal}"/><path d="${wave(264, 8, 190, { open: true })}" fill="none" stroke="${T.mist}" stroke-width="3" opacity=".8"/></g>
  ${glintsFront}
  ${bubbles}
  ${S.count ? particles(season, W) : ''}
  ${badge}
</g>
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="22" fill="none" stroke="${P.dark}" stroke-width="3"/>`;

  const scenery = {
    spring: 'cherry blossom petals drifting down',
    summer: 'seagulls flying under a bright sun',
    autumn: 'autumn leaves falling past the setting sun',
    winter: 'snow falling under the moon',
  }[season];
  return doc(W, H, {
    title: `${profile.name} — drawing & game dev`,
    desc: `Animated seaside banner (${season}): the name ${profile.name} bobbing in pixel letters, Wooper floating in the waves, ${scenery}, and a typewriter cycling through: ${profile.taglines.join(' / ')}`,
    style, defs, body,
  });
}
