import { useRef, useEffect, useState, useCallback } from 'react'
import { SPRITES, PALETTES, WEATHER_SPRITES, WEATHER_PALETTES, drawSprite } from '../lib/sprites.js'
import { getWeatherStatus } from '../lib/terrain.js'

const CARD_W = 1080
const CARD_H = 1350

/**
 * ShareCard — Generates a shareable image card for a region.
 *
 * Props:
 *  - region: { name, type, created_at, color }
 *  - checkins: array of checkins for this region
 *  - milestones: array of milestones
 *  - quote: string | null
 *  - onClose: () => void
 */
export default function ShareCard({ region, checkins = [], milestones = [], quote, onClose }) {
  const canvasRef = useRef(null)
  const [rendered, setRendered] = useState(false)
  const [copying, setCopying] = useState(false)

  // Calculate stats
  const weeksSinceCreation = region.created_at
    ? Math.max(1, Math.floor((Date.now() - new Date(region.created_at).getTime()) / (7 * 24 * 60 * 60 * 1000)))
    : 1
  const totalSessions = checkins.length

  // Get weather
  const lastCheckin = checkins.length > 0
    ? checkins.reduce((latest, c) => new Date(c.created_at) > new Date(latest.created_at) ? c : latest).created_at
    : null
  const weather = getWeatherStatus(lastCheckin)

  const renderCard = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    canvas.width = CARD_W
    canvas.height = CARD_H

    // Load Daydream font
    try {
      const font = new FontFace('Daydream', 'url(/fonts/Daydream-DEMO.otf)')
      await font.load()
      document.fonts.add(font)
    } catch (e) {
      console.warn('Font load failed, using fallback:', e)
    }

    const type = region.type || 'mountains'
    const regionColor = region.color || '#D4A853'

    // ── Top 60% — Region illustration (0 - 810px) ──
    ctx.fillStyle = '#0D0A06'
    ctx.fillRect(0, 0, CARD_W, 810)

    // Pixel grid background at larger scale
    const gridSize = 8
    const gridCols = Math.ceil(CARD_W / gridSize)
    const gridRows = Math.ceil(810 / gridSize)
    const gridColors = [
      [74, 144, 217],
      [255, 107, 157],
      [212, 168, 83],
    ]

    for (let y = 0; y < gridRows; y++) {
      for (let x = 0; x < gridCols; x++) {
        const noise = Math.sin(x * 0.2 + y * 0.15) * 0.5 + Math.cos(x * 0.1 - y * 0.2) * 0.5
        const colorIdx = Math.floor((noise + 1) * 1.5) % 3
        const brightness = 0.03 + Math.abs(Math.sin(x * 0.3 + y * 0.25)) * 0.03
        const [r, g, b] = gridColors[colorIdx]
        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`
        ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize)
      }
    }

    // Draw region sprite at large scale, centered
    const sprite = SPRITES[type] || SPRITES.mountains
    const palette = PALETTES[type] || PALETTES.mountains
    const spriteScale = 16
    const spriteW = 12 * spriteScale
    const spriteH = 12 * spriteScale
    const spriteX = (CARD_W - spriteW) / 2
    const spriteY = (810 - spriteH) / 2 - 20
    drawSprite(ctx, sprite, palette, spriteX, spriteY, spriteScale)

    // Draw weather sprite nearby
    const weatherSprite = WEATHER_SPRITES[weather]
    const weatherPalette = WEATHER_PALETTES[weather]
    if (weatherSprite) {
      drawSprite(ctx, weatherSprite, weatherPalette, spriteX + spriteW + 20, spriteY + 10, 6)
    }

    // Subtle grain texture: random noise at 3% opacity
    const imageData = ctx.getImageData(0, 0, CARD_W, 810)
    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 15
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }
    ctx.putImageData(imageData, 0, 0)

    // ── Middle 30% — Info panel (810 - 1215px) ──
    ctx.fillStyle = '#1A1510'
    ctx.fillRect(0, 810, CARD_W, 405)

    // Region name in Daydream font
    ctx.fillStyle = regionColor
    ctx.font = "48px 'Daydream', 'Boogaloo', cursive"
    ctx.textAlign = 'center'
    ctx.fillText(region.name, CARD_W / 2, 890, CARD_W - 80)

    // Stats line
    ctx.fillStyle = '#8A7560'
    ctx.font = "20px 'Inter', sans-serif"
    ctx.textAlign = 'center'
    const statsText = `${weeksSinceCreation} week${weeksSinceCreation !== 1 ? 's' : ''} \u00B7 ${totalSessions} session${totalSessions !== 1 ? 's' : ''}`
    ctx.fillText(statsText, CARD_W / 2, 930)

    // Pull quote if available
    if (quote) {
      ctx.fillStyle = '#D4A853'
      ctx.font = "italic 22px 'Inter', sans-serif"
      ctx.textAlign = 'center'

      // Word wrap the quote
      const maxWidth = CARD_W - 120
      const words = quote.split(' ')
      const lines = []
      let currentLine = ''

      for (const word of words) {
        const test = currentLine ? currentLine + ' ' + word : word
        if (ctx.measureText(test).width > maxWidth) {
          lines.push(currentLine)
          currentLine = word
        } else {
          currentLine = test
        }
      }
      if (currentLine) lines.push(currentLine)

      let quoteY = 980
      for (const line of lines.slice(0, 3)) { // max 3 lines
        ctx.fillText(`\u201C${line}\u201D`, CARD_W / 2, quoteY)
        quoteY += 32
      }
    }

    // 3px border line separating from footer
    ctx.fillStyle = '#3D2E1A'
    ctx.fillRect(40, 1215, CARD_W - 80, 3)

    // ── Bottom 10% — Footer (1215 - 1350px) ──
    ctx.fillStyle = '#0D0A06'
    ctx.fillRect(0, 1218, CARD_W, 132)

    // "terrain.app" small text
    ctx.fillStyle = '#5A4A38'
    ctx.font = "14px 'Inter', sans-serif"
    ctx.textAlign = 'center'
    ctx.fillText('terrain.app', CARD_W / 2, 1270)

    // Date
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    ctx.fillStyle = '#3D2E1A'
    ctx.font = "13px 'Courier New', monospace"
    ctx.fillText(dateStr, CARD_W / 2, 1300)

    setRendered(true)
  }, [region, checkins, weather, weeksSinceCreation, totalSessions, quote])

  useEffect(() => {
    renderCard()
  }, [renderCard])

  const handleCopy = async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setCopying(true)
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'))
      if (blob) {
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
      }
    } catch (err) {
      console.error('Copy failed:', err)
    }
    setTimeout(() => setCopying(false), 1500)
  }

  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    canvas.toBlob((blob) => {
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `terrain-${region.name.toLowerCase().replace(/\s+/g, '-')}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.8)',
        animation: 'fade-in 200ms var(--ease-out)',
        padding: 'var(--space-6)',
        gap: 'var(--space-4)',
      }}
    >
      {/* Card preview (scaled down) */}
      <div style={{
        border: '3px solid var(--border-retro)',
        background: '#0D0A06',
        overflow: 'hidden',
        maxWidth: '100%',
        maxHeight: 'calc(100vh - 140px)',
      }}>
        <canvas
          ref={canvasRef}
          style={{
            display: 'block',
            width: '540px',
            height: '675px',
            maxWidth: '100%',
            maxHeight: 'calc(100vh - 200px)',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Buttons */}
      {rendered && (
        <div style={{
          display: 'flex',
          gap: 'var(--space-3)',
          animation: 'slide-up 300ms var(--ease-out)',
        }}>
          <button
            className="btn-retro"
            onClick={handleCopy}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            {copying ? 'Copied!' : 'Copy Image'}
          </button>
          <button
            className="btn-retro btn-retro--secondary"
            onClick={handleDownload}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Download PNG
          </button>
          <button
            className="btn-retro btn-retro--secondary"
            onClick={onClose}
            style={{ fontSize: 'var(--text-sm)' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
