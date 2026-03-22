import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import Onboarding from './pages/Onboarding.jsx'
import Map from './pages/Map.jsx'
import Explore from './pages/Explore.jsx'
import Region from './pages/Region.jsx'
import AuthGuard from './components/AuthGuard.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
      <Route path="/map" element={<AuthGuard><Map /></AuthGuard>} />
      <Route path="/explore" element={<AuthGuard><Explore /></AuthGuard>} />
      <Route path="/region/:id" element={<AuthGuard><Region /></AuthGuard>} />
    </Routes>
  )
}

export default App
