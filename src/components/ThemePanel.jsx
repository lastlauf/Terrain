import { useState, useEffect } from 'react'

const SKY_PRESETS = [
  { value: 'dawn', label: 'Dawn', colors: ['#2A1A1A', '#4A2A2A', '#D4A853'] },
  { value: 'day', label: 'Day', colors: ['#1A2A3A', '#3A5A7A', '#4A90D9'] },
  { value: 'dusk', label: 'Dusk', colors: ['#2A1A2A', '#4A2A4A', '#E8632A'] },
  { value: 'night', label: 'Night', colors: ['#0A0A1A', '#1A1A2A', '#2A2A4A'] },
  { value: 'storm', label: 'Storm', colors: ['#0A0A0A', '#1A1A1A', '#2A2A2A'] },
]

const GROUND_STYLES = ['natural', 'pixelated', 'wireframe']
const PARTICLE_OPTIONS = ['fireflies', 'snowflakes', 'rain', 'none']
const CHARACTER_COLORS = ['#D4A853', '#4A90D9', '#FF6B9D', '#5E9E6E', '#3A72B0', '#D4568A']

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
      background: 'rgba(26, 21, 16, 0.95)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderRight: '3px solid var(--border-retro)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-left var(--duration-slow) var(--ease-out)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '2px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-xl)',
          color: 'var(--accent-gold)',
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
                  border: `2px solid ${localTheme.sky_color === sky.value ? 'var(--accent-gold)' : 'var(--border-retro)'}`,
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
                  background: localTheme.ground_style === style ? 'var(--accent-gold)' : 'var(--bg-surface)',
                  color: localTheme.ground_style === style ? 'var(--bg-base)' : 'var(--text-muted)',
                  border: `2px solid ${localTheme.ground_style === style ? 'var(--accent-gold)' : 'var(--border-retro)'}`,
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
                  background: localTheme.particle_fx === fx ? 'var(--accent-gold)' : 'var(--bg-surface)',
                  color: localTheme.particle_fx === fx ? 'var(--bg-base)' : 'var(--text-muted)',
                  border: `2px solid ${localTheme.particle_fx === fx ? 'var(--accent-gold)' : 'var(--border-retro)'}`,
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
        borderTop: '2px solid var(--border-retro)',
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
