import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useIsMobile } from '../hooks/useIsMobile.js'

export default function Navbar({ onReplayTour }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
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
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border-light)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link to="/map" style={{
        fontFamily: 'var(--font-heading)',
        fontWeight: 800,
        fontSize: 'var(--text-base)',
        letterSpacing: '0.08em',
        color: 'var(--text-primary)',
        textDecoration: 'none',
      }}>
        TERRAIN
      </Link>

      {/* Nav links */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? 'var(--space-3)' : 'var(--space-6)',
      }}>
        <Link to="/map" style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: location.pathname === '/map' ? 'var(--accent-orange)' : 'var(--text-muted)',
          fontWeight: location.pathname === '/map' ? 600 : 400,
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
          color: location.pathname === '/explore' ? 'var(--accent-orange)' : 'var(--text-muted)',
          fontWeight: location.pathname === '/explore' ? 600 : 400,
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'color var(--duration-fast) var(--ease-out)',
        }}>
          Explore
        </Link>

        {/* User menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: isMobile ? 'var(--space-1)' : 'var(--space-1) var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              background: 'transparent',
              cursor: 'pointer',
            }}
          >
            <span style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'var(--accent-orange)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 'var(--text-xs)',
              color: '#FFFFFF',
              fontWeight: 700,
            }}>
              {username[0].toUpperCase()}
            </span>
            {!isMobile && username}
          </button>

          {menuOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 'var(--space-1)',
              minWidth: '160px',
              background: 'var(--bg-surface-raised)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)',
              padding: 'var(--space-2)',
              zIndex: 60,
              animation: 'slide-up var(--duration-fast) var(--ease-out)',
            }}>
              {onReplayTour && (
                <button
                  onClick={() => { onReplayTour(); setMenuOpen(false) }}
                  style={{
                    width: '100%',
                    padding: 'var(--space-2) var(--space-3)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                    textAlign: 'left',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background var(--duration-fast)',
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--bg-muted)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  Replay Tour
                </button>
              )}
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
                onMouseEnter={(e) => e.target.style.background = 'var(--bg-muted)'}
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
