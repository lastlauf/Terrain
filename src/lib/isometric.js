/* ============================================
   Terrain — Isometric Diorama Renderer
   Draws pixel-art isometric blocks on canvas
   ============================================ */

// ── Isometric projection helpers ──

// Convert isometric tile coords to screen pixel coords
// tileW = diamond width, tileH = diamond height (half of width typically)
const TILE_W = 120
const TILE_H = 60
const BLOCK_DEPTH = 40
const PX = 2 // pixel size for that chunky pixel-art look

// Color palette per region type
const ISO_PALETTES = {
  mountains: {
    topLight: '#6BAF7B',
    topDark: '#5E9E6E',
    sideLeft: '#8B8680',
    sideRight: '#A09A93',
    accent1: '#4A6FA5',
    accent2: '#5A82B8',
    accent3: '#3D5E8C',
    snow: '#F5F2ED',
    detail: '#D4C8A0',
    trunk: '#8B6B3E',
  },
  forest: {
    topLight: '#6BAF7B',
    topDark: '#5E9E6E',
    sideLeft: '#8B8680',
    sideRight: '#A09A93',
    accent1: '#4A8C5C',
    accent2: '#3D7A4A',
    accent3: '#5E9E6E',
    snow: '#F5F2ED',
    detail: '#C4A882',
    trunk: '#8B6B3E',
  },
  city: {
    topLight: '#D4C8A0',
    topDark: '#C4B890',
    sideLeft: '#8B8680',
    sideRight: '#A09A93',
    accent1: '#E8E4DC',
    accent2: '#D4CFC6',
    accent3: '#C8C2B5',
    snow: '#F5F2ED',
    detail: '#4A6FA5',
    trunk: '#8B6B3E',
  },
  coast: {
    topLight: '#5E9E6E',
    topDark: '#5DB8D4',
    sideLeft: '#8B8680',
    sideRight: '#A09A93',
    accent1: '#4AA8C4',
    accent2: '#5DB8D4',
    accent3: '#3A7D9E',
    snow: '#E8E4DC',
    detail: '#D4C8A0',
    trunk: '#8B6B3E',
  },
}

// ── Core isometric block drawing ──

function fillPixelRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color
  // Snap to pixel grid
  const px = PX
  const sx = Math.round(x / px) * px
  const sy = Math.round(y / px) * px
  const sw = Math.round(w / px) * px
  const sh = Math.round(h / px) * px
  ctx.fillRect(sx, sy, sw, sh)
}

// Draw an isometric diamond (top face of block)
function drawIsoTop(ctx, cx, cy, w, h, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx, cy - h / 2)       // top
  ctx.lineTo(cx + w / 2, cy)       // right
  ctx.lineTo(cx, cy + h / 2)       // bottom
  ctx.lineTo(cx - w / 2, cy)       // left
  ctx.closePath()
  ctx.fill()
}

// Draw left side of isometric block
function drawIsoLeft(ctx, cx, cy, w, h, depth, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy)           // top-left
  ctx.lineTo(cx, cy + h / 2)           // top-right (bottom of diamond)
  ctx.lineTo(cx, cy + h / 2 + depth)   // bottom-right
  ctx.lineTo(cx - w / 2, cy + depth)   // bottom-left
  ctx.closePath()
  ctx.fill()
}

// Draw right side of isometric block
function drawIsoRight(ctx, cx, cy, w, h, depth, color) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(cx + w / 2, cy)           // top-right
  ctx.lineTo(cx, cy + h / 2)           // top-left (bottom of diamond)
  ctx.lineTo(cx, cy + h / 2 + depth)   // bottom-left
  ctx.lineTo(cx + w / 2, cy + depth)   // bottom-right
  ctx.closePath()
  ctx.fill()
}

// Draw a complete isometric block
function drawIsoBlock(ctx, cx, cy, w, h, depth, topColor, leftColor, rightColor) {
  // Draw sides first (behind top)
  drawIsoLeft(ctx, cx, cy, w, h, depth, leftColor)
  drawIsoRight(ctx, cx, cy, w, h, depth, rightColor)
  // Top face on top
  drawIsoTop(ctx, cx, cy, w, h, topColor)
}

