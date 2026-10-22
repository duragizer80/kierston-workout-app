import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Active } from './pages/Active'
import { Detail } from './pages/Detail'
import { History } from './pages/History'
import { Home } from './pages/Home'
import { Library } from './pages/Library'
import { RoutineBuilder } from './pages/RoutineBuilder'
import { Session } from './pages/Session'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="library" element={<Library />} />
        <Route path="workout/:id" element={<Detail />} />
        <Route path="session/:id" element={<Session />} />
        <Route path="routine/new" element={<RoutineBuilder />} />
        <Route path="routine/:id/edit" element={<RoutineBuilder />} />
        <Route path="history" element={<History />} />
        <Route path="active" element={<Active />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
