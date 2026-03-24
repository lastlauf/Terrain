import { useState } from 'react'
import { useIsMobile } from '../hooks/useIsMobile.js'

const MOODS = [
  { value: 1, emoji: String.fromCodePoint(0x1F629), label: 'Struggling' },
  { value: 2, emoji: String.fromCodePoint(0x1F615), label: 'Low' },
  { value: 3, emoji: String.fromCodePoint(0x1F610), label: 'Neutral' },
  { value: 4, emoji: String.fromCodePoint(0x1F642), label: 'Good' },
  { value: 5, emoji: String.fromCodePoint(0x1F525), label: 'On fire' },
]

export default function CheckinModal({ region, onClose, onSubmit }) {
  const isMobile = useIsMobile()
  const [duration, setDuration] = useState(30)
  const [mood, setMood] = useState(3)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await onSubmit({
        region_id: region.id,
        duration_minutes: duration,
        mood,
        notes: notes.trim(),
      })
      onClose()
    } catch (err) {
      console.error('Checkin error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel-heavy">
        <form onSubmit={handleSubmit}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--text-xl)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-1)',
          }}>
            Log Session
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}>
            {region.name}
          </p>

          {/* Duration slider */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2)',
            }}>
              <label style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                fontWeight: 600,
              }}>
                Duration
              </label>
              <span style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                color: 'var(--accent-orange)',
              }}>
                {duration} min
              </span>
            </div>
            <input
              type="range"
              min="15"
              max="240"
              step="15"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              style={{
                width: '100%',
                accentColor: 'var(--accent-orange)',
                height: '6px',
                cursor: 'pointer',
                touchAction: 'none',
              }}
            />
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-dim)',
              marginTop: 'var(--space-1)',
            }}>
              <span>15m</span>
              <span>4h</span>
            </div>
          </div>

          {/* Mood selector */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-2)',
              fontWeight: 600,
            }}>
              Mood
            </label>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              justifyContent: 'center',
            }}>
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMood(m.value)}
                  style={{
                    flex: isMobile ? '0 0 auto' : 1,
                    minWidth: isMobile ? '56px' : 'auto',
                    padding: 'var(--space-2) var(--space-1)',
                    fontSize: 'var(--text-xl)',
                    background: mood === m.value ? 'var(--accent-orange-bg)' : 'transparent',
                    border: `2px solid ${mood === m.value ? 'var(--accent-orange)' : 'var(--border-mid)'}`,
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all var(--duration-fast) var(--ease-out)',
                    transform: mood === m.value ? 'scale(1.1)' : 'scale(1)',
                  }}
                  title={m.label}
                >
                  <div>{m.emoji}</div>
                  <div style={{
                    fontSize: '10px',
                    color: mood === m.value ? 'var(--text-primary)' : 'var(--text-dim)',
                    marginTop: '2px',
                  }}>
                    {m.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <label style={{
              display: 'block',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-1)',
              fontWeight: 600,
            }}>
              Notes (optional)
            </label>
            <textarea
              className="input-retro"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did it go? What did you work on?"
              rows={3}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button
              type="submit"
              className="btn-retro"
              disabled={submitting}
              style={{ flex: 1 }}
            >
              {submitting ? 'Logging...' : 'Log Session'}
            </button>
            <button
              type="button"
              className="btn-retro btn-retro--secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
