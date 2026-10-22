import type {
  ExerciseLog,
  LastPerf,
  SavedRoutine,
  SessionRecord,
} from '../types'
import { BODY_TAGS, type BodyTag } from './tags'

const HISTORY_KEY = 'kierston.history.v1'
const LAST_PERF_KEY = 'kierston.lastPerf.v1'
const FAVORITES_KEY = 'kierston.favorites.v1'
const RATINGS_KEY = 'kierston.ratings.v1'
const LAST_STARTED_KEY = 'kierston.lastStarted.v1'
const ACTIVE_KEY = 'kierston.activeSession.v1'
const EXCLUDES_KEY = 'kierston.excludes.v1'
const EXCLUDE_STRICT_KEY = 'kierston.excludeStrict.v1'
const ROUTINES_KEY = 'kierston.routines.v1'

/** User rating 1–5; 0 means unrated. */
export type WorkoutRating = 0 | 1 | 2 | 3 | 4 | 5

export type ActiveSession = {
  workoutId: string
  workoutName: string
  step: number
  logs: ExerciseLog[]
  startedAt: string
  updatedAt: string
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function getHistory(): SessionRecord[] {
  return readJson<SessionRecord[]>(HISTORY_KEY, [])
}

export function saveSession(record: SessionRecord): void {
  const next = [record, ...getHistory()]
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 200)))

  const last = getLastPerfMap()
  for (const ex of record.exercises) {
    const finished = [...ex.sets].reverse().find((s) => s.done && (s.weight || s.reps))
    if (finished) {
      last[ex.exerciseName] = {
        weight: finished.weight,
        reps: finished.reps,
        completedAt: record.completedAt,
      }
    }
  }
  localStorage.setItem(LAST_PERF_KEY, JSON.stringify(last))
  clearActiveSession()
}

export function getLastPerfMap(): Record<string, LastPerf> {
  return readJson<Record<string, LastPerf>>(LAST_PERF_KEY, {})
}

export function getLastPerf(exerciseName: string): LastPerf | null {
  return getLastPerfMap()[exerciseName] ?? null
}

export function getFavorites(): string[] {
  return readJson<string[]>(FAVORITES_KEY, [])
}

export function isFavorite(workoutId: string): boolean {
  return getFavorites().includes(workoutId)
}

export function toggleFavorite(workoutId: string): boolean {
  const set = new Set(getFavorites())
  if (set.has(workoutId)) set.delete(workoutId)
  else set.add(workoutId)
  const next = Array.from(set)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(next))
  return set.has(workoutId)
}

export function getRatings(): Record<string, WorkoutRating> {
  return readJson<Record<string, WorkoutRating>>(RATINGS_KEY, {})
}

export function getRating(workoutId: string): WorkoutRating {
  const n = getRatings()[workoutId]
  if (n === 1 || n === 2 || n === 3 || n === 4 || n === 5) return n
  return 0
}

export function setRating(workoutId: string, rating: WorkoutRating): void {
  const next = { ...getRatings() }
  if (!rating) delete next[workoutId]
  else next[workoutId] = rating
  localStorage.setItem(RATINGS_KEY, JSON.stringify(next))
}

export function getLastStartedId(): string | null {
  return readJson<string | null>(LAST_STARTED_KEY, null)
}

export function setLastStarted(workoutId: string): void {
  localStorage.setItem(LAST_STARTED_KEY, JSON.stringify(workoutId))
}

export function getActiveSession(): ActiveSession | null {
  return readJson<ActiveSession | null>(ACTIVE_KEY, null)
}

export function saveActiveSession(session: ActiveSession): void {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(session))
  setLastStarted(session.workoutId)
}

export function clearActiveSession(): void {
  localStorage.removeItem(ACTIVE_KEY)
}

const VALID_BODY = new Set<string>(BODY_TAGS)

/** Muscle groups the user wants hidden from library results. */
export function getExcludedBodyTags(): BodyTag[] {
  const raw = readJson<string[]>(EXCLUDES_KEY, [])
  return raw.filter((t): t is BodyTag => VALID_BODY.has(t))
}

export function setExcludedBodyTags(tags: BodyTag[]): void {
  localStorage.setItem(EXCLUDES_KEY, JSON.stringify(tags))
}

/**
 * When true, Exclude matches any involvement (primary + secondary tags).
 * Default false: Exclude only matches primary-focus muscles.
 */
export function getExcludeStrict(): boolean {
  return readJson<boolean>(EXCLUDE_STRICT_KEY, false)
}

export function setExcludeStrict(strict: boolean): void {
  localStorage.setItem(EXCLUDE_STRICT_KEY, JSON.stringify(strict))
}

export function getRoutines(): SavedRoutine[] {
  return readJson<SavedRoutine[]>(ROUTINES_KEY, [])
}

export function getRoutine(id: string): SavedRoutine | undefined {
  return getRoutines().find((r) => r.id === id)
}

export function saveRoutine(routine: SavedRoutine): void {
  const list = getRoutines().filter((r) => r.id !== routine.id)
  list.unshift(routine)
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(list))
}

export function deleteRoutine(id: string): void {
  const next = getRoutines().filter((r) => r.id !== id)
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(next))
  // Drop favorite/rating keys for this routine
  const favs = getFavorites().filter((fid) => fid !== id)
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs))
  const ratings = getRatings()
  if (id in ratings) {
    delete ratings[id]
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings))
  }
  if (getLastStartedId() === id) {
    localStorage.removeItem(LAST_STARTED_KEY)
  }
  const active = getActiveSession()
  if (active?.workoutId === id) clearActiveSession()
}

export function newRoutineId(): string {
  return `routine-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
