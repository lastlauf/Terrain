import { useRef, useEffect, useState, useCallback } from 'react'
import { drawTerrainRegion, generateMapLayout, getWeatherStatus, simplex2d } from '../lib/terrain.js'

export default function TerrainCanvas({
  regions,
  checkins = [],
  onRegionClick,
  onAddClick,
  interactive = true,
  mini = false,
  singleRegion = null,
  theme = {},
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const animFrameRef = useRef(null)
  const stateRef = useRef({
    offset: { x: 0, y: 0 },
    scale: 1,
    dragging: false,
    dragStart: { x: 0, y: 0 },
    lastOffset: { x: 0, y: 0 },
    hoverRegion: null,
    mousePos: { x: 0, y: 0 },
    particles: [],
    time: 0,
    pinchDist: 0,
  })

  const layoutRef = useRef([])

  // Compute layout whenever regions change
  useEffect(() => {
    if (singleRegion) {
      layoutRef.current = [{
        region: singleRegion,
        x: 40,
        y: 40,
        w: 320,
        h: 240,
      }]
    } else {
      layoutRef.current = generateMapLayout(regions)
    }
  }, [regions, singleRegion])

  // Initialize particles
  useEffect(() => {
    const fx = theme.particle_fx || 'fireflies'
    const particles = []
    if (fx !== 'none') {
      const count = mini ? 12 : 40
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * 1200,
          y: Math.random() * 800,
          vx: (Math.random() - 0.5) * (fx === 'rain' ? 0.5 : 0.3),
          vy: fx === 'rain' ? 2 + Math.random() * 3 : fx === 'snowflakes' ? 0.3 + Math.random() * 0.5 : (Math.random() - 0.5) * 0.3,
          size: fx === 'rain' ? 1 : 1.5 + Math.random() * 2,
          alpha: 0.3 + Math.random() * 0.5,
          phase: Math.random() * Math.PI * 2,
        })
      }
    }
    stateRef.current.particles = particles
  }, [theme.particle_fx, mini])

  // Get last checkin date for a region
  const getLastCheckin = useCallback((regionId) => {
    const regionCheckins = checkins.filter(c => c.region_id === regionId)
    if (regionCheckins.length === 0) return null
    return regionCheckins.reduce((latest, c) =>
      new Date(c.created_at) > new Date(latest.created_at) ? c : latest
    ).created_at
  }, [checkins])

  // Hit test: which region is at screen coords?
  const hitTest = useCallback((screenX, screenY) => {
    const s = stateRef.current
    const worldX = (screenX - s.offset.x) / s.scale
    const worldY = (screenY - s.offset.y) / s.scale

    for (let i = layoutRef.current.length - 1; i >= 0; i--) {
      const l = layoutRef.current[i]
      if (worldX >= l.x && worldX <= l.x + l.w && worldY >= l.y && worldY <= l.y + l.h) {
        return l.region
      }
    }
    return null
  }, [])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let running = true

    function render() {
      if (!running) return

      const s = stateRef.current
      s.time += 0.016

      const container = containerRef.current
      if (!container) {
        animFrameRef.current = requestAnimationFrame(render)
        return
      }

      const dpr = window.devicePixelRatio || 1
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      canvas.style.width = rect.width + 'px'
      canvas.style.height = rect.height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

      // Clear
      ctx.fillStyle = '#0D0A06'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // Draw subtle grid
      ctx.save()
      ctx.translate(s.offset.x, s.offset.y)
      ctx.scale(s.scale, s.scale)

      // Grid dots
      if (!mini) {
        ctx.fillStyle = 'rgba(61, 46, 26, 0.3)'
        const gridSize = 48
        const startX = Math.floor(-s.offset.x / s.scale / gridSize) * gridSize - gridSize
        const startY = Math.floor(-s.offset.y / s.scale / gridSize) * gridSize - gridSize
        const endX = startX + (rect.width / s.scale) + gridSize * 2
        const endY = startY + (rect.height / s.scale) + gridSize * 2

        for (let gx = startX; gx < endX; gx += gridSize) {
          for (let gy = startY; gy < endY; gy += gridSize) {
            ctx.fillRect(gx, gy, 1, 1)
          }
        }
      }

      // Draw regions
      const layout = layoutRef.current
      for (const l of layout) {
        const lastDate = getLastCheckin(l.region.id)
        const weather = getWeatherStatus(lastDate)
        drawTerrainRegion(ctx, l.region, l.x, l.y, l.w, l.h, weather)

        // Hover highlight
        if (interactive && s.hoverRegion && s.hoverRegion.id === l.region.id) {
          ctx.strokeStyle = 'rgba(212, 168, 83, 0.5)'
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.roundRect(l.x - 2, l.y - 2, l.w + 4, l.h + 4, 10)
          ctx.stroke()
        }
      }

      // Add region placeholder
      if (interactive && !mini && !singleRegion) {
        const addX = layout.length > 0 ? Math.max(...layout.map(l => l.x + l.w)) + 24 : 24
        const addY = 24
        ctx.strokeStyle = 'rgba(212, 168, 83, 0.2)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 4])
        ctx.beginPath()
        ctx.roundRect(addX, addY, 200, 160, 8)
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = 'rgba(212, 168, 83, 0.3)'
        ctx.font = `bold 32px 'Inter', sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText('+', addX + 100, addY + 88)
      }

      ctx.restore()

      // Particles (screen space)
      const fx = theme.particle_fx || 'fireflies'
      if (fx !== 'none') {
        for (const p of s.particles) {
          p.x += p.vx
          p.y += p.vy

          if (fx === 'fireflies') {
            p.x += Math.sin(s.time * 2 + p.phase) * 0.3
            p.y += Math.cos(s.time * 1.5 + p.phase) * 0.2
          }

          // Wrap around
          if (p.x < 0) p.x = rect.width
          if (p.x > rect.width) p.x = 0
          if (p.y < 0) p.y = rect.height
          if (p.y > rect.height) p.y = 0

          const alpha = fx === 'fireflies'
            ? p.alpha * (0.5 + Math.sin(s.time * 3 + p.phase) * 0.5)
            : p.alpha

          if (fx === 'rain') {
            ctx.strokeStyle = `rgba(150, 180, 220, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p.x + p.vx * 2, p.y + p.vy * 2)
            ctx.stroke()
          } else {
            const color = fx === 'fireflies' ? `rgba(212, 168, 83, ${alpha})`
              : fx === 'snowflakes' ? `rgba(220, 220, 240, ${alpha})`
              : `rgba(200, 200, 200, ${alpha})`

            ctx.fillStyle = color
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
            ctx.fill()

            if (fx === 'fireflies') {
              ctx.fillStyle = `rgba(212, 168, 83, ${alpha * 0.2})`
              ctx.beginPath()
              ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
              ctx.fill()
            }
          }
        }
      }

      // Hover tooltip
      if (interactive && s.hoverRegion && !s.dragging) {
        const name = s.hoverRegion.name
        ctx.font = `bold 13px 'Inter', sans-serif`
        const tw = ctx.measureText(name).width
        const tx = s.mousePos.x - tw / 2 - 8
        const ty = s.mousePos.y - 36

        ctx.fillStyle = 'rgba(13, 10, 6, 0.9)'
        ctx.beginPath()
        ctx.roundRect(tx, ty, tw + 16, 24, 4)
        ctx.fill()

        ctx.strokeStyle = 'var(--border-retro)'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.roundRect(tx, ty, tw + 16, 24, 4)
        ctx.stroke()

        ctx.fillStyle = '#F5E6C8'
        ctx.textAlign = 'left'
        ctx.fillText(name, tx + 8, ty + 16)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()
    return () => {
      running = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [regions, checkins, interactive, mini, singleRegion, theme, getLastCheckin, hitTest])

  // Mouse/touch handlers
  const handleMouseDown = (e) => {
    if (!interactive) return
    const s = stateRef.current
    s.dragging = true
    s.dragStart = { x: e.clientX, y: e.clientY }
    s.lastOffset = { ...s.offset }
  }

  const handleMouseMove = (e) => {
    if (!interactive) return
    const s = stateRef.current
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    s.mousePos = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    if (s.dragging) {
      s.offset.x = s.lastOffset.x + (e.clientX - s.dragStart.x)
      s.offset.y = s.lastOffset.y + (e.clientY - s.dragStart.y)
    } else {
      s.hoverRegion = hitTest(s.mousePos.x, s.mousePos.y)
      const canvas = canvasRef.current
      if (canvas) {
        canvas.style.cursor = s.hoverRegion ? 'pointer' : 'grab'
      }
    }
  }

  const handleMouseUp = (e) => {
    if (!interactive) return
    const s = stateRef.current
    const moved = Math.abs(e.clientX - s.dragStart.x) + Math.abs(e.clientY - s.dragStart.y)

    if (moved < 5) {
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const screenX = e.clientX - rect.left
      const screenY = e.clientY - rect.top
      const region = hitTest(screenX, screenY)

      if (region && onRegionClick) {
        onRegionClick(region)
      } else if (!region && onAddClick) {
        // Check if clicked on the add button area
        const layout = layoutRef.current
        const addX = layout.length > 0 ? Math.max(...layout.map(l => l.x + l.w)) + 24 : 24
        const worldX = (screenX - s.offset.x) / s.scale
        const worldY = (screenY - s.offset.y) / s.scale
        if (worldX >= addX && worldX <= addX + 200 && worldY >= 24 && worldY <= 184) {
          onAddClick()
        }
      }
    }

    s.dragging = false
  }

  const handleWheel = (e) => {
    if (!interactive) return
    e.preventDefault()
    const s = stateRef.current
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08
    const newScale = Math.max(0.3, Math.min(3, s.scale * zoomFactor))

    // Zoom toward mouse position
    s.offset.x = mouseX - (mouseX - s.offset.x) * (newScale / s.scale)
    s.offset.y = mouseY - (mouseY - s.offset.y) * (newScale / s.scale)
    s.scale = newScale
  }

  // Touch handlers
  const handleTouchStart = (e) => {
    if (!interactive) return
    const s = stateRef.current

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      s.dragging = true
      s.dragStart = { x: touch.clientX, y: touch.clientY }
      s.lastOffset = { ...s.offset }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      s.pinchDist = Math.sqrt(dx * dx + dy * dy)
    }
  }

  const handleTouchMove = (e) => {
    if (!interactive) return
    e.preventDefault()
    const s = stateRef.current

    if (e.touches.length === 1 && s.dragging) {
      const touch = e.touches[0]
      s.offset.x = s.lastOffset.x + (touch.clientX - s.dragStart.x)
      s.offset.y = s.lastOffset.y + (touch.clientY - s.dragStart.y)
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (s.pinchDist > 0) {
        const scale = dist / s.pinchDist
        s.scale = Math.max(0.3, Math.min(3, s.scale * scale))
      }
      s.pinchDist = dist
    }
  }

  const handleTouchEnd = (e) => {
    if (!interactive) return
    const s = stateRef.current

    if (e.changedTouches.length === 1 && s.dragging) {
      const touch = e.changedTouches[0]
      const moved = Math.abs(touch.clientX - s.dragStart.x) + Math.abs(touch.clientY - s.dragStart.y)

      if (moved < 10) {
        const rect = containerRef.current?.getBoundingClientRect()
        if (rect) {
          const screenX = touch.clientX - rect.left
          const screenY = touch.clientY - rect.top
          const region = hitTest(screenX, screenY)
          if (region && onRegionClick) {
            onRegionClick(region)
          }
        }
      }
    }

    s.dragging = false
    s.pinchDist = 0
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => {
          stateRef.current.dragging = false
          stateRef.current.hoverRegion = null
        }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
