import type { Workout } from '../types'

export const BODY_TAGS = [
  'Arms',
  'Legs',
  'Back',
  'Chest',
  'Shoulders',
  'Core',
  'Cardio',
] as const

export type BodyTag = (typeof BODY_TAGS)[number]

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

/** Body-part cues from exercise name / load_notes only — prefer recall. */
const BODY_RULES: { tag: BodyTag; test: (hay: string) => boolean }[] = [
  {
    tag: 'Arms',
    test: (hay) =>
      /curl|tricep|press[- ]?down|bicep|hammer curl|skull\s*crush/i.test(hay),
  },
  {
    tag: 'Legs',
    test: (hay) =>
      /squat|lunge|deadlift|step[- ]?up|stair|leg press|glute|hamstring|calf|hip thrust|\brdl\b|bulgarian|sumo/i.test(
        hay,
      ),
  },
  {
    tag: 'Back',
    test: (hay) =>
      /\brows?\b|pulldown|pull[- ]?downs?|pull[- ]?ups?|chin[- ]?ups?|lat\b|renegade|face pull/i.test(
        hay,
      ),
  },
  {
    tag: 'Chest',
    test: (hay) => {
      if (/push[- ]?ups?|chest|bench|fly|flies|pec/i.test(hay)) return true
      // bare "press" only when not clearly shoulders / arms / legs
      return (
        /\bpress(es|ing)?\b/i.test(hay) &&
        !/overhead|shoulder|military|\bohp\b|leg press|press[- ]?down|archer|tricep/i.test(
          hay,
        )
      )
    },
  },
  {
    tag: 'Shoulders',
    test: (hay) =>
      /overhead|lateral raise|archer|shoulder|military press|\bohp\b|delt|y[- ]raise/i.test(
        hay,
      ),
  },
  {
    tag: 'Core',
    test: (hay) =>
      /plank|twist|tuck|crunch|\bab\b|abs\b|core|hollow|dead bug|pallof|v[- ]up|sit[- ]?up/i.test(
        hay,
      ),
  },
  {
    tag: 'Cardio',
    test: (hay) =>
      /stair|rowing|rower|burpee|jacks|sprint|cardio|jumping jack|elf jack|flutter|slam/i.test(
        hay,
      ),
  },
]

const EQUIPMENT_RULES: { tag: EquipmentTag; test: (hay: string) => boolean }[] = [
  { tag: 'Kettlebell', test: (hay) => /kettlebell|\bkb\b/i.test(hay) },
  { tag: 'Barbell', test: (hay) => /barbell|\bbb\b/i.test(hay) },
  { tag: 'Dumbbell', test: (hay) => /dumbbell|\bdbs?\b/i.test(hay) },
  { tag: 'TRX', test: (hay) => /\btrx\b/i.test(hay) },
  { tag: 'Cable', test: (hay) => /cable/i.test(hay) },
  {
    tag: 'Machine',
    test: (hay) =>
      /machine|pulldown|pull[- ]?down|leg press|smith|hack squat|seated row/i.test(
        hay,
      ),
  },
  { tag: 'Stairs', test: (hay) => /stair/i.test(hay) },
  { tag: 'Rope', test: (hay) => /\brope\b/i.test(hay) },
  { tag: 'BOSU', test: (hay) => /bosu|bosy/i.test(hay) },
  {
    tag: 'Med ball',
    test: (hay) => /med(?:icine)?\s*ball|ball slam|medball/i.test(hay),
  },
  { tag: 'Rowing', test: (hay) => /rowing|rower/i.test(hay) },
  {
    tag: 'Bodyweight',
    test: (hay) =>
      /bodyweight|\bbw\b|push[- ]?ups?|pull[- ]?ups?|chin[- ]?ups?|plank|burpee|jacks|walking lunges?|caterpillar|elf jack/i.test(
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
  return BODY_RULES.filter(({ test }) => test(hay)).map(({ tag }) => tag)
}

/** Equipment tags derived only from exercise names + load_notes (+ workout name). */
export function equipmentTags(w: Workout): EquipmentTag[] {
  const hay = workoutHaystack(w)
  return EQUIPMENT_RULES.filter(({ test }) => test(hay)).map(({ tag }) => tag)
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
