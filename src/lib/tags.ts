import {
  exerciseBodyTags,
  exerciseEquipmentTags,
} from './exerciseMap'
import type { Workout } from '../types'

/** Fine-grained body filters (MuscleWiki-style). Cardio is chip-only, not on the map. */
export const BODY_TAGS = [
  'Chest',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Core',
  'Upper back',
  'Lower back',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Cardio',
] as const

export type BodyTag = (typeof BODY_TAGS)[number]

/** Legend / chip grouping for the body map UI. */
export const BODY_TAG_GROUPS: {
  label: string
  tags: BodyTag[]
}[] = [
  {
    label: 'Upper body',
    tags: [
      'Chest',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Core',
      'Upper back',
      'Lower back',
    ],
  },
  {
    label: 'Lower body',
    tags: ['Quads', 'Hamstrings', 'Glutes', 'Calves'],
  },
]

export const EQUIPMENT_TAGS = [
  'Kettlebell',
  'Barbell',
  'Dumbbell',
  'TRX',
  'Cable',
  'Machine',
  'Stairs',
  'Rope',
  'BOSU',
  'Med ball',
  'Rowing',
  'Bodyweight',
] as const

export type EquipmentTag = (typeof EQUIPMENT_TAGS)[number]

/**
 * Best-effort cues from exercise name / load_notes.
 * Compounds get primary + secondary muscles (e.g. rows → Biceps, presses → Triceps).
 */

/** Pulling compounds — biceps as secondary (exclude face-pull / pullover / shrug / fly). */
function isPullCompound(hay: string): boolean {
  if (
    /face\s*pull|facepull|pullover|pull[- ]?over|shrug|\bflys?\b|\bflies\b/i.test(
      hay,
    )
  )
    return false
  if (/rowing|rower/i.test(hay)) return true
  return (
    (/\brows?\b/i.test(hay) && !/throw/i.test(hay)) ||
    /pulldown|pull[- ]?downs?|pull[- ]?ups?|chin[- ]?ups?|renegade|\blat\b|shotgun/i.test(
      hay,
    )
  )
}

/** Horizontal/vertical presses — not pallof / leg press / fly. */
function isPressCompound(hay: string): boolean {
  if (
    /pallof|paloff|leg press|press[- ]?down|pushdown|\bflys?\b|\bflies\b/i.test(
      hay,
    )
  )
    return false
  return (
    /\bpress(es|ing)?\b/i.test(hay) ||
    /push[- ]?ups?/i.test(hay) ||
    /\bdips?\b/i.test(hay)
  )
}

const BODY_RULES: { tag: BodyTag; test: (hay: string) => boolean }[] = [
  {
    tag: 'Biceps',
    test: (hay) =>
      (/bicep|hammer curl|\bcurls?\b/i.test(hay) && !/leg curl/i.test(hay)) ||
      isPullCompound(hay),
  },
  {
    tag: 'Triceps',
    test: (hay) =>
      /tricep|triep|skull\s*crush|press[- ]?down|pushdown|\bdips?\b/i.test(hay) ||
      /push[- ]?ups?/i.test(hay) ||
      isPressCompound(hay),
  },
  {
    tag: 'Quads',
    test: (hay) =>
      /squat|lunge|leg press|leg extension|step[- ]?up|wall sit|bulgarian|powerup|granny lunge|farmer squat|prisoner squat|stair/i.test(
        hay,
      ),
  },
  {
    tag: 'Hamstrings',
    test: (hay) =>
      /hamstring|rdl|romanian|deadlift|good morning|leg curl|nordic|single[- ]?leg(?:ged)?\s*dead|\bswings?\b|lunge|step[- ]?up|bulgarian|\bsquats?\b|sumo/i.test(
        hay,
      ),
  },
  {
    tag: 'Glutes',
    test: (hay) =>
      /glute|hip thrust|bridge|kickback|abduction|sumo|\bswings?\b|thrust back|squat|lunge|step[- ]?up|bulgarian|powerup|granny lunge|leg press|stair|deadlift|rdl|romanian/i.test(
        hay,
      ),
  },
  {
    tag: 'Calves',
    test: (hay) => /calf|calves|stair/i.test(hay),
  },
  {
    tag: 'Upper back',
    test: (hay) =>
      /\brows?\b|pulldown|pull[- ]?downs?|pull[- ]?ups?|chin[- ]?ups?|lat\b|renegade|face\s*pull|pullover|t[- ]?bar|shotgun|shrug|rowing|rower/i.test(
        hay,
      ),
  },
  {
    tag: 'Lower back',
    test: (hay) =>
      /hyperextension|back extension|good morning|superman|deadlift|romanian|\brdl\b/i.test(
        hay,
      ),
  },
  {
    tag: 'Chest',
    test: (hay) => {
      if (/reverse\s*fly|reverse\s*flies|rear\s*delt/i.test(hay)) return false
      if (
        /push[- ]?ups?|chest|\bbench\b|\bflys?\b|\bflies\b|\bpecs?\b/i.test(hay)
      )
        return true
      return (
        /\bpress(es|ing)?\b/i.test(hay) &&
        !/overhead|shoulder|military|\bohp\b|leg press|press[- ]?down|archer|tricep|pallof|paloff|arnold/i.test(
          hay,
        )
      )
    },
  },
  {
    tag: 'Shoulders',
    test: (hay) =>
      /overhead|lateral raise|front raise|archer|shoulder|military press|\bohp\b|delt|y[- ]raise|snatch|clean|arnold/i.test(
        hay,
      ) ||
      (isPressCompound(hay) &&
        /chest|bench|push[- ]?ups?|incline|decline|dumbbell press|hs\s+\w*\s*press/i.test(
          hay,
        )),
  },
  {
    tag: 'Core',
    test: (hay) =>
      /plank|twist|tuck|crunch|\bab\b|abs\b|core|hollow|dead bug|pallof|paloff|v[- ]up|sit[- ]?up|wood\s*chops?|torso|reach[- ]?up|wall sit|leg raise/i.test(
        hay,
      ),
  },
  {
    tag: 'Cardio',
    test: (hay) =>
      /stair|rowing|rower|burpee|jacks|sprint|cardio|jumping jack|elf jack|flutter|slam|psycho|syko|mt\.?\s*climber|mountain climber|ice\s*skater|caterpillar|suicide/i.test(
        hay,
      ),
  },
]

