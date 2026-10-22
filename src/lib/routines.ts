import { getRoutine, getRoutines } from './storage'
import { bodyTags, cardSubtitle, equipmentSignature, formatCardDate } from './tags'
import { workouts } from './workouts'
import type { RoutineExercise, SavedRoutine, Workout } from '../types'

export const ROUTINE_ID_PREFIX = 'routine-'

export function isRoutineId(id: string): boolean {
  return id.startsWith(ROUTINE_ID_PREFIX)
}

/** Adapt a saved routine into the Workout shape used by Detail / Session. */
export function routineToWorkout(routine: SavedRoutine): Workout {
  return {
    id: routine.id,
    date: null,
    source_email: 'custom-routine',
    email_date: routine.createdAt.slice(0, 10),
    name: routine.name,
    focus: null,
    notes: 'Custom routine — saved on this device.',
    warm_up: null,
    general_instructions: null,
    exercises: routine.exercises.map((e) => ({
      name: e.name,
      block: null,
      sets: e.sets,
      reps: e.reps,
      rest: e.rest,
      tempo: null,
      load_notes: e.load_notes,
      unclear: [],
    })),
  }
}

export function getAnyWorkout(id: string): Workout | undefined {
  const fromLib = workouts.find((w) => w.id === id)
  if (fromLib) return fromLib
  const routine = getRoutine(id)
  return routine ? routineToWorkout(routine) : undefined
}

export function listRoutineWorkouts(): Workout[] {
  return getRoutines().map(routineToWorkout)
}

/** Display title: user name for custom routines; date · equipment for trainer sessions. */
export function displayTitle(w: Workout): string {
  if (isRoutineId(w.id)) return w.name
  const date = formatCardDate(w)
  const sig = equipmentSignature(w)
  return sig ? `${date} · ${sig}` : date
}

export function displaySubtitle(w: Workout): string {
  if (isRoutineId(w.id)) {
    const n = w.exercises.length
    const body = bodyTags(w)
    const bits = [`${n} exercise${n === 1 ? '' : 's'}`, 'Custom']
    if (body.length) bits.push(body.slice(0, 3).join(', '))
    return bits.join(' · ')
  }
  return cardSubtitle(w)
}

export function blankRoutineExercise(name: string, hint?: Partial<RoutineExercise>): RoutineExercise {
  return {
    name,
    sets: hint?.sets ?? null,
    reps: hint?.reps ?? null,
    rest: hint?.rest ?? null,
    load_notes: hint?.load_notes ?? null,
  }
}
