import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import SignupOverlay from '../components/SignupOverlay.jsx'
import {
  SPRITES, PALETTES, REGION_COLORS,
} from '../lib/sprites.js'

// ── Pixel art inline SVG components (updated colors) ──

function PixelMountain({ size = 48 }) {
  const pixels = [
    [0,0,0,0,1,0,0,0],
    [0,0,0,1,2,1,0,0],
    [0,0,1,2,2,2,1,0],
    [0,1,2,2,2,2,2,1],
    [1,3,3,2,2,2,3,3],
    [3,3,3,3,2,3,3,3],
    [3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3],
  ]
  const colors = ['transparent', '#F5E6C8', '#4A90D9', '#3A72B0']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

function PixelTree({ size = 48 }) {
  const pixels = [
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,1,0,0,0],
    [0,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,0],
    [0,1,1,1,1,1,0,0],
    [1,1,1,1,1,1,1,0],
    [0,0,0,2,0,0,0,0],
    [0,0,0,2,0,0,0,0],
  ]
  const colors = ['transparent', '#5E9E6E', '#8B6B3E']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

function PixelCity({ size = 48 }) {
  const pixels = [
    [0,0,0,0,0,1,0,0],
    [0,0,1,0,0,1,0,0],
    [0,0,1,0,1,1,1,0],
    [0,1,1,0,1,2,1,0],
    [0,1,2,1,1,1,1,0],
    [1,1,1,1,1,2,1,0],
    [1,2,1,2,1,1,1,1],
    [1,1,1,1,1,1,1,1],
  ]
  const colors = ['transparent', '#D4A853', '#FF6B9D']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

function PixelWave({ size = 48 }) {
  const pixels = [
    [0,0,0,0,0,0,0,0],
    [0,0,1,0,0,0,0,0],
    [0,1,2,1,0,0,1,0],
    [1,2,2,2,1,1,2,1],
    [2,2,2,2,2,2,2,2],
    [0,2,2,2,2,2,2,0],
    [0,0,3,3,3,3,0,0],
    [0,0,0,3,3,0,0,0],
  ]
  const colors = ['transparent', '#F5E6C8', '#FF6B9D', '#D4A853']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

function PixelSatellite({ size = 48 }) {
  const pixels = [
    [0,0,0,0,0,0,1,0],
    [0,0,0,0,0,1,0,0],
    [0,0,0,0,1,0,0,0],
    [0,0,0,2,2,2,0,0],
    [0,0,2,2,2,2,2,0],
    [0,0,0,2,2,2,0,0],
    [0,1,0,0,1,0,0,0],
    [1,0,0,0,0,0,0,0],
  ]
  const colors = ['transparent', '#4A90D9', '#8A7560']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

function PixelGamepad({ size = 48 }) {
  const pixels = [
    [0,0,0,0,0,0,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,1,1,1,1,1],
    [1,0,2,0,1,0,3,1],
    [1,2,2,2,1,3,0,1],
    [1,0,2,0,1,0,3,1],
    [0,1,1,1,1,1,1,0],
    [0,0,1,0,0,1,0,0],
  ]
  const colors = ['transparent', '#5A4A38', '#D4A853', '#FF6B9D']
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

// ── SVG sprite renderer for demo card (uses sprite data from lib/sprites) ──

function SpriteRenderer({ type, scale = 8 }) {
  const sprite = SPRITES[type] || SPRITES.mountains
  const palette = PALETTES[type] || PALETTES.mountains
  const size = sprite.length * scale
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {sprite.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * scale} y={y * scale} width={scale} height={scale} fill={palette[c]} />
      ) : null))}
    </svg>
  )
}

// ── Demo Data ──

const DEMO_REGIONS = [
  { id: 'demo-1', name: 'Morning Runs', type: 'mountains', category: 'physical', description: 'Building a daily running habit', color: '#4A90D9', progress: 65 },
  { id: 'demo-2', name: 'Side Project', type: 'city', category: 'creative', description: 'Shipping my app by summer', color: '#D4A853', progress: 40 },
  { id: 'demo-3', name: 'Reading List', type: 'forest', category: 'learning', description: '24 books this year', color: '#5E9E6E', progress: 30 },
  { id: 'demo-4', name: 'Savings Goal', type: 'coast', category: 'financial', description: 'Emergency fund by December', color: '#FF6B9D', progress: 55 },
]

