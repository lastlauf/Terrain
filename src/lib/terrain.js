/* ============================================
   Terrain — Map Drawing Utilities
   ============================================ */

// Simple value noise (pseudo-random, deterministic)
function hash(x, y) {
  let h = x * 374761393 + y * 668265263
  h = (h ^ (h >> 13)) * 1274126177
  h = h ^ (h >> 16)
  return (h & 0x7fffffff) / 0x7fffffff
}

function smoothstep(t) {
  return t * t * (3 - 2 * t)
}

export function simplex2d(x, y) {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy

  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)

  const sx = smoothstep(fx)
  const sy = smoothstep(fy)

  return a + sx * (b - a) + sy * (c - a) + sx * sy * (a - b - c + d)
}

// Weather status based on last check-in
export function getWeatherStatus(lastCheckinDate) {
  if (!lastCheckinDate) return 'storm'
  const now = Date.now()
  const last = new Date(lastCheckinDate).getTime()
  const daysSince = (now - last) / (1000 * 60 * 60 * 24)

  if (daysSince < 1) return 'clear'
  if (daysSince < 3) return 'partial'
  if (daysSince < 7) return 'cloudy'
  return 'storm'
}

// Color lookup for region types
const REGION_COLORS = {
  mountains: '#7C9EBA',
  forest: '#5E9E6E',
  city: '#D4A853',
  coast: '#00D4C8',
}

// Draw a single terrain region tile
export function drawTerrainRegion(ctx, region, x, y, width, height, weather) {
  const color = region.color || REGION_COLORS[region.type] || '#D4A853'

  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 8)
  ctx.clip()

  // Background gradient
  const bgGrad = ctx.createLinearGradient(x, y, x, y + height)
  bgGrad.addColorStop(0, darken(color, 0.7))
  bgGrad.addColorStop(1, darken(color, 0.85))
  ctx.fillStyle = bgGrad
  ctx.fillRect(x, y, width, height)

  // Draw terrain type
  switch (region.type) {
    case 'mountains':
      drawMountains(ctx, x, y, width, height, color)
      break
    case 'forest':
      drawForest(ctx, x, y, width, height, color)
      break
    case 'city':
      drawCity(ctx, x, y, width, height, color)
      break
    case 'coast':
      drawCoast(ctx, x, y, width, height, color)
      break
    default:
      drawMountains(ctx, x, y, width, height, color)
  }

  // Weather overlay
  drawWeather(ctx, x, y, width, height, weather)

  // Progress bar at bottom
  if (region.progress !== undefined) {
    const barH = 4
    const barY = y + height - barH - 6
    const barX = x + 8
    const barW = width - 16

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW, barH, 2)
    ctx.fill()

    ctx.fillStyle = color
    ctx.beginPath()
    ctx.roundRect(barX, barY, barW * (region.progress / 100), barH, 2)
    ctx.fill()
  }

  // Region name label
  ctx.fillStyle = '#F5E6C8'
  ctx.font = `bold 13px 'Inter', sans-serif`
  ctx.textAlign = 'center'
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 4
  ctx.fillText(region.name, x + width / 2, y + 20, width - 16)
  ctx.shadowBlur = 0

  // Retro border
  ctx.strokeStyle = 'rgba(255,200,100,0.15)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(x, y, width, height, 8)
  ctx.stroke()

  ctx.restore()
}