// Draw outline for pixel crispness
function drawIsoOutline(ctx, cx, cy, w, h, depth, color, lineW = 1.5) {
  ctx.strokeStyle = color
  ctx.lineWidth = lineW
  ctx.lineJoin = 'round'

  // Top diamond
  ctx.beginPath()
  ctx.moveTo(cx, cy - h / 2)
  ctx.lineTo(cx + w / 2, cy)
  ctx.lineTo(cx, cy + h / 2)
  ctx.lineTo(cx - w / 2, cy)
  ctx.closePath()
  ctx.stroke()

  // Left side
  ctx.beginPath()
  ctx.moveTo(cx - w / 2, cy)
  ctx.lineTo(cx - w / 2, cy + depth)
  ctx.lineTo(cx, cy + h / 2 + depth)
  ctx.lineTo(cx, cy + h / 2)
  ctx.stroke()

  // Right side
  ctx.beginPath()
  ctx.moveTo(cx + w / 2, cy)
  ctx.lineTo(cx + w / 2, cy + depth)
  ctx.lineTo(cx, cy + h / 2 + depth)
  ctx.lineTo(cx, cy + h / 2)
  ctx.stroke()
}

// ── Pixel art isometric tree ──

function drawIsoTree(ctx, x, baseY, height, canopyR, trunkH, colors) {
  // Trunk
  fillPixelRect(ctx, x - 2, baseY - trunkH, 4, trunkH, colors.trunk)
  // Canopy layers (triangle-ish, pixelated)
  for (let i = 0; i < 3; i++) {
    const layerY = baseY - trunkH - (i * canopyR * 0.6)
    const layerW = canopyR * (1 - i * 0.25)
    const layerH = canopyR * 0.7
    const shade = i === 0 ? colors.accent2 : i === 1 ? colors.accent1 : colors.accent3
    // Diamond-ish canopy
    ctx.fillStyle = shade
    ctx.beginPath()
    ctx.moveTo(x, layerY - layerH)
    ctx.lineTo(x + layerW, layerY)
    ctx.lineTo(x, layerY + layerH * 0.3)
    ctx.lineTo(x - layerW, layerY)
    ctx.closePath()
    ctx.fill()
  }
}

// ── Mountain peak ──

function drawIsoPeak(ctx, x, baseY, peakH, baseW, colors) {
  // Main peak
  ctx.fillStyle = colors.accent1
  ctx.beginPath()
  ctx.moveTo(x, baseY - peakH)
  ctx.lineTo(x + baseW / 2, baseY)
  ctx.lineTo(x - baseW / 2, baseY)
  ctx.closePath()
  ctx.fill()

  // Lighter face
  ctx.fillStyle = colors.accent2
  ctx.beginPath()
  ctx.moveTo(x, baseY - peakH)
  ctx.lineTo(x + baseW / 2, baseY)
  ctx.lineTo(x, baseY - peakH * 0.2)
  ctx.closePath()
  ctx.fill()

  // Snow cap
  ctx.fillStyle = colors.snow
  ctx.beginPath()
  ctx.moveTo(x, baseY - peakH)
  ctx.lineTo(x + baseW * 0.2, baseY - peakH * 0.6)
  ctx.lineTo(x - baseW * 0.2, baseY - peakH * 0.6)
  ctx.closePath()
  ctx.fill()
}

// ── Building (isometric box) ──

function drawIsoBuilding(ctx, cx, cy, w, d, h, wallColor, roofColor, windowColor) {
  // Building is an iso box on top of the terrain
  drawIsoBlock(ctx, cx, cy - h / 2, w, d, h, roofColor, wallColor,
    shadeColor(wallColor, -15))

  // Windows (small pixel rectangles on left face)
  const winSize = 3
  const winGap = 6
  const floors = Math.floor(h / winGap) - 1
  for (let f = 0; f < floors; f++) {
    const wy = cy - h + (f + 1) * winGap
    // Left face windows
    fillPixelRect(ctx, cx - w / 4 - winSize / 2, wy, winSize, winSize, windowColor)
    // Right face windows
    fillPixelRect(ctx, cx + w / 4 - winSize / 2, wy, winSize, winSize,
      Math.random() > 0.5 ? windowColor : '#E8712B80')
  }
}

// ── Water surface (wavy iso diamond) ──

function drawIsoWater(ctx, cx, cy, w, h, time, colors) {
  // Semi-transparent water
  ctx.globalAlpha = 0.7
  drawIsoTop(ctx, cx, cy, w, h, colors.accent2)
  ctx.globalAlpha = 0.4
  // Ripple highlights
  const rippleCount = 4
  for (let i = 0; i < rippleCount; i++) {
    const rx = cx + Math.sin(time * 1.5 + i * 1.2) * (w * 0.15)
    const ry = cy + Math.cos(time * 1.2 + i * 0.8) * (h * 0.15)
    fillPixelRect(ctx, rx, ry, 6, 2, '#FFFFFF')
  }
  ctx.globalAlpha = 1.0
}