const DEMO_CHECKINS = [
  { id: 'c1', region_id: 'demo-1', duration_minutes: 45, notes: 'Great 5K today, felt strong.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: 'c2', region_id: 'demo-2', duration_minutes: 120, notes: 'Shipped the auth flow.', mood: 5, created_at: new Date(Date.now() - 1000*60*60*24*2).toISOString() },
  { id: 'c3', region_id: 'demo-3', duration_minutes: 60, notes: 'Finished chapter 8.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*5).toISOString() },
  { id: 'c4', region_id: 'demo-4', duration_minutes: 15, notes: 'Moved $500 into savings.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*7).toISOString() },
]

const MOOD_EMOJI = {
  1: String.fromCodePoint(0x1F629),
  2: String.fromCodePoint(0x1F615),
  3: String.fromCodePoint(0x1F610),
  4: String.fromCodePoint(0x1F642),
  5: String.fromCodePoint(0x1F525),
}

// ── Rich Demo Card (slides up from bottom of canvas) ──

function DemoCard({ region, onClose, onSignup }) {
  const checkins = DEMO_CHECKINS.filter(c => c.region_id === region.id)
  const latest = checkins[0]
  const regionColor = region.color || 'var(--accent-orange)'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-light)',
        borderBottom: 'none',
        padding: 'var(--space-6)',
        zIndex: 10,
        animation: 'slide-up var(--duration-slow) var(--ease-out)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'flex-start' }}>
        {/* Large pixel sprite */}
        <div style={{ flexShrink: 0 }}>
          <SpriteRenderer type={region.type} scale={8} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Name */}
          <h3 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: regionColor,
            marginBottom: 'var(--space-2)',
          }}>
            {region.name}
          </h3>

          {/* Type + Category pills */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: regionColor,
              border: `1px solid ${regionColor}`,
              borderRadius: 'var(--radius-sm)',
              background: 'var(--accent-orange-bg)',
            }}>
              {region.type}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-sm)',
              background: 'transparent',
            }}>
              {region.category}
            </span>
          </div>

          {/* Description */}
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-4)',
          }}>
            {region.description}
          </p>

          {/* Progress bar */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Progress</span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-xs)', color: regionColor }}>{region.progress}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--bg-muted)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{
                height: '100%',
                width: `${region.progress}%`,
                background: 'var(--accent-orange)',
                borderRadius: 'var(--radius-sm)',
                transition: 'width var(--duration-slow) var(--ease-out)',
              }} />
            </div>
          </div>

          {/* Latest checkin note */}
          {latest && (
            <div style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderLeft: `3px solid ${regionColor}`,
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-1)' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-primary)' }}>
                  {latest.duration_minutes} min {MOOD_EMOJI[latest.mood] || ''}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  {new Date(latest.created_at).toLocaleDateString()}
                </span>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {latest.notes}
              </p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="button"
              onClick={onSignup}
              style={{
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-6)',
                background: 'var(--accent-orange)',
                color: '#FFFFFF',
                border: '1px solid var(--accent-orange)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                fontSize: 'var(--text-sm)',
                padding: 'var(--space-2) var(--space-4)',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-mid)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Main Landing ──

