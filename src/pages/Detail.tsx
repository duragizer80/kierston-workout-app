import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StarRating } from '../components/StarRating'
import {
  deleteRoutine,
  getRating,
  isFavorite,
  setLastStarted,
  toggleFavorite,
  type WorkoutRating,
} from '../lib/storage'
import {
  exerciseBodyTags,
  exerciseStandardName,
} from '../lib/exerciseMap'
import {
  displaySubtitle,
  displayTitle,
  getAnyWorkout,
  isRoutineId,
} from '../lib/routines'
import {
  bodyChipLabel,
  bodyTags,
  equipmentTags,
} from '../lib/tags'
import { formatWorkoutDate } from '../lib/workouts'
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
  const navigate = useNavigate()
  const workout = getAnyWorkout(id)
  const custom = Boolean(id && isRoutineId(id))
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

  function onDelete() {
    if (!custom || !id) return
    if (!window.confirm(`Delete “${workout!.name}”? This cannot be undone.`)) {
      return
    }
    deleteRoutine(id)
    navigate('/library')
  }

  return (
    <main>
      <Link to="/library" className="back-link">
        ← Library
      </Link>
      <h1 className="page-title">{displayTitle(workout)}</h1>
      <div className="detail-meta">
        {custom ? (
          <span>Custom routine</span>
        ) : (
          <span>{formatWorkoutDate(workout)}</span>
        )}
        <span>{displaySubtitle(workout)}</span>
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
          {g.items.map((e, idx) => {
            const std = exerciseStandardName(e.name)
            const exBody = exerciseBodyTags(e.name)
            return (
              <div key={`${e.name}-${idx}`} className="ex-item">
                <strong>
                  {e.name}
                  {e.unclear?.length ? (
                    <span className="unclear-tag">unclear</span>
                  ) : null}
                </strong>
                {std || exBody.length ? (
                  <div className="ex-catalogue">
                    {std && std.toLowerCase() !== e.name.toLowerCase()
                      ? `≈ ${std}`
                      : null}
                    {std &&
                    std.toLowerCase() !== e.name.toLowerCase() &&
                    exBody.length
                      ? ' · '
                      : null}
                    {exBody.map(bodyChipLabel).join(' · ')}
                  </div>
                ) : null}
                <div className="rx">{rxLine(e)}</div>
                <ul className="details">
                  {e.tempo ? <li>Tempo: {e.tempo}</li> : null}
                  {e.load_notes ? <li>Load: {e.load_notes}</li> : null}
                  {e.unclear?.map((u) => (
                    <li key={u}>Unclear — {u}</li>
                  ))}
                </ul>
              </div>
            )
          })}
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
        {custom ? (
          <>
            <Link className="btn btn-secondary" to={`/routine/${workout.id}/edit`}>
              Edit routine
            </Link>
            <button type="button" className="btn btn-danger" onClick={onDelete}>
              Delete routine
            </button>
          </>
        ) : null}
      </div>
    </main>
  )
}
