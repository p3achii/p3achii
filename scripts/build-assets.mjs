// Builds the static animated SVG cards in assets/.
// Edit PROFILE below, then run:  node scripts/build-assets.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { Pixels, pixelLabel, pixelText, round } from './lib/pixel.mjs';
import { DOTS, cloud, cycle, doc, drift, esc, heart, panel, sparkle, tab, wave } from './lib/svg.mjs';
import {
  P, T,
  iconCake, iconCube, iconLive2D, iconPalette,
  peach, peachBlink, rakko, rakkoBlink, tinyPeach, wooper, wooperBlink,
} from './lib/theme.mjs';

const PROFILE = {
  name: 'p3achii',
  statusName: 'tao_p3ach', // name plate on the status card
  taglines: [
    "hi, i'm p3achii ~",
    'i draw & make games',
    'unity (mostly 3d) · c / c#',
    'currently: live2d rigging',
    'drawing for game dev ✦',
  ],
  status: [
    ['CLASS', 'artist ✦ game developer'],
    ['ENGINE', 'unity · mostly 3d'],
    ['MAIN', 'c / c#'],
    ['QUEST', 'live2d rigging & drawing for game dev'],
  ],
  birthday: '3 JUNE',
  inventory: [
    ['palette', 'drawing'],
    ['cube', 'unity · 3d'],
    ['C#', 'c#'],
    ['C', 'c'],
    ['live2d', 'live2d rigging'],
  ],
  party: [
    { sprite: 'wooper', name: 'WOOPER', tag: 'No.194', about: 'fav pokémon', chips: [['WATER', P.blue], ['GROUND', P.brown]] },
    { sprite: 'rakko', name: 'RAKKO', tag: '🦦', about: 'fav chiikawa character', chips: [['SEA OTTER', P.teal], ['CHIIKAWA', T.peachShade]] },
  ],
  playlist: ['Landokmai', 'dept', 'Tattoo Colour', 'Laufey'],
};

const OUT = new URL('../assets/', import.meta.url);

// Typewriter effect that works with any monospace fallback: every line is forced to an exact
// width with textLength, then revealed one character cell at a time by an animated clip rect.
function typewriter(lines, { x, y, size, color, cursor }) {
  const cw = size * 0.6;
  const typeDt = 0.075;
  const eraseDt = 0.03;
  const hold = 2;
  const gap = 0.45;
  let t = 0;
  const segs = lines.map((line) => {
    const n = [...line].length;
    const seg = { line, n, start: t };
    t += n * typeDt + hold + n * eraseDt + gap;
    return seg;
  });
  const dur = t;
  const kt = (sec) => (sec / dur).toFixed(5);
  const cursorEvents = [[0, 0]];
  let defs = '';
  let body = '';
  segs.forEach((s, i) => {
    const events = [[0, 0]];
    for (let k = 1; k <= s.n; k++) events.push([s.start + k * typeDt, k * cw]);
    const eraseAt = s.start + s.n * typeDt + hold;
    for (let k = 1; k <= s.n; k++) events.push([eraseAt + k * eraseDt, (s.n - k) * cw]);
    cursorEvents.push(...events.slice(1));
    defs += `<clipPath id="type${i}"><rect x="${x}" y="${y - size}" width="0" height="${size * 1.6}"><animate attributeName="width" values="${events.map((e) => round(e[1])).join(';')}" keyTimes="${events.map((e) => kt(e[0])).join(';')}" dur="${round(dur)}s" calcMode="discrete" repeatCount="indefinite"/></rect></clipPath>`;
    body += `<text class="mono" x="${x}" y="${y}" font-size="${size}" fill="${color}" textLength="${round(s.n * cw)}" lengthAdjust="spacingAndGlyphs" xml:space="preserve" clip-path="url(#type${i})">${esc(s.line)}</text>`;
  });
  body += `<rect class="caret" x="${x}" y="${y - size * 0.82}" width="${round(cw * 0.8)}" height="${size}" fill="${cursor}"><animate attributeName="x" values="${cursorEvents.map((e) => round(x + e[1] + 2)).join(';')}" keyTimes="${cursorEvents.map((e) => kt(e[0])).join(';')}" dur="${round(dur)}s" calcMode="discrete" repeatCount="indefinite"/></rect>`;
  return { defs, body };
}

