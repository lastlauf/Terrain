import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Signup() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirmed, setConfirmed] = useState(false)

  const handleSignup = async (e) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (!username.trim()) {
      setError('Pick a username.')
      return
    }

    setLoading(true)

    try {
      const data = await signUp(email, password, username.trim())
      // If session is immediately available (email confirm disabled), go straight to onboarding
      if (data?.session) {
        navigate('/onboarding')
      } else {
        // Email confirmation required
        setConfirmed(true)
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'var(--bg-base)',
    }}>
      {/* Logo — outside form container so it isn't clipped */}
      <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'clamp(40px, 10vw, 56px)',
            letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}>
            TERRAIN
          </h1>
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <div style={{
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)',
          padding: 'var(--space-8)',
        }}>

          {confirmed ? (
            <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
              <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>✉️</div>
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 400, fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)', letterSpacing: '-0.01em' }}>
                Check your email
              </h2>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                We sent a confirmation link to <strong style={{ color: 'var(--accent-orange)' }}>{email}</strong>.
                Click it to activate your account, then log in.
              </p>
              <Link to="/login" style={{
                textDecoration: 'none',
                display: 'inline-block',
                marginTop: 'var(--space-6)',
                background: 'var(--accent-orange)',
                color: '#FFFFFF',
                border: '1px solid var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-6)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
              }}>
                Go to Login
              </Link>
            </div>
          ) : (
          <>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'var(--text-xl)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center',
            letterSpacing: '-0.01em',
          }}>
            Create Account
          </h2>

          {error && (
            <div style={{
              padding: 'var(--space-3)',
              marginBottom: 'var(--space-4)',
              background: 'rgba(232, 67, 42, 0.1)',
              border: '1px solid var(--danger)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)',
              color: 'var(--danger)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
              }}>
                Username
              </label>
              <input
                className="input-retro"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your explorer name"
                maxLength={30}
                required
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 'var(--space-4)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
              }}>
                Email
              </label>
              <input
                className="input-retro"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div style={{ marginBottom: 'var(--space-6)' }}>
              <label style={{
                display: 'block',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-1)',
                fontWeight: 600,
              }}>
                Password
              </label>
              <input
                className="input-retro"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: 'var(--accent-orange)',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-3) var(--space-4)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                fontSize: 'var(--text-base)',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          </>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent-orange)', fontWeight: 600 }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  )
}
