// Builds the static animated SVG cards in assets/.
// Edit scripts/profile.mjs, then run:  node scripts/build-assets.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { Pixels, pixelLabel, round } from './lib/pixel.mjs';
import { PROFILE } from './profile.mjs';
import { DOTS, cloud, cycle, doc, drift, esc, heart, panel, sparkle, tab, wave } from './lib/svg.mjs';
import {
  P, T,
  iconCake, iconCube, iconLive2D, iconPalette,
  peach, peachBlink, rakko, rakkoBlink, tinyPeach, wooper, wooperBlink,
} from './lib/theme.mjs';

const OUT = new URL('../assets/', import.meta.url);

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
// artwork cards — images are embedded, because SVGs shown as <img> can't load files

const ART = new URL('../assets/art/', import.meta.url);
const art = (file) => `data:image/webp;base64,${readFileSync(new URL(file, ART)).toString('base64')}`;

// sketchbook.svg — featured illustration taped in, a sticker and two creature polaroids

function sketchbook() {
  const W = 900;
  const H = 410;
  const { featured, stickers, creatures } = PROFILE.art;

  // the glowing fruit in the forest piece (fractions of the image), pulsing softly
  const img = { x: 50, y: 80, w: 480, h: 270 };
  const orbs = [[0.28, 0.21, '#FFD36B'], [0.12, 0.33, '#A6F0A4'], [0.08, 0.61, '#FF8C7C']];
  const glows = orbs.map(([fx, fy, c], i) => {
    const [x, y] = [round(img.x + fx * img.w), round(img.y + fy * img.h)];
    return `<circle class="glow" style="animation-delay:${round(-i * 0.7)}s" cx="${x}" cy="${y}" r="30" fill="url(#glow${i})"/>
<g class="twinkle" style="animation-delay:${round(-i * 0.9)}s">${sparkle(T.foam).svg(x + 16, y - 26, 2)}</g>`;
  }).join('');
  // a cursor walking the title screen's PLAY / OPTION / QUIT menu (fractions of the image)
  const menu = [[0.625, 0.444, 0.645, 0.9], [0.675, 0.595, 0.69, 0.945], [0.628, 0.751, 0.645, 0.91]];
  const cursor = new Pixels(4, 7).stamp(0, 0, ['#...', '##..', '###.', '####', '###.', '##..', '#...'], { '#': T.foam });
  const menuFx = menu.map(([ax, fy, x0, x1], i) => {
    const y = img.y + fy * img.h;
    const vis = menu.map((_, j) => (j === i ? 1 : 0));
    return `<g opacity="${i === 0 ? 1 : 0}">${cycle('opacity', vis, menu.length * 1.8)}
  <rect x="${round(img.x + x0 * img.w)}" y="${round(y - 9)}" width="${round((x1 - x0) * img.w)}" height="18" rx="9" fill="#FFFFFF" opacity=".14"/>
  <g class="blinky">${cursor.svg(round(img.x + ax * img.w - 8), round(y - 7), 2)}</g>
</g>`;
  }).join('');
  const glowDefs = orbs.map(([, , c], i) =>
    `<radialGradient id="glow${i}"><stop offset="0" stop-color="${c}" stop-opacity=".75"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`).join('');

  const featuredFrame = `
<g transform="rotate(-1.2 290 216)"><g class="sway">
  <rect x="${img.x - 10}" y="${img.y - 10}" width="${img.w + 20}" height="${img.h + 20}" rx="6" fill="#FFFFFF" stroke="${P.dark}" stroke-width="3"/>
  <image href="${art(featured)}" x="${img.x}" y="${img.y}" width="${img.w}" height="${img.h}" clip-path="url(#featClip)" preserveAspectRatio="xMidYMid slice"/>
  <rect x="${img.x}" y="${img.y}" width="${img.w}" height="${img.h}" rx="3" fill="none" stroke="${P.dark}" stroke-width="1.5" opacity=".5"/>
  ${glows}
  ${menuFx}
  <rect x="62" y="56" width="74" height="24" fill="${T.peach}" opacity=".8" transform="rotate(-9 99 68)"/>
  <rect x="446" y="58" width="74" height="24" fill="${T.mist}" opacity=".85" transform="rotate(8 483 70)"/>
</g></g>`;

  const [calm, shock] = stickers.react;
  const stickerArt = `
<g transform="rotate(-6 636 130)"><g class="react">
  <image href="${art(calm)}" x="552" y="46" width="168" height="168" filter="url(#lift)"/>
  <image class="shock" href="${art(shock)}" x="552" y="46" width="168" height="168" filter="url(#lift)"/>
</g></g>
<g transform="rotate(7 792 124)"><g class="wiggle">
  <image href="${art(stickers.plain)}" x="710" y="40" width="164" height="164" filter="url(#lift)"/>
</g></g>
<g class="float">${sparkle(T.peachShade).svg(700, 44, 3)}</g>
<g class="float" style="animation-delay:-1.4s">${sparkle(P.blue).svg(566, 196, 2)}</g>`;

  const polaroid = (file, x, y, angle, i) => `
<g transform="rotate(${angle} ${x + 68} ${y + 79})"><g class="idle" style="animation-delay:${round(-i * 0.9)}s">
  <rect x="${x}" y="${y}" width="136" height="158" rx="4" fill="#FFFFFF" stroke="${P.dark}" stroke-width="2.5"/>
  <image href="${art(file)}" x="${x + 8}" y="${y + 8}" width="120" height="120"/>
  ${heart(i ? T.peachShade : P.teal).svg(x + 61, y + 136, 2)}
  <rect x="${x + 44}" y="${y - 10}" width="48" height="18" fill="${i ? T.mist : T.peach}" opacity=".8" transform="rotate(${-angle * 1.5} ${x + 68} ${y - 1})"/>
</g></g>`;

  const style = `
.sway { animation: sway 6s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 0; }
@keyframes sway { 0%, 100% { transform: rotate(-.5deg); } 50% { transform: rotate(.5deg); } }
.glow { animation: glow 2.8s ease-in-out infinite; mix-blend-mode: screen; }
@keyframes glow { 0%, 100% { opacity: .15; } 50% { opacity: .85; } }
.twinkle { animation: twinkle 2.2s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes twinkle { 0%, 100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }
.wiggle { animation: wiggle 3.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 90%; }
@keyframes wiggle { 0%, 60%, 100% { transform: rotate(0); } 70% { transform: rotate(-5deg); } 80% { transform: rotate(4deg); } 90% { transform: rotate(-2deg); } }
.react { animation: react 4.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 80%; }
@keyframes react { 0%, 64%, 84%, 100% { transform: scale(1); } 68% { transform: scale(1.1) rotate(-3deg); } 74% { transform: scale(1.06) rotate(2deg); } }
.shock { opacity: 0; animation: shock 4.4s steps(1) infinite; }
@keyframes shock { 66% { opacity: 1; } 84% { opacity: 0; } }
.blinky { animation: blinky .9s steps(1) infinite; }
@keyframes blinky { 50% { opacity: .3; } }
.float { animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); opacity: .4; } 50% { transform: translateY(-8px); opacity: 1; } }
.idle { animation: idle 3.6s ease-in-out infinite; }
@keyframes idle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`;

  const defs = `${DOTS}${glowDefs}
<clipPath id="featClip"><rect x="${img.x}" y="${img.y}" width="${img.w}" height="${img.h}" rx="3"/></clipPath>
<filter id="lift" x="-10%" y="-10%" width="130%" height="130%"><feDropShadow dx="3" dy="5" stdDeviation="0" flood-color="${P.dark}" flood-opacity=".3"/></filter>`;

  const body = `
${panel(10, 22, 872, 370)}
${tab(30, 4, 'SKETCHBOOK')}
${featuredFrame}
${stickerArt}
${polaroid(creatures[0], 572, 226, -4, 0)}
${polaroid(creatures[1], 724, 232, 5, 1)}`;

  return doc(W, H, {
    title: `${PROFILE.statusName} — sketchbook`,
    desc: 'My drawings: the title screen of Wandspell Chronicles (a hooded character in a dark forest with glowing fruit, and a PLAY / OPTION / QUIT menu with a cursor moving through it), a chibi sticker of a character with glasses who keeps making a surprised face, a chibi sticker with dark blue hair and yellow flowers, and two mushroom creature designs (a red-capped one and a brown-capped one).',
    style, defs, body,
  });
}

