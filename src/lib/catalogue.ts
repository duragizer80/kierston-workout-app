import {
  exerciseBodyTags,
  exerciseEquipmentTags,
  exerciseStandardName,
} from './exerciseMap'
import type { BodyTag, EquipmentTag } from './tags'
import { workouts } from './workouts'

export type CatalogueExercise = {
  name: string
  standardName: string | null
  body: BodyTag[]
  equipment: EquipmentTag[]
  /** Most common sets string across the library (when known). */
  commonSets: string | null
  /** Most common reps string across the library (when known). */
  commonReps: string | null
  /** Most common rest string across the library (when known). */
  commonRest: string | null
  /** Most common load_notes (when known). */
  commonLoadNotes: string | null
  timesSeen: number
}

function mode(values: (string | null | undefined)[]): string | null {
  const counts = new Map<string, number>()
  for (const v of values) {
    if (!v) continue
    const key = v.trim()
    if (!key) continue
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  let best: string | null = null
  let bestN = 0
  for (const [k, n] of counts) {
    if (n > bestN) {
      best = k
      bestN = n
    }
  }
  return best
}

function buildCatalogue(): CatalogueExercise[] {
  const buckets = new Map<
    string,
    {
      sets: (string | null)[]
      reps: (string | null)[]
      rest: (string | null)[]
      load: (string | null)[]
    }
  >()

  for (const w of workouts) {
    for (const e of w.exercises) {
      let b = buckets.get(e.name)
      if (!b) {
        b = { sets: [], reps: [], rest: [], load: [] }
        buckets.set(e.name, b)
      }
      b.sets.push(e.sets)
      b.reps.push(e.reps)
      b.rest.push(e.rest)
      b.load.push(e.load_notes)
    }
  }

  const list: CatalogueExercise[] = []
  for (const [name, b] of buckets) {
    list.push({
      name,
      standardName: exerciseStandardName(name),
      body: exerciseBodyTags(name),
      equipment: exerciseEquipmentTags(name),
      commonSets: mode(b.sets),
      commonReps: mode(b.reps),
      commonRest: mode(b.rest),
      commonLoadNotes: mode(b.load),
      timesSeen: b.sets.length,
    })
  }

  return list.sort((a, b) => a.name.localeCompare(b.name))
}

/** Unique exercises across the trainer library (299 in current dump). */
export const exerciseCatalogue: CatalogueExercise[] = buildCatalogue()

export function lookupCatalogue(name: string): CatalogueExercise | undefined {
  return exerciseCatalogue.find((e) => e.name === name)
}
