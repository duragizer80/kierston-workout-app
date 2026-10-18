import { Link, useParams } from 'react-router-dom'
import { formatWorkoutDate, getWorkout } from '../lib/workouts'
import type { Exercise } from '../types'

function rxLine(e: Exercise) {
  const bits = [
    e.sets ? `${e.sets} sets` : null,
    e.reps ? `${e.reps} reps` : null,
    e.rest ? `rest ${e.rest}` : null,
  ].filter(Boolean)
  return bits.join(' · ') || 'Prescription incomplete'
}

function groupByBlock(exercises: Exercise[]) {
  const groups: { label: string; items: Exercise[] }[] = []
  for (const e of exercises) {
    const label = e.block || 'Exercises'
    const last = groups[groups.length - 1]
    if (last && last.label === label) last.items.push(e)
    else groups.push({ label, items: [e] })
  }
  return groups
}

export function Detail() {
  const { id = '' } = useParams()
  const workout = getWorkout(id)

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

  const groups = groupByBlock(workout.exercises)

  return (
    <main>
      <Link to="/" className="back-link">
        ← Browse
      </Link>
      <h1 className="page-title">{workout.name}</h1>
      <div className="detail-meta">
        <span>{formatWorkoutDate(workout)}</span>
        {workout.focus ? <span>{workout.focus}</span> : null}
        <span>{workout.exercises.length} exercises</span>
      </div>

      {workout.warm_up ? <p className="note">Warm-up: {workout.warm_up}</p> : null}
      {workout.general_instructions ? (
        <p className="note">{workout.general_instructions}</p>
      ) : null}
      {workout.notes ? <p className="note">{workout.notes}</p> : null}

      {groups.map((g) => (
        <section key={g.label} className="block">
          <h3>{g.label}</h3>
          {g.items.map((e, idx) => (
            <div key={`${e.name}-${idx}`} className="ex-item">
              <strong>
                {e.name}
                {e.unclear?.length ? <span className="unclear-tag">unclear</span> : null}
              </strong>
              <div className="rx">{rxLine(e)}</div>
              <ul className="details">
                {e.tempo ? <li>Tempo: {e.tempo}</li> : null}
                {e.load_notes ? <li>Load: {e.load_notes}</li> : null}
                {e.unclear?.map((u) => (
                  <li key={u}>Unclear — {u}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ))}

      <div className="actions">
        <Link className="btn btn-primary" to={`/session/${workout.id}`}>
          Start session
        </Link>
      </div>
    </main>
  )
}