// characters.svg — the four elf characters as a game's character select screen

function characters() {
  const W = 900;
  const H = 384;
  const list = PROFILE.art.characters;
  const size = 188;
  const gap = 24;
  const x0 = (W - (list.length * size + (list.length - 1) * gap)) / 2;
  const y0 = 102;
  const px = (i) => x0 + i * (size + gap);
  const dur = list.length * 2.2;

  const portraits = list.map((file, i) => {
    const lift = list.map((_, j) => (j === i ? '0 -10' : '0 0'));
    const num = pixelLabel(String(i + 1).padStart(2, '0'), { x: 0, y: 0, size: 2, fill: T.foam });
    return `<g>${cycle('transform', lift, dur, { type: 'translate' })}
  <rect x="${px(i)}" y="${y0}" width="${size}" height="${size}" rx="12" fill="#FFFFFF" stroke="${P.dark}" stroke-width="3"/>
  <image href="${art(file)}" x="${px(i) + 1.5}" y="${y0 + 1.5}" width="${size - 3}" height="${size - 3}" clip-path="url(#pc${i})"/>
  <g transform="translate(${px(i) + 10} ${y0 + size - 30})"><rect width="${num.width + 16}" height="22" rx="8" fill="${P.teal}" stroke="${P.dark}" stroke-width="2"/><g transform="translate(8 4)">${num.svg}</g></g>
</g>`;
  }).join('');
  const clips = list.map((_, i) => `<clipPath id="pc${i}"><rect x="${px(i) + 1.5}" y="${y0 + 1.5}" width="${size - 3}" height="${size - 3}" rx="10.5"/></clipPath>`).join('');

  const tag = pixelLabel('1P', { x: 0, y: 0, size: 3, fill: T.foam });
  const selector = `<g>${cycle('transform', list.map((_, i) => `${px(i)} ${y0 - 10}`), dur, { type: 'translate' })}
  <g class="pulse"><rect x="-7" y="-7" width="${size + 14}" height="${size + 14}" rx="17" fill="none" stroke="${T.peachShade}" stroke-width="5"/></g>
  <g transform="translate(${size / 2 - 22} -46)"><g class="nudge"><rect width="44" height="30" rx="9" fill="${T.peachShade}" stroke="${P.dark}" stroke-width="2.5"/>
    <g transform="translate(${22 - tag.width / 2} 5)">${tag.svg}</g><path d="M16 30h12l-6 8z" fill="${T.peachShade}" stroke="${P.dark}" stroke-width="2.5" stroke-linejoin="round"/><rect x="17" y="27" width="10" height="4" fill="${T.peachShade}"/></g></g>
</g>`;

  const style = `
.pulse { animation: pulse 1s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
.nudge { animation: nudge .8s ease-in-out infinite; }
@keyframes nudge { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }
.start { animation: start 1.2s steps(1) infinite; }
@keyframes start { 50% { opacity: .15; } }`;

  const body = `
${panel(10, 22, 872, 346)}
${tab(30, 4, 'CHARACTER SELECT')}
${portraits}
${selector}
${pixelLabel('PRESS START', { x: W / 2, y: 328, size: 3, fill: P.teal, anchor: 'middle', attrs: 'class="start"' }).svg}`;

  return doc(W, H, {
    title: `${PROFILE.statusName} — character select`,
    desc: 'Four elf characters I drew on blue backgrounds, shown as a game character-select screen with a cursor cycling between them: green hair with a little mushroom and a blue vest, a dark navy hood, purple hair with brown overalls, and red hair with a green top.',
    style, defs: `${DOTS}${clips}`, body,
  });
}

