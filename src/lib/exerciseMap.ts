import raw from '../data/exercise-map.json'
import type { BodyTag, EquipmentTag } from './tags'

export type ExerciseMapEntry = {
  standardName: string | null
  body: string[]
  equipment: string[]
  match: string
  score: number
}

type ExerciseMapFile = {
  _meta: {
    source: string
    licenseNote: string
    generatedAt: string
    uniqueNames: number
    seedMatched: number
  }
  exercises: Record<string, ExerciseMapEntry>
}

const data = raw as ExerciseMapFile

/** Inline sets avoid circular import with tags.ts (which imports this module). */
const VALID_BODY = new Set<string>([
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
])
const VALID_EQUIP = new Set<string>([
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
])

export const exerciseMapMeta = data._meta

export function lookupExercise(name: string): ExerciseMapEntry | null {
  return data.exercises[name] ?? null
}

export function exerciseBodyTags(name: string): BodyTag[] {
  return (lookupExercise(name)?.body ?? []).filter((t): t is BodyTag =>
    VALID_BODY.has(t),
  )
}

const LOWER_BODY = new Set<string>([
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
])

/**
 * Primary focus muscles for an exercise (exclude filters use these by default).
 * Secondary tags stay on `body` for Include. Squats/lunges → Quads primary;
 * hinges/swings → Hamstrings+Glutes; stairs → Cardio+Quads+Calves; else map[0].
 */
export function exercisePrimaryBodyTags(name: string): BodyTag[] {
  const body = exerciseBodyTags(name)
  if (!body.length) return []
  const have = new Set(body)
  const out: BodyTag[] = []
  const add = (t: BodyTag) => {
    if (have.has(t) && !out.includes(t)) out.push(t)
  }

  if (/stair/i.test(name)) {
    add('Cardio')
    add('Quads')
    add('Calves')
  }
  if (
    /squat|lunge|leg press|step[- ]?up|bulgarian|wall sit|powerup|granny lunge|farmer squat|prisoner squat/i.test(
      name,
    )
  ) {
    add('Quads')
    // Sumo is more posterior-chain than a high-bar squat
    if (/sumo/i.test(name)) {
      add('Glutes')
      add('Hamstrings')
    }
  }
  if (
    /deadlift|rdl|romanian|good morning|leg curl|nordic|hamstring|single[- ]?leg(?:ged)?\s*dead|\bswings?\b/i.test(
      name,
    )
  ) {
    add('Hamstrings')
    add('Glutes')
  }
  if (/glute|hip thrust|bridge|kickback|abduction|thrust back/i.test(name)) {
    add('Glutes')
  }
  if (/calf|calves/i.test(name)) {
    add('Calves')
  }

  if (out.length) {
    // Compounds like "rows w/ squats" keep the non-lower map head as primary too
    const head = body[0]
    if (head && !LOWER_BODY.has(head)) add(head)
    return out
  }
  return [body[0]]
}

export function exerciseEquipmentTags(name: string): EquipmentTag[] {
  return (lookupExercise(name)?.equipment ?? []).filter((t): t is EquipmentTag =>
    VALID_EQUIP.has(t),
  )
}

export function exerciseStandardName(name: string): string | null {
  return lookupExercise(name)?.standardName ?? null
}
