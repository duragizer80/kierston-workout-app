/**
 * Build a derived mapping for unique trainer exercise strings → body/equipment tags
 * and optional “standard name” labels. Heuristics + a small ExerciseDB-style seed list.
 * Does NOT download or vendor openGym media. Re-run: node scripts/build-exercise-map.mjs
 *
 * Body tags are fine-grained (biceps/triceps/quads/…) — best-effort from names.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const workouts = JSON.parse(
  readFileSync(join(root, 'src/data/workouts.json'), 'utf8'),
)

/**
 * @typedef {'Chest'|'Shoulders'|'Biceps'|'Triceps'|'Core'|'Upper back'|'Lower back'|'Quads'|'Hamstrings'|'Glutes'|'Calves'|'Cardio'} BodyTag
 * @typedef {'Kettlebell'|'Barbell'|'Dumbbell'|'TRX'|'Cable'|'Machine'|'Stairs'|'Rope'|'BOSU'|'Med ball'|'Rowing'|'Bodyweight'} EquipTag
 */

/** Small seed catalogue — public ExerciseDB-style names/metadata only (no media). */
const SEED = [
  { name: 'barbell squat', body: ['Quads', 'Glutes'], equip: ['Barbell'] },
  { name: 'goblet squat', body: ['Quads', 'Glutes'], equip: ['Kettlebell', 'Dumbbell'] },
  { name: 'bulgarian split squat', body: ['Quads', 'Glutes'], equip: ['Dumbbell'] },
  { name: 'walking lunge', body: ['Quads', 'Glutes'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'forward lunge', body: ['Quads', 'Glutes'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'reverse lunge', body: ['Quads', 'Glutes'], equip: ['Dumbbell', 'Bodyweight'] },
  { name: 'romanian deadlift', body: ['Hamstrings', 'Lower back', 'Glutes'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'deadlift', body: ['Hamstrings', 'Lower back', 'Glutes'], equip: ['Barbell', 'Kettlebell'] },
  { name: 'hip thrust', body: ['Glutes'], equip: ['Barbell'] },
  { name: 'leg press', body: ['Quads', 'Glutes'], equip: ['Machine'] },
  { name: 'calf raise', body: ['Calves'], equip: ['Machine', 'Bodyweight'] },
  { name: 'step up', body: ['Quads', 'Glutes'], equip: ['Dumbbell', 'Kettlebell'] },
  { name: 'kettlebell swing', body: ['Glutes', 'Hamstrings', 'Core'], equip: ['Kettlebell'] },
  { name: 'kb swing', body: ['Glutes', 'Hamstrings', 'Core'], equip: ['Kettlebell'] },
  { name: 'woodchop', body: ['Core'], equip: ['Cable', 'Med ball'] },
  { name: 'wall sit', body: ['Quads', 'Core'], equip: ['Bodyweight'] },
  { name: 'leg extension', body: ['Quads'], equip: ['Machine'] },
  { name: 'caterpillar', body: ['Core', 'Shoulders'], equip: ['Bodyweight'] },
  { name: 'ice skater', body: ['Quads', 'Glutes', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'push up', body: ['Chest', 'Triceps'], equip: ['Bodyweight'] },
  { name: 'bench press', body: ['Chest', 'Triceps'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'chest fly', body: ['Chest'], equip: ['Cable', 'Dumbbell'] },
  { name: 'chest press', body: ['Chest', 'Triceps'], equip: ['Machine', 'Dumbbell', 'Cable'] },
  { name: 'pull up', body: ['Upper back', 'Biceps'], equip: ['Bodyweight'] },
  { name: 'chin up', body: ['Upper back', 'Biceps'], equip: ['Bodyweight'] },
  { name: 'lat pulldown', body: ['Upper back'], equip: ['Cable', 'Machine'] },
  { name: 'seated row', body: ['Upper back'], equip: ['Cable', 'Machine'] },
  { name: 'bent over row', body: ['Upper back'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'face pull', body: ['Shoulders', 'Upper back'], equip: ['Cable'] },
  { name: 'facepull', body: ['Shoulders', 'Upper back'], equip: ['Cable'] },
  { name: 'pullover', body: ['Upper back', 'Chest'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'pulldown', body: ['Upper back'], equip: ['Cable', 'Machine'] },
  { name: 'suicide', body: ['Cardio', 'Quads'], equip: ['Bodyweight'] },
  { name: 'ball throw', body: ['Shoulders', 'Core'], equip: ['Med ball'] },
  { name: 'overhead press', body: ['Shoulders', 'Triceps'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'lateral raise', body: ['Shoulders'], equip: ['Dumbbell'] },
  { name: 'front raise', body: ['Shoulders'], equip: ['Dumbbell'] },
  { name: 'archer press', body: ['Shoulders'], equip: ['Dumbbell', 'TRX'] },
  { name: 'bicep curl', body: ['Biceps'], equip: ['Dumbbell', 'Barbell', 'Cable'] },
  { name: 'hammer curl', body: ['Biceps'], equip: ['Dumbbell'] },
  { name: 'tricep extension', body: ['Triceps'], equip: ['Dumbbell', 'Cable'] },
  { name: 'tricep pushdown', body: ['Triceps'], equip: ['Cable'] },
  { name: 'skull crusher', body: ['Triceps'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'plank', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'russian twist', body: ['Core'], equip: ['Bodyweight', 'Med ball'] },
  { name: 'cable woodchop', body: ['Core'], equip: ['Cable'] },
  { name: 'pallof press', body: ['Core'], equip: ['Cable'] },
  { name: 'sit up', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'crunch', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'burpee', body: ['Cardio', 'Quads', 'Chest'], equip: ['Bodyweight'] },
  { name: 'jumping jack', body: ['Cardio'], equip: ['Bodyweight'] },
  { name: 'ball slam', body: ['Cardio', 'Core'], equip: ['Med ball'] },
  { name: 'battle rope', body: ['Cardio', 'Shoulders'], equip: ['Rope'] },
  { name: 'stair climb', body: ['Cardio', 'Quads', 'Calves'], equip: ['Stairs'] },
  { name: 'rower', body: ['Cardio', 'Upper back'], equip: ['Rowing'] },
  { name: 'trx row', body: ['Upper back'], equip: ['TRX'] },
  { name: 'trx push up', body: ['Chest', 'Triceps'], equip: ['TRX'] },
  { name: 'farmer walk', body: ['Core', 'Shoulders'], equip: ['Dumbbell', 'Kettlebell'] },
  { name: 'wall ball', body: ['Quads', 'Shoulders'], equip: ['Med ball'] },
  { name: 'box jump', body: ['Quads', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'mountain climber', body: ['Core', 'Cardio'], equip: ['Bodyweight'] },
  { name: 'renegade row', body: ['Upper back', 'Core'], equip: ['Dumbbell'] },
  { name: 'reverse fly', body: ['Upper back', 'Shoulders'], equip: ['Dumbbell'] },
  { name: 'shrug', body: ['Shoulders', 'Upper back'], equip: ['Dumbbell', 'Barbell'] },
  { name: 'good morning', body: ['Hamstrings', 'Lower back'], equip: ['Barbell'] },
  { name: 'sumo squat', body: ['Quads', 'Glutes'], equip: ['Kettlebell', 'Barbell'] },
  { name: 'thruster', body: ['Quads', 'Shoulders'], equip: ['Barbell', 'Dumbbell'] },
  { name: 'clean', body: ['Quads', 'Shoulders'], equip: ['Barbell', 'Kettlebell'] },
  { name: 'snatch', body: ['Quads', 'Shoulders'], equip: ['Kettlebell', 'Barbell'] },
  { name: 'turkish get up', body: ['Core', 'Shoulders'], equip: ['Kettlebell'] },
  { name: 'bosu squat', body: ['Quads', 'Core'], equip: ['BOSU'] },
  { name: 'bosu plank', body: ['Core'], equip: ['BOSU'] },
  { name: 'glute bridge', body: ['Glutes', 'Hamstrings'], equip: ['Bodyweight'] },
  { name: 'leg raise', body: ['Core'], equip: ['Bodyweight'] },
  { name: 'tricep dip', body: ['Triceps'], equip: ['Bodyweight'] },
]

const BODY_RULES = [
  {
    tag: 'Biceps',
    test: (h) => /bicep|hammer curl|\bcurls?\b/i.test(h) && !/leg curl/i.test(h),
  },
  {
    tag: 'Triceps',
    test: (h) =>
      /tricep|triep|skull\s*crush|press[- ]?down|pushdown|\bdips?\b/i.test(h) ||
      (/push[- ]?ups?/i.test(h) && !/pull[- ]?ups?/i.test(h)),
  },
  {
    tag: 'Quads',
    test: (h) =>
      /squat|lunge|leg press|leg extension|step[- ]?up|wall sit|bulgarian|powerup|granny lunge|farmer squat|prisoner squat/i.test(
        h,
      ),
  },
  {
    tag: 'Hamstrings',
    test: (h) =>
      /hamstring|rdl|romanian|deadlift|good morning|leg curl|nordic|single[- ]?leg(?:ged)?\s*dead/i.test(
        h,
      ),
  },
  {
    tag: 'Glutes',
    test: (h) =>
      /glute|hip thrust|bridge|kickback|abduction|sumo|\bswings?\b|thrust back/i.test(
        h,
      ),
  },
  {
    tag: 'Calves',
    test: (h) => /calf|calves/i.test(h),
  },
  {
    tag: 'Upper back',
    test: (h) =>
      /\brows?\b|pulldown|pull[- ]?downs?|pull[- ]?ups?|chin[- ]?ups?|lat\b|renegade|face\s*pull|pullover|t[- ]?bar|shotgun|shrug/i.test(
        h,
      ),
  },
  {
    tag: 'Lower back',
    test: (h) =>
      /hyperextension|back extension|good morning|superman|deadlift|romanian|\brdl\b/i.test(
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
      /overhead|lateral raise|front raise|archer|shoulder|military press|\bohp\b|delt|y[- ]raise|snatch|clean/i.test(
        h,
      ),
  },
  {
    tag: 'Core',
    test: (h) =>
      /plank|twist|tuck|crunch|\bab\b|abs\b|core|hollow|dead bug|pallof|v[- ]up|sit[- ]?up|torso|reach[- ]?up|wood\s*chops?|side to side|wall sit|leg raise/i.test(
        h,
      ),
  },
  {
    tag: 'Cardio',
    test: (h) =>
      /stair|rowing|rower|burpee|jacks|sprint|cardio|jumping jack|elf jack|flutter|slam|rope|psycho|syko|mt\.?\s*climber|mountain climber|ice\s*skater|caterpillar|suicide/i.test(
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
    equipment = [
      ...new Set([
        ...best.equip.filter((e) => equipH.includes(e) || bestScore >= 0.8),
        ...equipH,
      ]),
    ]
    if (!equipment.length) equipment = [...equipH]
    if (!equipment.length && bestScore >= 0.8) equipment = [...best.equip]
    match = bestScore >= 0.85 ? 'exactish' : 'fuzzy'
    score = Math.round(bestScore * 100) / 100
    matched++
  } else if (!body.length && !equipment.length) {
    if (/\//.test(name) || /into /.test(norm)) {
      body = ['Cardio']
      match = 'compound-heuristic'
    }
  }

  const OVERRIDES = {
    'Andrzej Specials': {
      standardName: null,
      body: ['Cardio', 'Quads'],
      equipment: ['Bodyweight'],
    },
    'Andrzej specials': {
      standardName: null,
      body: ['Cardio', 'Quads'],
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
      body: ['Shoulders', 'Upper back'],
      equipment: ['Cable'],
    },
    'pull-overs': {
      standardName: 'Pullover',
      body: ['Upper back', 'Chest'],
      equipment: ['Dumbbell'],
    },
    pulldwns: {
      standardName: 'Lat Pulldown',
      body: ['Upper back'],
      equipment: ['Cable', 'Machine'],
    },
    suicides: {
      standardName: null,
      body: ['Cardio', 'Quads'],
      equipment: ['Bodyweight'],
    },
    'Roman chair leg raises': {
      standardName: 'Leg Raise',
      body: ['Core'],
      equipment: ['Bodyweight'],
    },
    'Single Legged Bridge Raises': {
      standardName: 'Glute Bridge',
      body: ['Glutes', 'Hamstrings', 'Core'],
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
      'Derived mapping for Kierston trainer exercise strings. Seed names/body/equipment inspired by public ExerciseDB-style catalogue metadata (text only). Not a wholesale ExerciseDB dump. No openGym / Gym visual media. Fine muscle tags are best-effort from exercise names.',
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