// ---------------------------------------------------------------------------
// link buttons — one image each so the README can wrap them in links

const LINK_ICONS = {
  x: { bg: P.dark, rows: ['##......##', '.##....##.', '..##..##..', '...####...', '....##....', '...####...', '..##..##..', '.##....##.', '##......##'] },
  instagram: { bg: T.peachShade, rows: ['.#########.', '#.........#', '#.......#.#', '#...###...#', '#..#...#..#', '#..#...#..#', '#..#...#..#', '#...###...#', '#.........#', '#.........#', '.#########.'] },
  itch: { bg: P.teal, rows: ['.##########.', '############', '#..##..##..#', '############', '.##########.', '.###.##.###.', '.##..##..##.', '.##########.', '.####..####.'] },
  discord: { bg: P.blue, rows: ['..##....##..', '.##########.', '############', '###..##..###', '###..##..###', '############', '############', '.###....###.', '..#......#..'] },
};

// Compact enough that four sit in one row.
function linkButton({ icon, label, handle, url }) {
  const W = 224;
  const H = 80;
  const ic = LINK_ICONS[icon];
  const glyph = new Pixels(ic.rows[0].length, ic.rows.length).stamp(0, 0, ic.rows, { '#': T.foam });
  const s = 3;
  const tile = { x: 13, y: 14, size: 42 };
  const gx = tile.x + (tile.size - glyph.w * s) / 2;
  const gy = tile.y + (tile.size - glyph.h * s) / 2;
  const arrow = url ? `<g class="nudge">${pixelLabel('>', { x: 194, y: 28, size: 2.5, fill: P.teal }).svg}</g>` : '';
  const style = `
.shine { animation: shine 4s ease-in-out infinite; }
@keyframes shine { 0%, 55% { transform: translateX(-80px) skewX(-20deg); } 85%, 100% { transform: translateX(300px) skewX(-20deg); } }
.hop { animation: hop 2.4s ease-in-out infinite; }
@keyframes hop { 0%, 80%, 100% { transform: translateY(0); } 88% { transform: translateY(-4px); } }
.nudge { animation: nudge 1s ease-in-out infinite; }
@keyframes nudge { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(3px); } }`;
  const body = `
<clipPath id="btn"><rect x="3" y="3" width="210" height="66" rx="14"/></clipPath>
<rect x="10" y="10" width="210" height="66" rx="14" fill="${P.brown}"/>
<rect x="3" y="3" width="210" height="66" rx="14" fill="${P.cream}"/>
<g clip-path="url(#btn)"><rect class="shine" x="0" y="0" width="30" height="80" fill="#FFFFFF" opacity=".45"/></g>
<rect x="3" y="3" width="210" height="66" rx="14" fill="none" stroke="${P.dark}" stroke-width="3"/>
<g class="hop"><rect x="${tile.x}" y="${tile.y}" width="${tile.size}" height="${tile.size}" rx="10" fill="${ic.bg}" stroke="${P.dark}" stroke-width="2.5"/>${glyph.svg(round(gx), round(gy), s)}</g>
${pixelLabel(label, { x: 66, y: 18, size: 2, fill: P.brown }).svg}
<text class="mono" x="66" y="54" font-size="16" font-weight="700" fill="${P.dark}">${esc(handle)}</text>
${arrow}`;
  return doc(W, H, {
    title: `${label.toLowerCase()} ${handle}`,
    desc: `${label[0]}${label.slice(1).toLowerCase()}: ${handle}${url ? ` (${url})` : ''}`,
    style, body,
  });
}

// ---------------------------------------------------------------------------

mkdirSync(OUT, { recursive: true });
const files = {
  'status.svg': status(),
  'sketchbook.svg': sketchbook(),
  'characters.svg': characters(),
  'party.svg': party(),
  'playlist.svg': playlist(),
  'footer.svg': footer(),
  ...Object.fromEntries(PROFILE.links.map((link) => [link.file, linkButton(link)])),
};
for (const [name, svg] of Object.entries(files)) {
  writeFileSync(new URL(name, OUT), svg);
  console.log(`assets/${name}  ${(svg.length / 1024).toFixed(1)} KB`);
}
