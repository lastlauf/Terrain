import { useEffect, useState, useCallback, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import SignupOverlay from '../components/SignupOverlay.jsx'
import {
  SPRITES, PALETTES, REGION_COLORS,
} from '../lib/sprites.js'

// ── Isometric Diorama SVG Components ──
// Hand-crafted isometric tiles inspired by reference art

function IsometricForest({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Base block */}
      <path d="M100 170 L30 130 L30 100 L100 140 Z" fill="#8B8680" />
      <path d="M100 170 L170 130 L170 100 L100 140 Z" fill="#A09A93" />
      <path d="M30 100 L100 60 L170 100 L100 140 Z" fill="#5E9E6E" />
      {/* Grass detail */}
      <path d="M50 110 L100 85 L150 110 L100 135 Z" fill="#6BAF7B" />
      {/* Trees */}
      <g>
        <polygon points="75,55 65,75 85,75" fill="#3D7A4A" />
        <polygon points="75,48 67,65 83,65" fill="#4A8C5C" />
        <polygon points="75,40 69,55 81,55" fill="#5E9E6E" />
        <rect x="73" y="75" width="4" height="8" fill="#8B6B3E" />
      </g>
      <g>
        <polygon points="95,50 85,70 105,70" fill="#3D7A4A" />
        <polygon points="95,43 87,60 103,60" fill="#4A8C5C" />
        <polygon points="95,35 89,50 101,50" fill="#5E9E6E" />
        <rect x="93" y="70" width="4" height="8" fill="#8B6B3E" />
      </g>
      <g>
        <polygon points="115,58 105,78 125,78" fill="#3D7A4A" />
        <polygon points="115,51 107,68 123,68" fill="#4A8C5C" />
        <polygon points="115,43 109,58 121,58" fill="#5E9E6E" />
        <rect x="113" y="78" width="4" height="8" fill="#8B6B3E" />
      </g>
      {/* Small cabin */}
      <path d="M128 82 L128 95 L142 88 L142 75 Z" fill="#C4A882" />
      <path d="M128 82 L120 78 L120 91 L128 95 Z" fill="#A89070" />
      <path d="M120 78 L128 72 L142 78 L134 82 Z" fill="#D4B892" />
      <path d="M120 78 L128 72 L135 76 L128 82 Z" fill="#BF8C5E" />
      {/* Campfire */}
      <circle cx="60" cy="100" r="3" fill="#E8712B" opacity="0.8" />
      <circle cx="60" cy="99" r="2" fill="#F5C542" opacity="0.6" />
    </svg>
  )
}

function IsometricCoast({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Base block */}
      <path d="M100 170 L30 130 L30 100 L100 140 Z" fill="#8B8680" />
      <path d="M100 170 L170 130 L170 100 L100 140 Z" fill="#A09A93" />
      {/* Ground with water split */}
      <path d="M30 100 L100 60 L130 77 L100 97 L60 117 L30 100 Z" fill="#5E9E6E" />
      <path d="M130 77 L170 100 L100 140 L60 117 L100 97 Z" fill="#5DB8D4" opacity="0.7" />
      {/* Water surface detail */}
      <path d="M130 80 L160 96 L100 130 L70 114 L100 100 Z" fill="#4AA8C4" opacity="0.5" />
      {/* Rocks */}
      <ellipse cx="90" cy="90" rx="8" ry="5" fill="#9E9890" />
      <ellipse cx="82" cy="93" rx="6" ry="4" fill="#B5AFA8" />
      <ellipse cx="110" cy="85" rx="5" ry="3" fill="#A8A29C" />
      {/* Sandy shore */}
      <path d="M60 112 L100 92 L110 98 L70 118 Z" fill="#D4C8A0" />
      {/* Small boat */}
      <g transform="translate(120, 100) rotate(-15)">
        <path d="M0 0 L20 0 L18 6 L2 6 Z" fill="#8B6B3E" />
        <line x1="10" y1="0" x2="10" y2="-12" stroke="#6B5030" strokeWidth="1.5" />
        <path d="M10 -12 L18 -4 L10 -2 Z" fill="#E8E4DC" opacity="0.8" />
      </g>
      {/* Palm tree */}
      <rect x="48" y="85" width="3" height="15" fill="#8B6B3E" />
      <path d="M49 85 L40 78 L49 82 Z" fill="#5E9E6E" />
      <path d="M49 85 L58 78 L49 82 Z" fill="#4A8C5C" />
      <path d="M49 83 L44 75 L49 80 Z" fill="#6BAF7B" />
    </svg>
  )
}