// ── Shade a hex color by percent ──

function shadeColor(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, Math.max(0, ((num >> 16) & 0xFF) + percent))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + percent))
  const b = Math.min(255, Math.max(0, (num & 0xFF) + percent))
  return `rgb(${r},${g},${b})`
}

// ══════════════════════════════════════
//  Main export: draw a full isometric region diorama
// ══════════════════════════════════════

export function drawIsoDiorama(ctx, type, cx, cy, time = 0, progress = 0, hover = false) {
  const pal = ISO_PALETTES[type] || ISO_PALETTES.mountains
  const w = TILE_W
  const h = TILE_H
  const d = BLOCK_DEPTH

  // Hover lift
  const lift = hover ? 3 : 0
  const drawY = cy - lift

  // Shadow under block
  if (hover) {
    ctx.globalAlpha = 0.08
    drawIsoTop(ctx, cx, cy + d / 2 + 4, w + 8, h + 4, '#1A1714')
    ctx.globalAlpha = 1.0
  }

  // ── Base block ──
  drawIsoBlock(ctx, cx, drawY, w, h, d, pal.topLight, pal.sideLeft, pal.sideRight)

  // ── Outline for crisp pixel look ──
  drawIsoOutline(ctx, cx, drawY, w, h, d, '#4A454033', 1.5)

  // ── Region-specific content on top ──
  switch (type) {
    case 'mountains':
      drawMountainContent(ctx, cx, drawY, w, h, pal, time)
      break
    case 'forest':
      drawForestContent(ctx, cx, drawY, w, h, pal, time)
      break
    case 'city':
      drawCityContent(ctx, cx, drawY, w, h, pal, time)
      break
    case 'coast':
      drawCoastContent(ctx, cx, drawY, w, h, pal, time)
      break
    default:
      drawMountainContent(ctx, cx, drawY, w, h, pal, time)
  }

  // ── Progress ring at bottom ──
  if (progress > 0) {
    const barX = cx - 24
    const barY = drawY + h / 2 + d + 8
    ctx.fillStyle = 'rgba(26, 23, 20, 0.08)'
    ctx.fillRect(barX, barY, 48, 3)
    const regionColors = { mountains: '#4A6FA5', forest: '#4A8C5C', city: '#C45A1A', coast: '#3A7D9E' }
    ctx.fillStyle = regionColors[type] || '#E8712B'
    ctx.fillRect(barX, barY, 48 * (progress / 100), 3)
  }
}

// ── Mountains: two peaks with snow caps, trail dots ──

function drawMountainContent(ctx, cx, cy, w, h, pal, time) {
  const topY = cy - h / 2 // top of diamond

  // Large peak
  drawIsoPeak(ctx, cx - 8, topY + 5, 42, 30, pal)
  // Smaller peak
  drawIsoPeak(ctx, cx + 18, topY + 10, 28, 22, {
    ...pal,
    accent1: pal.accent3,
    accent2: pal.accent1,
  })

  // Trail dots
  ctx.fillStyle = pal.detail
  const dots = [[-20, 8], [-10, 5], [0, 3], [10, 6], [22, 10]]
  for (const [dx, dy] of dots) {
    fillPixelRect(ctx, cx + dx, topY + 25 + dy, 3, 3, pal.detail + '80')
  }

  // Small rocks
  fillPixelRect(ctx, cx - 25, topY + 20, 5, 3, '#9E9890')
  fillPixelRect(ctx, cx + 28, topY + 22, 4, 2, '#B5AFA8')
}

// ── Forest: 3 pine trees + small cabin ──

function drawForestContent(ctx, cx, cy, w, h, pal, time) {
  const topY = cy - h / 2

  // Three trees at different positions
  drawIsoTree(ctx, cx - 22, topY + 22, 30, 10, 8, pal)
  drawIsoTree(ctx, cx - 4, topY + 18, 36, 12, 10, pal)
  drawIsoTree(ctx, cx + 18, topY + 24, 28, 9, 7, pal)

  // Small cabin
  const cabX = cx + 30
  const cabY = topY + 16
  // Walls
  fillPixelRect(ctx, cabX - 7, cabY - 10, 14, 10, pal.detail)
  // Roof (triangle-ish)
  ctx.fillStyle = '#BF8C5E'
  ctx.beginPath()
  ctx.moveTo(cabX, cabY - 18)
  ctx.lineTo(cabX + 9, cabY - 10)
  ctx.lineTo(cabX - 9, cabY - 10)
  ctx.closePath()
  ctx.fill()
  // Door
  fillPixelRect(ctx, cabX - 2, cabY - 6, 4, 6, '#6B5030')

  // Ground details
  fillPixelRect(ctx, cx - 35, topY + 25, 3, 2, '#8B6B3E40')
  fillPixelRect(ctx, cx + 35, topY + 26, 2, 2, '#8B6B3E40')
}

