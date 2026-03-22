import { useState } from 'react'
import { getRegionIcon } from './PixelIcons.jsx'

const TEMPLATES = [
  {
    id: 'athlete',
    name: 'The Athlete',
    description: 'Track your physical training, nutrition, and recovery.',
    regions: [
      { name: 'Morning Runs', type: 'mountains', category: 'physical', color: '#4A90D9' },
      { name: 'Gym Sessions', type: 'city', category: 'physical', color: '#D4A853' },
      { name: 'Nutrition', type: 'forest', category: 'physical', color: '#5E9E6E' },
      { name: 'Recovery', type: 'coast', category: 'physical', color: '#FF6B9D' },
    ],
  },
  {
    id: 'creator',
    name: 'The Creator',
    description: 'Organize your creative projects and output.',
    regions: [
      { name: 'Writing', type: 'forest', category: 'creative', color: '#5E9E6E' },
      { name: 'Design', type: 'city', category: 'creative', color: '#D4A853' },
      { name: 'Side Project', type: 'mountains', category: 'creative', color: '#4A90D9' },
      { name: 'Social Media', type: 'coast', category: 'creative', color: '#FF6B9D' },
    ],
  },
  {
    id: 'student',
    name: 'The Student',
    description: 'Stay on top of study sessions and exam prep.',
    regions: [
      { name: 'Study Sessions', type: 'mountains', category: 'learning', color: '#4A90D9' },
      { name: 'Reading', type: 'forest', category: 'learning', color: '#5E9E6E' },
      { name: 'Exam Prep', type: 'city', category: 'learning', color: '#D4A853' },
      { name: 'Language Learning', type: 'coast', category: 'learning', color: '#FF6B9D' },
    ],
  },
  {
    id: 'balance',
    name: 'Life Balance',
    description: 'Map the key pillars of a balanced life.',
    regions: [
      { name: 'Health', type: 'mountains', category: 'physical', color: '#4A90D9' },
      { name: 'Career', type: 'city', category: 'financial', color: '#D4A853' },
      { name: 'Relationships', type: 'forest', category: 'relationships', color: '#5E9E6E' },
      { name: 'Finance', type: 'coast', category: 'financial', color: '#FF6B9D' },
    ],
  },
  {
    id: 'builder',
    name: 'The Builder',
    description: 'For developers building skills and shipping code.',
    regions: [
      { name: 'Coding', type: 'city', category: 'creative', color: '#D4A853' },
      { name: 'Open Source', type: 'mountains', category: 'creative', color: '#4A90D9' },
      { name: 'Networking', type: 'coast', category: 'relationships', color: '#FF6B9D' },
      { name: 'Learning', type: 'forest', category: 'learning', color: '#5E9E6E' },
    ],
  },
]

export default function TemplatesModal({ onClose, onCreateRegions }) {
  const [applying, setApplying] = useState(null)

  const handleApply = async (template) => {
    setApplying(template.id)
    try {
      for (let i = 0; i < template.regions.length; i++) {
        const r = template.regions[i]
        const cols = 2
        const col = i % cols
        const row = Math.floor(i / cols)
        await onCreateRegions({
          ...r,
          description: '',
          position_x: col * 224 + 24,
          position_y: row * 184 + 24,
        })
      }
      onClose()
    } catch (err) {
      console.error('Template apply error:', err)
    } finally {
      setApplying(null)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel-heavy" style={{
        maxWidth: '560px',
        maxHeight: '85vh',
        overflow: 'auto',
      }}>
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-2xl)',
          color: 'var(--accent-gold)',
          marginBottom: 'var(--space-2)',
        }}>
          TEMPLATES
        </h2>
        <p style={{
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-6)',
        }}>
          Start with a preset map. Each template creates 4 regions for you.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}>
          {TEMPLATES.map((t) => (
            <div
              key={t.id}
              style={{
                padding: 'var(--space-4)',
                background: 'var(--bg-surface)',
                border: '2px solid var(--border-retro)',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--accent-gold)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-retro)'}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 'var(--space-2)',
              }}>
                <h3 style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  color: 'var(--text-primary)',
                }}>
                  {t.name}
                </h3>

                {/* Mini pixel sprites row */}
                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  {t.regions.map((r, i) => (
                    <div key={i} style={{ opacity: 0.85 }}>
                      {getRegionIcon(r.type, 20)}
                    </div>
                  ))}
                </div>
              </div>

              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-3)',
                lineHeight: 1.4,
              }}>
                {t.description}
              </p>

              {/* Region names preview */}
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--space-1)',
                marginBottom: 'var(--space-3)',
              }}>
                {t.regions.map((r, i) => (
                  <span
                    key={i}
                    className="mono-label"
                    style={{
                      padding: '2px var(--space-2)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-retro)',
                      fontSize: '11px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {r.name}
                  </span>
                ))}
              </div>

              <button
                className="btn-retro"
                onClick={() => handleApply(t)}
                disabled={applying !== null}
                style={{
                  width: '100%',
                  fontSize: 'var(--text-sm)',
                  padding: 'var(--space-2) var(--space-4)',
                }}
              >
                {applying === t.id ? 'Creating...' : 'Use This Template'}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'var(--space-4)' }}>
          <button
            className="btn-retro btn-retro--secondary"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
