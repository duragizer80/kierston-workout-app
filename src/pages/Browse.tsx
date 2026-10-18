import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  exerciseSummary,
  formatWorkoutDate,
  workoutYear,
  workouts,
  years,
} from '../lib/workouts'

export function Browse() {
  const [q, setQ] = useState('')
  const [year, setYear] = useState('All')

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return workouts.filter((w) => {
      if (year !== 'All' && workoutYear(w) !== year) return false
      if (!needle) return true
      const hay = [
        w.name,
        w.focus ?? '',
        w.notes ?? '',
        ...w.exercises.map((e) => e.name),
      ]
        .join(' ')
        .toLowerCase()
      return hay.includes(needle)
    })
  }, [q, year])

  return (
    <main>
      <h1 className="page-title">Workouts</h1>
      <p className="lede">Your trainer library — search, filter by year, start a session.</p>

      <div className="search-row">
        <input
          type="search"
          placeholder="Search name or exercise…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search workouts"
        />
        <div className="filters" role="group" aria-label="Year filter">
          <button
            type="button"
            className={`chip${year === 'All' ? ' on' : ''}`}
            onClick={() => setYear('All')}
          >
            All
          </button>
          {years.map((y) => (
            <button
              key={y}
              type="button"
              className={`chip${year === y ? ' on' : ''}`}
              onClick={() => setYear(y)}
            >
              {y}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No workouts match.</p>
      ) : (
        <div className="workout-list">
          {filtered.map((w, i) => (
            <Link
              key={w.id}
              to={`/workout/${w.id}`}
              className="workout-row"
              style={{ animationDelay: `${Math.min(i, 12) * 30}ms` }}
            >
              <div className="date">{formatWorkoutDate(w)}</div>
              <h3>{w.name}</h3>
              <p>{exerciseSummary(w)}</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