// ── City: 2–3 buildings of different heights ──

function drawCityContent(ctx, cx, cy, w, h, pal, time) {
  const topY = cy - h / 2

  // Tall building
  drawIsoBuilding(ctx, cx - 15, topY + 10, 20, 12, 35,
    pal.accent1, pal.snow, pal.detail + '60')

  // Medium building
  drawIsoBuilding(ctx, cx + 12, topY + 14, 18, 10, 24,
    pal.accent2, '#F0ECE4', '#E8712B60')

  // Short building
  drawIsoBuilding(ctx, cx + 32, topY + 18, 14, 8, 16,
    pal.accent3, pal.accent1, pal.detail + '40')

  // Small tree between buildings
  ctx.fillStyle = '#5E9E6E'
  ctx.beginPath()
  ctx.arc(cx + 0, topY + 18, 5, 0, Math.PI * 2)
  ctx.fill()
  fillPixelRect(ctx, cx - 1, topY + 19, 2, 4, '#8B6B3E')

  // Grid lines on ground
  ctx.strokeStyle = '#C4B89040'
  ctx.lineWidth = 0.5
  for (let i = -2; i < 3; i++) {
    ctx.beginPath()
    ctx.moveTo(cx + i * 12, topY + 5)
    ctx.lineTo(cx + i * 12 + 20, topY + 30)
    ctx.stroke()
  }
}

// ── Coast: water split, rocks, boat ──

function drawCoastContent(ctx, cx, cy, w, h, pal, time) {
  const topY = cy - h / 2

  // Water portion (right half of top face)
  drawIsoWater(ctx, cx + 15, topY + 12, w * 0.5, h * 0.5, time, pal)

  // Sandy shore
  ctx.fillStyle = pal.detail
  ctx.beginPath()
  ctx.moveTo(cx - 10, topY + 5)
  ctx.lineTo(cx + 5, topY + 15)
  ctx.lineTo(cx - 5, topY + 25)
  ctx.lineTo(cx - 25, topY + 15)
  ctx.closePath()
  ctx.fill()

  // Rocks
  ctx.fillStyle = '#9E9890'
  ctx.beginPath()
  ctx.ellipse(cx - 5, topY + 12, 5, 3, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#B5AFA8'
  ctx.beginPath()
  ctx.ellipse(cx + 2, topY + 16, 4, 2.5, 0, 0, Math.PI * 2)
  ctx.fill()

  // Small boat
  const boatX = cx + 22
  const boatY = topY + 14 + Math.sin(time * 1.2) * 1.5
  ctx.fillStyle = '#8B6B3E'
  ctx.beginPath()
  ctx.moveTo(boatX - 8, boatY)
  ctx.lineTo(boatX + 8, boatY)
  ctx.lineTo(boatX + 6, boatY + 4)
  ctx.lineTo(boatX - 6, boatY + 4)
  ctx.closePath()
  ctx.fill()
  // Mast
  ctx.strokeStyle = '#6B5030'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(boatX, boatY)
  ctx.lineTo(boatX, boatY - 12)
  ctx.stroke()
  // Sail
  ctx.fillStyle = '#E8E4DC'
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.moveTo(boatX, boatY - 12)
  ctx.lineTo(boatX + 7, boatY - 4)
  ctx.lineTo(boatX, boatY - 2)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1.0

  // Palm tree on shore
  fillPixelRect(ctx, cx - 18, topY + 5, 3, 12, '#8B6B3E')
  ctx.fillStyle = '#5E9E6E'
  ctx.beginPath()
  ctx.moveTo(cx - 17, topY + 5)
  ctx.lineTo(cx - 24, topY)
  ctx.lineTo(cx - 17, topY + 3)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = '#4A8C5C'
  ctx.beginPath()
  ctx.moveTo(cx - 17, topY + 5)
  ctx.lineTo(cx - 10, topY)
  ctx.lineTo(cx - 17, topY + 3)
  ctx.closePath()
  ctx.fill()
}

// Export constants for layout
export const ISO_TILE_W = TILE_W
export const ISO_TILE_H = TILE_H + BLOCK_DEPTH
