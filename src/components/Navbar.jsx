import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'

export default function Navbar({ onThemeToggle }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Explorer'

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-6)',
      background: 'rgba(13, 10, 6, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '2px solid var(--border-retro)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link to="/map" style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        color: 'var(--accent-gold)',
        textDecoration: 'none',
        letterSpacing: '1px',
      }}>
        TERRAIN
      </Link>

      {/* Nav links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-6)',
      }}>
        <Link to="/map" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: location.pathname === '/map' ? 'var(--accent-gold)' : 'var(--text-muted)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color var(--duration-fast) var(--ease-out)',
        }}>
          Map
        </Link>

        <Link to="/explore" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: location.pathname === '/explore' ? 'var(--accent-gold)' : 'var(--text-muted)',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color var(--duration-fast) var(--ease-out)',
        }}>
          Explore
        </Link>

        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-muted)',
              padding: 'var(--space-1)',
              transition: 'color var(--duration-fast) var(--ease-out)',
            }}
            title="Theme settings"
          >
            &#9881;
          </button>
        )}

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-retro)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-glass)',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--accent-gold)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              color: 'var(--bg-base)',
              fontWeight: 700,
            }}>
              {username[0].toUpperCase()}
            </span>
            {username}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--space-1)',
              minWidth: '160px',
              background: 'var(--bg-surface)',
              border: '2px solid var(--border-retro)',
              borderRadius: 'var(--radius-md)',
              padding: 'var(--space-2)',
              zIndex: 60,
              animation: 'slide-up var(--duration-fast) var(--ease-out)',
            }}>
              <button
                onClick={handleSignOut}
                style={{
                  width: '100%',
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--text-primary)',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  transition: 'background var(--duration-fast)',
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-glass)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
