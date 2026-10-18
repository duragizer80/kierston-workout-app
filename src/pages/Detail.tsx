import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { StarRating } from '../components/StarRating'
import {
  getRating,
  isFavorite,
  setLastStarted,
  toggleFavorite,
  type WorkoutRating,
} from '../lib/storage'
import {
  bodyChipLabel,
  bodyTags,
  cardSubtitle,
  cardTitle,
  equipmentTags,
} from '../lib/tags'
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
  const [fav, setFav] = useState(() => (id ? isFavorite(id) : false))
  const [rating, setRatingValue] = useState<WorkoutRating>(() =>
    id ? getRating(id) : 0,
  )

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

  const groups = groupByBlock(workout.exercises)
  const body = bodyTags(workout)
  const equip = equipmentTags(workout)

  return (
    <main>
      <Link to="/library" className="back-link">
        ← Library
      </Link>
      <h1 className="page-title">{cardTitle(workout)}</h1>
      <div className="detail-meta">
        <span>{formatWorkoutDate(workout)}</span>
        <span>{cardSubtitle(workout)}</span>
      </div>
      {body.length || equip.length ? (
        <div className="tag-row" aria-label="Tags">
          {body.map((t) => (
            <span key={`b-${t}`} className="tag-pill">
              {bodyChipLabel(t)}
            </span>
          ))}
          {equip.map((t) => (
            <span key={`e-${t}`} className="tag-pill">
              {t}
            </span>
          ))}
        </div>
      ) : null}

      <div className="rate-box">
        <div className="section-label">Your rating</div>
        <StarRating
          workoutId={workout.id}
          value={rating}
          onChange={setRatingValue}
          size="md"
        />
        <p className="rate-hint">
          {rating ? `${rating} of 5 — saved on this device` : 'Tap stars to rate'}
        </p>
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
        <Link
          className="btn btn-primary"
          to={`/session/${workout.id}`}
          onClick={() => setLastStarted(workout.id)}
        >
          Start session
        </Link>
        <button
          type="button"
          className={`btn btn-secondary${fav ? ' fav-on' : ''}`}
          onClick={() => setFav(toggleFavorite(workout.id))}
        >
          {fav ? '♥ Favorited' : '♡ Favorite'}
        </button>
      </div>
    </main>
  )
}
