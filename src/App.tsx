import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { About } from './pages/About'
import { Browse } from './pages/Browse'
import { Detail } from './pages/Detail'
import { History } from './pages/History'
import { Session } from './pages/Session'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Browse />} />
        <Route path="workout/:id" element={<Detail />} />
        <Route path="session/:id" element={<Session />} />
        <Route path="history" element={<History />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
