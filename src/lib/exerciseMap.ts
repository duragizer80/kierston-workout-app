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

export const exerciseMapMeta = data._meta

export function lookupExercise(name: string): ExerciseMapEntry | null {
  return data.exercises[name] ?? null
}

export function exerciseBodyTags(name: string): BodyTag[] {
  return (lookupExercise(name)?.body ?? []) as BodyTag[]
}

export function exerciseEquipmentTags(name: string): EquipmentTag[] {
  return (lookupExercise(name)?.equipment ?? []) as EquipmentTag[]
}

export function exerciseStandardName(name: string): string | null {
  return lookupExercise(name)?.standardName ?? null
}