function IsometricMountain({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Base block */}
      <path d="M100 170 L30 130 L30 100 L100 140 Z" fill="#8B8680" />
      <path d="M100 170 L170 130 L170 100 L100 140 Z" fill="#A09A93" />
      <path d="M30 100 L100 60 L170 100 L100 140 Z" fill="#6BAF7B" />
      {/* Mountain */}
      <polygon points="100,25 60,85 140,85" fill="#4A6FA5" />
      <polygon points="100,25 80,60 120,60" fill="#5A82B8" />
      {/* Snow cap */}
      <polygon points="100,25 90,42 110,42" fill="#F5F2ED" />
      <polygon points="100,25 93,38 107,38" fill="#FFFFFF" />
      {/* Smaller peak */}
      <polygon points="135,50 115,85 155,85" fill="#3D5E8C" />
      <polygon points="135,50 127,65 143,65" fill="#4A6FA5" />
      {/* Trail path */}
      <path d="M65 100 Q80 90 95 95 Q110 100 130 88" stroke="#D4C8A0" strokeWidth="2" fill="none" strokeDasharray="4 3" opacity="0.6" />
      {/* Small rocks */}
      <ellipse cx="70" cy="105" rx="5" ry="3" fill="#9E9890" />
      <ellipse cx="130" cy="100" rx="4" ry="2.5" fill="#B5AFA8" />
    </svg>
  )
}

function IsometricCity({ size = 200 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      {/* Base block */}
      <path d="M100 170 L30 130 L30 100 L100 140 Z" fill="#8B8680" />
      <path d="M100 170 L170 130 L170 100 L100 140 Z" fill="#A09A93" />
      <path d="M30 100 L100 60 L170 100 L100 140 Z" fill="#D4C8A0" />
      {/* Grid pattern on ground */}
      <line x1="60" y1="80" x2="100" y2="120" stroke="#C4B890" strokeWidth="0.5" />
      <line x1="80" y1="70" x2="120" y2="110" stroke="#C4B890" strokeWidth="0.5" />
      <line x1="60" y1="100" x2="140" y2="100" stroke="#C4B890" strokeWidth="0.5" />
      {/* Tall building */}
      <path d="M80 45 L80 90 L95 98 L95 53 Z" fill="#E8E4DC" />
      <path d="M95 53 L95 98 L105 92 L105 47 Z" fill="#D4CFC6" />
      <path d="M80 45 L90 40 L105 47 L95 53 Z" fill="#F5F2ED" />
      {/* Windows */}
      <rect x="83" y="55" width="4" height="4" fill="#4A6FA5" opacity="0.4" />
      <rect x="83" y="63" width="4" height="4" fill="#4A6FA5" opacity="0.6" />
      <rect x="83" y="71" width="4" height="4" fill="#E8712B" opacity="0.5" />
      <rect x="89" y="55" width="4" height="4" fill="#4A6FA5" opacity="0.3" />
      <rect x="89" y="63" width="4" height="4" fill="#4A6FA5" opacity="0.5" />
      <rect x="97" y="55" width="4" height="4" fill="#4A6FA5" opacity="0.4" />
      <rect x="97" y="63" width="4" height="4" fill="#E8712B" opacity="0.4" />
      {/* Shorter building */}
      <path d="M115 65 L115 95 L130 103 L130 73 Z" fill="#E8E4DC" />
      <path d="M130 73 L130 103 L140 97 L140 67 Z" fill="#C8C2B5" />
      <path d="M115 65 L125 60 L140 67 L130 73 Z" fill="#F0ECE4" />
      {/* Windows on shorter building */}
      <rect x="118" y="73" width="4" height="3" fill="#4A6FA5" opacity="0.3" />
      <rect x="118" y="80" width="4" height="3" fill="#E8712B" opacity="0.4" />
      <rect x="124" y="73" width="4" height="3" fill="#4A6FA5" opacity="0.5" />
      {/* Small tree between buildings */}
      <circle cx="108" cy="88" r="5" fill="#5E9E6E" />
      <rect x="107" y="88" width="2" height="5" fill="#8B6B3E" />
    </svg>
  )
}

