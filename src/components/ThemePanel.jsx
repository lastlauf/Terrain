import { useState, useEffect } from 'react'

const SKY_PRESETS = [
  { value: 'dawn', label: 'Dawn', colors: ['#C8A882', '#E8D0A8', '#E8712B'] },
  { value: 'day', label: 'Day', colors: ['#A8C4D8', '#C8DCE8', '#4A6FA5'] },
  { value: 'dusk', label: 'Dusk', colors: ['#C8907A', '#E8B090', '#E8712B'] },
  { value: 'night', label: 'Night', colors: ['#3A4A5A', '#4A5A6A', '#5A6A7A'] },
  { value: 'storm', label: 'Storm', colors: ['#5A5A5A', '#6A6A6A', '#7A7A7A'] },
]

const GROUND_STYLES = ['natural', 'pixelated', 'wireframe']
const PARTICLE_OPTIONS = ['fireflies', 'snowflakes', 'rain', 'none']
const CHARACTER_COLORS = ['#E8712B', '#4A6FA5', '#4A8C5C', '#3A7D9E', '#C45A1A', '#7A7268']

export default function ThemePanel({ open, onClose, theme, onUpdate, onPreview }) {
  const [localTheme, setLocalTheme] = useState(theme)
  const [savedTheme] = useState(theme)

  // Sync local theme when panel opens with new theme
  useEffect(() => {
    if (open) {
      setLocalTheme(theme)
    }
  }, [open, theme])

  if (!open) return null

  const handleChange = (key, value) => {
    const next = { ...localTheme, [key]: value }
    setLocalTheme(next)
    // Live preview: push changes to the map immediately
    if (onPreview) {
      onPreview(next)
    }
  }

  const handleSave = () => {
    onUpdate(localTheme)
    onClose()
  }

  const handleReset = () => {
    setLocalTheme(savedTheme)
    if (onPreview) {
      onPreview(savedTheme)
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      width: '320px',
      maxWidth: '100vw',
      background: 'var(--bg-surface-raised)',
      borderRight: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-left var(--duration-slow) var(--ease-out)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'var(--text-xl)',
          color: 'var(--text-primary)',
          letterSpacing: '0.06em',
        }}>
          THEME
        </h2>
        <button
          onClick={onClose}
          style={{
            width: '32px',
            height: '32px',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          &times;
        </button>
      </div>

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-6)',
      }}>
        {/* Sky Color */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Sky
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {SKY_PRESETS.map((sky) => (
              <button
                key={sky.value}
                onClick={() => handleChange('sky_color', sky.value)}
                style={{
                  width: '48px',
                  height: '48px',
                  background: `linear-gradient(180deg, ${sky.colors[0]}, ${sky.colors[1]}, ${sky.colors[2]})`,
                  border: `2px solid ${localTheme.sky_color === sky.value ? 'var(--accent-orange)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'border-color var(--duration-fast) var(--ease-out)',
                }}
                title={sky.label}
              />
            ))}
          </div>
        </div>

        {/* Ground Style */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Ground Style
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {GROUND_STYLES.map((style) => (
              <button
                key={style}
                onClick={() => handleChange('ground_style', style)}
                style={{
                  flex: 1,
                  padding: 'var(--space-2)',
                  fontSize: 'var(--text-sm)',
                  background: localTheme.ground_style === style ? 'var(--accent-orange)' : 'var(--bg-surface)',
                  color: localTheme.ground_style === style ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1px solid ${localTheme.ground_style === style ? 'var(--accent-orange)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        {/* Particle FX */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Particle FX
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {PARTICLE_OPTIONS.map((fx) => (
              <button
                key={fx}
                onClick={() => handleChange('particle_fx', fx)}
                style={{
                  padding: 'var(--space-2) var(--space-3)',
                  fontSize: 'var(--text-sm)',
                  background: localTheme.particle_fx === fx ? 'var(--accent-orange)' : 'var(--bg-surface)',
                  color: localTheme.particle_fx === fx ? '#FFFFFF' : 'var(--text-muted)',
                  border: `1px solid ${localTheme.particle_fx === fx ? 'var(--accent-orange)' : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                }}
              >
                {fx}
              </button>
            ))}
          </div>
        </div>

        {/* Character Color */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <label style={{
            display: 'block',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-2)',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Character Color
          </label>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {CHARACTER_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => handleChange('character_color', c)}
                style={{
                  width: '36px',
                  height: '36px',
                  background: c,
                  border: `3px solid ${localTheme.character_color === c ? 'var(--text-primary)' : 'transparent'}`,
                  cursor: 'pointer',
                  transition: 'border-color var(--duration-fast) var(--ease-out)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Reset + Save */}
      <div style={{
        padding: 'var(--space-4) var(--space-6)',
        borderTop: '1px solid var(--border-light)',
        display: 'flex',
        gap: 'var(--space-3)',
      }}>
        <button
          onClick={handleReset}
          className="btn-retro btn-retro--secondary"
          style={{ flex: 1 }}
        >
          Reset
        </button>
        <button
          onClick={handleSave}
          className="btn-retro"
          style={{ flex: 2 }}
        >
          Save Theme
        </button>
      </div>
    </div>
  )
}
