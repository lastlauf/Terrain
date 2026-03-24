import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function SignupOverlay({ onClose }) {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const isMobile = useIsMobile()
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
      if (data?.session) {
        navigate('/onboarding')
      } else {
        setConfirmed(true)
      }
    } catch (err) {
      setError(err.message || 'Signup failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ zIndex: 200 }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: isMobile ? 'calc(100vw - 24px)' : '440px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: isMobile ? 'var(--space-6)' : 'var(--space-8)',
          position: 'relative',
          animation: 'slide-up var(--duration-slow) var(--ease-out)',
          background: 'var(--bg-surface-raised)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-4)',
            right: 'var(--space-4)',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-muted)',
            background: 'transparent',
            border: '1px solid var(--border-light)',
            cursor: 'pointer',
            transition: 'color var(--duration-fast) var(--ease-out), border-color var(--duration-fast) var(--ease-out)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)'
            e.currentTarget.style.borderColor = 'var(--border-mid)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)'
            e.currentTarget.style.borderColor = 'var(--border-light)'
          }}
          title="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
          </svg>
        </button>

        {/* TERRAIN logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(32px, 8vw, 44px)',
            letterSpacing: '0.04em',
            color: 'var(--text-primary)',
          }}>
            TERRAIN
          </h1>
        </div>

        {confirmed ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-6) 0' }}>
            <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect x="4" y="12" width="40" height="28" stroke="var(--accent-orange)" strokeWidth="3" fill="none" />
                <path d="M4 12l20 16 20-16" stroke="var(--accent-orange)" strokeWidth="3" fill="none" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)', marginBottom: 'var(--space-3)' }}>
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
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-xl)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-6)',
              textAlign: 'center',
            }}>
              Create Account
            </h2>

            {error && (
              <div style={{
                padding: 'var(--space-3)',
                marginBottom: 'var(--space-4)',
                background: 'rgba(217, 59, 32, 0.08)',
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
          </>
        )}
      </div>
    </div>
  )
}
