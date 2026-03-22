/* ============================================
   Terrain — Animated Pixel Grid Background
   Subtle noise-driven grid using blue/pink/gold
   ============================================ */

import { simplex2d } from './terrain.js'

export function drawPixelGrid(ctx, W, H, time) {
  const cellSize = 4
  const cols = Math.ceil(W / cellSize)
  const rows = Math.ceil(H / cellSize)

  // Three muted gradient colors at very low opacity
  const colors = [
    [74, 144, 217],   // blue
    [255, 107, 157],  // pink
    [212, 168, 83],   // gold
  ]

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const noise = simplex2d(x * 0.08 + time * 0.3, y * 0.08 + time * 0.2)
      const colorIdx = Math.floor((noise + 1) * 1.5) % 3
      const brightness = simplex2d(x * 0.15 + time * 0.5, y * 0.15) * 0.03 + 0.03
      const [r, g, b] = colors[colorIdx]
      ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`
      ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
    }
  }
}
