// Draws the header for the current season. Runs daily in GitHub Actions.
//
//   node scripts/header.mjs --out dist/header.svg
//
// Options:  --today YYYY-MM-DD           pretend it's this date
//           --season spring|summer|autumn|winter   force a season (for previews)
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { PROFILE } from './profile.mjs';
import { header } from './lib/header.mjs';
import { seasonOf, todayIn } from './lib/time.mjs';

const args = {};
const argv = process.argv.slice(2);
for (let i = 0; i < argv.length; i += 2) {
  if (!argv[i].startsWith('--')) throw new Error(`unexpected argument: ${argv[i]}`);
  args[argv[i].slice(2)] = argv[i + 1];
}

const season = args.season || seasonOf(args.today || todayIn());
const out = args.out || 'dist/header.svg';
const svg = header(PROFILE, season);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, svg);
console.log(`wrote ${out} (${(svg.length / 1024).toFixed(1)} KB) — ${season}`);
