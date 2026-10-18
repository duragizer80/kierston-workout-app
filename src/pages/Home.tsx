import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getActiveSession,
  getFavorites,
  getLastStartedId,
} from '../lib/storage'
import { cardSubtitle, cardTitle, getWorkout, workouts } from '../lib/workouts'

export function Home() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const onFocus = () => setTick((n) => n + 1)
    window.addEventListener('focus', onFocus)
    window.addEventListener('storage', onFocus)
    return () => {
      window.removeEventListener('focus', onFocus)
      window.removeEventListener('storage', onFocus)
    }
  }, [])

  // Re-read localStorage when returning to this tab / after navigation
  void tick

  const active = getActiveSession()
  const lastId = getLastStartedId()
  const last = lastId ? getWorkout(lastId) : undefined
  const favoriteIds = getFavorites()
  const favorites = favoriteIds
    .map((id) => getWorkout(id))
    .filter((w): w is NonNullable<typeof w> => Boolean(w))

  return (
    <main>
      <h1 className="page-title">Home</h1>
      <p className="lede">Pick up where you left off, or open a favorite.</p>

      {active ? (
        <section className="home-section">
          <h2 className="section-label">Continue</h2>
          <Link className="home-card home-card-primary" to={`/session/${active.workoutId}`}>
            <div className="eyebrow">Active session</div>
            <h3>{active.workoutName}</h3>
            <p>
              Exercise {active.step + 1}
              {active.logs.length ? ` of ${active.logs.length}` : ''} · started{' '}
              {new Date(active.startedAt).toLocaleString()}
            </p>
            <span className="home-cta">Resume →</span>
          </Link>
        </section>
      ) : null}

      <section className="home-section">
        <h2 className="section-label">Last started</h2>
        {last ? (
          <Link className="home-card" to={`/workout/${last.id}`}>
            <h3>{cardTitle(last)}</h3>
            <p>{cardSubtitle(last)}</p>
          </Link>
        ) : (
          <p className="empty soft">No sessions started yet.</p>
        )}
      </section>

      <section className="home-section">
        <h2 className="section-label">Favorites</h2>
        {favorites.length === 0 ? (
          <p className="empty soft">
            Heart workouts in the library — saved on this device.
          </p>
        ) : (
          <div className="workout-list">
            {favorites.map((w) => (
              <Link key={w.id} to={`/workout/${w.id}`} className="workout-row">
                <h3>{cardTitle(w)}</h3>
                <p>{cardSubtitle(w)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <div className="actions">
        <Link className="btn btn-secondary" to="/library">
          Browse library ({workouts.length})
        </Link>
      </div>
    </main>
  )
}
