/* ============================================
   Terrain — Pixel Art Sprite System
   Mario World aesthetic with blue/pink/gold family
   ============================================ */

// Color palettes per region type (index 0 = transparent)
export const PALETTES = {
  mountains: ['transparent', '#4A90D9', '#3A72B0', '#2A5486', '#F5E6C8'],
  forest:    ['transparent', '#5E9E6E', '#4A7D56', '#3A5D42', '#8B6B3E'],
  city:      ['transparent', '#D4A853', '#B08A3A', '#8A6B2A', '#FF6B9D'],
  coast:     ['transparent', '#FF6B9D', '#D4568A', '#4A90D9', '#F5E6C8'],
}

// Region color lookup (for progress bars, labels, etc.)
export const REGION_COLORS = {
  mountains: '#4A90D9',
  forest:    '#5E9E6E',
  city:      '#D4A853',
  coast:     '#FF6B9D',
}

// ── 12x12 Region Sprites ──

export const SPRITES = {
  // Mountains: peaks with snow caps, layered ridgeline
  mountains: [
    [0,0,0,0,0,1,0,0,0,0,0,0],
    [0,0,0,0,1,4,1,0,0,0,0,0],
    [0,0,0,1,4,1,2,1,0,0,0,0],
    [0,0,1,1,1,2,2,2,1,0,0,0],
    [0,1,2,2,2,2,2,2,2,1,0,0],
    [0,1,2,2,3,2,2,2,2,1,1,0],
    [1,2,2,3,3,3,2,2,1,4,1,0],
    [1,2,3,3,3,3,3,1,4,1,2,1],
    [2,3,3,3,3,3,1,1,1,2,2,2],
    [2,3,3,3,3,3,2,2,2,2,3,2],
    [3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3],
  ],

  // Forest: 3 pine trees with trunks, ground line
  forest: [
    [0,0,0,1,0,0,0,0,1,0,0,0],
    [0,0,1,1,1,0,0,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,2,1,0,0,1,2,1,0,0],
    [0,1,2,2,2,1,1,2,2,2,1,0],
    [1,1,2,2,2,1,1,2,2,2,1,1],
    [0,0,0,4,0,0,0,0,4,0,0,0],
    [0,0,0,4,0,1,0,0,4,0,0,0],
    [0,0,0,4,1,1,1,0,4,0,0,0],
    [0,0,0,0,1,2,1,0,0,0,0,0],
    [3,3,3,3,0,4,0,3,3,3,3,3],
    [3,3,3,3,3,4,3,3,3,3,3,3],
  ],

  // City: 3-4 buildings of different heights, lit windows
  city: [
    [0,0,0,0,0,0,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,0,0,0,0],
    [0,0,2,2,0,1,4,1,0,0,0,0],
    [0,0,2,4,0,1,1,1,2,2,0,0],
    [0,0,2,2,0,1,4,1,2,4,0,0],
    [1,1,2,4,0,1,1,1,2,2,2,0],
    [1,4,2,2,1,1,4,1,2,4,2,0],
    [1,1,2,4,1,1,1,1,2,2,2,1],
    [1,4,2,2,1,4,1,4,2,4,2,1],
    [1,1,2,4,1,1,1,1,2,2,2,1],
    [3,3,3,3,3,3,3,3,3,3,3,3],
    [3,3,3,3,3,3,3,3,3,3,3,3],
  ],

  // Coast: wave with shore, small sand area
  coast: [
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,3,3,0,0,0,0,3,3,0],
    [0,0,3,3,3,3,0,0,3,3,3,3],
    [0,3,3,3,3,3,3,3,3,3,3,0],
    [3,3,3,3,3,3,3,3,3,3,0,0],
    [0,3,3,3,3,3,3,3,3,0,0,0],
    [0,0,3,3,3,3,3,3,0,0,4,0],
    [0,0,0,0,3,3,0,0,0,4,4,4],
    [0,0,0,0,0,0,0,0,4,4,4,4],
    [4,4,0,0,0,0,0,4,4,4,4,4],
    [4,4,4,4,4,4,4,4,4,4,4,4],
    [4,4,4,4,4,4,4,4,4,4,4,4],
  ],
}

// ── 8x8 Weather Sprites ──

