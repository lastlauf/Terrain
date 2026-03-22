import { useRef, useEffect, useCallback } from 'react'
import { GRAVITY, JUMP_FORCE, MOVE_SPEED, FRICTION, SPRINT_MULTIPLIER, generateZone, createPlayer } from '../lib/platformer.js'

export default function PlatformerCanvas({ regions, onExit }) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const gameRef = useRef({
    player: createPlayer(100, 400),
    zones: [],
    currentZone: 0,
    keys: {},
    camera: { x: 0, y: 0 },
    collectedCount: 0,
    fadingOut: false,
    fadeAlpha: 0,
    touchControls: {
      left: false,
      right: false,
      jump: false,
      sprint: false,
    },
    showMobileControls: false,
  })

  // Generate zones from regions
  useEffect(() => {
    const game = gameRef.current
    if (regions.length === 0) return
    game.zones = regions.map((r, i) => generateZone(r, i))
    game.currentZone = 0
    game.player = createPlayer(100, 400)
    game.collectedCount = 0

    // Detect touch device
    game.showMobileControls = 'ontouchstart' in window
  }, [regions])

  // Key handlers
  useEffect(() => {
    const game = gameRef.current

    const handleKeyDown = (e) => {
      game.keys[e.key.toLowerCase()] = true
      game.keys[e.code] = true

      if (e.key === 'Escape' && onExit) {
        onExit()
      }
    }

    const handleKeyUp = (e) => {
      game.keys[e.key.toLowerCase()] = false
      game.keys[e.code] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onExit])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let running = true

    function gameLoop() {
      if (!running) return

      const game = gameRef.current
      const container = containerRef.current
      if (!container || game.zones.length === 0) {
        requestAnimationFrame(gameLoop)
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

      const zone = game.zones[game.currentZone]
      const player = game.player
      const keys = game.keys
      const touch = game.touchControls

      // Input
      const moveLeft = keys['a'] || keys['arrowleft'] || touch.left
      const moveRight = keys['d'] || keys['arrowright'] || touch.right
      const jump = keys[' '] || keys['w'] || keys['arrowup'] || keys['Space'] || touch.jump
      const sprint = keys['shift'] || keys['Shift'] || touch.sprint
      const collect = keys['e']

      // Physics
      const speed = sprint ? MOVE_SPEED * SPRINT_MULTIPLIER : MOVE_SPEED
      if (moveLeft) {
        player.vx -= speed * 0.3
        player.facing = -1
      }
      if (moveRight) {
        player.vx += speed * 0.3
        player.facing = 1
      }

      player.vx *= FRICTION
      player.vy += GRAVITY

      if (jump && player.onGround) {
        player.vy = JUMP_FORCE
        player.onGround = false
      }

      player.x += player.vx
      player.y += player.vy

      // Collision with platforms
      player.onGround = false
      for (const plat of zone.platforms) {
        // Simple AABB from above
        if (
          player.x + player.width > plat.x &&
          player.x < plat.x + plat.w &&
          player.y + player.height > plat.y &&
          player.y + player.height < plat.y + plat.h + 10 &&
          player.vy >= 0
        ) {
          player.y = plat.y - player.height
          player.vy = 0
          player.onGround = true
        }
      }

      // Prevent falling off screen
      if (player.y > H + 100) {
        player.y = 100
        player.vy = 0
        player.x = 100
      }

      // Collect orbs
      if (collect) {
        for (const orb of zone.collectibles) {
          if (orb.collected) continue
          const dx = (player.x + player.width / 2) - orb.x
          const dy = (player.y + player.height / 2) - orb.y
          if (Math.sqrt(dx * dx + dy * dy) < 40) {
            orb.collected = true
            game.collectedCount++
          }
        }
      }

      // Zone transition
      if (player.x > zone.width - 50 && game.currentZone < game.zones.length - 1) {
        game.fadingOut = true
      }
      if (player.x < -20 && game.currentZone > 0) {
        game.currentZone--
        player.x = game.zones[game.currentZone].width - 80
      }

      if (game.fadingOut) {
        game.fadeAlpha += 0.03
        if (game.fadeAlpha >= 1) {
          game.currentZone++
          player.x = 50
          player.y = 300
          player.vx = 0
          player.vy = 0
          game.fadingOut = false
          game.fadeAlpha = 0
        }
      }

      // Camera
      game.camera.x += (player.x - W / 3 - game.camera.x) * 0.08
      game.camera.y += (player.y - H / 2 - game.camera.y) * 0.05
      game.camera.x = Math.max(0, Math.min(zone.width - W, game.camera.x))

      // ---- RENDER ----
      ctx.save()

      // Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
      bgGrad.addColorStop(0, zone.colors.sky)
      bgGrad.addColorStop(1, zone.colors.ground)
      ctx.fillStyle = bgGrad
      ctx.fillRect(0, 0, W, H)

      // Parallax stars
      for (let i = 0; i < 30; i++) {
        const sx = ((i * 137.3) % W + game.camera.x * -0.05) % W
        const sy = ((i * 89.7) % (H * 0.5))
        const brightness = 0.2 + (Math.sin(i + Date.now() * 0.001) * 0.3 + 0.3)
        ctx.fillStyle = `rgba(255,255,255,${brightness})`
        ctx.fillRect(sx, sy, 1.5, 1.5)
      }

      // Camera transform
      ctx.translate(-game.camera.x, -game.camera.y)

      // Platforms
      for (const plat of zone.platforms) {
        if (plat.type === 'ground') {
          const groundGrad = ctx.createLinearGradient(0, plat.y, 0, plat.y + plat.h)
          groundGrad.addColorStop(0, zone.colors.accent)
          groundGrad.addColorStop(0.3, zone.colors.ground)
          groundGrad.addColorStop(1, '#000')
          ctx.fillStyle = groundGrad
          ctx.fillRect(plat.x, plat.y, plat.w, plat.h)

          // Ground top line
          ctx.strokeStyle = zone.colors.accent
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(plat.x, plat.y)
          ctx.lineTo(plat.x + plat.w, plat.y)
          ctx.stroke()
        } else {
          ctx.fillStyle = zone.colors.ground
          ctx.beginPath()
          ctx.roundRect(plat.x, plat.y, plat.w, plat.h, 4)
          ctx.fill()

          // Platform top highlight
          ctx.strokeStyle = zone.colors.accent
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(plat.x, plat.y)
          ctx.lineTo(plat.x + plat.w, plat.y)
          ctx.stroke()
        }
      }

      // Collectible orbs
      for (const orb of zone.collectibles) {
        if (orb.collected) continue

        const pulse = Math.sin(Date.now() * 0.003 + orb.x) * 0.3 + 0.7
        const orbRadius = 8

        // Glow
        ctx.fillStyle = `rgba(212, 168, 83, ${0.15 * pulse})`
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orbRadius * 3, 0, Math.PI * 2)
        ctx.fill()

        // Orb
        const orbGrad = ctx.createRadialGradient(orb.x, orb.y - 2, 0, orb.x, orb.y, orbRadius)
        orbGrad.addColorStop(0, '#FFF4D0')
        orbGrad.addColorStop(0.6, '#D4A853')
        orbGrad.addColorStop(1, 'rgba(212, 168, 83, 0.3)')
        ctx.fillStyle = orbGrad
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orbRadius, 0, Math.PI * 2)
        ctx.fill()

        // E prompt when near
        const dx = (player.x + player.width / 2) - orb.x
        const dy = (player.y + player.height / 2) - orb.y
        if (Math.sqrt(dx * dx + dy * dy) < 50) {
          ctx.fillStyle = 'rgba(245, 230, 200, 0.8)'
          ctx.font = `bold 11px 'Inter', sans-serif`
          ctx.textAlign = 'center'
          ctx.fillText('E', orb.x, orb.y - 16)
        }
      }

      // Player
      const px = player.x
      const py = player.y

      // Player glow
      ctx.fillStyle = `rgba(212, 168, 83, 0.12)`
      ctx.beginPath()
      ctx.arc(px + player.width / 2, py + player.height / 2, 30, 0, Math.PI * 2)
      ctx.fill()

      // Player body (filled rect with glow)
      const playerColor = player.color || '#D4A853'
      const playerGrad = ctx.createRadialGradient(
        px + player.width / 2, py + player.height / 2, 0,
        px + player.width / 2, py + player.height / 2, 24
      )
      playerGrad.addColorStop(0, playerColor)
      playerGrad.addColorStop(1, 'rgba(212, 168, 83, 0.3)')
      ctx.fillStyle = playerGrad
      ctx.beginPath()
      ctx.roundRect(px, py, player.width, player.height, 4)
      ctx.fill()

      // Player outline
      ctx.strokeStyle = playerColor
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.roundRect(px, py, player.width, player.height, 4)
      ctx.stroke()

      // Eyes
      ctx.fillStyle = '#0D0A06'
      const eyeY = py + 10
      const eyeOffset = player.facing > 0 ? 6 : 2
      ctx.fillRect(px + eyeOffset, eyeY, 3, 3)
      ctx.fillRect(px + eyeOffset + 8, eyeY, 3, 3)

      ctx.restore()

      // ---- HUD (screen space) ----

      // Zone name
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(W / 2 - 80, 16, 160, 32, 8)
      ctx.fill()

      ctx.fillStyle = '#F5E6C8'
      ctx.font = `16px 'Fredoka One', cursive`
      ctx.textAlign = 'center'
      ctx.fillText(zone.name, W / 2, 38)

      // Collected count
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
      ctx.beginPath()
      ctx.roundRect(W - 120, 16, 100, 32, 8)
      ctx.fill()

      ctx.fillStyle = '#D4A853'
      ctx.font = `14px 'Inter', sans-serif`
      ctx.textAlign = 'right'
      ctx.fillText(`${game.collectedCount} collected`, W - 30, 37)

      // ESC hint
      ctx.fillStyle = 'rgba(245, 230, 200, 0.3)'
      ctx.font = `12px 'Inter', sans-serif`
      ctx.textAlign = 'left'
      ctx.fillText('ESC to exit', 16, 36)

      // Zone indicator
      if (game.zones.length > 1) {
        const dotSize = 8
        const dotGap = 16
        const totalW = game.zones.length * (dotSize + dotGap) - dotGap
        const startX = W / 2 - totalW / 2
        for (let i = 0; i < game.zones.length; i++) {
          ctx.fillStyle = i === game.currentZone ? '#D4A853' : 'rgba(138, 117, 96, 0.4)'
          ctx.beginPath()
          ctx.arc(startX + i * (dotSize + dotGap) + dotSize / 2, H - 24, dotSize / 2, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      // Mobile controls
      if (game.showMobileControls) {
        drawMobileControls(ctx, W, H, game.touchControls)
      }

      // Fade transition
      if (game.fadeAlpha > 0) {
        ctx.fillStyle = `rgba(13, 10, 6, ${game.fadeAlpha})`
        ctx.fillRect(0, 0, W, H)
      }

      requestAnimationFrame(gameLoop)
    }

    gameLoop()
    return () => { running = false }
  }, [regions])

  // Touch control handlers
  const handleTouchStart = useCallback((e) => {
    const game = gameRef.current
    if (!game.showMobileControls) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    for (const touch of e.changedTouches) {
      const x = touch.clientX - rect.left
      const y = touch.clientY - rect.top
      const H = rect.height
      const W = rect.width

      // D-pad area (bottom-left)
      if (x < 60 && y > H - 100) game.touchControls.left = true
      if (x > 80 && x < 150 && y > H - 100) game.touchControls.right = true
      if (x < 150 && y > H - 160 && y < H - 100) game.touchControls.sprint = true

      // Jump button (bottom-right)
      if (x > W - 100 && y > H - 100) game.touchControls.jump = true
    }
  }, [])

  const handleTouchEnd = useCallback((e) => {
    const game = gameRef.current
    game.touchControls.left = false
    game.touchControls.right = false
    game.touchControls.jump = false
    game.touchControls.sprint = false
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        touchAction: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
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

function drawMobileControls(ctx, W, H, touchControls) {
  const btnSize = 48
  const padding = 20

  // Left arrow
  drawControlBtn(ctx, padding, H - padding - btnSize, btnSize, '<', touchControls.left)
  // Right arrow
  drawControlBtn(ctx, padding + btnSize + 12, H - padding - btnSize, btnSize, '>', touchControls.right)
  // Sprint (above)
  drawControlBtn(ctx, padding + (btnSize + 12) / 2, H - padding - btnSize * 2 - 12, btnSize, 'S', touchControls.sprint)

  // Jump (bottom-right)
  drawControlBtn(ctx, W - padding - btnSize, H - padding - btnSize, btnSize * 1.2, 'JUMP', touchControls.jump)
}

function drawControlBtn(ctx, x, y, size, label, active) {
  ctx.fillStyle = active ? 'rgba(212, 168, 83, 0.4)' : 'rgba(255, 255, 255, 0.1)'
  ctx.strokeStyle = active ? 'rgba(212, 168, 83, 0.6)' : 'rgba(255, 255, 255, 0.2)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x, y, size, size, 8)
  ctx.fill()
  ctx.stroke()

  ctx.fillStyle = active ? '#D4A853' : 'rgba(255, 255, 255, 0.5)'
  ctx.font = `bold 14px 'Inter', sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText(label, x + size / 2, y + size / 2 + 5)
}