// ---------------------------------------------------------------------------
// header.svg — seaside title screen

function header() {
  const W = 900;
  const H = 300;
  const fx = 2, fy = 2, fw = 888, fh = 288;

  // wobbly pixel title, one hopping group per letter (shadow + face)
  const size = 10;
  let lx = 58;
  const ly = 40;
  let letters = '';
  [...PROFILE.name].forEach((ch, i) => {
    const { d, width } = pixelText(ch, { bold: true });
    letters += `<g class="hop" style="animation-delay:${round(-i * 0.16)}s"><path transform="translate(${lx + 6} ${ly + 6}) scale(${size})" fill="${T.peach}" d="${d}"/><path transform="translate(${lx} ${ly}) scale(${size})" fill="${P.dark}" d="${d}"/></g>`;
    lx += (width + 1) * size;
  });

  const typing = typewriter(PROFILE.taglines, { x: 98, y: 190, size: 22, color: P.dark, cursor: P.teal });

  const sun = new Pixels(28, 28).ellipse(14, 14, 13.6, 13.6, '#F7BDA2').ellipse(14, 14, 10.5, 10.5, '#F9CDB5').ellipse(11.5, 10.5, 4, 3.4, '#FBDDCB');
  const clouds = [
    { y: 34, s: 3, dur: 70, delay: -8 },
    { y: 98, s: 2, dur: 95, delay: -60 },
    { y: 58, s: 2, dur: 82, delay: -33 },
  ].map((c) => `<g class="cloud" style="animation-duration:${c.dur}s;animation-delay:${c.delay}s">${cloud().svg(0, c.y, c.s)}</g>`).join('');

  const sparkles = [
    [532, 44, P.teal, 0], [610, 96, T.peachShade, -0.8], [548, 128, P.blue, -1.6], [840, 40, P.teal, -2.1], [30, 150, P.blue, -1.1],
  ].map(([x, y, c, d]) => `<g class="twinkle" style="animation-delay:${d}s">${sparkle(c).svg(x, y, 3)}</g>`).join('');

  const glint = (list, fill) => list
    .map(([x, y, w], i) => `<rect class="glint" style="animation-delay:${round(-i * 0.55)}s" x="${x}" y="${y}" width="${w}" height="3" rx="1.5" fill="${fill}"/>`).join('');
  const glintsMid = glint([[712, 244, 36], [750, 250, 22], [700, 252, 16], [770, 246, 26]], T.foam);
  const glintsFront = glint([[726, 274, 30], [764, 282, 18], [704, 286, 14]], T.sky);

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
@keyframes sunring { 0% { opacity: .7; transform: scale(.9); } 100% { opacity: 0; transform: scale(1.35); } }`;

  const defs = `
<clipPath id="frame"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="22"/></clipPath>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.paper}"/><stop offset="1" stop-color="#F6DFCF"/></linearGradient>
${DOTS}
${typing.defs}`;

  const body = `
