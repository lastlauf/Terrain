/* ============================================
   Terrain — Platformer Physics & Zone Generation
   ============================================ */

export const GRAVITY = 0.4
export const JUMP_FORCE = -10
export const MOVE_SPEED = 4
export const FRICTION = 0.82
export const SPRINT_MULTIPLIER = 1.8

const REGION_BG_COLORS = {
  mountains: { sky: '#1A2A3A', ground: '#2A3A4A', accent: '#4A90D9' },
  forest: { sky: '#0A1A0A', ground: '#1A2A1A', accent: '#5E9E6E' },
  city: { sky: '#1A1510', ground: '#2A2015', accent: '#D4A853' },
  coast: { sky: '#0A1A2A', ground: '#1A2A3A', accent: '#FF6B9D' },
}

export function generateZone(region, index) {
  const colors = REGION_BG_COLORS[region.type] || REGION_BG_COLORS.mountains
  const groundLevel = 500
  const platforms = []

  // Ground platform (full width)
  platforms.push({
    x: 0,
    y: groundLevel,
    w: 2000,
    h: 100,
    type: 'ground',
  })

  // Generate platforms based on region type
  const seed = hashString(region.name || 'default')

  const platformCount = 6 + (seed % 5)
  for (let i = 0; i < platformCount; i++) {
    const px = 100 + seededRandom(seed + i * 7) * 1600
    const py = groundLevel - 80 - seededRandom(seed + i * 13) * 280
    const pw = 80 + seededRandom(seed + i * 19) * 120

    platforms.push({
      x: px,
      y: py,
      w: pw,
      h: 16,
      type: 'platform',
    })
  }

  // Collectible positions (from past check-in notes)
  const collectibles = []
  for (let i = 0; i < 5; i++) {
    collectibles.push({
      x: 150 + seededRandom(seed + i * 23) * 1600,
      y: groundLevel - 40 - seededRandom(seed + i * 29) * 300,
      collected: false,
      id: `${region.id}-note-${i}`,
    })
  }

  return {
    id: region.id,
    name: region.name,
    type: region.type,
    index,
    groundLevel,
    platforms,
    collectibles,
    colors,
    width: 2000,
  }
}

export function createPlayer(x, y) {
  return {
    x,
    y,
    vx: 0,
    vy: 0,
    width: 20,
    height: 32,
    onGround: false,
    facing: 1, // 1 = right, -1 = left
    sprinting: false,
    color: '#D4A853',
  }
}

// Deterministic hash for seed-based generation
function hashString(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}

function seededRandom(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}
