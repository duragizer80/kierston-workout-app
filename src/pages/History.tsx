import { Link } from 'react-router-dom'
import { getHistory } from '../lib/storage'

export function History() {
  const history = getHistory()

  return (
    <main>
      <h1 className="page-title">History</h1>
      <p className="lede">Sessions saved on this device only.</p>

      {history.length === 0 ? (
        <p className="empty">No sessions yet. Start one from a workout.</p>
      ) : (
        history.map((h) => {
          const doneSets = h.exercises.reduce(
            (n, e) => n + e.sets.filter((s) => s.done).length,
            0,
          )
          return (
            <article key={h.id} className="history-item">
              <h3>{h.workoutName}</h3>
              <p>
                {new Date(h.completedAt).toLocaleString()} · {doneSets} sets logged
              </p>
              <p style={{ marginTop: 6 }}>
                <Link to={`/workout/${h.workoutId}`}>Open workout →</Link>
              </p>
            </article>
          )
        })
      )}
    </main>
  )
}