<rect x="${fx + 7}" y="${fy + 7}" width="${fw}" height="${fh}" rx="22" fill="${P.brown}"/>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#sky)"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  <circle class="sunring" cx="768" cy="176" r="74" fill="none" stroke="${T.peach}" stroke-width="3"/>
  <circle class="sunring" style="animation-delay:-2s" cx="768" cy="176" r="74" fill="none" stroke="${T.peach}" stroke-width="3"/>
  ${sun.svg(698, 106, 5)}
  ${clouds}
  ${sparkles}
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
</g>
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="22" fill="none" stroke="${P.dark}" stroke-width="3"/>`;

  return doc(W, H, {
    title: `${PROFILE.name} — drawing & game dev`,
    desc: `Animated seaside banner: the name ${PROFILE.name} bobbing in pixel letters, Wooper floating in the waves in front of the setting sun, and a typewriter cycling through: ${PROFILE.taglines.join(' / ')}`,
    style, defs, body,
  });
}

// ---------------------------------------------------------------------------
// status.svg — RPG-style player card

function slotIcon(kind) {
  switch (kind) {
    case 'palette': return iconPalette().svg(8, 8, 3);
    case 'cube': return iconCube().svg(8, 8, 3);
    case 'live2d': return iconLive2D().svg(8, 8, 3);
    default: {
      const color = kind === 'C#' ? P.teal : P.blue;
      return pixelLabel(kind, { x: 32, y: 21, size: 3, fill: color, anchor: 'middle' }).svg;
    }
  }
}

function status() {
  const W = 900;
  const H = 400;
  const px = 10, py = 22, pw = 872, ph = 360;
  const x0 = 290;

  const avatar = `
<rect x="34" y="72" width="222" height="286" rx="14" fill="${T.sky}" stroke="${P.dark}" stroke-width="3"/>
<g clip-path="url(#avatarClip)"><g>${drift(74, 6)}<path d="${wave(214, 4, 74, { width: 222, bottom: 360 })}" transform="translate(34 0)" fill="${T.mist}"/></g></g>
<ellipse class="shadow" cx="145" cy="221" rx="48" ry="7" fill="${P.blue}" opacity=".45"/>
<g transform="translate(79 78)"><g class="hover">${peach().svg(0, 0, 6)}<g class="blink">${peachBlink().svg(0, 0, 6)}</g></g></g>
${pixelLabel(PROFILE.statusName, { x: 145, y: 252, size: 3, fill: P.dark, bold: true, anchor: 'middle' }).svg}
<line x1="58" y1="300" x2="232" y2="300" stroke="${T.sandDeep}" stroke-width="2" stroke-dasharray="4 5"/>
${iconCake().svg(84, 312, 3)}
${pixelLabel(PROFILE.birthday, { x: 128, y: 322, size: 2, fill: P.brown }).svg}
<g class="twinkle">${sparkle(T.peachShade).svg(226, 312, 2)}</g>`;

  let rows = '';
  PROFILE.status.forEach(([label, value], i) => {
    const y = 66 + i * 44;
    rows += pixelLabel(label, { x: x0, y: y + 4, size: 2, fill: P.brown }).svg;
    rows += `<text class="mono" x="${x0 + 104}" y="${y + 17}" font-size="18" fill="${P.dark}">${esc(value)}</text>`;
    if (label === 'QUEST') {
      rows += `<rect x="${x0 + 104}" y="${y + 29}" width="300" height="12" rx="6" fill="${T.sand}" stroke="${P.dark}" stroke-width="2"/>
<rect x="${x0 + 106}" y="${y + 31}" width="186" height="8" rx="4" fill="url(#stripes)"/>
${pixelLabel('IN PROGRESS', { x: x0 + 418, y: y + 30, size: 1.5, fill: P.teal, attrs: 'class="wip"' }).svg}`;
    }
    rows += `<line x1="${x0}" y1="${y + 30 + (label === 'QUEST' ? 20 : 0)}" x2="858" y2="${y + 30 + (label === 'QUEST' ? 20 : 0)}" stroke="${T.sandDeep}" stroke-width="2" stroke-dasharray="4 5"/>`;
  });

  const invY = 298;
  const step = 76;
  const n = PROFILE.inventory.length;
  const dur = n * 2;
  const slots = PROFILE.inventory.map(([kind], i) =>
    `<g transform="translate(${x0 + i * step} ${invY})"><rect width="64" height="64" rx="10" fill="${T.paper}" stroke="${P.dark}" stroke-width="3"/>${slotIcon(kind)}</g>`).join('');
  const selector = `<g>${cycle('transform', PROFILE.inventory.map((_, i) => `${x0 + i * step} ${invY}`), dur, { type: 'translate' })}
