/**
 * Shared pixel art SVG icons for the Terrain app.
 * 8x8 grid rendered at configurable size.
 * Used across AddRegionModal, TemplatesModal, Onboarding, etc.
 */

function PixelIcon({ pixels, colors, size = 24 }) {
  const s = size / 8
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated', display: 'block' }}>
      {pixels.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * s} y={y * s} width={s} height={s} fill={colors[c]} />
      ) : null))}
    </svg>
  )
}

// Mountain: snow-capped peak
const MOUNTAIN_PIXELS = [
  [0,0,0,0,1,0,0,0],
  [0,0,0,1,2,1,0,0],
  [0,0,1,2,2,2,1,0],
  [0,1,2,2,2,2,2,1],
  [1,3,3,2,2,2,3,3],
  [3,3,3,3,2,3,3,3],
  [3,3,3,3,3,3,3,3],
  [3,3,3,3,3,3,3,3],
]
const MOUNTAIN_COLORS = ['transparent', '#F5E6C8', '#4A90D9', '#3A72B0']

// Forest: pine tree
const FOREST_PIXELS = [
  [0,0,0,1,0,0,0,0],
  [0,0,1,1,1,0,0,0],
  [0,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,0,0],
  [1,1,1,1,1,1,1,0],
  [0,0,0,2,0,0,0,0],
  [0,0,0,2,0,0,0,0],
]
const FOREST_COLORS = ['transparent', '#5E9E6E', '#8B6B3E']

// City: skyline buildings
const CITY_PIXELS = [
  [0,0,0,0,0,1,0,0],
  [0,0,1,0,0,1,0,0],
  [0,0,1,0,1,1,1,0],
  [0,1,1,0,1,2,1,0],
  [0,1,2,1,1,1,1,0],
  [1,1,1,1,1,2,1,0],
  [1,2,1,2,1,1,1,1],
  [1,1,1,1,1,1,1,1],
]
const CITY_COLORS = ['transparent', '#D4A853', '#FF6B9D']

// Coast: ocean waves
const COAST_PIXELS = [
  [0,0,0,0,0,0,0,0],
  [0,0,1,0,0,0,0,0],
  [0,1,2,1,0,0,1,0],
  [1,2,2,2,1,1,2,1],
  [2,2,2,2,2,2,2,2],
  [0,2,2,2,2,2,2,0],
  [0,0,3,3,3,3,0,0],
  [0,0,0,3,3,0,0,0],
]
const COAST_COLORS = ['transparent', '#F5E6C8', '#FF6B9D', '#D4A853']

// Sparkle icon (used in Login for the ✨ replacement)
const SPARKLE_PIXELS = [
  [0,0,0,1,0,0,0,0],
  [0,0,0,1,0,0,0,0],
  [0,0,1,2,1,0,0,0],
  [1,1,2,2,2,1,1,0],
  [0,0,1,2,1,0,0,0],
  [0,0,0,1,0,1,0,0],
  [0,0,0,0,0,1,0,0],
  [0,0,0,0,1,2,1,0],
]
const SPARKLE_COLORS = ['transparent', '#D4A853', '#F5E6C8']

// Checkmark icon (used in Region.jsx for milestones)
const CHECK_PIXELS = [
  [0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,1,0],
  [0,0,0,0,0,1,1,0],
  [0,0,0,0,1,1,0,0],
  [0,1,0,1,1,0,0,0],
  [0,1,1,1,0,0,0,0],
  [0,0,1,0,0,0,0,0],
  [0,0,0,0,0,0,0,0],
]
const CHECK_COLORS = ['transparent', '#5E9E6E']

// Paint palette icon (used for theme toggle)
const PALETTE_PIXELS = [
  [0,0,1,1,1,1,0,0],
  [0,1,2,1,1,3,1,0],
  [1,1,1,1,1,1,1,1],
  [1,4,1,1,1,5,1,1],
  [1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,0,0],
  [0,0,0,1,1,0,0,0],
]
const PALETTE_COLORS = ['transparent', '#D4A853', '#4A90D9', '#FF6B9D', '#5E9E6E', '#9B6BFF']

export function PixelMountainIcon({ size = 24 }) {
  return <PixelIcon pixels={MOUNTAIN_PIXELS} colors={MOUNTAIN_COLORS} size={size} />
}

export function PixelForestIcon({ size = 24 }) {
  return <PixelIcon pixels={FOREST_PIXELS} colors={FOREST_COLORS} size={size} />
}

export function PixelCityIcon({ size = 24 }) {
  return <PixelIcon pixels={CITY_PIXELS} colors={CITY_COLORS} size={size} />
}

export function PixelCoastIcon({ size = 24 }) {
  return <PixelIcon pixels={COAST_PIXELS} colors={COAST_COLORS} size={size} />
}

export function PixelSparkleIcon({ size = 24 }) {
  return <PixelIcon pixels={SPARKLE_PIXELS} colors={SPARKLE_COLORS} size={size} />
}

export function PixelCheckIcon({ size = 24 }) {
  return <PixelIcon pixels={CHECK_PIXELS} colors={CHECK_COLORS} size={size} />
}

export function PixelPaletteIcon({ size = 24 }) {
  return <PixelIcon pixels={PALETTE_PIXELS} colors={PALETTE_COLORS} size={size} />
}

// Helper: get the right icon component for a region type
export function getRegionIcon(type, size = 24) {
  switch (type) {
    case 'mountains': return <PixelMountainIcon size={size} />
    case 'forest': return <PixelForestIcon size={size} />
    case 'city': return <PixelCityIcon size={size} />
    case 'coast': return <PixelCoastIcon size={size} />
    default: return <PixelMountainIcon size={size} />
  }
}
