/* ============================================
   Terrain — Map Utilities
   Simplex noise, weather, layout, sprite wrapper
   ============================================ */

import { drawSprite, SPRITES, PALETTES, REGION_COLORS } from './sprites.js'

// ── Simplex 2D noise (deterministic) ──

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

// ── Weather status based on last check-in ──

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

// ── Draw terrain region sprite (thin wrapper) ──

export function drawTerrainRegion(ctx, region, x, y, width, height, weather) {
  const type = region.type || 'mountains'
  const sprite = SPRITES[type] || SPRITES.mountains
  const palette = PALETTES[type] || PALETTES.mountains

  // scale sprite to fit width (sprite is 12x12, scale so 12 * scale = width)
  const scale = Math.floor(width / 12)
  drawSprite(ctx, sprite, palette, x, y, scale)
}

// ── Generate winding-path layout for Mario World map ──

export function generateMapLayout(regions) {
  if (!regions || regions.length === 0) return []

  // Winding path pattern: right, down-right, right, up-right, right, down
  const pathPattern = [
    { dx: 1, dy: 0 },
    { dx: 1, dy: 1 },
    { dx: 1, dy: 0 },
    { dx: 1, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
  ]
  const CELL = 100  // grid cell size with padding
  const startX = 80
  const startY = 200

  return regions.map((region, i) => {
    // Use stored position if available
    if (region.position_x != null && region.position_y != null) {
      return {
        region,
        x: region.position_x,
        y: region.position_y,
        w: 48,
        h: 48,
      }
    }

    let x = startX
    let y = startY
    for (let j = 0; j < i; j++) {
      const step = pathPattern[j % pathPattern.length]
      x += step.dx * CELL
      y += step.dy * CELL
    }
    return { region, x, y, w: 48, h: 48 }
  })
}