<g class="pulse"><rect x="-6" y="-6" width="76" height="76" rx="14" fill="none" stroke="${T.peachShade}" stroke-width="4"/></g>
<path d="M26 -17h12l-6 8z" fill="${T.peachShade}" class="nudge"/></g>`;
  const capX = x0 + n * step + 12;
  const captions = PROFILE.inventory.map(([, name], i) => {
    const vis = PROFILE.inventory.map((_, j) => (j === i ? 1 : 0));
    return `<text class="mono" x="${capX + 16}" y="${invY + 38}" font-size="17" fill="${P.dark}" opacity="${i === 0 ? 1 : 0}">${cycle('opacity', vis, dur)}${esc(name)}</text>`;
  }).join('');

  const inventory = `
${pixelLabel('INVENTORY', { x: x0, y: invY - 40, size: 2, fill: P.brown }).svg}
${slots}
${selector}
<rect x="${capX}" y="${invY + 10}" width="${858 - capX}" height="44" rx="10" fill="${T.paper}" stroke="${P.dark}" stroke-width="2.5"/>
<path d="M${capX} ${invY + 26}l-9 6 9 6z" fill="${T.paper}" stroke="${P.dark}" stroke-width="2.5" stroke-linejoin="round"/>
<rect x="${capX + 1}" y="${invY + 24}" width="4" height="16" fill="${T.paper}"/>
${captions}`;

  const style = `