export const WEATHER_SPRITES = {
  // Sun: bright center with 4 rays
  clear: [
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,1,0],
    [0,0,1,1,1,0,0,0],
    [1,0,1,1,1,0,0,1],
    [0,0,1,1,1,0,0,0],
    [0,1,0,0,0,1,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],

  // Partial cloud: small cloud with sun peeking
  partial: [
    [0,0,0,0,0,1,0,0],
    [0,0,0,0,1,1,1,0],
    [0,0,2,2,0,1,0,0],
    [0,2,2,2,2,0,0,0],
    [2,2,2,2,2,2,0,0],
    [0,2,2,2,2,0,0,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],

  // Cloud: filled cloud shape
  cloudy: [
    [0,0,0,0,0,0,0,0],
    [0,0,2,2,0,0,0,0],
    [0,2,2,2,2,2,0,0],
    [2,2,2,2,2,2,2,0],
    [2,2,2,2,2,2,2,2],
    [0,2,2,2,2,2,2,0],
    [0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0],
  ],

  // Storm: dark cloud with lightning bolt pixel
  storm: [
    [0,0,3,3,3,0,0,0],
    [0,3,3,3,3,3,0,0],
    [3,3,3,3,3,3,3,0],
    [3,3,3,3,3,3,3,3],
    [0,0,0,1,0,0,0,0],
    [0,0,1,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,0,1,0,0,0],
  ],
}

// Weather sprite palettes
export const WEATHER_PALETTES = {
  clear:   ['transparent', '#D4A853', '#8A7560', '#5A4A38'],
  partial: ['transparent', '#D4A853', '#8A7560', '#5A4A38'],
  cloudy:  ['transparent', '#D4A853', '#8A7560', '#5A4A38'],
  storm:   ['transparent', '#D4A853', '#5A4A38', '#3D2E1A'],
}

// ── 8x8 Landmark Sprites ──

export const LANDMARK_SPRITES = {
  // Tower (mountains): stacked stones with flag
  mountains: [
    [0,0,1,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,0,2,0,0,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,2,3,2,0,0,0],
    [0,2,2,2,2,2,0,0],
    [0,2,3,2,3,2,0,0],
    [2,2,2,2,2,2,2,0],
  ],

  // Ancient tree (forest): thick trunk, wide canopy
  forest: [
    [0,0,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,0],
    [1,1,1,2,2,1,1,1],
    [1,1,2,2,2,2,1,1],
    [0,1,1,1,1,1,1,0],
    [0,0,0,4,4,0,0,0],
    [0,0,0,4,4,0,0,0],
    [0,0,4,4,4,4,0,0],
  ],

  // Skyscraper (city): tall narrow building, antenna
  city: [
    [0,0,0,1,0,0,0,0],
    [0,0,0,1,0,0,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,2,4,2,0,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,2,4,2,0,0,0],
    [0,0,2,2,2,0,0,0],
    [0,0,2,4,2,0,0,0],
  ],

  // Lighthouse (coast): striped tower with beam
  coast: [
    [0,0,1,1,1,0,0,0],
    [0,0,0,2,0,0,0,0],
    [0,0,2,3,2,0,0,0],
    [0,0,3,2,3,0,0,0],
    [0,0,2,3,2,0,0,0],
    [0,0,3,2,3,0,0,0],
    [0,3,3,3,3,3,0,0],
    [0,3,3,3,3,3,0,0],
  ],
}

// ── 6x6 Star / Collectible Sprite ──

export const STAR_SPRITE = [
  [0,0,1,1,0,0],
  [0,1,2,2,1,0],
  [1,2,2,2,2,1],
  [1,2,2,2,2,1],
  [0,1,2,2,1,0],
  [0,0,1,1,0,0],
]

export const STAR_PALETTE = ['transparent', '#D4A853', '#F5E6C8']

// ── Core Drawing Utility ──

export function drawSprite(ctx, sprite, palette, x, y, scale = 4) {
  sprite.forEach((row, py) => {
    row.forEach((colorIdx, px) => {
      if (colorIdx === 0) return // transparent
      ctx.fillStyle = palette[colorIdx]
      ctx.fillRect(x + px * scale, y + py * scale, scale, scale)
    })
  })
}

// ── Path Tile Helpers ──

// Draw a dotted path between two points
export function drawPixelPath(ctx, x1, y1, x2, y2, color = '#3D2E1A', dotSize = 4, gap = 8) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)
  const steps = Math.floor(dist / gap)

  if (steps === 0) return

  const stepX = dx / steps
  const stepY = dy / steps

  ctx.fillStyle = color
  for (let i = 0; i <= steps; i++) {
    const px = x1 + stepX * i
    const py = y1 + stepY * i
    ctx.fillRect(
      Math.round(px - dotSize / 2),
      Math.round(py - dotSize / 2),
      dotSize,
      dotSize
    )
  }
}
