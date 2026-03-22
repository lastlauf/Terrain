import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import Loader from './Loader.jsx'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <Loader message="Loading..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
