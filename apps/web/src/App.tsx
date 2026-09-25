import { Routes, Route } from 'react-router'
import HealthPage from '@/pages/HealthPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HealthPage />} />
    </Routes>
  )
}

export default App
