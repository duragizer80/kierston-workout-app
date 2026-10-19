/**
 * Build a derived mapping for unique trainer exercise strings → body/equipment tags
 * and optional “standard name” labels. Heuristics + a small ExerciseDB-style seed list.
 * Does NOT download or vendor openGym media. Re-run: node scripts/build-exercise-map.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const workouts = JSON.parse(
  readFileSync(join(root, 'src/data/workouts.json'), 'utf8'),
)

/** @typedef {'Arms'|'Legs'|'Back'|'Chest'|'Shoulders'|'Core'|'Cardio'} BodyTag */
/** @typedef {'Kettlebell'|'Barbell'|'Dumbbell'|'TRX'|'Cable'|'Machine'|'Stairs'|'Rope'|'BOSU'|'Med ball'|'Rowing'|'Bodyweight'} EquipTag */

/** Small seed catalogue — public ExerciseDB-style names/metadata only (no media). */
const SEED = [
  { name: 'barbell squat', body: ['Legs'], equip: ['Barbell'] },
  { name: 'goblet squat', body: ['Legs'], equip: ['Kettlebell', 'Dumbbell'] },
  { name: 'bulgarian split squat', body: ['Legs'], equip: ['Dumbbell'] },
  { name: 'walking lunge', body: ['Legs'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'forward lunge', body: ['Legs'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'reverse lunge', body: ['Legs'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'romanian deadlift', body: ['Legs', 'Back'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'deadlift', body: ['Legs', 'Back'], equip: ['Barbell', 'Kettlebell'] },
  { name: 'hip thrust', body: ['Legs'], equip: ['Barbell'] },
  { name: 'leg press', body: ['Legs'], equip: ['Machine'] },
  { name: 'calf raise', body: ['Legs'], equip: ['Machine', 'Bodyweight'] },
  { name: 'step up', body: ['Legs'], equip: ['Dumbbell', 'Kettlebell'] },
  { name: 'kettlebell swing', body: ['Legs', 'Core'], equip: ['Kettlebell'] },
  { name: 'kb swing', body: ['Legs', 'Core'], equip: ['Kettlebell'] },
  { name: 'woodchop', body: ['Core'], equip: ['Cable', 'Med ball'] },
  { name: 'wall sit', body: ['Legs'], equip: ['Bodyweight'] },
  { name: 'leg extension', body: ['Legs'], equip: ['Machine'] },
  { name: 'caterpillar', body: ['Core', 'Arms'], equip: ['Bodyweight'] },
  { name: 'ice skater', body: ['Legs', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'push up', body: ['Chest', 'Arms'], equip: ['Bodyweight'] },
  { name: 'bench press', body: ['Chest'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'chest fly', body: ['Chest'], equip: ['Cable', 'Dumbbell'] },
  { name: 'chest press', body: ['Chest'], equip: ['Machine', 'Dumbbell', 'Cable'] },
  { name: 'pull up', body: ['Back', 'Arms'], equip: ['Bodyweight'] },
  { name: 'chin up', body: ['Back', 'Arms'], equip: ['Bodyweight'] },
  { name: 'lat pulldown', body: ['Back'], equip: ['Cable', 'Machine'] },
  { name: 'seated row', body: ['Back'], equip: ['Cable', 'Machine'] },
  { name: 'bent over row', body: ['Back'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'face pull', body: ['Shoulders', 'Back'], equip: ['Cable'] },
  { name: 'facepull', body: ['Shoulders', 'Back'], equip: ['Cable'] },
  { name: 'pullover', body: ['Back', 'Chest'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'pulldown', body: ['Back'], equip: ['Cable', 'Machine'] },
  { name: 'suicide', body: ['Cardio', 'Legs'], equip: ['Bodyweight'] },
  { name: 'ball throw', body: ['Shoulders', 'Core'], equip: ['Med ball'] },
  { name: 'overhead press', body: ['Shoulders'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'lateral raise', body: ['Shoulders'], equip: ['Dumbbell'] },
  { name: 'front raise', body: ['Shoulders'], equip: ['Dumbbell'] },
  { name: 'archer press', body: ['Shoulders'], equip: ['Dumbbell', 'TRX'] },
  { name: 'bicep curl', body: ['Arms'], equip: ['Dumbbell', 'Barbell', 'Cable'] },
  { name: 'hammer curl', body: ['Arms'], equip: ['Dumbbell'] },
  { name: 'tricep extension', body: ['Arms'], equip: ['Dumbbell', 'Cable'] },
  { name: 'tricep pushdown', body: ['Arms'], equip: ['Cable'] },
  { name: 'skull crusher', body: ['Arms'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'plank', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'russian twist', body: ['Core'], equip: ['Bodyweight', 'Med ball'] },
  { name: 'cable woodchop', body: ['Core'], equip: ['Cable'] },
  { name: 'pallof press', body: ['Core'], equip: ['Cable'] },
  { name: 'sit up', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'crunch', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'burpee', body: ['Cardio', 'Legs'], equip: ['Bodyweight'] },
  { name: 'jumping jack', body: ['Cardio'], equip: ['Bodyweight'] },
  { name: 'ball slam', body: ['Cardio', 'Core'], equip: ['Med ball'] },
  { name: 'battle rope', body: ['Cardio', 'Arms'], equip: ['Rope'] },
  { name: 'stair climb', body: ['Cardio', 'Legs'], equip: ['Stairs'] },
  { name: 'rower', body: ['Cardio', 'Back'], equip: ['Rowing'] },
  { name: 'trx row', body: ['Back'], equip: ['TRX'] },
  { name: 'trx push up', body: ['Chest'], equip: ['TRX'] },
  { name: 'farmer walk', body: ['Legs', 'Core'], equip: ['Dumbbell', 'Kettlebell'] },
  { name: 'wall ball', body: ['Legs', 'Shoulders'], equip: ['Med ball'] },
  { name: 'box jump', body: ['Legs', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'mountain climber', body: ['Core', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'renegade row', body: ['Back', 'Core'], equip: ['Dumbbell'] },
  { name: 'pullover', body: ['Back', 'Chest'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'reverse fly', body: ['Back', 'Shoulders'], equip: ['Dumbbell'] },
  { name: 'shrug', body: ['Shoulders', 'Back'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'good morning', body: ['Legs', 'Back'], equip: ['Barbell'] },
  { name: 'sumo squat', body: ['Legs'], equip: ['Kettlebell', 'Barbell'] },
  { name: 'thruster', body: ['Legs', 'Shoulders'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'clean', body: ['Legs', 'Shoulders'], equip: ['Barbell', 'Kettlebell'] },
  { name: 'snatch', body: ['Legs', 'Shoulders'], equip: ['Kettlebell', 'Barbell'] },
  { name: 'turkish get up', body: ['Core', 'Shoulders'], equip: ['Kettlebell'] },
  { name: 'bosu squat', body: ['Legs', 'Core'], equip: ['BOSU'] },
  { name: 'bosu plank', body: ['Core'], equip: ['BOSU'] },
]

const BODY_RULES = [
  {
    tag: 'Arms',
    test: (h) =>
      /curl|tricep|press[- ]?down|bicep|hammer curl|skull\s*crush|pushdown/i.test(h),
  },
  {
    tag: 'Legs',
    test: (h) =>
      /squat|lunge|deadlift|step[- ]?up|stair|leg press|glute|hamstring|calf|hip thrust|\brdl\b|bulgarian|sumo|powerup|iceskater|ice\s*skater|farmer squat|granny lunge|wall sit|leg extension|\bswings?\b/i.test(
        h,
      ),
  },
  {
    tag: 'Back',
    test: (h) =>
      /\brows?\b|pulldown|pull[- ]?downs?|pull[- ]?ups?|chin[- ]?ups?|lat\b|renegade|face pull|pullover|tbar|shotgun/i.test(
        h,
      ),
  },
  {
    tag: 'Chest',
    test: (h) => {
      if (
        /push[- ]?ups?|chest|\bbench\b|\bflys?\b|\bflies\b|\bpecs?\b/i.test(h)
      )
        return true
      return (
        /\bpress(es|ing)?\b/i.test(h) &&
        !/overhead|shoulder|military|\bohp\b|leg press|press[- ]?down|archer|tricep/i.test(
          h,
        )
      )
    },
  },
  {
    tag: 'Shoulders',
    test: (h) =>
      /overhead|lateral raise|front raise|archer|shoulder|military press|\bohp\b|delt|y[- ]raise/i.test(
        h,
      ),
  },
  {
    tag: 'Core',
    test: (h) =>
      /plank|twist|tuck|crunch|\bab\b|abs\b|core|hollow|dead bug|pallof|v[- ]up|sit[- ]?up|torso|reach[- ]?up|wood\s*chops?|side to side|wall sit/i.test(
        h,
      ),
  },
  {
    tag: 'Cardio',
    test: (h) =>
      /stair|rowing|rower|burpee|jacks|sprint|cardio|jumping jack|elf jack|flutter|slam|rope|psycho|syko|mt\.?\s*climber|mountain climber|ice\s*skater|caterpillar/i.test(
        h,
      ),
  },
]

const EQUIP_RULES = [
  { tag: 'Kettlebell', test: (h) => /kettlebell|\bkb\b|\bks\b/i.test(h) },
  { tag: 'Barbell', test: (h) => /barbell|\bbb\b|\bbar\b/i.test(h) },
  { tag: 'Dumbbell', test: (h) => /dumbbell|\bdbs?\b|\bhs\b/i.test(h) },
  { tag: 'TRX', test: (h) => /\btrx\b|rip trainer/i.test(h) },
  { tag: 'Cable', test: (h) => /cable/i.test(h) },
  {
    tag: 'Machine',
    test: (h) =>
      /machine|pulldown|pull[- ]?down|leg press|smith|hack squat|seated row|\bhs\b|leg extension/i.test(
        h,
      ),
  },
  { tag: 'Stairs', test: (h) => /stair/i.test(h) },
  { tag: 'Rope', test: (h) => /\brope\b/i.test(h) },
  { tag: 'BOSU', test: (h) => /bosu|bosy/i.test(h) },
  {
    tag: 'Med ball',
    test: (h) =>
      /med(?:icine)?\s*ball|ball slam|medball|wall ball|ball throw|lacrosse/i.test(h),
  },
  { tag: 'Rowing', test: (h) => /rowing|rower/i.test(h) },
  {
    tag: 'Bodyweight',
    test: (h) =>
      /bodyweight|\bbw\b|push[- ]?ups?|pull[- ]?ups?|chin[- ]?ups?|plank|burpee|jacks|walking lunges?|caterpillar|elf jack|wall sit|mt\.?\s*climber|mountain climber|psycho|syko|ice\s*skater/i.test(
        h,
      ),
  },
]

function normalize(s) {
  return s
    .toLowerCase()
    .replace(/[""''—–]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(s) {
  return normalize(s)
    .split(' ')
    .filter((t) => t.length > 1 && !/^\d+$/.test(t))
}

function scoreMatch(nameNorm, seedNorm) {
  if (nameNorm === seedNorm) return 1
  if (nameNorm.includes(seedNorm) || seedNorm.includes(nameNorm)) return 0.85
  const a = new Set(tokens(nameNorm))
  const b = new Set(tokens(seedNorm))
  if (!a.size || !b.size) return 0
  let inter = 0
  for (const t of a) if (b.has(t)) inter++
  const union = a.size + b.size - inter
  const jaccard = inter / union
  // Prefer seed tokens being covered
  const recall = inter / b.size
  return Math.max(jaccard, recall * 0.9)
}

function heuristicBody(hay) {
  return BODY_RULES.filter(({ test }) => test(hay)).map(({ tag }) => tag)
}

function heuristicEquip(hay) {
  return EQUIP_RULES.filter(({ test }) => test(hay)).map(({ tag }) => tag)
}

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

const names = new Set()
for (const w of workouts) {
  for (const e of w.exercises) names.add(e.name)
}

/** @type {Record<string, { standardName: string|null, body: string[], equipment: string[], match: string, score: number }>} */
const map = {}
let matched = 0

for (const name of [...names].sort()) {
  const hay = name
  const norm = normalize(name)
  let best = null
  let bestScore = 0
  for (const seed of SEED) {
    const sc = scoreMatch(norm, normalize(seed.name))
    if (sc > bestScore) {
      bestScore = sc
      best = seed
    }
  }

  const bodyH = heuristicBody(hay)
  const equipH = heuristicEquip(hay)

  let standardName = null
  let body = bodyH
  let equipment = equipH
  let match = 'heuristic'
  let score = 0

  if (best && bestScore >= 0.55) {
    standardName = titleCase(best.name)
    body = [...new Set([...best.body, ...bodyH])]
    equipment = [...new Set([...best.equip.filter((e) => equipH.includes(e) || bestScore >= 0.8), ...equipH])]
    if (!equipment.length) equipment = [...equipH]
    if (!equipment.length && bestScore >= 0.8) equipment = [...best.equip]
    match = bestScore >= 0.85 ? 'exactish' : 'fuzzy'
    score = Math.round(bestScore * 100) / 100
    matched++
  } else if (!body.length && !equipment.length) {
    // compounds / circuits — tag cardio if slash-heavy
    if (/\//.test(name) || /into /.test(norm)) {
      body = ['Cardio']
      match = 'compound-heuristic'
    }
  }

  // Manual overrides for trainer nicknames / OCR typos with no useful seed hit
  const OVERRIDES = {
    'Andrzej Specials': {
      standardName: null,
      body: ['Cardio', 'Legs'],
      equipment: ['Bodyweight'],
    },
    'Andrzej specials': {
      standardName: null,
      body: ['Cardio', 'Legs'],
      equipment: ['Bodyweight'],
    },
    'Behind the head ball throws': {
      standardName: 'Ball Throw',
      body: ['Shoulders', 'Core'],
      equipment: ['Med ball'],
    },
    'Rip trainer lacrosse throws': {
      standardName: null,
      body: ['Shoulders', 'Core'],
      equipment: ['TRX', 'Med ball'],
    },
    facepulls: {
      standardName: 'Face Pull',
      body: ['Shoulders', 'Back'],
      equipment: ['Cable'],
    },
    'pull-overs': {
      standardName: 'Pullover',
      body: ['Back', 'Chest'],
      equipment: ['Dumbbell'],
    },
    pulldwns: {
      standardName: 'Lat Pulldown',
      body: ['Back'],
      equipment: ['Cable', 'Machine'],
    },
    suicides: {
      standardName: null,
      body: ['Cardio', 'Legs'],
      equipment: ['Bodyweight'],
    },
    'Roman chair leg raises': {
      standardName: 'Leg Raise',
      body: ['Core', 'Legs'],
      equipment: ['Bodyweight'],
    },
    'Single Legged Bridge Raises': {
      standardName: 'Glute Bridge',
      body: ['Legs', 'Core'],
      equipment: ['Bodyweight'],
    },
  }

  if (OVERRIDES[name]) {
    const o = OVERRIDES[name]
    standardName = o.standardName
    body = o.body
    equipment = o.equipment
    match = 'manual'
    score = 1
  }

  map[name] = {
    standardName,
    body,
    equipment,
    match,
    score,
  }
}

const out = {
  _meta: {
    source:
      'Derived mapping for Kierston trainer exercise strings. Seed names/body/equipment inspired by public ExerciseDB-style catalogue metadata (text only). Not a wholesale ExerciseDB dump. No openGym / Gym visual media.',
    licenseNote:
      'This file is original derived data for this app. Seed labels are common exercise vocabulary; do not treat as a copy of AGPL openGym catalogue JSON or licensed animations.',
    generatedAt: new Date().toISOString().slice(0, 10),
    uniqueNames: names.size,
    seedMatched: matched,
  },
  exercises: map,
}

const dest = join(root, 'src/data/exercise-map.json')
writeFileSync(dest, JSON.stringify(out, null, 2) + '\n')
console.log(
  `Wrote ${dest}: ${names.size} names, ${matched} seed-matched (${Math.round((matched / names.size) * 100)}%)`,
)
