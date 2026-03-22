import { useRef, useEffect, useState, useCallback } from 'react'
import { generateMapLayout, getWeatherStatus, simplex2d } from '../lib/terrain.js'
import { drawPixelGrid } from '../lib/pixels.js'
import {
  drawSprite, drawPixelPath,
  SPRITES, PALETTES, REGION_COLORS,
  WEATHER_SPRITES, WEATHER_PALETTES,
  LANDMARK_SPRITES,
  STAR_SPRITE, STAR_PALETTE,
} from '../lib/sprites.js'

export default function TerrainCanvas({
  regions,
  checkins = [],
  milestones = [],
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
        w: 48,
        h: 48,
      }]
    } else {
      layoutRef.current = generateMapLayout(regions)
    }
  }, [regions, singleRegion])

  // Initialize square particles
  useEffect(() => {
    const particles = []
    const count = mini ? 8 : 24
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * 1200,
        y: Math.random() * 800,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -0.1 - Math.random() * 0.2,
        size: 2,
        alpha: 0.15 + Math.random() * 0.25,
        phase: Math.random() * Math.PI * 2,
        colorIdx: Math.floor(Math.random() * 3),
      })
    }
    stateRef.current.particles = particles
  }, [mini])

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
      // Generous hit area around the sprite
      const hitRadius = 28
      const cx = l.x + l.w / 2
      const cy = l.y + l.h / 2
      const dx = worldX - cx
      const dy = worldY - cy
      if (dx * dx + dy * dy < hitRadius * hitRadius) {
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

    // Particle colors
    const particleColors = [
      [74, 144, 217],   // blue
      [255, 107, 157],  // pink
      [212, 168, 83],   // gold
    ]

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

      const W = rect.width
      const H = rect.height

      // 1. Fill background
      ctx.fillStyle = '#0D0A06'
      ctx.fillRect(0, 0, W, H)

      // 2. Draw pixel grid (subtle animated background)
      drawPixelGrid(ctx, W, H, s.time)

      // Transform for world-space
      ctx.save()
      ctx.translate(s.offset.x, s.offset.y)
      ctx.scale(s.scale, s.scale)

      const layout = layoutRef.current

      // 3. Draw paths between connected regions
      if (layout.length > 1) {
        for (let i = 0; i < layout.length - 1; i++) {
          const a = layout[i]
          const b = layout[i + 1]
          const ax = a.x + a.w / 2
          const ay = a.y + a.h / 2
          const bx = b.x + b.w / 2
          const by = b.y + b.h / 2
          drawPixelPath(ctx, ax, ay, bx, by, '#3D2E1A', 4, 8)
        }
      }

      // 4. Draw each region
      for (const l of layout) {
        const type = l.region.type || 'mountains'
        const sprite = SPRITES[type] || SPRITES.mountains
        const palette = PALETTES[type] || PALETTES.mountains
        const regionColor = REGION_COLORS[type] || '#D4A853'

        // Hover glow (draw behind sprite)
        if (interactive && s.hoverRegion && s.hoverRegion.id === l.region.id) {
          ctx.fillStyle = regionColor.replace(')', ',0.2)').replace('rgb', 'rgba').replace('#', '')
          // Use a hex-to-rgba approach
          const r = parseInt(regionColor.slice(1, 3), 16)
          const g = parseInt(regionColor.slice(3, 5), 16)
          const b = parseInt(regionColor.slice(5, 7), 16)
          ctx.fillStyle = `rgba(${r},${g},${b},0.2)`
          ctx.fillRect(l.x - 4, l.y - 4, l.w + 8, l.h + 8)
        }

        // Draw the region sprite at scale=4 (12*4=48)
        drawSprite(ctx, sprite, palette, l.x, l.y, 4)

        // Progress bar below (48px wide, 4px tall)
        const progress = l.region.progress || 0
        const barY = l.y + l.h + 4
        const barW = 48
        const barH = 4

        ctx.fillStyle = 'rgba(0,0,0,0.5)'
        ctx.fillRect(l.x, barY, barW, barH)

        if (progress > 0) {
          ctx.fillStyle = regionColor
          ctx.fillRect(l.x, barY, barW * (progress / 100), barH)
        }

        // Weather sprite (8x8 at scale=2 = 16px) upper-right
        const lastDate = getLastCheckin(l.region.id)
        const weather = getWeatherStatus(lastDate)
        const weatherSprite = WEATHER_SPRITES[weather]
        const weatherPalette = WEATHER_PALETTES[weather]
        if (weatherSprite) {
          drawSprite(ctx, weatherSprite, weatherPalette, l.x + l.w - 4, l.y - 12, 2)
        }

        // Region name below
        ctx.fillStyle = '#F5E6C8'
        ctx.font = "11px 'Inter', sans-serif"
        ctx.textAlign = 'center'
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 3
        ctx.fillText(l.region.name, l.x + l.w / 2, barY + barH + 14, 80)
        ctx.shadowBlur = 0
      }

      // 4b. Draw landmarks for completed milestones
      for (const l of layout) {
        const regionMilestones = milestones.filter(
          m => m.region_id === l.region.id && m.completed && m.landmark_name && m.landmark_x != null && m.landmark_y != null
        )

        const type = l.region.type || 'mountains'
        const palette = PALETTES[type] || PALETTES.mountains
        const landmarkSprite = LANDMARK_SPRITES[type]

        for (const m of regionMilestones) {
          if (!landmarkSprite) continue

          // Position offset from region center using landmark_x/landmark_y (0-1)
          const lmScale = 2  // 8x8 at scale=2 = 16px
          const offsetX = (m.landmark_x - 0.5) * 60
          const offsetY = (m.landmark_y - 0.5) * 40
          const lmX = l.x + l.w / 2 + offsetX - (8 * lmScale) / 2
          const lmY = l.y + l.h / 2 + offsetY - (8 * lmScale) / 2

          drawSprite(ctx, landmarkSprite, palette, lmX, lmY, lmScale)

          // Name label
          ctx.fillStyle = 'rgba(245, 230, 200, 0.6)'
          ctx.font = "9px 'Inter', sans-serif"
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(0,0,0,0.8)'
          ctx.shadowBlur = 2
          ctx.fillText(m.landmark_name, lmX + (8 * lmScale) / 2, lmY + 8 * lmScale + 10, 60)
          ctx.shadowBlur = 0
        }
      }

      // Add region placeholder (dashed square)
      if (interactive && !mini && !singleRegion && layout.length > 0) {
        const last = layout[layout.length - 1]
        const addX = last.x + 100
        const addY = last.y
        ctx.strokeStyle = 'rgba(212, 168, 83, 0.2)'
        ctx.lineWidth = 2
        ctx.setLineDash([4, 4])
        ctx.strokeRect(addX, addY, 48, 48)
        ctx.setLineDash([])

        ctx.fillStyle = 'rgba(212, 168, 83, 0.3)'
        ctx.font = "bold 24px 'Inter', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('+', addX + 24, addY + 32)
      }

      ctx.restore()

      // 5. Square particles (screen space)
      for (const p of s.particles) {
        p.x += p.vx + Math.sin(s.time * 1.5 + p.phase) * 0.1
        p.y += p.vy

        // Wrap around
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        const alpha = p.alpha * (0.5 + Math.sin(s.time * 2 + p.phase) * 0.5)
        const [pr, pg, pb] = particleColors[p.colorIdx]
        ctx.fillStyle = `rgba(${pr},${pg},${pb},${alpha})`
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size)
      }

      // Hover tooltip
      if (interactive && s.hoverRegion && !s.dragging) {
        const name = s.hoverRegion.name
        ctx.font = "bold 13px 'Inter', sans-serif"
        const tw = ctx.measureText(name).width
        const tx = s.mousePos.x - tw / 2 - 8
        const ty = s.mousePos.y - 36

        ctx.fillStyle = 'rgba(13, 10, 6, 0.9)'
        ctx.fillRect(tx, ty, tw + 16, 24)

        ctx.strokeStyle = '#3D2E1A'
        ctx.lineWidth = 2
        ctx.strokeRect(tx, ty, tw + 16, 24)

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
  }, [regions, checkins, milestones, interactive, mini, singleRegion, theme, getLastCheckin, hitTest])

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
        if (layout.length > 0) {
          const last = layout[layout.length - 1]
          const addX = last.x + 100
          const addY = last.y
          const worldX = (screenX - s.offset.x) / s.scale
          const worldY = (screenY - s.offset.y) / s.scale
          if (worldX >= addX && worldX <= addX + 48 && worldY >= addY && worldY <= addY + 48) {
            onAddClick()
          }
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
