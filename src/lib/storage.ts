import type { LastPerf, SessionRecord } from '../types'

const HISTORY_KEY = 'kierston.history.v1'
const LAST_PERF_KEY = 'kierston.lastPerf.v1'

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
}

export function getLastPerfMap(): Record<string, LastPerf> {
  return readJson<Record<string, LastPerf>>(LAST_PERF_KEY, {})
}

export function getLastPerf(exerciseName: string): LastPerf | null {
  return getLastPerfMap()[exerciseName] ?? null
}