.hover { animation: hover 2.4s ease-in-out infinite; }
@keyframes hover { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
.shadow { animation: shadow 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes shadow { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(.8); opacity: .3; } }
.blink { opacity: 0; animation: blink 3.8s infinite; }
@keyframes blink { 0%, 90%, 96%, 100% { opacity: 0; } 91%, 95% { opacity: 1; } }
.twinkle { animation: twinkle 2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twinkle { 0%, 100% { opacity: .3; transform: scale(.6); } 50% { opacity: 1; transform: scale(1); } }
.wip { animation: wip 1.2s steps(1) infinite; }
@keyframes wip { 50% { opacity: .25; } }
.pulse { animation: pulse 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
.nudge { animation: nudge .8s ease-in-out infinite; }
@keyframes nudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }`;

  const defs = `${DOTS}
<clipPath id="avatarClip"><rect x="35.5" y="73.5" width="219" height="283" rx="12"/></clipPath>
<pattern id="stripes" width="16" height="8" patternUnits="userSpaceOnUse"><rect width="16" height="8" fill="${P.teal}"/><path d="M0 8L8 0h4L4 8zM8 8l8-8v4l-4 4z" fill="${P.blue}"/>${drift(16, 0.8, 1).replace('attributeName="transform"', 'attributeName="patternTransform"')}</pattern>`;

  const body = `
${panel(px, py, pw, ph)}
${tab(30, 4, 'STATUS')}
${avatar}
${rows}
${inventory}`;

  return doc(W, H, {
    title: `${PROFILE.name} — status`,
    desc: `Player card. ${PROFILE.status.map(([k, v]) => `${k.toLowerCase()}: ${v}`).join('; ')}; birthday: ${PROFILE.birthday.toLowerCase()}. Inventory: ${PROFILE.inventory.map(([, v]) => v).join(', ')}.`,
    style, defs, body,
  });
}

// ---------------------------------------------------------------------------
// party.svg — favourite characters as party members

function party() {
  const W = 440;
  const H = 360;
  let members = '';
  PROFILE.party.forEach((m, i) => {
    const y = 64 + i * 142;
    const foot = m.sprite === 'wooper' ? 104 : 106;
    const sprite = m.sprite === 'wooper'
      ? `<g transform="translate(22 ${y + 12})"><g class="idle" style="animation-delay:${-i * 0.6}s">${wooper().svg(0, 0, 4)}<g class="blink">${wooperBlink().svg(0, 0, 4)}</g></g></g>`
      : `<g transform="translate(24 ${y})"><g class="idle" style="animation-delay:${-i * 0.6}s">${rakko().svg(0, 0, 4)}<g class="blink" style="animation-delay:-2s">${rakkoBlink().svg(0, 0, 4)}</g></g></g>`;
    const hearts = [0, 1, 2].map((k) => `<g class="float" style="animation-delay:${round(-k * 1.3 - i * 0.7)}s">${heart().svg(118 + k * 10, y + 30 - k * 6, 2)}</g>`).join('');
    let cx = 176;
    const chips = m.chips.map(([label, color]) => {
      const t = pixelLabel(label, { x: cx + 8, y: y + 70, size: 2, fill: T.foam });
      const chip = `<rect x="${cx}" y="${y + 63}" width="${t.width + 16}" height="28" rx="14" fill="${color}" stroke="${P.dark}" stroke-width="2.5"/>${t.svg}`;
      cx += t.width + 22;
      return chip;
    }).join('');
    members += `
<rect x="20" y="${y}" width="398" height="126" rx="14" fill="${T.paper}" stroke="${P.dark}" stroke-width="2.5"/>
<ellipse cx="84" cy="${y + foot}" rx="54" ry="10" fill="${T.sandDeep}"/>
<ellipse cx="84" cy="${y + foot - 3}" rx="44" ry="6" fill="${T.sand}"/>
${sprite}
${hearts}
${pixelLabel(m.name, { x: 176, y: y + 16, size: 3, fill: P.dark }).svg}
<text class="mono" x="402" y="${y + 32}" font-size="14" fill="${P.brown}" text-anchor="end">${esc(m.tag)}</text>
<text class="mono" x="176" y="${y + 55}" font-size="15" fill="${P.brown}">${esc(m.about)}</text>
${chips}
${pixelLabel('HP', { x: 176, y: y + 102, size: 2, fill: P.teal }).svg}
<rect x="206" y="${y + 100}" width="196" height="14" rx="7" fill="${T.sand}" stroke="${P.dark}" stroke-width="2"/>
<rect class="hp" style="animation-delay:${-i * 1.1}s" x="208" y="${y + 102}" width="192" height="10" rx="5" fill="${P.teal}"/>
<rect x="212" y="${y + 104}" width="182" height="2.5" rx="1.25" fill="${T.mist}" opacity=".8"/>`;
  });

  const style = `
.idle { animation: idle 1.8s ease-in-out infinite; }
@keyframes idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
.blink { opacity: 0; animation: blink 4s infinite; }
@keyframes blink { 0%, 90%, 96%, 100% { opacity: 0; } 91%, 95% { opacity: 1; } }
.float { opacity: 0; animation: float 3.9s ease-out infinite; }
@keyframes float { 0% { opacity: 0; transform: translateY(8px); } 25% { opacity: 1; } 100% { opacity: 0; transform: translateY(-26px); } }
.hp { animation: hp 5s ease-in-out infinite; transform-box: fill-box; transform-origin: left; }
@keyframes hp { 0%, 100% { transform: scaleX(1); } 45% { transform: scaleX(.9); } 55% { transform: scaleX(.9); } }`;

  const body = `
${panel(8, 22, 418, 322)}
${tab(28, 4, 'PARTY')}
${pixelLabel(`${PROFILE.party.length}/6`, { x: 404, y: 38, size: 2, fill: P.brown, anchor: 'end' }).svg}
${members}`;

  return doc(W, H, {
    title: `${PROFILE.name} — party`,
    desc: `Favourite characters as a game party: ${PROFILE.party.map((m) => `${m.name[0]}${m.name.slice(1).toLowerCase()} (${m.about})`).join(' and ')}.`,
    style, defs: DOTS, body,
  });
}

// ---------------------------------------------------------------------------
// playlist.svg — favourite artists on a spinning record

function playlist() {
  const W = 440;
  const H = 360;
  const n = PROFILE.playlist.length;
  const per = 3.5;
  const dur = n * per;
  const rx0 = 214;
  const rowY = (i) => 80 + i * 46;

  const grooves = [62, 54, 46, 38].map((r) => `<circle cx="112" cy="168" r="${r}" fill="none" stroke="#6A4430" stroke-width="1.4" opacity=".75"/>`).join('');
  const record = `
<circle cx="116" cy="172" r="78" fill="${P.brown}"/>
<g class="spin">
  <circle cx="112" cy="168" r="78" fill="${P.dark}"/>
  ${grooves}
  <circle cx="112" cy="168" r="26" fill="${T.peach}"/>
  <path d="M112 142a26 26 0 0 1 26 26h-26z" fill="${T.peachShade}"/>
  <path d="M112 194a26 26 0 0 1 -26 -26h26z" fill="${T.peachShade}"/>
  ${tinyPeach().svg(103, 148, 2)}
  <circle cx="112" cy="168" r="3.5" fill="${P.cream}"/>
</g>
<path d="M50 132a70 70 0 0 1 40 -30" fill="none" stroke="${T.foam}" stroke-width="4" stroke-linecap="round" opacity=".35"/>
<g class="arm">
  <circle cx="196" cy="84" r="11" fill="${T.sand}" stroke="${P.dark}" stroke-width="2.5"/>
  <path d="M196 84 L176 170 L160 184" fill="none" stroke="${P.dark}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M196 84 L176 170 L160 184" fill="none" stroke="${T.sandDeep}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <rect x="150" y="178" width="18" height="12" rx="3" fill="${P.teal}" stroke="${P.dark}" stroke-width="2.5" transform="rotate(-40 159 184)"/>
</g>`;

  const highlight = `<g>${cycle('transform', PROFILE.playlist.map((_, i) => `0 ${rowY(i) - rowY(0)}`), dur, { type: 'translate' })}
<rect x="${rx0}" y="${rowY(0) - 26}" width="198" height="38" rx="10" fill="${P.teal}" stroke="${P.dark}" stroke-width="2.5"/>
${[0, 1, 2, 3].map((k) => `<rect class="eq" style="animation-delay:${round(-k * 0.23)}s" x="${382 + k * 7}" y="${rowY(0) - 17}" width="4" height="20" rx="1" fill="${T.peach}"/>`).join('')}
</g>`;
  const tracks = PROFILE.playlist.map((name, i) => {
    const y = rowY(i);
    const vis = PROFILE.playlist.map((_, j) => (j === i ? 1 : 0));
    const label = (fill) => `${pixelLabel(String(i + 1).padStart(2, '0'), { x: rx0 + 12, y: y - 14, size: 2, fill }).svg}<text class="mono" x="${rx0 + 42}" y="${y}" font-size="15" fill="${fill}">${esc(name)}</text>`;
    return `<g>${label(P.dark)}</g><g opacity="${i === 0 ? 1 : 0}">${cycle('opacity', vis, dur)}${label(T.foam)}</g>`;
  }).join('');

  const controls = `
<g transform="translate(214 272)">
  <rect width="198" height="12" rx="6" fill="${T.sand}" stroke="${P.dark}" stroke-width="2"/>
  <rect x="2" y="2" width="194" height="8" rx="4" fill="${P.blue}" class="progress"/>
  <g transform="translate(46 26)" fill="${P.dark}">
    <path d="M0 4h4v18h-4zM22 4v18l-16 -9z"/>
    <g transform="translate(46 -2)"><circle cx="15" cy="15" r="15" fill="${T.peach}" stroke="${P.dark}" stroke-width="2.5"/><path d="M11 8v14l12 -7z"/></g>
    <path d="M104 4v18l16 -9zM122 4h4v18h-4z"/>
  </g>
</g>`;

  const style = `
.spin { animation: spin 4s linear infinite; transform-origin: 112px 168px; }
@keyframes spin { to { transform: rotate(360deg); } }
.arm { animation: arm 3s ease-in-out infinite; transform-origin: 196px 84px; }
@keyframes arm { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(1.6deg); } }
.eq { animation: eq .9s ease-in-out infinite; transform-box: fill-box; transform-origin: bottom; }
@keyframes eq { 0%, 100% { transform: scaleY(.25); } 50% { transform: scaleY(1); } }
.progress { animation: progress ${per}s linear infinite; transform-box: fill-box; transform-origin: left; }
@keyframes progress { from { transform: scaleX(0); } to { transform: scaleX(1); } }`;

  const body = `
${panel(8, 22, 418, 322)}
${tab(28, 4, 'ON REPEAT ♪')}
${record}
${highlight}
${tracks}
${controls}`;

  return doc(W, H, {
    title: `${PROFILE.name} — on repeat`,
    desc: `Favourite artists on a spinning record: ${PROFILE.playlist.join(', ')}.`,
    style, defs: DOTS, body,
  });
}

// ---------------------------------------------------------------------------
// footer.svg — goodbye waves

function footer() {
  const W = 900;
  const H = 170;
  const fx = 2, fy = 2, fw = 888, fh = 158;
  const style = `
.swim { animation: swim 22s linear -9s infinite; }
@keyframes swim { from { transform: translateX(-180px); } to { transform: translateX(${W + 40}px); } }
.bob { animation: bob 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(5px) rotate(2deg); } }
.blink { opacity: 0; animation: blink 4s infinite; }
@keyframes blink { 0%, 90%, 96%, 100% { opacity: 0; } 91%, 95% { opacity: 1; } }
.beat { animation: beat 1.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes beat { 0%, 100% { transform: scale(1); } 15% { transform: scale(1.25); } 30% { transform: scale(1); } }`;
  const title = pixelLabel('THANKS FOR SWIMMING BY', { x: W / 2 - 12, y: 30, size: 3, fill: P.dark, anchor: 'middle' });
  const body = `
<clipPath id="frame"><rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="20"/></clipPath>
<rect x="${fx + 7}" y="${fy + 7}" width="${fw}" height="${fh}" rx="20" fill="${P.brown}"/>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="${T.paper}"/>
  <rect width="${W}" height="${H}" fill="url(#dots)"/>
  ${title.svg}
  <g class="beat">${heart(T.peachShade).svg(W / 2 - 12 + title.width / 2 + 14, 32, 3)}</g>
  <text class="mono" x="${W / 2}" y="78" font-size="16" fill="${P.brown}" text-anchor="middle">see you at sea ~</text>
  <g>${drift(120, 10, 1)}<path d="${wave(112, 6, 120, { bottom: 200 })}" fill="${T.mist}"/></g>
  <g>${drift(160, 7)}<path d="${wave(130, 7, 160, { bottom: 200 })}" fill="${P.blue}"/></g>
  <g class="swim"><g transform="translate(0 100)"><g class="bob">${rakko().svg(0, 0, 2)}<g class="blink">${rakkoBlink().svg(0, 0, 2)}</g></g></g></g>
  <g>${drift(200, 9)}<path d="${wave(146, 6, 200, { bottom: 200 })}" fill="${P.teal}"/></g>
</g>
<rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="20" fill="none" stroke="${P.dark}" stroke-width="3"/>`;
  return doc(W, H, {
    title: 'thanks for swimming by',
    desc: 'Footer: "thanks for swimming by — see you at sea" above rolling waves, with Rakko floating past.',
    style, defs: DOTS, body,
  });
}

// ---------------------------------------------------------------------------

mkdirSync(OUT, { recursive: true });
const files = { 'header.svg': header(), 'status.svg': status(), 'party.svg': party(), 'playlist.svg': playlist(), 'footer.svg': footer() };
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), svg);
  console.log(`assets/${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
