import type { Workout } from '../types'

export const EQUIPMENT_TAGS = [
  'Stairs',
  'Rope',
  'Cable',
  'Kettlebell',
  'TRX',
  'Dumbbell',
  'BOSU',
  'Rowing',
] as const

export type EquipmentTag = (typeof EQUIPMENT_TAGS)[number]

const EQUIPMENT_RULES: { tag: EquipmentTag; re: RegExp }[] = [
  { tag: 'Stairs', re: /stair/i },
  { tag: 'Rope', re: /\brope\b/i },
  { tag: 'Cable', re: /cable/i },
  { tag: 'Kettlebell', re: /kettlebell|\bkb\b/i },
  { tag: 'TRX', re: /\btrx\b/i },
  { tag: 'Dumbbell', re: /dumbbell|\bdbs?\b/i },
  { tag: 'BOSU', re: /bosu|bosy/i },
  { tag: 'Rowing', re: /rowing|rower/i },
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

/** Equipment tags derived only from exercise names + load_notes (+ workout name). */
export function equipmentTags(w: Workout): EquipmentTag[] {
  const hay = workoutHaystack(w)
  return EQUIPMENT_RULES.filter(({ re }) => re.test(hay)).map(({ tag }) => tag)
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
  const tags = equipmentTags(w)
  if (!tags.length) return null
  return tags.slice(0, max).join(' + ')
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
