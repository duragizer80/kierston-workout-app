import { Link } from 'react-router-dom'

export function About() {
  return (
    <main>
      <h1 className="page-title">About</h1>
      <p className="lede">
        Phone-first companion for Kierston&apos;s trainer workout emails. Library data is
        transcribed as written — unclear markers stay visible. No invented program names.
      </p>
      <p className="note">
        Library groups sessions by trainer era (2020–21 return, 2017–18 Gmail, 2017 iCloud
        peak, undated). Body map + chips share the same filters. Include matches primary and
        secondary muscle tags; Exclude defaults to primary focus only (toggle “Any
        involvement” for the old strict behavior). Tags come from exercise names, load
        notes, and a derived catalogue map (text metadata only — no third-party exercise
        animations).
      </p>
      <p className="note">
        In a session, checking a set starts a rest timer (skip / +15s / +30s). Weight and
        reps show ghost values from your last log (or a best-effort parse of the
        prescription). Logs, favorites, and in-progress sessions stay in this browser /
        home-screen app. Clearing site data removes them.
      </p>
      <p className="note">
        Add to Home Screen on iPhone (Share → Add to Home Screen) or Chromebook (install /
        create shortcut) for a full-screen gym view.
      </p>
      <div className="actions">
        <Link className="btn btn-secondary" to="/library">
          Back to library
        </Link>
      </div>
    </main>
  )
}
