import { NavLink, Outlet } from 'react-router-dom'
import { workouts } from '../lib/workouts'

export function Layout() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Kierston <span>Train</span>
        </div>
        <div className="topbar-meta">{workouts.length} workouts</div>
      </header>
      <Outlet />
      <nav className="nav">
        <NavLink to="/" end>
          Browse
        </NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/about">About</NavLink>
      </nav>
    </div>
  )
}