function drawMountains(ctx, x, y, w, h, color) {
  const groundY = y + h * 0.75

  // Rear mountain range
  ctx.fillStyle = darken(color, 0.4)
  ctx.beginPath()
  ctx.moveTo(x, groundY)
  for (let i = 0; i <= w; i += 3) {
    const noise = simplex2d(i * 0.02 + 10, 5)
    const peakH = h * 0.3 * noise + h * 0.15
    ctx.lineTo(x + i, groundY - peakH)
  }
  ctx.lineTo(x + w, groundY)
  ctx.closePath()
  ctx.fill()

  // Front mountain range
  ctx.fillStyle = darken(color, 0.2)
  ctx.beginPath()
  ctx.moveTo(x, groundY)
  for (let i = 0; i <= w; i += 3) {
    const noise = simplex2d(i * 0.025, 0)
    const peakH = h * 0.35 * noise + h * 0.1
    ctx.lineTo(x + i, groundY - peakH)
  }
  ctx.lineTo(x + w, groundY)
  ctx.closePath()
  ctx.fill()

  // Snow caps on tallest peaks
  ctx.fillStyle = 'rgba(255,255,255,0.6)'
  for (let i = 0; i <= w; i += 3) {
    const noise = simplex2d(i * 0.025, 0)
    const peakH = h * 0.35 * noise + h * 0.1
    if (peakH > h * 0.3) {
      ctx.beginPath()
      ctx.arc(x + i, groundY - peakH, 3, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Ground
  const groundGrad = ctx.createLinearGradient(x, groundY, x, y + h)
  groundGrad.addColorStop(0, darken(color, 0.6))
  groundGrad.addColorStop(1, darken(color, 0.8))
  ctx.fillStyle = groundGrad
  ctx.fillRect(x, groundY, w, h - groundY + y)
}

function drawForest(ctx, x, y, w, h, color) {
  const groundY = y + h * 0.7

  // Ground
  const groundGrad = ctx.createLinearGradient(x, groundY, x, y + h)
  groundGrad.addColorStop(0, darken(color, 0.4))
  groundGrad.addColorStop(1, darken(color, 0.7))
  ctx.fillStyle = groundGrad
  ctx.fillRect(x, groundY, w, h - groundY + y)

  // Pine trees — rear layer
  for (let i = 0; i < 8; i++) {
    const tx = x + (w * (i + 0.5)) / 8 + simplex2d(i, 3) * 10
    const treeH = h * 0.25 + simplex2d(i, 7) * h * 0.1
    drawPineTree(ctx, tx, groundY, treeH, darken(color, 0.35))
  }

  // Pine trees — front layer
  for (let i = 0; i < 6; i++) {
    const tx = x + (w * (i + 0.3)) / 6 + simplex2d(i, 1) * 15
    const treeH = h * 0.3 + simplex2d(i, 2) * h * 0.12
    drawPineTree(ctx, tx, groundY + 5, treeH, darken(color, 0.15))
  }
}

function drawPineTree(ctx, cx, baseY, height, color) {
  // Trunk
  ctx.fillStyle = '#3D2E1A'
  ctx.fillRect(cx - 2, baseY - height * 0.15, 4, height * 0.15)

  // Layers
  ctx.fillStyle = color
  const layers = 3
  for (let i = 0; i < layers; i++) {
    const layerY = baseY - height * 0.15 - i * (height * 0.25)
    const layerW = (height * 0.35) * (1 - i * 0.2)
    ctx.beginPath()
    ctx.moveTo(cx, layerY - height * 0.25)
    ctx.lineTo(cx + layerW, layerY)
    ctx.lineTo(cx - layerW, layerY)
    ctx.closePath()
    ctx.fill()
  }
}

function drawCity(ctx, x, y, w, h, color) {
  const groundY = y + h * 0.75

  // Ground
  ctx.fillStyle = darken(color, 0.7)
  ctx.fillRect(x, groundY, w, h - groundY + y)

  // Buildings
  const buildingCount = Math.floor(w / 18)
  for (let i = 0; i < buildingCount; i++) {
    const bx = x + 6 + i * (w - 12) / buildingCount
    const bw = (w / buildingCount) * 0.7
    const bh = h * (0.2 + simplex2d(i, 10) * 0.35)

    ctx.fillStyle = darken(color, 0.3 + simplex2d(i, 5) * 0.2)
    ctx.fillRect(bx, groundY - bh, bw, bh)

    // Windows
    ctx.fillStyle = `rgba(255,200,100,${0.3 + simplex2d(i, 20) * 0.5})`
    const cols = Math.max(1, Math.floor(bw / 6))
    const rows = Math.max(1, Math.floor(bh / 8))
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (simplex2d(i * 10 + c, r) > 0.4) {
          ctx.fillRect(
            bx + 2 + c * (bw - 4) / cols,
            groundY - bh + 4 + r * (bh - 4) / rows,
            3,
            3
          )
        }
      }
    }
  }
}

function drawCoast(ctx, x, y, w, h, color) {
  const shoreY = y + h * 0.55

  // Sky/water gradient
  const waterGrad = ctx.createLinearGradient(x, y, x, y + h)
  waterGrad.addColorStop(0, darken(color, 0.6))
  waterGrad.addColorStop(0.5, darken(color, 0.4))
  waterGrad.addColorStop(1, darken(color, 0.7))
  ctx.fillStyle = waterGrad
  ctx.fillRect(x, y, w, h)

  // Shore/sand
  const shoreGrad = ctx.createLinearGradient(x, shoreY, x, shoreY + h * 0.15)
  shoreGrad.addColorStop(0, '#D4A853')
  shoreGrad.addColorStop(1, darken('#D4A853', 0.4))
  ctx.fillStyle = shoreGrad
  ctx.beginPath()
  ctx.moveTo(x, shoreY)
  for (let i = 0; i <= w; i += 4) {
    const wave = Math.sin(i * 0.05) * 4
    ctx.lineTo(x + i, shoreY + wave)
  }
  ctx.lineTo(x + w, y + h)
  ctx.lineTo(x, y + h)
  ctx.closePath()
  ctx.fill()

  // Wave lines
  for (let row = 0; row < 4; row++) {
    const waveY = y + h * 0.15 + row * h * 0.1
    ctx.strokeStyle = `rgba(255,255,255,${0.15 - row * 0.03})`
    ctx.lineWidth = 1.5
    ctx.beginPath()
    for (let i = 0; i <= w; i += 2) {
      const wave = Math.sin(i * 0.06 + row * 2) * 3
      if (i === 0) ctx.moveTo(x + i, waveY + wave)
      else ctx.lineTo(x + i, waveY + wave)
    }
    ctx.stroke()
  }
}

function drawWeather(ctx, x, y, w, h, weather) {
  switch (weather) {
    case 'clear':
      // Sun rays
      ctx.fillStyle = 'rgba(255,200,100,0.08)'
      for (let i = 0; i < 5; i++) {
        const angle = (i / 5) * Math.PI * 0.5 - Math.PI * 0.25
        ctx.beginPath()
        ctx.moveTo(x + w * 0.8, y + 10)
        ctx.lineTo(
          x + w * 0.8 + Math.cos(angle) * w * 0.6,
          y + 10 + Math.sin(angle) * h * 0.6
        )
        ctx.lineTo(
          x + w * 0.8 + Math.cos(angle + 0.1) * w * 0.6,
          y + 10 + Math.sin(angle + 0.1) * h * 0.6
        )
        ctx.closePath()
        ctx.fill()
      }
      break

    case 'partial':
      // Single small cloud
      drawCloud(ctx, x + w * 0.6, y + h * 0.15, 20, 'rgba(200,200,200,0.15)')
      break

    case 'cloudy':
      // Cloud layer
      drawCloud(ctx, x + w * 0.3, y + h * 0.1, 25, 'rgba(150,150,150,0.2)')
      drawCloud(ctx, x + w * 0.6, y + h * 0.08, 22, 'rgba(150,150,150,0.18)')
      drawCloud(ctx, x + w * 0.8, y + h * 0.14, 18, 'rgba(150,150,150,0.15)')
      break

    case 'storm':
      // Dark overlay
      ctx.fillStyle = 'rgba(0,0,0,0.15)'
      ctx.fillRect(x, y, w, h)

      // Storm clouds
      drawCloud(ctx, x + w * 0.3, y + h * 0.08, 28, 'rgba(80,80,80,0.3)')
      drawCloud(ctx, x + w * 0.65, y + h * 0.05, 30, 'rgba(80,80,80,0.35)')

      // Lightning bolt
      ctx.strokeStyle = 'rgba(255,240,150,0.25)'
      ctx.lineWidth = 2
      ctx.beginPath()
      const lx = x + w * 0.5
      const ly = y + h * 0.2
      ctx.moveTo(lx, ly)
      ctx.lineTo(lx - 4, ly + 12)
      ctx.lineTo(lx + 3, ly + 12)
      ctx.lineTo(lx - 2, ly + 28)
      ctx.stroke()

      // Rain dots
      ctx.fillStyle = 'rgba(150,180,220,0.15)'
      for (let i = 0; i < 12; i++) {
        const rx = x + simplex2d(i, 30) * w
        const ry = y + simplex2d(i, 31) * h * 0.7 + h * 0.2
        ctx.fillRect(rx, ry, 1, 4)
      }
      break
  }
}

function drawCloud(ctx, cx, cy, size, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(cx, cy, size * 0.5, 0, Math.PI * 2)
  ctx.arc(cx + size * 0.35, cy - size * 0.15, size * 0.4, 0, Math.PI * 2)
  ctx.arc(cx + size * 0.6, cy, size * 0.35, 0, Math.PI * 2)
  ctx.fill()
}

function darken(hex, amount) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgb(${Math.floor(r * (1 - amount))},${Math.floor(g * (1 - amount))},${Math.floor(b * (1 - amount))})`
}

// Generate layout positions for all regions on the canvas
export function generateMapLayout(regions) {
  if (!regions || regions.length === 0) return []

  const cols = Math.ceil(Math.sqrt(regions.length))
  const tileW = 200
  const tileH = 160
  const gap = 24

  return regions.map((region, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)

    // Use stored position if available, otherwise auto-layout
    const posX = region.position_x != null ? region.position_x : col * (tileW + gap) + gap
    const posY = region.position_y != null ? region.position_y : row * (tileH + gap) + gap

    return {
      region,
      x: posX,
      y: posY,
      w: tileW,
      h: tileH,
    }
  })
}
