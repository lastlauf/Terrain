import { useEffect, useRef, useState, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { drawPixelGrid } from '../lib/pixels.js'
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
  const regionColor = region.color || 'var(--accent-gold)'

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--bg-surface)',
        border: '3px solid var(--border-retro)',
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
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: regionColor,
            marginBottom: 'var(--space-2)',
            letterSpacing: '0.04em',
          }}>
            {region.name}
          </h3>

          {/* Type + Category pills */}
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: regionColor,
              border: `2px solid ${regionColor}`,
              background: 'transparent',
            }}>
              {region.type}
            </span>
            <span style={{
              display: 'inline-block',
              padding: '2px var(--space-2)',
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--text-muted)',
              border: '2px solid var(--border-retro)',
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
            <div style={{ height: '6px', background: 'rgba(0,0,0,0.4)', border: '2px solid var(--border-retro)' }}>
              <div style={{
                height: '100%',
                width: `${region.progress}%`,
                background: regionColor,
                transition: 'width var(--duration-slow) var(--ease-out)',
              }} />
            </div>
          </div>

          {/* Latest checkin note */}
          {latest && (
            <div style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--bg-glass)',
              border: '2px solid var(--border-retro)',
              borderLeft: `3px solid ${regionColor}`,
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
              className="btn-retro"
              onClick={onSignup}
              style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-6)' }}
            >
              Sign Up
            </button>
            <button
              type="button"
              className="btn-retro btn-retro--secondary"
              onClick={onClose}
              style={{ fontSize: 'var(--text-sm)', padding: 'var(--space-2) var(--space-4)' }}
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
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [demoRegion, setDemoRegion] = useState(null)
  const [signupOpen, setSignupOpen] = useState(() => searchParams.get('signup') === '1')

  useEffect(() => {
    if (user) navigate('/map', { replace: true })
  }, [user, navigate])

  // Pixel grid hero background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let running = true
    let time = 0

    function render() {
      if (!running) return
      const dpr = window.devicePixelRatio || 1
      const container = containerRef.current
      if (!container) { requestAnimationFrame(render); return }
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const W = rect.width
      const H = rect.height
      time += 0.005

      ctx.fillStyle = '#0D0A06'
      ctx.fillRect(0, 0, W, H)

      // Draw pixel grid
      drawPixelGrid(ctx, W, H, time)

      // Fade gradient at bottom
      const g = ctx.createLinearGradient(0, H * 0.75, 0, H)
      g.addColorStop(0, 'rgba(13, 10, 6, 0)')
      g.addColorStop(1, '#0D0A06')
      ctx.fillStyle = g
      ctx.fillRect(0, H * 0.75, W, H * 0.25)

      requestAnimationFrame(render)
    }
    render()
    return () => { running = false }
  }, [])

  const openSignup = useCallback(() => setSignupOpen(true), [])
  const closeSignup = useCallback(() => setSignupOpen(false), [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── HERO ── */}
      <section
        className="scanlines"
        style={{ position: 'relative', height: '100vh', overflow: 'hidden' }}
      >
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
        </div>

        <div style={{
          position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 30% 50%, transparent 25%, rgba(13,10,6,0.65) 75%)',
        }} />

        <div style={{
          position: 'relative', zIndex: 2,
          height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 6vw',
          maxWidth: '1100px',
        }}>
          <span className="mono-label" style={{ marginBottom: '20px', color: 'var(--accent-gold)', opacity: 0.7 }}>
            Goal operating system — v1.0
          </span>

          {/* TERRAIN on ONE line — gradient text */}
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(48px, 9vw, 120px)',
            lineHeight: 1.0,
            letterSpacing: '0.04em',
            background: 'linear-gradient(135deg, #4A90D9 0%, #FF6B9D 45%, #D4A853 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: 'drop-shadow(0 0 40px rgba(212,168,83,0.15))',
            marginBottom: '32px',
            whiteSpace: 'nowrap',
          }}>
            TERRAIN
          </h1>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '48px', flexWrap: 'wrap' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'clamp(16px, 2.2vw, 22px)',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              maxWidth: '320px',
            }}>
              Your goals, mapped. A living terrain where
              every region is a life area you're building.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#demo" className="btn-retro" style={{
                textDecoration: 'none',
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '50px',
              }}>
                Start Exploring
              </a>
              <Link to="/login" className="btn-retro btn-retro--secondary" style={{
                textDecoration: 'none',
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '50px',
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
                  padding: 0,
                  fontFamily: 'inherit',
                }}
              >
                or Sign Up
              </button>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: '32px', left: '6vw', zIndex: 2,
          animation: 'float 2s ease-in-out infinite',
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
        padding: '120px 6vw',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '80px' }}>
          <span className="mono-label">How it works</span>
          <hr className="dotted-divider" style={{ flex: 1, margin: 0 }} />
        </div>

        {/* Feature 01 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '64px',
          alignItems: 'center',
          marginBottom: '80px',
        }}>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-gold)' }}>01</span>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 5vw, 60px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
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
          <div className="glass-panel" style={{
            padding: 0,
            aspectRatio: '4/3',
            position: 'relative',
            overflow: 'hidden',
            background: 'var(--bg-base)',
          }}>
            {/* Grid dots background */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: 'radial-gradient(circle, rgba(245,230,200,0.06) 1px, transparent 1px)',
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
              <line x1="80" y1="75" x2="310" y2="105" stroke="var(--border-retro)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
              <line x1="170" y1="210" x2="80" y2="75" stroke="var(--border-retro)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
              <line x1="170" y1="210" x2="280" y2="230" stroke="var(--border-retro)" strokeWidth="2" strokeDasharray="4 4" opacity="0.4" />
            </svg>
          </div>
        </div>

        <hr className="dotted-divider" />

        {/* Features 02 + 03 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '48px',
          marginTop: '80px',
        }}>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-blue)' }}>02</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelSatellite size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
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
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-pink)' }}>03</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelGamepad size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 3.5vw, 44px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
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
        padding: '80px 6vw 120px',
        maxWidth: '1100px',
        margin: '0 auto',
      }}>
        <hr className="dotted-divider" style={{ marginBottom: '80px' }} />

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-gold)' }}>Interactive</span>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 6vw, 80px)',
            letterSpacing: '0.1em',
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
          height: '500px',
          margin: '0 auto 48px',
          border: '3px solid var(--border-retro)',
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
            className="btn-retro btn-retro--orange"
            style={{
              fontSize: '16px',
              padding: '16px 40px',
              borderRadius: '50px',
            }}
          >
            Sign Up to Build Yours
          </button>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section style={{
        borderTop: '2px solid var(--border-retro)',
        padding: '80px 6vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '32px',
      }}>
        <div>
          <p className="mono-label" style={{ marginBottom: '8px' }}>Ready to map your terrain?</p>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 64px)',
            color: 'var(--accent-gold)',
            lineHeight: 1.0,
            letterSpacing: '0.04em',
          }}>
            Start building.
          </h2>
        </div>
        <button
          onClick={openSignup}
          className="btn-retro btn-retro--orange"
          style={{
            fontSize: '16px',
            padding: '16px 40px',
            borderRadius: '50px',
            flexShrink: 0,
          }}
        >
          Create Your Map
        </button>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: '24px 6vw',
        borderTop: '1px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
