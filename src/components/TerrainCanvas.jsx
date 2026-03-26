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
import { drawIsoDiorama } from '../lib/isometric.js'

export default function TerrainCanvas({
  regions,
  checkins = [],
  milestones = [],
  onRegionClick,
  onAddClick,
  interactive = true,
  locked: lockedProp = false,
  mini = false,
  singleRegion = null,
  theme = {},
}) {
  const locked = !!lockedProp
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
    // Walkable character state
    character: {
      x: 0, y: 0,       // world position
      vx: 0, vy: 0,     // velocity
      facing: 1,         // 1 = right, -1 = left
      bobPhase: 0,       // walking bob animation
      nearRegion: null,   // region the character is near
      active: false,      // whether character mode is engaged
    },
    keys: {},            // currently pressed keys
  })

  const layoutRef = useRef([])
  const themeRef = useRef(theme)

  // Keep themeRef in sync
  useEffect(() => {
    themeRef.current = theme
  }, [theme])

  // Compute layout whenever regions change + auto-center
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
      const newLayout = generateMapLayout(regions)
      layoutRef.current = newLayout

      // Auto-center (and auto-fit if locked)
      if (newLayout.length > 0 && containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
        newLayout.forEach(l => {
          // Include extra space for diorama height above tile center
          minX = Math.min(minX, l.x - 20)
          maxX = Math.max(maxX, l.x + l.w + 20)
          minY = Math.min(minY, l.y - 60) // account for peaks/trees above
          maxY = Math.max(maxY, l.y + l.h + 40) // account for labels below
        })
        const contentW = maxX - minX
        const contentH = maxY - minY
        const centerX = minX + contentW / 2
        const centerY = minY + contentH / 2

        if (locked) {
          // Fit all content into the viewport with padding
          const pad = 24
          const scaleX = (rect.width - pad * 2) / contentW
          const scaleY = (rect.height - pad * 2) / contentH
          const fitScale = Math.min(scaleX, scaleY, 1) // never zoom past 1x
          stateRef.current.scale = fitScale
          stateRef.current.offset.x = rect.width / 2 - centerX * fitScale
          stateRef.current.offset.y = rect.height / 2 - centerY * fitScale
        } else {
          stateRef.current.offset.x = rect.width / 2 - centerX
          stateRef.current.offset.y = rect.height / 2 - centerY
        }
      }
    }
  }, [regions, singleRegion, locked])

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

  // Initialize character at first region center
  useEffect(() => {
    const layout = layoutRef.current
    if (layout.length > 0 && !stateRef.current.character.active) {
      const first = layout[0]
      stateRef.current.character.x = first.x + first.w / 2
      stateRef.current.character.y = first.y + first.h / 2 + 20
    }
  }, [regions])

  // Keyboard handlers for character movement
  useEffect(() => {
    if (mini || !interactive) return

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase()
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'e', 'shift'].includes(key)) {
        stateRef.current.keys[key] = true
        stateRef.current.character.active = true
        e.preventDefault()
      }
    }
    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase()
      stateRef.current.keys[key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [mini, interactive])

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
      // Generous hit area around the isometric tile
      const hitRadius = 65
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
      [200, 194, 181],  // warm gray
      [232, 113, 43],   // orange accent
      [168, 158, 142],  // taupe
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
      const t = themeRef.current || {}

      // Sky color mapping — warm neutral light palette
      const skyColors = {
        dawn: '#F5F0E8',
        day: '#F5F2ED',
        dusk: '#EDE8E0',
        night: '#E8E4DC',
        storm: '#DDD8CE',
      }
      const bgColor = skyColors[t.sky_color] || '#F5F2ED'

      // 1. Fill background with theme sky color
      ctx.fillStyle = bgColor
      ctx.fillRect(0, 0, W, H)

      // 2. Draw pixel grid (subtle animated background)
      drawPixelGrid(ctx, W, H, s.time)

      // Transform for world-space
      ctx.save()
      ctx.translate(s.offset.x, s.offset.y)
      ctx.scale(s.scale, s.scale)

      const layout = layoutRef.current

      // 2b. Draw isometric dot grid floor (world-space)
      // True isometric grid — dots placed on a 2:1 diamond pattern
      {
        const isoW = 40  // horizontal spacing between dots
        const isoH = 20  // vertical spacing (half of isoW for 2:1 iso ratio)
        const dotSize = 1.5
        // Compute visible world bounds with margin
        const worldLeft = -s.offset.x / s.scale - 300
        const worldTop = -s.offset.y / s.scale - 300
        const worldRight = worldLeft + W / s.scale + 600
        const worldBottom = worldTop + H / s.scale + 600
        // Mouse in world space for interactive glow
        const mwx = (s.mousePos.x - s.offset.x) / s.scale
        const mwy = (s.mousePos.y - s.offset.y) / s.scale

        const startCol = Math.floor(worldLeft / isoW) - 2
        const endCol = Math.ceil(worldRight / isoW) + 2
        const startRow = Math.floor(worldTop / isoH) - 2
        const endRow = Math.ceil(worldBottom / isoH) + 2

        for (let row = startRow; row <= endRow; row++) {
          const isOdd = row & 1
          const rowOffX = isOdd ? isoW * 0.5 : 0
          for (let col = startCol; col <= endCol; col++) {
            // Isometric position: shift every other row by half
            const gx = col * isoW + rowOffX
            const gy = row * isoH
            // Distance from mouse for interactive glow
            const dx = gx - mwx
            const dy = gy - mwy
            const dist = Math.sqrt(dx * dx + dy * dy)
            const proximity = Math.max(0, 1 - dist / 140)
            const baseAlpha = 0.07
            const alpha = baseAlpha + proximity * 0.28
            const size = dotSize + proximity * 2
            ctx.fillStyle = `rgba(168, 158, 142, ${alpha})`
            ctx.beginPath()
            ctx.arc(Math.round(gx), Math.round(gy), size, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // 3. Draw paths between connected regions
      if (layout.length > 1) {
        for (let i = 0; i < layout.length - 1; i++) {
          const a = layout[i]
          const b = layout[i + 1]
          const ax = a.x + a.w / 2
          const ay = a.y + a.h / 2
          const bx = b.x + b.w / 2
          const by = b.y + b.h / 2
          drawPixelPath(ctx, ax, ay, bx, by, '#C8C2B5', 4, 8)
        }
      }

      // 4. Draw each region as isometric diorama
      for (const l of layout) {
        const type = l.region.type || 'mountains'
        const regionColor = REGION_COLORS[type] || '#D4A853'
        const isHovered = interactive && s.hoverRegion && s.hoverRegion.id === l.region.id
        const progress = l.region.progress || 0

        // Center of the isometric tile
        const cx = l.x + l.w / 2
        const cy = l.y + l.h / 2

        // Draw the isometric diorama
        drawIsoDiorama(ctx, type, cx, cy, s.time, progress, isHovered)

        // Weather sprite (8x8 at scale=2 = 16px) upper-right of tile
        const lastDate = getLastCheckin(l.region.id)
        const weather = getWeatherStatus(lastDate)
        const weatherSprite = WEATHER_SPRITES[weather]
        const weatherPalette = WEATHER_PALETTES[weather]
        if (weatherSprite) {
          drawSprite(ctx, weatherSprite, weatherPalette, cx + 48, cy - 40, 2)
        }

        // Region name below the diorama — white pill background
        const nameY = cy + 55 + 16
        ctx.font = "bold 13px 'Inter', sans-serif"
        ctx.textAlign = 'center'
        const nameText = l.region.name
        const nameW = ctx.measureText(nameText).width
        const pillPadX = 10
        const pillPadY = 4
        const pillH = 18
        // White pill behind text
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
        const pillX = cx - nameW / 2 - pillPadX
        const pillY = nameY - pillH + pillPadY
        ctx.beginPath()
        ctx.roundRect(pillX, pillY, nameW + pillPadX * 2, pillH, 9)
        ctx.fill()
        // Text
        ctx.fillStyle = '#4A4540'
        ctx.fillText(nameText, cx, nameY, 140)
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
          ctx.fillStyle = 'rgba(74, 69, 64, 0.6)'
          ctx.font = "9px 'Inter', sans-serif"
          ctx.textAlign = 'center'
          ctx.shadowColor = 'rgba(245, 242, 237, 0.8)'
          ctx.shadowBlur = 2
          ctx.fillText(m.landmark_name, lmX + (8 * lmScale) / 2, lmY + 8 * lmScale + 10, 60)
          ctx.shadowBlur = 0
        }
      }

      // Add region placeholder (dashed isometric diamond)
      if (interactive && !mini && !singleRegion && layout.length > 0) {
        const last = layout[layout.length - 1]
        const addCx = last.x + last.w / 2 + 180
        const addCy = last.y + last.h / 2
        ctx.strokeStyle = 'rgba(200, 194, 181, 0.4)'
        ctx.lineWidth = 2
        ctx.setLineDash([6, 6])
        ctx.beginPath()
        ctx.moveTo(addCx, addCy - 30)
        ctx.lineTo(addCx + 60, addCy)
        ctx.lineTo(addCx, addCy + 30)
        ctx.lineTo(addCx - 60, addCy)
        ctx.closePath()
        ctx.stroke()
        ctx.setLineDash([])

        ctx.fillStyle = 'rgba(200, 194, 181, 0.5)'
        ctx.font = "bold 28px 'Inter', sans-serif"
        ctx.textAlign = 'center'
        ctx.fillText('+', addCx, addCy + 10)
      }

      // 6. Walkable character — update physics and draw
      if (!mini && interactive) {
        const ch = s.character
        const keys = s.keys
        const speed = keys.shift ? 3.5 : 2
        const friction = 0.82

        // Movement input
        let inputX = 0, inputY = 0
        if (keys.a || keys.arrowleft) inputX -= 1
        if (keys.d || keys.arrowright) inputX += 1
        if (keys.w || keys.arrowup) inputY -= 1
        if (keys.s || keys.arrowdown) inputY += 1

        // Normalize diagonal
        if (inputX !== 0 && inputY !== 0) {
          inputX *= 0.707
          inputY *= 0.707
        }

        ch.vx += inputX * speed * 0.3
        ch.vy += inputY * speed * 0.3
        ch.vx *= friction
        ch.vy *= friction
        ch.x += ch.vx
        ch.y += ch.vy

        if (Math.abs(ch.vx) > 0.1) ch.facing = ch.vx > 0 ? 1 : -1

        // Walking bob
        const isMoving = Math.abs(ch.vx) > 0.3 || Math.abs(ch.vy) > 0.3
        if (isMoving) ch.bobPhase += 0.15
        else ch.bobPhase *= 0.9

        // Check proximity to regions
        let nearest = null
        let nearestDist = 80
        for (const l of layout) {
          const rcx = l.x + l.w / 2
          const rcy = l.y + l.h / 2
          const dx = ch.x - rcx
          const dy = ch.y - rcy
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < nearestDist) {
            nearestDist = dist
            nearest = l.region
          }
        }
        ch.nearRegion = nearest

        // Auto-center camera on character when active
        if (ch.active && containerRef.current) {
          const cRect = containerRef.current.getBoundingClientRect()
          const targetOffX = cRect.width / 2 - ch.x * s.scale
          const targetOffY = cRect.height / 2 - ch.y * s.scale
          s.offset.x += (targetOffX - s.offset.x) * 0.05
          s.offset.y += (targetOffY - s.offset.y) * 0.05
        }

        // E to interact with nearby region
        if (keys.e && ch.nearRegion && onRegionClick) {
          onRegionClick(ch.nearRegion)
          keys.e = false // consume
        }

        // Draw shadow (larger)
        const bobY = Math.sin(ch.bobPhase) * 3
        ctx.fillStyle = 'rgba(0,0,0,0.08)'
        ctx.beginPath()
        ctx.ellipse(ch.x, ch.y + 18, 12, 5, 0, 0, Math.PI * 2)
        ctx.fill()

        // Draw character — larger isometric figure
        const charColor = t.character_color || '#E8712B'
        const darkerColor = '#C45A1A'
        // Body
        ctx.fillStyle = charColor
        ctx.beginPath()
        ctx.roundRect(ch.x - 7, ch.y - 16 + bobY, 14, 20, 3)
        ctx.fill()
        // Body highlight
        ctx.fillStyle = 'rgba(255,255,255,0.15)'
        ctx.beginPath()
        ctx.roundRect(ch.x - 4, ch.y - 14 + bobY, 5, 16, 2)
        ctx.fill()
        // Head
        ctx.fillStyle = charColor
        ctx.beginPath()
        ctx.arc(ch.x, ch.y - 24 + bobY, 9, 0, Math.PI * 2)
        ctx.fill()
        // Hair / cap
        ctx.fillStyle = darkerColor
        ctx.beginPath()
        ctx.arc(ch.x, ch.y - 26 + bobY, 9, Math.PI, Math.PI * 2)
        ctx.fill()
        // Eyes
        ctx.fillStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.arc(ch.x + ch.facing * 3 - 1, ch.y - 25 + bobY, 2.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ch.x + ch.facing * 3 + 4, ch.y - 25 + bobY, 2.5, 0, Math.PI * 2)
        ctx.fill()
        // Pupils
        ctx.fillStyle = '#1A1714'
        ctx.beginPath()
        ctx.arc(ch.x + ch.facing * 3, ch.y - 25 + bobY, 1.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(ch.x + ch.facing * 3 + 5, ch.y - 25 + bobY, 1.2, 0, Math.PI * 2)
        ctx.fill()

        // Arms
        ctx.fillStyle = charColor
        if (isMoving) {
          const armPhase = Math.sin(ch.bobPhase * 2)
          ctx.fillRect(ch.x - 10, ch.y - 10 + bobY + armPhase * 3, 4, 10)
          ctx.fillRect(ch.x + 6, ch.y - 10 + bobY - armPhase * 3, 4, 10)
        } else {
          ctx.fillRect(ch.x - 10, ch.y - 10 + bobY, 4, 10)
          ctx.fillRect(ch.x + 6, ch.y - 10 + bobY, 4, 10)
        }

        // Legs
        ctx.fillStyle = darkerColor
        if (isMoving) {
          const legPhase = Math.sin(ch.bobPhase * 2)
          ctx.fillRect(ch.x - 5, ch.y + 4 + bobY, 5, 8 + legPhase * 3)
          ctx.fillRect(ch.x + 1, ch.y + 4 + bobY, 5, 8 - legPhase * 3)
        } else {
          ctx.fillRect(ch.x - 5, ch.y + 4, 5, 8)
          ctx.fillRect(ch.x + 1, ch.y + 4, 5, 8)
        }

        // Bouncing indicator arrow above head
        const indicatorBob = Math.sin(s.time * 3) * 4
        ctx.fillStyle = charColor
        ctx.beginPath()
        ctx.moveTo(ch.x, ch.y - 40 + indicatorBob)
        ctx.lineTo(ch.x - 6, ch.y - 48 + indicatorBob)
        ctx.lineTo(ch.x + 6, ch.y - 48 + indicatorBob)
        ctx.closePath()
        ctx.fill()

        // Region proximity indicator
        if (ch.nearRegion) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.92)'
          ctx.font = "bold 11px 'Inter', sans-serif"
          ctx.textAlign = 'center'
          const hint = `Press E — ${ch.nearRegion.name}`
          const hw = ctx.measureText(hint).width
          ctx.beginPath()
          ctx.roundRect(ch.x - hw / 2 - 10, ch.y - 58 + indicatorBob, hw + 20, 18, 9)
          ctx.fill()
          ctx.strokeStyle = 'rgba(200, 194, 181, 0.5)'
          ctx.lineWidth = 1
          ctx.stroke()
          ctx.fillStyle = '#4A4540'
          ctx.fillText(hint, ch.x, ch.y - 47 + indicatorBob)
        }
      }

      ctx.restore()

      // 5. Square particles (screen space) — skip if theme says 'none'
      const pFx = t.particle_fx || 'fireflies'
      if (pFx === 'none') { /* skip */ } else
      for (const p of s.particles) {
        // Adjust velocity based on particle type
        const vyBase = pFx === 'rain' ? 2 : pFx === 'snowflakes' ? 0.3 : p.vy
        p.x += p.vx + (pFx === 'fireflies' ? Math.sin(s.time * 1.5 + p.phase) * 0.1 : 0)
        p.y += vyBase

        // Wrap around
        if (p.x < 0) p.x = W
        if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H
        if (p.y > H) p.y = 0

        const alpha = p.alpha * (0.5 + Math.sin(s.time * 2 + p.phase) * 0.5)
        // Use character color from theme if set, otherwise default palette
        let pr, pg, pb
        if (t.character_color) {
          const hex = t.character_color
          pr = parseInt(hex.slice(1, 3), 16)
          pg = parseInt(hex.slice(3, 5), 16)
          pb = parseInt(hex.slice(5, 7), 16)
        } else {
          [pr, pg, pb] = particleColors[p.colorIdx]
        }
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

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
        ctx.fillRect(tx, ty, tw + 16, 24)

        ctx.strokeStyle = '#DDD8CE'
        ctx.lineWidth = 1
        ctx.strokeRect(tx, ty, tw + 16, 24)

        ctx.fillStyle = '#1A1714'
        ctx.textAlign = 'left'
        ctx.fillText(name, tx + 8, ty + 16)
      }

      // Controls hint (bottom-left, screen space)
      if (!mini && interactive && !s.character.active) {
        ctx.fillStyle = 'rgba(74, 69, 64, 0.3)'
        ctx.font = "11px 'Inter', sans-serif"
        ctx.textAlign = 'left'
        ctx.fillText('WASD to walk  ·  E to interact  ·  Shift to run', 16, H - 16)
      }

      animFrameRef.current = requestAnimationFrame(render)
    }

    render()
    return () => {
      running = false
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [regions, checkins, milestones, interactive, locked, mini, singleRegion, theme, getLastCheckin, hitTest])

  // Mouse/touch handlers
  const handleMouseDown = (e) => {
    if (!interactive || locked) return
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
    if (!interactive || locked) return
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
    if (!interactive || locked) return
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
