// Everything the cards say. Edit this, then run:  node scripts/build-assets.mjs
// (the header and tide log are redrawn by the GitHub Action — see .github/workflows/contributions.yml)
import { P, T } from './lib/theme.mjs';

export const PROFILE = {
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
  // link buttons under the header (the README wraps each one in its link)
  links: [
    { file: 'link-x.svg', icon: 'x', label: 'X', handle: '@tao_p3ach', url: 'https://x.com/tao_p3ach' },
    { file: 'link-instagram.svg', icon: 'instagram', label: 'INSTAGRAM', handle: '@sxph_.tcha', url: 'https://www.instagram.com/sxph_.tcha/' },
    { file: 'link-discord.svg', icon: 'discord', label: 'DISCORD', handle: 'tao_zi.' },
  ],
  // artwork lives in assets/art/ (web-sized copies)
  art: {
    featured: 'forest.webp',
    sticker: 'sticker.webp',
    creatures: ['mushroom-red.webp', 'mushroom-brown.webp'],
    characters: ['elf-1.webp', 'elf-2.webp', 'elf-3.webp', 'elf-4.webp'],
  },
};
