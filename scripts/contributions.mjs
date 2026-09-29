// Renders the animated "tide log" contribution card. Runs daily in GitHub Actions.
//
//   GITHUB_TOKEN=... node scripts/contributions.mjs --out dist/contributions.svg
//
// Options:  --user <login>      whose calendar to draw (default: repo owner, else p3achii)
//           --data <file.json>  use a saved GraphQL response instead of calling the API
//           --today YYYY-MM-DD  pretend it's this date (handy for testing birthday mode)
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { pixelLabel, round } from './lib/pixel.mjs';
import { DOTS, doc, drift, esc, panel, sparkle, tab, wave } from './lib/svg.mjs';
import { P, T, iconCake, otterFloat, otterFloatBlink } from './lib/theme.mjs';

const BIRTHDAY = { month: 6, day: 3 };
const TIMEZONE = process.env.TIMEZONE || 'Asia/Bangkok'; // used for "today" and the birthday countdown

const LEVELS = {
  NONE: T.sand,
  FIRST_QUARTILE: '#B8D6E6',
  SECOND_QUARTILE: '#7FB2CF',
  THIRD_QUARTILE: P.blue,
  FOURTH_QUARTILE: P.teal,
};

const QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks { contributionDays { date contributionCount contributionLevel weekday } }
      }
    }
  }
}`;

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    if (!argv[i].startsWith('--')) throw new Error(`unexpected argument: ${argv[i]}`);
    out[argv[i].slice(2)] = argv[i + 1];
    i++;
  }
  return out;
}

async function fetchCalendar(login) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) throw new Error('set GITHUB_TOKEN (or pass --data <file.json>)');
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': `${login}-readme` },
    body: JSON.stringify({ query: QUERY, variables: { login } }),
  });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors.map((e) => e.message).join('; '));
  return json.data.user.contributionsCollection.contributionCalendar;
}

function loadCalendar(file) {
  const json = JSON.parse(readFileSync(file, 'utf8'));
  return json.data?.user?.contributionsCollection?.contributionCalendar ?? json;
}

const dayMs = 86400000;
const utc = (date) => Date.parse(`${date}T00:00:00Z`);
const shortDate = (date) =>
  new Date(utc(date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }).toLowerCase();

// "apr 21-24" within a month, "apr 28-may 2" across months
function dateRange(from, to) {
  const [a, b] = [shortDate(from), shortDate(to)];
  return a.split(' ')[0] === b.split(' ')[0] ? `${a}-${b.split(' ')[1]}` : `${a}-${b}`;
}

function todayIn(timeZone) {
  // en-CA formats as YYYY-MM-DD
  return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
}

function daysUntilBirthday(today) {
  const year = Number(today.slice(0, 4));
  let next = Date.UTC(year, BIRTHDAY.month - 1, BIRTHDAY.day);
  if (next < utc(today)) next = Date.UTC(year + 1, BIRTHDAY.month - 1, BIRTHDAY.day);
  return Math.round((next - utc(today)) / dayMs);
}

function stats(days) {
  let longest = { len: 0, end: null };
  let run = 0;
  for (const d of days) {
    run = d.contributionCount > 0 ? run + 1 : 0;
    if (run > longest.len) longest = { len: run, end: d.date };
  }
  // today may simply not have a contribution *yet*, so it doesn't break the streak
  let i = days.length - 1;
  if (i >= 0 && days[i].contributionCount === 0) i--;
  let current = 0;
  while (i >= 0 && days[i].contributionCount > 0) { current++; i--; }
  const best = days.reduce((a, d) => (d.contributionCount > (a?.contributionCount ?? 0) ? d : a), null);
  const active = days.filter((d) => d.contributionCount > 0).length;
  return { current, longest, best, active };
}

// Small deterministic PRNG so the art only changes when the data does.
function rng(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------

function render(calendar, { login, today }) {
  const W = 900;
  const H = 356;
  const cell = 12;
  const pitch = 15;
  const gx = 66;
  const gy = 136;
  const weeks = calendar.weeks;
  const days = weeks.flatMap((w) => w.contributionDays);
  const s = stats(days);
  const untilBirthday = daysUntilBirthday(today);
  const birthdayMode = untilBirthday === 0;
  const random = rng(`${login}:${today}:${calendar.totalContributions}`);
  const birthdayKey = `-${String(BIRTHDAY.month).padStart(2, '0')}-${String(BIRTHDAY.day).padStart(2, '0')}`;
  const lastDate = days.at(-1)?.date;

  // month labels: first column whose week contains the 1st of a month
  let months = '';
  let lastLabelCol = -9;
  weeks.forEach((w, c) => {
    const first = w.contributionDays.find((d) => d.date.endsWith('-01'));
    if (!first || c - lastLabelCol < 3 || c > weeks.length - 2) return;
    lastLabelCol = c;
    const name = new Date(utc(first.date)).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }).toLowerCase();
    months += `<text class="mono" x="${gx + c * pitch}" y="${gy - 8}" font-size="11" fill="${P.brown}">${name}</text>`;
  });

  const weekdays = [[1, 'mon'], [3, 'wed'], [5, 'fri']]
    .map(([r, name]) => `<text class="mono" x="${gx - 8}" y="${gy + r * pitch + 10}" font-size="11" fill="${P.brown}" text-anchor="end">${name}</text>`).join('');

  // the grid: each week is a column that rolls with the tide; each cell pops in on load
  const top = [...days].filter((d) => d.contributionCount > 0).sort((a, b) => b.contributionCount - a.contributionCount).slice(0, 12);
  const topDates = new Set(top.map((d) => d.date));
  let grid = '';
  let marks = '';
  weeks.forEach((w, c) => {
    let cells = '';
    for (const d of w.contributionDays) {
      const x = gx + c * pitch;
      const y = gy + d.weekday * pitch;
      const delay = round(0.2 + c * 0.018 + d.weekday * 0.035);
      cells += `<rect class="cell" style="animation-delay:${delay}s" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${LEVELS[d.contributionLevel] ?? LEVELS.NONE}"/>`;
      if (topDates.has(d.date)) {
        cells += `<g class="shine" style="animation-delay:${round(-random() * 3)}s">${sparkle(T.foam).svg(x + 2.5, y + 2.5, 1)}</g>`;
      }
      if (d.date.endsWith(birthdayKey)) {
        cells += `<circle cx="${x + cell - 1}" cy="${y + 1}" r="3.2" fill="${T.peachShade}" stroke="${P.dark}" stroke-width="1.2"/>`;
      }
      if (d.date === lastDate) {
        marks += `<rect class="today" x="${x - 2.5}" y="${y - 2.5}" width="${cell + 5}" height="${cell + 5}" rx="4.5" fill="none" stroke="${T.peachShade}" stroke-width="2.5"/>`;
      }
    }
    grid += `<g class="tide" style="animation-delay:${round(-c * 0.09)}s">${cells}</g>`;
  });

  // legend row
  const lx = gx + weeks.length * pitch - pitch - 3;
  const legendCells = Object.values(LEVELS).map((fill, i) =>
    `<rect x="${lx - (5 - i) * 15 + 3}" y="250" width="12" height="12" rx="3" fill="${fill}"/>`).join('');
  const legend = `
<text class="mono" x="${lx - 5 * 15 - 4}" y="260" font-size="11" fill="${P.brown}" text-anchor="end">less</text>
${legendCells}
<text class="mono" x="${lx + 6}" y="260" font-size="11" fill="${P.brown}">more</text>
<rect x="${gx}" y="249" width="14" height="14" rx="4" fill="none" stroke="${T.peachShade}" stroke-width="2.5"/>
<text class="mono" x="${gx + 20}" y="260" font-size="11" fill="${P.brown}">today</text>
<circle cx="${gx + 80}" cy="256" r="3.2" fill="${T.peachShade}" stroke="${P.dark}" stroke-width="1.2"/>
<text class="mono" x="${gx + 88}" y="260" font-size="11" fill="${P.brown}">my birthday</text>`;

  // stat boxes
  const plural = (n, word) => `${word}${n === 1 ? '' : 's'}`;
  const longestFrom = s.longest.end ? new Date(utc(s.longest.end) - (s.longest.len - 1) * dayMs).toISOString().slice(0, 10) : null;
  const boxes = [
    ['TOTAL', String(calendar.totalContributions), [plural(calendar.totalContributions, 'contribution'), 'contribs', '']],
    ['STREAK', String(s.current), [`${plural(s.current, 'day')} now`, plural(s.current, 'day')]],
    ['LONGEST', String(s.longest.len), s.longest.len > 1 ? [dateRange(longestFrom, s.longest.end), 'days'] : [plural(s.longest.len, 'day')]],
    ['BEST DAY', String(s.best?.contributionCount ?? 0), [s.best ? shortDate(s.best.date) : 'soon!']],
    birthdayMode ? ['BIRTHDAY', 'today!', ['hbd ♥', '']] : ['BIRTHDAY', String(untilBirthday), [`${plural(untilBirthday, 'day')} to go`, plural(untilBirthday, 'day')]],
  ];
  const bw = 156;
  const gap = (822 - bw * 5) / 4;
  const statBoxes = boxes.map(([label, value, units], i) => {
    const bx = round(35 + i * (bw + gap));
    const by = 272;
    const isBday = label === 'BIRTHDAY';
    const valueW = value.length * 24 * 0.62;
    // first unit wording that fits beside the number (monospace ~0.62em per character)
    const unit = units.find((u) => 18 + valueW + u.length * 11.5 * 0.62 <= bw - 8) ?? '';
    return `<g class="stat" style="animation-delay:${round(1.1 + i * 0.12)}s">
<rect x="${bx}" y="${by}" width="${bw}" height="54" rx="10" fill="${isBday ? '#FBE3D8' : T.paper}" stroke="${P.dark}" stroke-width="2.5"/>
${pixelLabel(label, { x: bx + 12, y: by + 9, size: 2, fill: isBday ? T.peachShade : P.teal }).svg}
<text class="mono" x="${bx + 12}" y="${by + 45}" font-size="24" font-weight="700" fill="${P.dark}">${esc(value)}</text>
<text class="mono" x="${round(bx + 18 + valueW)}" y="${by + 44}" font-size="11.5" fill="${P.brown}">${esc(unit)}</text>
${isBday ? `<g class="${birthdayMode ? 'party' : 'wiggle'}">${iconCake().svg(bx + bw - 34, by + 8, 2)}</g>` : ''}
</g>`;
  }).join('');

  // the otter paddling along the surface above the calendar
  const otter = `<g class="swim"><g transform="translate(0 58)"><g class="bob">${otterFloat().svg(0, 0, 3)}<g class="blink">${otterFloatBlink().svg(0, 0, 3)}</g></g></g></g>`;

  // birthday confetti
  let confetti = '';
  if (birthdayMode) {
    const colors = [P.teal, P.blue, T.peach, P.brown, T.peachShade];
    for (let i = 0; i < 36; i++) {
      const x = round(20 + random() * (W - 40));
      const dur = round(3 + random() * 3);
      confetti += `<rect class="confetti" style="animation-duration:${dur}s;animation-delay:${round(-random() * dur)}s" x="${x}" y="-12" width="${random() > 0.5 ? 6 : 4}" height="${random() > 0.5 ? 10 : 6}" rx="1" fill="${colors[i % colors.length]}"/>`;
    }
  }

  const style = `
.cell { animation: pop .55s cubic-bezier(.3, 1.7, .5, 1) both; transform-box: fill-box; transform-origin: center; }
@keyframes pop { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.tide { animation: tide 3.2s ease-in-out infinite; }
@keyframes tide { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
.shine { animation: shine 2.6s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes shine { 0%, 100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }
.today { animation: today 1.6s ease-in-out infinite; }
@keyframes today { 0%, 100% { opacity: 1; } 50% { opacity: .3; } }
.stat { animation: rise .6s ease-out both; }
@keyframes rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.swim { animation: swim 30s linear -6s infinite; }
@keyframes swim { from { transform: translateX(-110px); } to { transform: translateX(${W + 10}px); } }
.bob { animation: bob 2.8s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
@keyframes bob { 0%, 100% { transform: translateY(0) rotate(-2.5deg); } 50% { transform: translateY(4px) rotate(2.5deg); } }
.blink { opacity: 0; animation: blink 4.2s infinite; }
@keyframes blink { 0%, 90%, 96%, 100% { opacity: 0; } 91%, 95% { opacity: 1; } }
.wiggle { animation: wiggle 2.4s ease-in-out infinite; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes wiggle { 0%, 70%, 100% { transform: rotate(0); } 78% { transform: rotate(-8deg); } 86% { transform: rotate(8deg); } }
.party { animation: party .5s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
@keyframes party { from { transform: translateY(0) rotate(-6deg); } to { transform: translateY(-4px) rotate(6deg); } }
.confetti { animation: confetti linear infinite; transform-box: fill-box; transform-origin: center; }
@keyframes confetti { from { transform: translateY(0) rotate(0); } to { transform: translateY(${H + 30}px) rotate(540deg); } }`;

  const defs = `${DOTS}<clipPath id="inner"><rect x="12" y="24" width="868" height="314" rx="16"/></clipPath>`;

  const body = `
${panel(10, 22, 872, 318)}
${tab(30, 4, birthdayMode ? 'BIRTHDAY TIDE ♥' : 'TIDE LOG')}
<text class="mono" x="858" y="50" font-size="12" fill="${P.brown}" text-anchor="end">@${esc(login)} · contributions, last 12 months</text>
<g clip-path="url(#inner)">
  <g>${drift(60, 7)}<path d="${wave(100, 3, 60, { bottom: 116 })}" fill="${T.sky}"/></g>
  ${otter}
  <g>${drift(80, 5, 1)}<path d="${wave(106, 3, 80, { bottom: 116 })}" fill="${T.mist}"/></g>
</g>
${months}
${weekdays}
${grid}
${marks}
${legend}
${statBoxes}
${confetti}`;

  const bdayText = birthdayMode ? "it's my birthday today" : `${untilBirthday} ${plural(untilBirthday, 'day')} until my birthday`;
  return doc(W, H, {
    title: `${login} — contribution tide log`,
    desc: `${calendar.totalContributions} contributions in the last year across ${s.active} active days. Current streak ${s.current} ${plural(s.current, 'day')}, longest ${s.longest.len}. ${bdayText}. A sea otter paddles over the calendar while the squares roll like waves.`,
    style, defs, body,
  });
}

// ---------------------------------------------------------------------------

const args = parseArgs(process.argv.slice(2));
const login = args.user || process.env.GITHUB_REPOSITORY_OWNER || 'p3achii';
const today = args.today || todayIn(TIMEZONE);
const out = args.out || 'dist/contributions.svg';

const calendar = args.data ? loadCalendar(args.data) : await fetchCalendar(login);
const svg = render(calendar, { login, today });
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${(svg.length / 1024).toFixed(1)} KB) — ${calendar.totalContributions} contributions, today ${today}`);