// ── Scroll-triggered fade-up hook ──

function useScrollReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect() } },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible]
}

// ── SVG sprite renderer for demo card ──

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
  { id: 'demo-1', name: 'Morning Runs', type: 'mountains', category: 'physical', description: 'Building a daily running habit', color: '#4A6FA5', progress: 65 },
  { id: 'demo-2', name: 'Side Project', type: 'city', category: 'creative', description: 'Shipping my app by summer', color: '#C45A1A', progress: 40 },
  { id: 'demo-3', name: 'Reading List', type: 'forest', category: 'learning', description: '24 books this year', color: '#5E9E6E', progress: 30 },
  { id: 'demo-4', name: 'Savings Goal', type: 'coast', category: 'financial', description: 'Emergency fund by December', color: '#3A7D9E', progress: 55 },
]

const DEMO_CHECKINS = [
  { id: 'c1', region_id: 'demo-1', duration_minutes: 45, notes: 'Great 5K today, felt strong.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24).toISOString() },
  { id: 'c2', region_id: 'demo-2', duration_minutes: 120, notes: 'Shipped the auth flow.', mood: 5, created_at: new Date(Date.now() - 1000*60*60*24*2).toISOString() },
  { id: 'c3', region_id: 'demo-3', duration_minutes: 60, notes: 'Finished chapter 8.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*5).toISOString() },
  { id: 'c4', region_id: 'demo-4', duration_minutes: 15, notes: 'Moved $500 into savings.', mood: 4, created_at: new Date(Date.now() - 1000*60*60*24*7).toISOString() },
]

const MOOD_EMOJI = { 1: '\u{1F629}', 2: '\u{1F615}', 3: '\u{1F610}', 4: '\u{1F642}', 5: '\u{1F525}' }

// ── Rich Demo Card ──

function DemoCard({ region, onClose, onSignup }) {
  const checkins = DEMO_CHECKINS.filter(c => c.region_id === region.id)
  const latest = checkins[0]
  const regionColor = region.color || 'var(--accent-orange)'
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'var(--bg-surface-raised)', border: '1px solid var(--border-light)',
      borderBottom: 'none', padding: '24px', zIndex: 10,
      animation: 'fadeUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
    }}>
      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        <div style={{ flexShrink: 0 }}><SpriteRenderer type={region.type} scale={8} /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400, fontSize: '24px', letterSpacing: '-0.01em', color: regionColor, marginBottom: '8px' }}>{region.name}</h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <span style={{ display: 'inline-block', padding: '2px 8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: regionColor, border: `1px solid ${regionColor}`, borderRadius: '2px' }}>{region.type}</span>
            <span style={{ display: 'inline-block', padding: '2px 8px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', border: '1px solid var(--border-light)', borderRadius: '2px' }}>{region.category}</span>
          </div>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>{region.description}</p>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Progress</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: regionColor }}>{region.progress}%</span>
            </div>
            <div style={{ height: '4px', background: 'var(--bg-muted)', borderRadius: '2px' }}>
              <div style={{ height: '100%', width: `${region.progress}%`, background: regionColor, borderRadius: '2px', transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)' }} />
            </div>
          </div>
          {latest && (
            <div style={{ padding: '8px 12px', background: 'var(--bg-surface)', border: '1px solid var(--border-light)', borderLeft: `3px solid ${regionColor}`, borderRadius: '4px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-primary)' }}>{latest.duration_minutes} min {MOOD_EMOJI[latest.mood] || ''}</span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{new Date(latest.created_at).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.4 }}>{latest.notes}</p>
            </div>
          )}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={onSignup} className="btn" style={{ fontSize: '13px', padding: '8px 20px' }}>Sign Up</button>
            <button onClick={onClose} className="btn btn--secondary" style={{ fontSize: '13px', padding: '8px 16px' }}>Close</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Magnetic Button ──