export default function Landing() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user } = useAuth()
  const [demoRegion, setDemoRegion] = useState(null)
  const [signupOpen, setSignupOpen] = useState(() => searchParams.get('signup') === '1')
  const isMobile = useIsMobile()

  useEffect(() => {
    if (user) navigate('/map', { replace: true })
  }, [user, navigate])

  const openSignup = useCallback(() => setSignupOpen(true), [])
  const closeSignup = useCallback(() => setSignupOpen(false), [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── HERO ── */}
      <section
        style={{
          position: 'relative',
          height: '100vh',
          overflow: 'hidden',
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <div style={{
          position: 'relative', zIndex: 2,
          height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 6vw',
          maxWidth: '1100px',
        }}>
          <span className="mono-label" style={{ marginBottom: '20px', color: 'var(--accent-orange)', opacity: 0.8 }}>
            Goal operating system — v1.0
          </span>

          {/* TERRAIN on ONE line — bold display text */}
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: isMobile ? 'clamp(32px, 11vw, 48px)' : 'clamp(48px, 9vw, 120px)',
            lineHeight: 1.0,
            letterSpacing: isMobile ? '0.02em' : '0.04em',
            color: 'var(--text-primary)',
            marginBottom: '32px',
            whiteSpace: 'nowrap',
          }}>
            TERRAIN
          </h1>

          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? '24px' : '48px',
            flexWrap: 'wrap',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              maxWidth: '320px',
            }}>
              Your goals, mapped. A living terrain where
              every region is a life area you're building.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              flexWrap: 'wrap',
              alignItems: isMobile ? 'stretch' : 'center',
              width: isMobile ? '100%' : 'auto',
            }}>
              <a href="#demo" style={{
                textDecoration: 'none',
                fontSize: isMobile ? '14px' : '15px',
                padding: isMobile ? '12px 24px' : '14px 32px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                background: 'var(--accent-orange)',
                color: '#FFFFFF',
                border: '1px solid var(--accent-orange)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block',
              }}>
                Start Exploring
              </a>
              <Link to="/login" style={{
                textDecoration: 'none',
                fontSize: isMobile ? '14px' : '15px',
                padding: isMobile ? '12px 24px' : '14px 32px',
                borderRadius: 'var(--radius-md)',
                textAlign: 'center',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-mid)',
                fontFamily: 'var(--font-body)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-block',
              }}>
                Log In
              </Link>
              <button
                onClick={openSignup}
                style={{
                  fontSize: '14px',
                  color: 'var(--text-muted)',
                  textDecoration: 'underline',
                  textUnderlineOffset: '3px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isMobile ? '8px 0' : 0,
                  fontFamily: 'inherit',
                  textAlign: isMobile ? 'center' : 'left',
                }}
              >
                or Sign Up
              </button>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: isMobile ? '16px' : '32px', left: '6vw', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span className="mono-label" style={{ color: 'var(--text-dim)' }}>scroll</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: isMobile ? '64px 6vw' : '120px 6vw',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: isMobile ? '48px' : '80px' }}>
          <span className="mono-label">How it works</span>
          <hr className="dotted-divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Feature 01 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '32px' : '64px',
          alignItems: 'center',
          marginBottom: isMobile ? '48px' : '80px',
        }}>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-orange)' }}>01</span>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(32px, 5vw, 60px)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}>
              Map<br />View
            </h2>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '380px' }}>
              Each goal becomes a region on your terrain — mountains, forests, cities, coasts. The map breathes: weather shifts with your check-in recency.
            </p>
          </div>
          {/* Mini map preview with icons placed on terrain */}
          <div style={{
            padding: 0,
            aspectRatio: '4/3',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
          }}>
            {/* Grid dots background */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(200,194,181,0.25) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }} />
            {/* Region icons positioned on the "map" */}
            <div style={{ position: 'absolute', top: '15%', left: '12%' }}>
              <PixelMountain size={48} />
              <span className="mono-label" style={{ display: 'block', textAlign: 'center', marginTop: '4px', fontSize: '9px', color: 'var(--region-mountains)' }}>runs</span>
            </div>
            <div style={{ position: 'absolute', top: '25%', right: '15%' }}>
              <PixelCity size={48} />
              <span className="mono-label" style={{ display: 'block', textAlign: 'center', marginTop: '4px', fontSize: '9px', color: 'var(--region-city)' }}>project</span>
            </div>
            <div style={{ position: 'absolute', bottom: '25%', left: '35%' }}>
              <PixelTree size={48} />
              <span className="mono-label" style={{ display: 'block', textAlign: 'center', marginTop: '4px', fontSize: '9px', color: 'var(--region-forest)' }}>reading</span>
            </div>
            <div style={{ position: 'absolute', bottom: '15%', right: '25%' }}>
              <PixelWave size={48} />
              <span className="mono-label" style={{ display: 'block', textAlign: 'center', marginTop: '4px', fontSize: '9px', color: 'var(--region-coast)' }}>savings</span>
            </div>
            {/* Connecting dotted lines between regions */}
            <svg viewBox="0 0 400 300" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
              <line x1="80" y1="75" x2="310" y2="105" stroke="var(--border-mid)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <line x1="170" y1="210" x2="80" y2="75" stroke="var(--border-mid)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
              <line x1="170" y1="210" x2="280" y2="230" stroke="var(--border-mid)" strokeWidth="1" strokeDasharray="4 4" opacity="0.5" />
            </svg>
          </div>
        </div>

        <hr className="dotted-divider" />

        {/* Features 02 + 03 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '32px' : '48px',
          marginTop: isMobile ? '48px' : '80px',
        }}>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>02</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelSatellite size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              Field<br />Reports
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              AI-powered dispatches from your terrain. A wise cartographer notices patterns, names what it sees, and asks one good question. Under 80 words — always.
            </p>
          </div>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)' }}>03</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelGamepad size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 800,
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              lineHeight: 1.1,
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              Explore<br />Mode
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Walk through your goals as a platformer. Each region becomes a biome zone. Collect past reflections as orbs. Traverse your progress — literally.
            </p>
          </div>
        </div>
      </section>

      {/* ── DEMO SECTION ── */}
      <section id="demo" style={{
        padding: isMobile ? '48px 6vw 64px' : '80px 6vw 120px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <hr className="dotted-divider" style={{ marginBottom: isMobile ? '48px' : '80px' }} />

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-orange)' }}>Interactive</span>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(40px, 6vw, 80px)',
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            Try the Demo
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Click a region to explore it.
          </p>
        </div>

        {/* Demo Canvas — full width, taller */}
        <div style={{
          width: '100%',
          maxWidth: '900px',
          height: isMobile ? '300px' : '500px',
          margin: isMobile ? '0 auto 32px' : '0 auto 48px',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-base)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <TerrainCanvas
            regions={DEMO_REGIONS}
            checkins={DEMO_CHECKINS}
            onRegionClick={(region) => setDemoRegion(region)}
            interactive={true}
            mini={false}
            theme={{}}
          />

          {/* Rich inline card that slides up from bottom */}
          {demoRegion && (
            <DemoCard
              region={demoRegion}
              onClose={() => setDemoRegion(null)}
              onSignup={() => { setDemoRegion(null); openSignup() }}
            />
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={openSignup}
            style={{
              fontSize: isMobile ? '14px' : '16px',
              padding: isMobile ? '12px 24px' : '16px 40px',
              borderRadius: 'var(--radius-md)',
              width: isMobile ? '100%' : 'auto',
              background: 'var(--accent-orange)',
              color: '#FFFFFF',
              border: '1px solid var(--accent-orange)',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Sign Up to Build Yours
          </button>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        padding: isMobile ? '48px 6vw' : '80px 6vw',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: isMobile ? '24px' : '32px',
      }}>
        <div>
          <p className="mono-label" style={{ marginBottom: '8px', color: 'var(--text-muted)' }}>Ready to map your terrain?</p>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 800,
            fontSize: 'clamp(32px, 5vw, 64px)',
            color: 'var(--text-primary)',
            lineHeight: 1.0,
          }}>
            Start building.
          </h2>
        </div>
        <button
          onClick={openSignup}
          style={{
            fontSize: isMobile ? '14px' : '16px',
            padding: isMobile ? '12px 24px' : '16px 40px',
            borderRadius: 'var(--radius-md)',
            flexShrink: 0,
            width: isMobile ? '100%' : 'auto',
            background: 'var(--accent-orange)',
            color: '#FFFFFF',
            border: '1px solid var(--accent-orange)',
            fontFamily: 'var(--font-body)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Create Your Map
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: isMobile ? '16px 6vw' : '24px 6vw',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '4px' : '0',
      }}>
        <span className="mono-label">TERRAIN — Goal Operating System</span>
        <span className="mono-label" style={{ color: 'var(--text-dim)' }}>Built with care</span>
      </footer>

      {/* Signup overlay */}
      {signupOpen && (
        <SignupOverlay onClose={closeSignup} />
      )}
    </div>
  )
}
