import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { PixelSparkleIcon } from '../components/PixelIcons.jsx'

export default function Login() {
  const navigate = useNavigate()
  const { signIn, sendMagicLink } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await signIn(email, password)
      navigate('/map')
    } catch (err) {
      const msg = err.message || ''
      if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please confirm your email first, or use the magic link below to log in without a password.')
      } else {
        setError(msg || 'Login failed. Check your credentials.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setError('Enter your email first.')
      return
    }

    setError('')
    setLoading(true)

    try {
      await sendMagicLink(email)
      setMagicLinkSent(true)
    } catch (err) {
      setError(err.message || 'Could not send magic link.')
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
            fontSize: 'clamp(40px, 10vw, 56px)',
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #4A90D9 0%, #FF6B9D 45%, #D4A853 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 30px rgba(212,168,83,0.15))',
          }}>
            TERRAIN
          </h1>
        </Link>
      </div>

      <div style={{
        width: '100%',
        maxWidth: '400px',
      }}>
        <div className="glass-panel-heavy" style={{ padding: 'var(--space-8)' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-xl)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
            textAlign: 'center',
          }}>
            Welcome Back
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

          {magicLinkSent ? (
            <div style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: 'var(--text-3xl)',
                marginBottom: 'var(--space-4)',
              }}>
                <PixelSparkleIcon size={48} />
              </div>
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-base)',
                color: 'var(--text-primary)',
                marginBottom: 'var(--space-2)',
              }}>
                Check your email
              </p>
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
              }}>
                We sent a magic link to {email}
              </p>
            </div>
          ) : (
            <form onSubmit={handleLogin}>
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
                  autoFocus
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
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-retro"
                disabled={loading}
                style={{ width: '100%', marginBottom: 'var(--space-3)' }}
              >
                {loading ? 'Signing in...' : 'Log In'}
              </button>

              <button
                type="button"
                className="btn-retro btn-retro--secondary"
                onClick={handleMagicLink}
                disabled={loading}
                style={{ width: '100%' }}
              >
                Send Magic Link
              </button>
            </form>
          )}
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: 'var(--space-6)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
        }}>
          No account yet?{' '}
          <Link to="/signup" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Sign Up
          </Link>
        </p>
      </div>

      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 6vw',
        borderTop: '1px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--bg-base)',
      }}>
        <span className="mono-label">TERRAIN</span>
        <span className="mono-label" style={{ color: 'var(--text-dim)' }}>enterterrain.com</span>
      </footer>
    </div>
  )
}
