import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import RegionCard from '../components/RegionCard.jsx'

// ── Sample Data ──

const DEMO_REGIONS = [
  { id: 'demo-1', name: 'Morning Runs', type: 'mountains', category: 'physical', description: 'Building a daily running habit', color: '#7C9EBA', progress: 65, position_x: 24, position_y: 24 },
  { id: 'demo-2', name: 'Side Project', type: 'city', category: 'creative', description: 'Shipping my app by summer', color: '#D4A853', progress: 40, position_x: 248, position_y: 24 },
  { id: 'demo-3', name: 'Reading List', type: 'forest', category: 'learning', description: '24 books this year', color: '#5E9E6E', progress: 30, position_x: 136, position_y: 208 },
  { id: 'demo-4', name: 'Savings Goal', type: 'coast', category: 'financial', description: 'Emergency fund by December', color: '#00D4C8', progress: 55, position_x: 360, position_y: 130 },
]

const DEMO_CHECKINS = [
  { id: 'c1', region_id: 'demo-1', duration_minutes: 45, notes: 'Great 5K today, felt strong. Legs recovering faster now.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: 'c2', region_id: 'demo-1', duration_minutes: 30, notes: 'Easy recovery run. Listened to a podcast.', mood: 3, created_at: new Date(Date.now() - 1000*60*60*24*3).toISOString() },
  { id: 'c3', region_id: 'demo-2', duration_minutes: 120, notes: 'Shipped the auth flow. Feeling productive.', mood: 5, created_at: new Date(Date.now() - 1000*60*60*24*2).toISOString() },
  { id: 'c4', region_id: 'demo-3', duration_minutes: 60, notes: 'Finished chapter 8 of Designing Data-Intensive Applications.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*5).toISOString() },
  { id: 'c5', region_id: 'demo-4', duration_minutes: 15, notes: 'Moved $500 into savings. Automated next month.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*7).toISOString() },
]

const MOOD_EMOJI = ['', '\u{1F629}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F525}']

// ── Demo Checkin Modal (read-only, pre-filled) ──

function DemoCheckinModal({ region, checkins, onClose }) {
  const regionCheckins = checkins.filter(c => c.region_id === region.id)

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel-heavy">
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: region.color || 'var(--accent-gold)',
          marginBottom: 'var(--space-1)',
        }}>
          {region.name}
        </h2>
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
          textTransform: 'capitalize',
        }}>
          {region.type} &middot; {region.category}
        </p>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-6)',
          lineHeight: 1.6,
        }}>
          {region.description}
        </p>

        {/* Progress */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Progress
            </span>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              color: region.color || 'var(--accent-gold)',
            }}>
              {region.progress}%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-retro)',
            borderRadius: '4px',
          }}>
            <div style={{
              height: '100%',
              width: `${region.progress}%`,
              background: region.color || 'var(--accent-gold)',
              borderRadius: '4px',
              transition: 'width var(--duration-slow) var(--ease-out)',
            }} />
          </div>
        </div>

        {/* Recent check-ins */}
        <h3 style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          marginBottom: 'var(--space-3)',
        }}>
          Recent Check-ins
        </h3>

        {regionCheckins.length === 0 ? (
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-dim)',
            padding: 'var(--space-4)',
            textAlign: 'center',
            border: '1px dashed var(--border-retro)',
            borderRadius: 'var(--radius-md)',
          }}>
            No check-ins yet for this region.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-6)' }}>
            {regionCheckins.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: 'var(--space-3)',
                  background: 'var(--bg-glass)',
                  border: '1px solid var(--border-retro)',
                  borderRadius: 'var(--radius-md)',
                  borderLeft: `3px solid ${region.color || 'var(--accent-gold)'}`,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: c.notes ? 'var(--space-2)' : 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--text-lg)' }}>
                      {MOOD_EMOJI[c.mood] || MOOD_EMOJI[3]}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                    }}>
                      {c.duration_minutes} min
                    </span>
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
                    {new Date(c.created_at).toLocaleDateString()}
                  </span>
                </div>
                {c.notes && (
                  <p style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-muted)',
                    lineHeight: 1.5,
                  }}>
                    {c.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Demo notice + actions */}
        <div style={{
          padding: 'var(--space-3)',
          background: 'rgba(212, 168, 83, 0.08)',
          border: '1px solid rgba(212, 168, 83, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-4)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--accent-gold)',
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}>
            Demo Mode &mdash; Read Only
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <Link
            to="/signup"
            className="btn-retro"
            style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
          >
            Sign Up to Log Sessions
          </Link>
          <button
            type="button"
            className="btn-retro btn-retro--secondary"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Demo Region Card (no navigation, just opens modal) ──

function DemoRegionCard({ region, lastCheckinDate, onClick }) {
  const TYPE_ICONS = {
    mountains: '\u{26F0}\uFE0F',
    forest: '\u{1F332}',
    city: '\u{1F3D9}\uFE0F',
    coast: '\u{1F30A}',
  }

  const icon = TYPE_ICONS[region.type] || TYPE_ICONS.mountains

  const timeSince = lastCheckinDate
    ? formatTimeSince(new Date(lastCheckinDate))
    : 'No check-ins yet'

  return (
    <button
      onClick={() => onClick(region)}
      style={{
        flex: '0 0 200px',
        padding: 'var(--space-4)',
        background: 'var(--bg-glass)',
        border: '2px solid var(--border-retro)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--duration-fast) var(--ease-out)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-gold)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-retro)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-2)',
      }}>
        <span style={{ fontSize: 'var(--text-lg)' }}>{icon}</span>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {region.name}
        </span>
      </div>

      <div style={{
        height: '6px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '3px',
        marginBottom: 'var(--space-2)',
        border: '1px solid var(--border-retro)',
      }}>
        <div style={{
          height: '100%',
          width: `${region.progress || 0}%`,
          background: region.color || 'var(--accent-gold)',
          borderRadius: '3px',
          transition: 'width var(--duration-slow) var(--ease-out)',
        }} />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: region.color || 'var(--accent-gold)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {region.progress}%
        </span>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-dim)' }}>
          {timeSince}
        </span>
      </div>
    </button>
  )
}

function formatTimeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}

// ── Main Demo Page ──

export default function Demo() {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [bannerVisible, setBannerVisible] = useState(true)

  const getLastCheckinDate = useCallback((regionId) => {
    const regionCheckins = DEMO_CHECKINS.filter(c => c.region_id === regionId)
    if (regionCheckins.length === 0) return null
    return regionCheckins.reduce((latest, c) =>
      new Date(c.created_at) > new Date(latest.created_at) ? c : latest
    ).created_at
  }, [])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      {/* Demo Navbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/" style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            textDecoration: 'none',
            letterSpacing: '1px',
            background: 'linear-gradient(135deg, #4A90D9 0%, #FF6B9D 45%, #D4A853 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            TERRAIN
          </Link>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '10px',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--accent-teal)',
            padding: '2px 8px',
            border: '1px solid var(--accent-teal)',
            borderRadius: 'var(--radius-sm)',
          }}>
            DEMO
          </span>
        </div>

        <Link
          to="/signup"
          className="btn-retro"
          style={{
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2) var(--space-6)',
          }}
        >
          Sign Up
        </Link>
      </nav>

      {/* Dismissible banner */}
      {bannerVisible && (
        <div style={{
          position: 'fixed',
          top: '56px',
          left: 0,
          right: 0,
          zIndex: 40,
          padding: 'var(--space-3) var(--space-6)',
          background: 'rgba(212, 168, 83, 0.1)',
          borderBottom: '1px solid rgba(212, 168, 83, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-4)',
          animation: 'slide-up var(--duration-slow) var(--ease-out)',
        }}>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--accent-gold)',
            textAlign: 'center',
          }}>
            You're exploring a demo terrain.{' '}
            <Link to="/signup" style={{
              color: 'var(--text-primary)',
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
            }}>
              Sign up
            </Link>
            {' '}to create your own.
          </p>
          <button
            onClick={() => setBannerVisible(false)}
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-dim)',
              padding: 'var(--space-1)',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Main canvas */}
      <div style={{
        flex: 1,
        marginTop: bannerVisible ? '96px' : '56px',
        position: 'relative',
        transition: 'margin-top var(--duration-normal) var(--ease-out)',
      }}>
        <TerrainCanvas
          regions={DEMO_REGIONS}
          checkins={DEMO_CHECKINS}
          onRegionClick={(region) => setSelectedRegion(region)}
          interactive={true}
          theme={{}}
        />
      </div>

      {/* Bottom bar — Region cards */}
      <div style={{
        height: '100px',
        background: 'rgba(13, 10, 6, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '2px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      }}>
        {DEMO_REGIONS.map((region) => (
          <DemoRegionCard
            key={region.id}
            region={region}
            lastCheckinDate={getLastCheckinDate(region.id)}
            onClick={setSelectedRegion}
          />
        ))}
      </div>

      {/* Sign Up CTA at bottom */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-xs)',
          color: 'var(--text-dim)',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
        }}>
          Ready to map your own terrain?
        </span>
        <Link
          to="/signup"
          className="btn-retro btn-retro--orange"
          style={{
            textDecoration: 'none',
            fontSize: 'var(--text-sm)',
            padding: 'var(--space-2) var(--space-6)',
            borderRadius: '50px',
          }}
        >
          Sign Up to Start
        </Link>
      </div>

      {/* Demo Checkin Modal */}
      {selectedRegion && (
        <DemoCheckinModal
          region={selectedRegion}
          checkins={DEMO_CHECKINS}
          onClose={() => setSelectedRegion(null)}
        />
      )}
    </div>
  )
}
