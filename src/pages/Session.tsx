import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RestTimer } from '../components/RestTimer'
import { getLastPerf, saveSession } from '../lib/storage'
import {
  getWorkout,
  parseRestSeconds,
  parseSetCount,
} from '../lib/workouts'
import type { ExerciseLog, SetLog, Workout } from '../types'

function blankSets(count: number, last?: { weight: string; reps: string } | null): SetLog[] {
  return Array.from({ length: count }, () => ({
    weight: last?.weight ?? '',
    reps: last?.reps ?? '',
    done: false,
  }))
}

function buildLogs(workout: Workout): ExerciseLog[] {
  return workout.exercises.map((e) => {
    const last = getLastPerf(e.name)
    return {
      exerciseName: e.name,
      sets: blankSets(parseSetCount(e.sets), last),
    }
  })
}

export function Session() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const workout = getWorkout(id)

  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<ExerciseLog[]>(() =>
    workout ? buildLogs(workout) : [],
  )

  if (!workout) {
    return (
      <main>
        <Link to="/" className="back-link">
          ← Browse
        </Link>
        <p className="empty">Workout not found.</p>
      </main>
    )
  }

  const total = workout.exercises.length
  const exercise = workout.exercises[step]
  const log = logs[step]
  const last = getLastPerf(exercise.name)
  const restSecs = parseRestSeconds(exercise.rest)
  const progress = ((step + 1) / total) * 100

  function updateSet(si: number, patch: Partial<SetLog>) {
    setLogs((prev) =>
      prev.map((ex, ei) =>
        ei !== step
          ? ex
          : {
              ...ex,
              sets: ex.sets.map((s, i) => (i === si ? { ...s, ...patch } : s)),
            },
      ),
    )
  }

  function finish() {
    saveSession({
      id: `${workout!.id}-${Date.now()}`,
      workoutId: workout!.id,
      workoutName: workout!.name,
      completedAt: new Date().toISOString(),
      exercises: logs,
    })
    navigate('/history')
  }

  return (
    <main className="session">
      <Link to={`/workout/${workout.id}`} className="back-link">
        ← {workout.name}
      </Link>

      <div className="progress" aria-hidden>
        <span style={{ width: `${progress}%` }} />
      </div>

      <div className="session-step">
        <div className="eyebrow">
          Exercise {step + 1} of {total}
          {exercise.block ? ` · ${exercise.block}` : ''}
        </div>
        <h2>
          {exercise.name}
          {exercise.unclear?.length ? <span className="unclear-tag">unclear</span> : null}
        </h2>
        <p className="lede" style={{ marginBottom: 8 }}>
          {[
            exercise.sets ? `${exercise.sets} sets` : null,
            exercise.reps ? `${exercise.reps} reps` : null,
            exercise.rest ? `rest ${exercise.rest}` : null,
            exercise.load_notes,
          ]
            .filter(Boolean)
            .join(' · ') || 'Log what you can'}
        </p>
        {exercise.unclear?.length ? (
          <p className="note">
            Unclear markers: {exercise.unclear.join('; ')}
          </p>
        ) : null}
        {last ? (
          <p className="last-perf">
            Last: {last.weight || '—'} × {last.reps || '—'}
            {last.completedAt
              ? ` · ${new Date(last.completedAt).toLocaleDateString()}`
              : ''}
          </p>
        ) : (
          <p className="last-perf">No prior log for this movement.</p>
        )}

        <div className="set-grid">
          {log.sets.map((s, si) => (
            <div key={si} className="set-row">
              <div className="n">{si + 1}</div>
              <input
                inputMode="decimal"
                placeholder="Weight"
                aria-label={`Set ${si + 1} weight`}
                value={s.weight}
                onChange={(e) => updateSet(si, { weight: e.target.value })}
              />
              <input
                inputMode="numeric"
                placeholder="Reps"
                aria-label={`Set ${si + 1} reps`}
                value={s.reps}
                onChange={(e) => updateSet(si, { reps: e.target.value })}
              />
              <button
                type="button"
                className={`check${s.done ? ' on' : ''}`}
                aria-label={s.done ? 'Mark incomplete' : 'Mark complete'}
                onClick={() => updateSet(si, { done: !s.done })}
              >
                ✓
              </button>
            </div>
          ))}
        </div>

        <RestTimer suggestedSeconds={restSecs} />
      </div>

      <div className="actions">
        {step < total - 1 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep((s) => s + 1)}>
            Next exercise
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finish}>
            Finish & save
          </button>
        )}
        {step > 0 ? (
          <button type="button" className="btn btn-secondary" onClick={() => setStep((s) => s - 1)}>
            Previous
          </button>
        ) : null}
      </div>
    </main>
  )
}
