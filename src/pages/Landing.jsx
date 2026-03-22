import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { simplex2d } from '../lib/terrain.js'

// ── Pixel art inline SVG components ──

function PixelMountain({ size = 48 }) {
  // 8x8 pixel mountain
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
  const colors = ['transparent', '#F5E6C8', '#7C9EBA', '#5A6B7A']
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
  const colors = ['transparent', '#5E9E6E', '#6B4226']
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
  const colors = ['transparent', '#8A7560', '#D4A853']
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
  const colors = ['transparent', '#F5E6C8', '#00D4C8', '#D4A853']
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
  const colors = ['transparent', '#00D4C8', '#8A7560']
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

// ── Main Landing ──

export default function Landing() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (user) navigate('/map', { replace: true })
  }, [user, navigate])

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

      for (let i = 0; i < 80; i++) {
        const sx = (simplex2d(i * 0.3, 0.1) * W * 1.5 + W * 0.2 + time * 8 * ((i % 3) + 0.5)) % W
        const sy = simplex2d(0.1, i * 0.3) * H * 0.55
        const br = Math.sin(time * 1.8 + i) * 0.3 + 0.45
        ctx.fillStyle = `rgba(245, 230, 200, ${br * 0.35})`
        ctx.fillRect(sx, sy, i % 4 === 0 ? 2 : 1.5, i % 4 === 0 ? 2 : 1.5)
      }

      ctx.fillStyle = 'rgba(124, 158, 186, 0.13)'
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 3) {
        const n = simplex2d(x * 0.003 + time * 0.15, 1.0)
        ctx.lineTo(x, H * 0.52 - n * H * 0.22)
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()

      ctx.fillStyle = 'rgba(94, 158, 110, 0.18)'
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 3) {
        const n = simplex2d(x * 0.005 + time * 0.25, 5.0)
        ctx.lineTo(x, H * 0.62 - n * H * 0.14)
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()

      ctx.fillStyle = 'rgba(212, 168, 83, 0.10)'
      ctx.beginPath(); ctx.moveTo(0, H)
      for (let x = 0; x <= W; x += 3) {
        const n = simplex2d(x * 0.008 + time * 0.4, 10.0)
        ctx.lineTo(x, H * 0.72 - n * H * 0.10)
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill()

      const g = ctx.createLinearGradient(0, H * 0.78, 0, H)
      g.addColorStop(0, 'rgba(26, 21, 16, 0.6)')
      g.addColorStop(1, '#0D0A06')
      ctx.fillStyle = g
      ctx.fillRect(0, H * 0.78, W, H * 0.22)

      for (let i = 0; i < 22; i++) {
        const px = (simplex2d(i * 0.7, time * 0.4) * W + W) % W
        const py = simplex2d(time * 0.25, i * 0.7) * H * 0.45 + H * 0.32
        const alpha = Math.sin(time * 2.2 + i * 0.6) * 0.28 + 0.28
        ctx.fillStyle = `rgba(212, 168, 83, ${alpha})`
        ctx.beginPath(); ctx.arc(px, py, 2, 0, Math.PI * 2); ctx.fill()
        ctx.fillStyle = `rgba(212, 168, 83, ${alpha * 0.18})`
        ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill()
      }

      requestAnimationFrame(render)
    }
    render()
    return () => { running = false }
  }, [])

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
            fontSize: 'clamp(64px, 12vw, 160px)',
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

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link to="/signup" className="btn-retro" style={{
                textDecoration: 'none',
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '50px',
              }}>
                Start Exploring
              </Link>
              <Link to="/login" className="btn-retro btn-retro--secondary" style={{
                textDecoration: 'none',
                fontSize: '15px',
                padding: '14px 32px',
                borderRadius: '50px',
              }}>
                Log In
              </Link>
            </div>
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: '32px', left: '6vw', zIndex: 2,
          animation: 'float 2s ease-in-out infinite',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span className="mono-label" style={{ color: 'var(--text-dim)' }}>scroll</span>
          <span style={{ color: 'var(--text-dim)', fontSize: '12px' }}>↓</span>
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
              fontSize: 'clamp(40px, 6vw, 80px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              marginBottom: '24px',
            }}>
              Map<br />View
            </h2>
            <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '340px' }}>
              Each goal becomes a region on your terrain — mountains, forests, cities, coasts. The map breathes: weather shifts with your check-in recency.
            </p>
          </div>
          <div className="glass-panel" style={{
            padding: '40px',
            aspectRatio: '4/3',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
            background: 'linear-gradient(135deg, rgba(124,158,186,0.08) 0%, rgba(94,158,110,0.08) 100%)',
          }}>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <PixelMountain size={56} />
              <PixelTree size={56} />
              <PixelCity size={56} />
              <PixelWave size={56} />
            </div>
            <span className="mono-label" style={{ color: 'var(--text-muted)' }}>mountains · forest · city · coast</span>
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
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-teal)' }}>02</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelSatellite size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              Field<br />Reports
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              AI-powered dispatches from your terrain. A wise cartographer notices patterns, names what it sees, and asks one good question. Under 80 words — always.
            </p>
          </div>
          <div>
            <span className="mono-label" style={{ display: 'block', marginBottom: '12px', color: 'var(--accent-orange)' }}>03</span>
            <div style={{ marginBottom: '16px' }}>
              <PixelGamepad size={40} />
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(28px, 4vw, 52px)',
              lineHeight: 1.1,
              letterSpacing: '0.1em',
              color: 'var(--text-primary)',
              marginBottom: '16px',
            }}>
              Explore<br />Mode
            </h3>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
              Walk through your goals as a platformer. Each region becomes a biome zone. Collect past reflections as orbs. Traverse your progress — literally.
            </p>
          </div>
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
        <Link to="/signup" className="btn-retro btn-retro--orange" style={{
          textDecoration: 'none',
          fontSize: '16px',
          padding: '16px 40px',
          borderRadius: '50px',
          flexShrink: 0,
        }}>
          Create Your Map
        </Link>
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
    </div>
  )
}
