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

export function exerciseEquipmentTags(name: string): EquipmentTag[] {
  return (lookupExercise(name)?.equipment ?? []).filter((t): t is EquipmentTag =>
    VALID_EQUIP.has(t),
  )
}

export function exerciseStandardName(name: string): string | null {
  return lookupExercise(name)?.standardName ?? null
}
