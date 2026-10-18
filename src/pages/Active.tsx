import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearActiveSession, getActiveSession } from '../lib/storage'

export function Active() {
  const navigate = useNavigate()
  const [active, setActive] = useState(() => getActiveSession())

  if (!active) {
    return (
      <main>
        <h1 className="page-title">Active</h1>
        <p className="lede">No session in progress on this device.</p>
        <div className="actions">
          <Link className="btn btn-primary" to="/library">
            Open library
          </Link>
          <Link className="btn btn-secondary" to="/about">
            About
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main>
      <h1 className="page-title">Active</h1>
      <p className="lede">Resume your in-progress session or discard it.</p>
      <Link className="home-card home-card-primary" to={`/session/${active.workoutId}`}>
        <div className="eyebrow">In progress</div>
        <h3>{active.workoutName}</h3>
        <p>
          Exercise {active.step + 1} of {active.logs.length} · updated{' '}
          {new Date(active.updatedAt).toLocaleString()}
        </p>
        <span className="home-cta">Resume →</span>
      </Link>
      <div className="actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            clearActiveSession()
            setActive(null)
            navigate('/active', { replace: true })
          }}
        >
          Discard session
        </button>
      </div>
    </main>
  )
}