function MagneticButton({ children, onClick, style, className = '' }) {
  const ref = useRef(null)
  const handleMouseMove = useCallback((e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2
    el.style.transform = `translate(${x * 0.15}px, ${y * 0.15}px)`
  }, [])
  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = ''
    el.style.transition = 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)'
  }, [])
  return (
    <button ref={ref} onClick={onClick} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={className} style={{ ...style, willChange: 'transform' }}>
      {children}
    </button>
  )
}

// ── Feature Section with scroll reveal ──

function FeatureSection({ number, title, description, children, reverse, isMobile }) {
  const [ref, visible] = useScrollReveal()
  return (
    <div ref={ref} style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? '1fr' : reverse ? '1fr 1fr' : '1fr 1fr',
      gap: isMobile ? '32px' : '64px',
      alignItems: 'center',
      marginBottom: isMobile ? '64px' : '120px',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(24px)',
      transition: 'opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
    }}>
      <div style={{ order: isMobile ? 0 : (reverse ? 1 : 0) }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--accent-orange)',
          display: 'block', marginBottom: '16px',
        }}>
          / {number}
        </span>
        <h2 style={{
          fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400,
          fontSize: isMobile ? '28px' : 'clamp(28px, 3.5vw, 44px)',
          lineHeight: 1.2, letterSpacing: '-0.01em',
          color: 'var(--text-primary)', marginBottom: '20px',
        }}>
          {title}
        </h2>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '16px',
          color: 'var(--text-muted)', lineHeight: 1.65, maxWidth: '400px',
        }}>
          {description}
        </p>
      </div>
      <div style={{ order: isMobile ? 1 : (reverse ? 0 : 1) }}>
        {children}
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
  const [heroVisible, setHeroVisible] = useState(false)

  useEffect(() => {
    if (user) navigate('/map', { replace: true })
  }, [user, navigate])

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100)
    return () => clearTimeout(t)
  }, [])

  const openSignup = useCallback(() => setSignupOpen(true), [])
  const closeSignup = useCallback(() => setSignupOpen(false), [])

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* ── STICKY HEADER NAV ── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px',
        background: 'rgba(245, 242, 237, 0.85)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-light)',
      }}>
        <span style={{
          fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400,
          fontSize: '18px', letterSpacing: '-0.01em', color: 'var(--text-primary)',
        }}>
          Terrain
        </span>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/login" style={{
            fontFamily: 'var(--font-heading)', fontSize: '13px', fontWeight: 500,
            color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '0.04em',
          }}>
            Log In
          </Link>
          <button onClick={openSignup} className="btn" style={{
            fontSize: '13px', padding: '8px 20px',
          }}>
            Sign Up
          </button>
        </div>
      </header>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', minHeight: '100vh', overflow: 'hidden',
        background: 'var(--bg-base)',
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: isMobile ? '80px 24px 48px' : '80px 6vw 48px',
        textAlign: 'center',
      }}>
        {/* Text content */}
        <div style={{
          position: 'relative', zIndex: 2,
          maxWidth: '640px', width: '100%', marginBottom: isMobile ? '32px' : '48px',
        }}>
          {/* Tagline */}
          <div style={{
            overflow: 'hidden', marginBottom: '16px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '12px',
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'var(--accent-orange)', fontWeight: 500,
            }}>
              A Goal Operating System
            </span>
          </div>

          {/* Headline */}
          <div style={{ overflow: 'hidden', marginBottom: '24px' }}>
            <h1 style={{
              fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400,
              fontSize: isMobile ? 'clamp(36px, 12vw, 56px)' : 'clamp(56px, 6vw, 88px)',
              lineHeight: 1.15, letterSpacing: '-0.01em',
              color: 'var(--text-primary)',
              transform: heroVisible ? 'translateY(0)' : 'translateY(110%)',
              transition: 'transform 0.7s cubic-bezier(0.76, 0, 0.24, 1) 0.3s',
            }}>
              Build your world,<br />one goal at a time
            </h1>
          </div>

          {/* Body copy */}
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 400,
            fontSize: isMobile ? '16px' : '18px',
            color: 'var(--text-secondary)', lineHeight: 1.6,
            maxWidth: '480px', margin: '0 auto 36px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.6s',
          }}>
            Terrain turns your goals into a living, illustrated map. Check in on what matters, watch your world grow, and walk through your progress — literally.
          </p>

          {/* CTA */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '12px',
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? 'translateY(0)' : 'translateY(16px)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.75s',
          }}>
            <MagneticButton
              onClick={openSignup}
              className="btn btn--display"
              style={{ fontSize: isMobile ? '14px' : '16px', padding: '14px 32px' }}
            >
              Get Started Free
            </MagneticButton>
            <MagneticButton
              onClick={() => document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })}
              className="btn btn--secondary"
              style={{ fontSize: '14px', padding: '14px 24px' }}
            >
              Try the Demo
            </MagneticButton>
          </div>
        </div>

        {/* Large isometric hero illustration — detailed scene */}
        <div style={{
          position: 'relative', width: '100%', maxWidth: '700px',
          opacity: heroVisible ? 1 : 0,
          transform: heroVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.9s',
        }}>
          <svg width="100%" viewBox="0 0 700 400" fill="none" style={{ display: 'block' }}>
            {/* Isometric ground plane */}
            <path d="M350 360 L50 200 L350 40 L650 200 Z" fill="#E8E4DC" stroke="#DDD8CE" strokeWidth="1" />
            {/* Grid lines on ground */}
            {[1,2,3,4,5].map(i => (
              <g key={`grid-${i}`} opacity="0.15">
                <line x1={50 + i*50} y1={200 - i*26.67} x2={350 + i*50} y2={360 - i*26.67} stroke="#C8C2B5" strokeWidth="0.5" />
                <line x1={350 - i*50} y1={40 + i*26.67} x2={650 - i*50} y2={200 + i*26.67} stroke="#C8C2B5" strokeWidth="0.5" />
              </g>
            ))}

            {/* Forest region — left */}
            <g>
              <path d="M200 240 L130 200 L130 170 L200 210 Z" fill="#8B8680" />
              <path d="M200 240 L270 200 L270 170 L200 210 Z" fill="#A09A93" />
              <path d="M130 170 L200 130 L270 170 L200 210 Z" fill="#5E9E6E" />
              {/* Trees */}
              <polygon points="175,95 160,130 190,130" fill="#3D7A4A" />
              <polygon points="175,85 163,118 187,118" fill="#4A8C5C" />
              <polygon points="175,75 166,105 184,105" fill="#5E9E6E" />
              <rect x="173" y="130" width="4" height="8" fill="#8B6B3E" />
              <polygon points="210,100 198,128 222,128" fill="#3D7A4A" />
              <polygon points="210,90 200,115 220,115" fill="#4A8C5C" />
              <rect x="208" y="128" width="4" height="8" fill="#8B6B3E" />
              {/* Small cabin */}
              <path d="M155 148 L155 160 L170 153 L170 141 Z" fill="#C4A882" />
              <path d="M155 148 L148 144 L148 156 L155 160 Z" fill="#A89070" />
              <path d="M148 144 L155 138 L170 144 L163 148 Z" fill="#D4B892" />
            </g>

            {/* City region — center */}
            <g>
              <path d="M350 280 L280 240 L280 210 L350 250 Z" fill="#8B8680" />
              <path d="M350 280 L420 240 L420 210 L350 250 Z" fill="#A09A93" />
              <path d="M280 210 L350 170 L420 210 L350 250 Z" fill="#D4C8A0" />
              {/* Tall building */}
              <path d="M330 120 L330 175 L350 185 L350 130 Z" fill="#E8E4DC" />
              <path d="M350 130 L350 185 L365 177 L365 122 Z" fill="#D4CFC6" />
              <path d="M330 120 L345 113 L365 122 L350 130 Z" fill="#F5F2ED" />
              {/* Windows */}
              <rect x="334" y="132" width="5" height="4" fill="#4A6FA5" opacity="0.4" />
              <rect x="334" y="142" width="5" height="4" fill="#4A6FA5" opacity="0.6" />
              <rect x="334" y="152" width="5" height="4" fill="#E8712B" opacity="0.5" />
              <rect x="342" y="132" width="5" height="4" fill="#4A6FA5" opacity="0.3" />
              <rect x="342" y="142" width="5" height="4" fill="#4A6FA5" opacity="0.5" />
              {/* Shorter building */}
              <path d="M375 155 L375 185 L395 195 L395 165 Z" fill="#E8E4DC" />
              <path d="M395 165 L395 195 L405 189 L405 159 Z" fill="#C8C2B5" />
              <path d="M375 155 L388 148 L405 159 L395 165 Z" fill="#F0ECE4" />
              {/* Tree */}
              <circle cx="310" cy="195" r="6" fill="#5E9E6E" />
              <rect x="309" y="195" width="2" height="6" fill="#8B6B3E" />
            </g>

            {/* Mountain region — right */}
            <g>
              <path d="M500 240 L430 200 L430 170 L500 210 Z" fill="#8B8680" />
              <path d="M500 240 L570 200 L570 170 L500 210 Z" fill="#A09A93" />
              <path d="M430 170 L500 130 L570 170 L500 210 Z" fill="#6BAF7B" />
              {/* Mountain peaks */}
              <polygon points="500,65 460,140 540,140" fill="#4A6FA5" />
              <polygon points="500,65 475,110 525,110" fill="#5A82B8" />
              <polygon points="500,65 487,88 513,88" fill="#F5F2ED" />
              {/* Smaller peak */}
              <polygon points="540,95 520,140 560,140" fill="#3D5E8C" />
              <polygon points="540,95 530,118 550,118" fill="#4A6FA5" />
              {/* Trail */}
              <path d="M450 185 Q475 175 500 180 Q520 185 545 172" stroke="#D4C8A0" strokeWidth="2" fill="none" strokeDasharray="4 3" opacity="0.6" />
            </g>

            {/* Animated character — small walking figure */}
            <g className="hero-character">
              <circle cx="305" cy="218" r="4" fill="#E8712B" />
              <rect x="303" y="222" width="4" height="7" rx="1" fill="#E8712B" />
              {/* Shadow */}
              <ellipse cx="305" cy="231" rx="5" ry="2" fill="rgba(0,0,0,0.08)" />
            </g>

            {/* Paths between regions */}
            <path d="M230 210 Q290 230 320 240" stroke="#C8C2B5" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />
            <path d="M380 240 Q430 230 470 210" stroke="#C8C2B5" strokeWidth="2" strokeDasharray="6 4" opacity="0.4" />

            {/* Labels */}
            <g>
              <rect x="160" y="248" width="80" height="20" rx="4" fill="rgba(255,255,255,0.9)" />
              <text x="200" y="262" textAnchor="middle" fill="#4A4540" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">Morning Runs</text>
            </g>
            <g>
              <rect x="310" y="288" width="80" height="20" rx="4" fill="rgba(255,255,255,0.9)" />
              <text x="350" y="302" textAnchor="middle" fill="#4A4540" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">Side Project</text>
            </g>
            <g>
              <rect x="460" y="248" width="80" height="20" rx="4" fill="rgba(255,255,255,0.9)" />
              <text x="500" y="262" textAnchor="middle" fill="#4A4540" fontSize="10" fontFamily="Inter, sans-serif" fontWeight="500">Fitness Goal</text>
            </g>
          </svg>

          {/* CSS animation for the character bobbing */}
          <style>{`
            .hero-character {
              animation: hero-bob 2s ease-in-out infinite;
            }
            @keyframes hero-bob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
          `}</style>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: isMobile ? '24px' : '32px',
          left: '50%', transform: 'translateX(-50%)', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: '8px',
          opacity: heroVisible ? 0.5 : 0,
          transition: 'opacity 0.5s ease 1.2s',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>scroll</span>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 2v8M2 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-dim)' }}/>
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{
        padding: isMobile ? '64px 24px' : '120px 6vw',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: isMobile ? '64px' : '120px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-muted)', fontWeight: 500,
          }}>
            How it works
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-light)' }} />
        </div>

        {/* Feature 01 — Map View */}
        <FeatureSection
          number="01"
          title="Map View"
          description="Each goal becomes a region on your terrain — mountains, forests, cities, coasts. The map breathes: weather shifts with your check-in recency."
          isMobile={isMobile}
        >
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
            padding: '24px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)', borderRadius: '8px',
          }}>
            <div style={{ textAlign: 'center' }}>
              <IsometricMountain size={isMobile ? 100 : 140} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--region-mountains)', display: 'block', marginTop: '8px' }}>Fitness</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <IsometricCity size={isMobile ? 100 : 140} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--region-city)', display: 'block', marginTop: '8px' }}>Projects</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <IsometricForest size={isMobile ? 100 : 140} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--region-forest)', display: 'block', marginTop: '8px' }}>Learning</span>
            </div>
            <div style={{ textAlign: 'center' }}>
              <IsometricCoast size={isMobile ? 100 : 140} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--region-coast)', display: 'block', marginTop: '8px' }}>Finance</span>
            </div>
          </div>
        </FeatureSection>

        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: isMobile ? '64px' : '120px' }} />

        {/* Feature 02 — Field Reports */}
        <FeatureSection
          number="02"
          title="Field Reports"
          description="AI-powered dispatches from your terrain. A wise cartographer notices patterns, names what it sees, and asks one good question. Under 80 words — always."
          reverse
          isMobile={isMobile}
        >
          <div style={{
            padding: '24px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)', borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-orange)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent-orange)' }}>Field Report</span>
            </div>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: isMobile ? '18px' : '22px', lineHeight: 1.4,
              color: 'var(--text-primary)', marginBottom: '16px',
            }}>
              "The mountain trail shows consistent footprints — 12 sessions this month.
              Your reading forest, though, has gone quiet. When did the last book close?"
            </p>
            <span style={{
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', textTransform: 'uppercase',
              color: 'var(--text-dim)',
            }}>
              AI Cartographer / 3 min ago
            </span>
          </div>
        </FeatureSection>

        {/* Feature 03 — Explore Mode */}
        <FeatureSection
          number="03"
          title="Explore Mode"
          description="Walk through your goals as a platformer. Each region becomes a biome zone. Collect past reflections as orbs. Traverse your progress — literally."
          isMobile={isMobile}
        >
          <div style={{
            padding: '24px', background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)', borderRadius: '8px',
            position: 'relative', overflow: 'hidden', minHeight: '200px',
          }}>
            {/* Platformer preview mockup */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', gap: '4px',
              position: 'absolute', bottom: '40px', left: '24px', right: '24px',
            }}>
              {[20, 35, 25, 45, 30, 40, 20, 35, 50, 30, 25, 40].map((h, i) => (
                <div key={i} style={{
                  flex: 1, height: `${h}px`,
                  background: i < 4 ? 'var(--region-forest)' : i < 8 ? 'var(--region-mountains)' : 'var(--region-coast)',
                  opacity: 0.3 + (i % 3) * 0.2,
                  borderRadius: '2px 2px 0 0',
                }} />
              ))}
            </div>
            {/* Ground line */}
            <div style={{ position: 'absolute', bottom: '40px', left: '24px', right: '24px', height: '2px', background: 'var(--border-mid)' }} />
            {/* Player silhouette */}
            <div style={{
              position: 'absolute', bottom: '42px', left: '35%',
              width: '12px', height: '20px', borderRadius: '6px',
              background: 'var(--accent-orange)', boxShadow: '0 0 12px rgba(232, 113, 43, 0.4)',
            }} />
            {/* Collectible orbs */}
            {[45, 55, 65, 75].map((left, i) => (
              <div key={i} style={{
                position: 'absolute', bottom: `${60 + i * 15}px`, left: `${left}%`,
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#F5C542', opacity: 0.6,
                boxShadow: '0 0 6px rgba(245, 197, 66, 0.5)',
              }} />
            ))}
            {/* Controls hint */}
            <div style={{
              position: 'absolute', bottom: '12px', left: '24px',
              fontFamily: 'var(--font-mono)', fontSize: '10px',
              letterSpacing: '0.08em', color: 'var(--text-dim)',
              textTransform: 'uppercase',
            }}>
              WASD to move / Space to jump / E to interact
            </div>
          </div>
        </FeatureSection>
      </section>

      {/* ── DEMO SECTION ── */}
      <section id="demo" style={{
        padding: isMobile ? '48px 24px 64px' : '80px 6vw 120px',
        maxWidth: '1100px', margin: '0 auto',
      }}>
        <div style={{ height: '1px', background: 'var(--border-light)', marginBottom: isMobile ? '48px' : '80px' }} />

        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--accent-orange)', display: 'block', marginBottom: '16px',
          }}>
            / Interactive
          </span>
          <h2 style={{
            fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400,
            fontSize: isMobile ? '36px' : 'clamp(40px, 5vw, 64px)',
            lineHeight: 1.15, letterSpacing: '-0.01em',
            color: 'var(--text-primary)', marginBottom: '16px',
          }}>
            Try the Demo
          </h2>
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto', lineHeight: 1.6 }}>
            Click a region to explore it.
          </p>
        </div>

        {/* Portal Window — recessed neo-skeu container */}
        <div style={{
          width: '100%', maxWidth: '900px',
          margin: '0 auto', position: 'relative',
        }}>
          {/* Portal frame — inset shadow = recessed feel */}
          <div style={{
            height: isMobile ? '320px' : '500px',
            borderRadius: '20px',
            background: '#EBE7E0',
            boxShadow: `
              inset 6px 6px 14px rgba(166, 158, 143, 0.35),
              inset -6px -6px 14px rgba(255, 255, 255, 0.6),
              8px 8px 20px rgba(166, 158, 143, 0.2),
              -4px -4px 12px rgba(255, 255, 255, 0.5)
            `,
            border: '1px solid var(--border-light)',
            overflow: 'hidden', position: 'relative',
          }}>
            <TerrainCanvas
              regions={DEMO_REGIONS}
              checkins={DEMO_CHECKINS}
              onRegionClick={(region) => setDemoRegion(region)}
              interactive={true}
              locked={true}
              mini={false}
              theme={{}}
            />
            {demoRegion && (
              <DemoCard
                region={demoRegion}
                onClose={() => setDemoRegion(null)}
                onSignup={() => { setDemoRegion(null); openSignup() }}
              />
            )}
          </div>

          {/* Floating button bar ON TOP of the portal */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '12px',
            marginTop: '-28px', position: 'relative', zIndex: 20,
          }}>
            <MagneticButton
              onClick={openSignup}
              className="btn btn--display"
              style={{
                fontSize: isMobile ? '14px' : '16px',
                padding: isMobile ? '12px 24px' : '14px 32px',
              }}
            >
              Sign Up to Build Yours
            </MagneticButton>
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ── */}
      <section style={{
        borderTop: '1px solid var(--border-light)',
        background: 'var(--bg-surface)',
        padding: isMobile ? '48px 24px' : '80px 6vw',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap', gap: isMobile ? '24px' : '32px',
      }}>
        <div>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '11px',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-muted)', display: 'block', marginBottom: '12px',
          }}>
            Ready to map your terrain?
          </span>
          <h2 style={{
            fontFamily: "'CalivePixel', var(--font-display)", fontWeight: 400,
            fontSize: isMobile ? '32px' : 'clamp(36px, 4vw, 56px)',
            lineHeight: 1.15, letterSpacing: '-0.01em',
            color: 'var(--text-primary)',
          }}>
            Start building.
          </h2>
        </div>
        <MagneticButton
          onClick={openSignup}
          className="btn btn--display"
          style={{
            fontSize: isMobile ? '14px' : '16px',
            padding: isMobile ? '12px 24px' : '16px 40px',
            flexShrink: 0, width: isMobile ? '100%' : 'auto',
          }}
        >
          Create Your Map
        </MagneticButton>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        padding: isMobile ? '16px 24px' : '24px 6vw',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between', gap: isMobile ? '4px' : '0',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
          Terrain — Goal Operating System
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-dim)' }}>
          Built with care
        </span>
      </footer>

      {signupOpen && <SignupOverlay onClose={closeSignup} />}
    </div>
  )
}
