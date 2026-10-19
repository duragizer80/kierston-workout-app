import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { RestTimer } from '../components/RestTimer'
import {
  exerciseBodyTags,
  exerciseStandardName,
} from '../lib/exerciseMap'
import { parseLoadNotes } from '../lib/loadNotes'
import {
  getActiveSession,
  getLastPerf,
  saveActiveSession,
  saveSession,
  setLastStarted,
  type ActiveSession,
} from '../lib/storage'
import { bodyChipLabel } from '../lib/tags'
import {
  getWorkout,
  parseRestSeconds,
  parseSetCount,
} from '../lib/workouts'
import type { ExerciseLog, SetLog, Workout } from '../types'

type Prefill = { weight: string; reps: string; source: 'history' | 'prescription' }

function resolvePrefill(exerciseName: string, loadNotes: string | null): Prefill | null {
  const last = getLastPerf(exerciseName)
  if (last && (last.weight || last.reps)) {
    return { weight: last.weight, reps: last.reps, source: 'history' }
  }
  const parsed = parseLoadNotes(loadNotes)
  if (parsed && (parsed.weight || parsed.reps)) {
    return { weight: parsed.weight, reps: parsed.reps, source: 'prescription' }
  }
  return null
}

function blankSets(count: number): SetLog[] {
  return Array.from({ length: count }, () => ({
    weight: '',
    reps: '',
    done: false,
  }))
}

function buildLogs(workout: Workout): ExerciseLog[] {
  return workout.exercises.map((e) => ({
    exerciseName: e.name,
    sets: blankSets(parseSetCount(e.sets)),
  }))
}

function loadSessionState(workout: Workout): {
  step: number
  logs: ExerciseLog[]
  startedAt: string
} {
  const existing = getActiveSession()
  if (
    existing &&
    existing.workoutId === workout.id &&
    existing.logs.length === workout.exercises.length
  ) {
    return {
      step: Math.min(existing.step, workout.exercises.length - 1),
      logs: existing.logs,
      startedAt: existing.startedAt,
    }
  }
  return {
    step: 0,
    logs: buildLogs(workout),
    startedAt: new Date().toISOString(),
  }
}

