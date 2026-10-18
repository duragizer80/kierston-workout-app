import { NavLink, Outlet } from 'react-router-dom'
import { getActiveSession } from '../lib/storage'

export function Layout() {
  const active = getActiveSession()

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          Kierston <span>Train</span>
        </div>
        <div className="topbar-meta">{active ? 'Session open' : 'On device'}</div>
      </header>
      <Outlet />
      <nav className="nav">
        <NavLink to="/" end>
          Home
        </NavLink>
        <NavLink to="/library">Library</NavLink>
        <NavLink to="/history">History</NavLink>
        <NavLink to="/active">{active ? 'Active·' : 'Active'}</NavLink>
      </nav>
    </div>
  )
}
