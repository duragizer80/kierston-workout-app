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
        peak, undated). Equipment chips come from exercise names and load notes only.
      </p>
      <p className="note">
        Logs, favorites, and in-progress sessions stay in this browser / home-screen app.
        Clearing site data removes them.
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