export function Session() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const workout = getWorkout(id)

  const [step, setStep] = useState(0)
  const [logs, setLogs] = useState<ExerciseLog[]>([])
  const [startedAt, setStartedAt] = useState('')
  const [ready, setReady] = useState(false)
  const [restTrigger, setRestTrigger] = useState(0)

  useEffect(() => {
    if (!workout) {
      setReady(false)
      return
    }
    const state = loadSessionState(workout)
    setStep(state.step)
    setLogs(state.logs)
    setStartedAt(state.startedAt)
    setLastStarted(workout.id)
    setReady(true)
    // Re-init only when the workout id changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    if (!workout || !ready) return
    const payload: ActiveSession = {
      workoutId: workout.id,
      workoutName: workout.name,
      step,
      logs,
      startedAt: startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveActiveSession(payload)
  }, [workout, step, logs, startedAt, ready])

  const exercise = workout?.exercises[step]
  const prefill = useMemo(() => {
    if (!exercise) return null
    return resolvePrefill(exercise.name, exercise.load_notes)
  }, [exercise])

  if (!workout) {
    return (
      <main>
        <Link to="/library" className="back-link">
          ← Library
        </Link>
        <p className="empty">Workout not found.</p>
      </main>
    )
  }

  if (!ready || !logs[step] || !exercise) {
    return (
      <main>
        <p className="empty">Loading session…</p>
      </main>
    )
  }

  const total = workout.exercises.length
  const log = logs[step]
  const last = getLastPerf(exercise.name)
  const restSecs = parseRestSeconds(exercise.rest)
  const progress = ((step + 1) / total) * 100
  const standard = exerciseStandardName(exercise.name)
  const body = exerciseBodyTags(exercise.name)

  const allSetsDone = log.sets.every((s) => s.done)
  const isLastExercise = step >= total - 1
  const suppressRest = isLastExercise && allSetsDone

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

  function toggleDone(si: number) {
    const current = log.sets[si]
    const nextDone = !current.done
    // Prefill empty fields from last / prescription when marking done
    const patch: Partial<SetLog> = { done: nextDone }
    if (nextDone) {
      if (!current.weight && prefill?.weight) patch.weight = prefill.weight
      if (!current.reps && prefill?.reps) patch.reps = prefill.reps
    }
    updateSet(si, patch)

    if (nextDone) {
      const setsAfter = log.sets.map((s, i) =>
        i === si ? { ...s, ...patch, done: true } : s,
      )
      const finishingWorkout =
        isLastExercise && setsAfter.every((s) => s.done)
      if (!finishingWorkout) {
        setRestTrigger((n) => n + 1)
      }
    }
  }

  function finish() {
    if (!workout) return
    saveSession({
      id: `${workout.id}-${Date.now()}`,
      workoutId: workout.id,
      workoutName: workout.name,
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
        {standard || body.length ? (
          <p className="ex-catalogue">
            {standard && standard.toLowerCase() !== exercise.name.toLowerCase()
              ? `≈ ${standard}`
              : null}
            {standard &&
            standard.toLowerCase() !== exercise.name.toLowerCase() &&
            body.length
              ? ' · '
              : null}
            {body.map(bodyChipLabel).join(' · ')}
          </p>
        ) : null}
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
          <p className="note">Unclear markers: {exercise.unclear.join('; ')}</p>
        ) : null}
        {last ? (
          <p className="last-perf">
            Last logged: {last.weight || '—'} × {last.reps || '—'}
            {last.completedAt
              ? ` · ${new Date(last.completedAt).toLocaleDateString()}`
              : ''}
          </p>
        ) : prefill?.source === 'prescription' ? (
          <p className="last-perf">
            From prescription: {prefill.weight || '—'}
            {prefill.reps ? ` × ${prefill.reps}` : ''}
          </p>
        ) : (
          <p className="last-perf">No prior log for this movement.</p>
        )}

        <div className="set-grid">
          {log.sets.map((s, si) => (
            <div key={si} className={`set-row${s.done ? ' set-done' : ''}`}>
              <div className="n">{si + 1}</div>
              <div className="set-field">
                <input
                  inputMode="decimal"
                  placeholder={prefill?.weight ? prefill.weight : 'Weight'}
                  aria-label={`Set ${si + 1} weight`}
                  value={s.weight}
                  onChange={(e) => updateSet(si, { weight: e.target.value })}
                  className={
                    !s.weight && prefill?.weight ? 'has-ghost' : undefined
                  }
                />
                {!s.weight && prefill?.weight ? (
                  <span className="ghost-hint">prev {prefill.weight}</span>
                ) : null}
              </div>
              <div className="set-field">
                <input
                  inputMode="numeric"
                  placeholder={prefill?.reps ? prefill.reps : 'Reps'}
                  aria-label={`Set ${si + 1} reps`}
                  value={s.reps}
                  onChange={(e) => updateSet(si, { reps: e.target.value })}
                  className={!s.reps && prefill?.reps ? 'has-ghost' : undefined}
                />
                {!s.reps && prefill?.reps ? (
                  <span className="ghost-hint">prev {prefill.reps}</span>
                ) : null}
              </div>
              <button
                type="button"
                className={`check${s.done ? ' on' : ''}`}
                aria-label={s.done ? 'Mark incomplete' : 'Mark complete'}
                onClick={() => toggleDone(si)}
              >
                ✓
              </button>
            </div>
          ))}
        </div>

        <RestTimer
          suggestedSeconds={restSecs}
          triggerKey={restTrigger}
          suppressAuto={suppressRest}
        />
      </div>

      <div className="actions">
        {step < total - 1 ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setStep((s) => s + 1)}
          >
            Next exercise
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finish}>
            Finish & save
          </button>
        )}
        {step > 0 ? (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setStep((s) => s - 1)}
          >
            Previous
          </button>
        ) : null}
      </div>
    </main>
  )
}
