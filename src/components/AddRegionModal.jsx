import { useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { getRegionIcon } from './PixelIcons.jsx'

const REGION_TYPES = [
  { value: 'mountains', label: 'Mountains', color: 'var(--region-mountains)' },
  { value: 'forest', label: 'Forest', color: 'var(--region-forest)' },
  { value: 'city', label: 'City', color: 'var(--region-city)' },
  { value: 'coast', label: 'Coast', color: 'var(--region-coast)' },
]

const CATEGORIES = [
  { value: 'physical', label: 'Physical' },
  { value: 'creative', label: 'Creative' },
  { value: 'financial', label: 'Financial' },
  { value: 'relationships', label: 'Relationships' },
  { value: 'learning', label: 'Learning' },
  { value: 'other', label: 'Other' },
]

const COLOR_PRESETS = [
  '#4A6FA5', '#4A8C5C', '#C45A1A', '#3A7D9E',
  '#3A5F8A', '#7A5AB5', '#4A8070', '#C47A3A',
]

export default function AddRegionModal({ onClose, onSubmit, inline = false }) {
  const isMobile = useIsMobile()
  const [name, setName] = useState('')
  const [type, setType] = useState('mountains')
  const [category, setCategory] = useState('other')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState(COLOR_PRESETS[0])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Give your region a name.')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      await onSubmit({ name: name.trim(), type, category, description: description.trim(), color })
      if (!inline) onClose()
      // Reset for inline mode
      setName('')
      setDescription('')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setSubmitting(false)
    }
  }

  const content = (
    <form onSubmit={handleSubmit}>
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 400,
        fontSize: 'var(--text-xl)',
        color: 'var(--text-primary)',
        marginBottom: 'var(--space-6)',
        letterSpacing: '0.06em',
      }}>
        New Region
      </h2>

      {error && (
        <div style={{
          padding: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
          background: 'rgba(232, 67, 42, 0.1)',
          border: '1px solid var(--danger)',
          borderRadius: 'var(--radius-md)',
          fontSize: 'var(--text-sm)',
          color: 'var(--danger)',
        }}>
          {error}
        </div>
      )}

      {/* Name */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-1)',
          fontWeight: 600,
        }}>
          Region Name
        </label>
        <input
          className="input-retro"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Morning Runs, Novel Draft, Side Project..."
          maxLength={50}
          autoFocus
        />
      </div>

      {/* Type selector */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
          fontWeight: 600,
        }}>
          Terrain Type
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 'var(--space-2)',
        }}>
          {REGION_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setType(t.value)
                // Auto-set color to match type
                const typeColor = COLOR_PRESETS[REGION_TYPES.findIndex(rt => rt.value === t.value)]
                if (typeColor) setColor(typeColor)
              }}
              style={{
                padding: 'var(--space-3) var(--space-2)',
                background: type === t.value ? 'var(--accent-orange-bg)' : 'var(--bg-surface)',
                border: `2px solid ${type === t.value ? t.color : 'var(--border-mid)'}`,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2px' }}>{getRegionIcon(t.value, 24)}</div>
              <div style={{
                fontSize: 'var(--text-xs)',
                color: type === t.value ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: 600,
              }}>
                {t.label}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
          fontWeight: 600,
        }}>
          Category
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setCategory(c.value)}
              style={{
                padding: 'var(--space-1) var(--space-3)',
                fontSize: 'var(--text-sm)',
                background: category === c.value ? 'var(--accent-orange)' : 'var(--bg-surface)',
                color: category === c.value ? '#FFFFFF' : 'var(--text-muted)',
                border: `1px solid ${category === c.value ? 'var(--accent-orange)' : 'var(--border-mid)'}`,
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all var(--duration-fast) var(--ease-out)',
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-1)',
          fontWeight: 600,
        }}>
          Description (optional)
        </label>
        <textarea
          className="input-retro"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What does this region represent?"
          rows={3}
        />
      </div>

      {/* Color */}
      <div style={{ marginBottom: 'var(--space-6)' }}>
        <label style={{
          display: 'block',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-2)',
          fontWeight: 600,
        }}>
          Color
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {COLOR_PRESETS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: c,
                border: `3px solid ${color === c ? 'var(--text-primary)' : 'transparent'}`,
                cursor: 'pointer',
                transition: 'border-color var(--duration-fast) var(--ease-out)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
        <button
          type="submit"
          className="btn-retro"
          disabled={submitting || !name.trim()}
          style={{ flex: 1 }}
        >
          {submitting ? 'Creating...' : 'Create Region'}
        </button>
        {!inline && (
          <button
            type="button"
            className="btn-retro btn-retro--secondary"
            onClick={onClose}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )

  if (inline) {
    return content
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel-heavy">
        {content}
      </div>
    </div>
  )
}