const EQUIPMENT_RULES: { tag: EquipmentTag; test: (hay: string) => boolean }[] = [
  { tag: 'Kettlebell', test: (hay) => /kettlebell|\bkb\b|\bks\b/i.test(hay) },
  { tag: 'Barbell', test: (hay) => /barbell|\bbb\b/i.test(hay) },
  { tag: 'Dumbbell', test: (hay) => /dumbbell|\bdbs?\b/i.test(hay) },
  { tag: 'TRX', test: (hay) => /\btrx\b|rip trainer/i.test(hay) },
  { tag: 'Cable', test: (hay) => /cable/i.test(hay) },
  {
    tag: 'Machine',
    test: (hay) =>
      /machine|pulldown|pull[- ]?down|leg press|smith|hack squat|seated row|leg extension/i.test(
        hay,
      ),
  },
  { tag: 'Stairs', test: (hay) => /stair/i.test(hay) },
  { tag: 'Rope', test: (hay) => /\brope\b/i.test(hay) },
  { tag: 'BOSU', test: (hay) => /bosu|bosy/i.test(hay) },
  {
    tag: 'Med ball',
    test: (hay) =>
      /med(?:icine)?\s*ball|ball slam|medball|wall ball|lacrosse/i.test(hay),
  },
  { tag: 'Rowing', test: (hay) => /rowing|rower/i.test(hay) },
  {
    tag: 'Bodyweight',
    test: (hay) =>
      /bodyweight|\bbw\b|push[- ]?ups?|pull[- ]?ups?|chin[- ]?ups?|plank|burpee|jacks|walking lunges?|caterpillar|elf jack|wall sit|mt\.?\s*climber|mountain climber|psycho|syko|ice\s*skater/i.test(
        hay,
      ),
  },
]

export type EraId =
  | '2020-21-return'
  | '2017-18-gmail'
  | '2017-icloud-peak'
  | 'undated'

export type EraSection = {
  id: EraId
  label: string
  blurb: string
}

export const ERA_SECTIONS: EraSection[] = [
  {
    id: '2020-21-return',
    label: '2020–21 return',
    blurb: 'Sparse iCloud sessions after the long gap',
  },
  {
    id: '2017-18-gmail',
    label: '2017–18 Gmail era',
    blurb: 'ajkfitnesstrainer@gmail.com block',
  },
  {
    id: '2017-icloud-peak',
    label: '2017 iCloud peak',
    blurb: 'Dense summer–fall programming',
  },
  {
    id: 'undated',
    label: 'Undated add-ons',
    blurb: 'Day-of-week prescriptions without a calendar date',
  },
]

