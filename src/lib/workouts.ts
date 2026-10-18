import raw from '../data/workouts.json'
import type { Workout } from '../types'

export const workouts = raw as Workout[]

export function workoutYear(w: Workout): string {
  const d = w.date || w.email_date
  return d ? d.slice(0, 4) : 'Unknown'
}

export function formatWorkoutDate(w: Workout): string {
  if (w.date) {
    const [y, m, day] = w.date.split('-')
    return `${Number(m)}/${Number(day)}/${y}`
  }
  if (w.email_date) return `Email ${w.email_date}`
  return 'Undated'
}

export function exerciseSummary(w: Workout): string {
  const n = w.exercises.length
  const blocks = new Set(w.exercises.map((e) => e.block).filter(Boolean))
  const bits = [`${n} exercise${n === 1 ? '' : 's'}`]
  if (blocks.size) bits.push(`${blocks.size} block${blocks.size === 1 ? '' : 's'}`)
  if (w.focus) bits.push(w.focus)
  return bits.join(' · ')
}

export function parseSetCount(sets: string | null): number {
  if (!sets) return 1
  const m = sets.match(/(\d+)/)
  if (!m) return 1
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? Math.min(n, 12) : 1
}

export function parseRestSeconds(rest: string | null): number | null {
  if (!rest) return null
  const lower = rest.toLowerCase()
  const minMatch = lower.match(/(\d+)\s*(?:min|minute)/)
  if (minMatch) return Number(minMatch[1]) * 60
  const secMatch = lower.match(/(\d+)\s*(?:sec|s\b)/)
  if (secMatch) return Number(secMatch[1])
  const bare = lower.match(/^(\d+)$/)
  if (bare) {
    const n = Number(bare[1])
    return n > 20 ? n : n * 60
  }
  return null
}

export function getWorkout(id: string): Workout | undefined {
  return workouts.find((w) => w.id === id)
}

export const years = Array.from(
  new Set(workouts.map(workoutYear)),
).sort()