function workoutHaystack(w: Workout): string {
  const bits = [w.name]
  for (const e of w.exercises) {
    bits.push(e.name)
    if (e.load_notes) bits.push(e.load_notes)
  }
  return bits.join(' ')
}

export function bodyTags(w: Workout): BodyTag[] {
  const hay = workoutHaystack(w)
  const fromRules = BODY_RULES.filter(({ test }) => test(hay)).map(({ tag }) => tag)
  const fromMap = new Set<BodyTag>()
  for (const e of w.exercises) {
    for (const t of exerciseBodyTags(e.name)) fromMap.add(t)
  }
  return Array.from(new Set([...fromRules, ...fromMap]))
}

/** Equipment tags from exercise names + load_notes (+ workout name) and catalogue map. */
export function equipmentTags(w: Workout): EquipmentTag[] {
  const hay = workoutHaystack(w)
  const fromRules = EQUIPMENT_RULES.filter(({ test }) => test(hay)).map(
    ({ tag }) => tag,
  )
  const fromMap = new Set<EquipmentTag>()
  for (const e of w.exercises) {
    for (const t of exerciseEquipmentTags(e.name)) fromMap.add(t)
  }
  return Array.from(new Set([...fromRules, ...fromMap]))
}

export function workoutEra(w: Workout): EraId {
  if (!w.date) return 'undated'
  const year = Number(w.date.slice(0, 4))
  if (year >= 2020) return '2020-21-return'
  if ((w.source_email || '').toLowerCase().includes('gmail')) return '2017-18-gmail'
  return '2017-icloud-peak'
}

export function eraLabel(id: EraId): string {
  return ERA_SECTIONS.find((e) => e.id === id)?.label ?? id
}

export function sourceLabel(w: Workout): string | null {
  const email = (w.source_email || '').toLowerCase()
  if (email.includes('icloud')) return 'iCloud'
  if (email.includes('gmail')) return 'Gmail'
  return null
}

/** Short equipment signature for card titles — no invented focus names. */
export function equipmentSignature(w: Workout, max = 2): string | null {
  const preferred: EquipmentTag[] = [
    'Stairs',
    'TRX',
    'Kettlebell',
    'Rope',
    'Cable',
    'Dumbbell',
    'BOSU',
    'Med ball',
    'Rowing',
    'Barbell',
    'Machine',
  ]
  const have = new Set(equipmentTags(w))
  const ordered = preferred.filter((t) => have.has(t))
  if (!ordered.length) return null
  return ordered.slice(0, max).join(' + ')
}

export function formatCardDate(w: Workout): string {
  if (w.date) {
    const d = new Date(`${w.date}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    }
    return w.date
  }
  if (w.email_date) {
    const d = new Date(`${w.email_date}T12:00:00`)
    if (!Number.isNaN(d.getTime())) {
      return `Email ${d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`
    }
    return `Email ${w.email_date}`
  }
  return 'Undated'
}

export function cardTitle(w: Workout): string {
  const date = formatCardDate(w)
  const sig = equipmentSignature(w)
  return sig ? `${date} · ${sig}` : date
}

export function cardSubtitle(w: Workout): string {
  const n = w.exercises.length
  const blocks = new Set(w.exercises.map((e) => e.block).filter(Boolean))
  const bits = [`${n} exercise${n === 1 ? '' : 's'}`]
  if (blocks.size) bits.push(`${blocks.size} block${blocks.size === 1 ? '' : 's'}`)
  const src = sourceLabel(w)
  if (src) bits.push(src)
  return bits.join(' · ')
}

export function sortByDateDesc(a: Workout, b: Workout): number {
  const da = a.date || a.email_date || ''
  const db = b.date || b.email_date || ''
  return db.localeCompare(da)
}

/** Chip labels — Cardio shown as "Full body / Cardio" per UX request. */
export function bodyChipLabel(tag: BodyTag): string {
  return tag === 'Cardio' ? 'Full body / Cardio' : tag
}

export function buildTagCounts(list: Workout[]): {
  body: Partial<Record<BodyTag, number>>
  equipment: Partial<Record<EquipmentTag, number>>
} {
  const body: Partial<Record<BodyTag, number>> = {}
  const equipment: Partial<Record<EquipmentTag, number>> = {}
  for (const w of list) {
    for (const t of bodyTags(w)) body[t] = (body[t] ?? 0) + 1
    for (const t of equipmentTags(w)) equipment[t] = (equipment[t] ?? 0) + 1
  }
  return { body, equipment }
}
