import { useState, useRef, useEffect } from 'react'

/**
 * LandmarkNaming — Modal overlay shown when a milestone is completed.
 *
 * Props:
 *  - regionName: string
 *  - milestoneTitle: string
 *  - onSubmit: (name: string) => void
 *  - onClose: () => void — called when dismissed without naming (uses default)
 */
export default function LandmarkNaming({ regionName, milestoneTitle, onSubmit, onClose }) {
  const [name, setName] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    // Autofocus the input
    const t = setTimeout(() => inputRef.current?.focus(), 100)
    return () => clearTimeout(t)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (name.trim().length >= 2) {
      onSubmit(name.trim())
    }
  }

  const handleDismiss = () => {
    // Default name: "[Region Name] — [Month Year]"
    const now = new Date()
    const monthYear = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    const defaultName = `${regionName} — ${monthYear}`
    onSubmit(defaultName.slice(0, 24))
  }

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleDismiss()
    }
  }

  return (
    <div
      className="modal-overlay"
      onClick={handleOverlayClick}
      style={{
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
      }}
    >
      <div
        className="glass-panel modal-content"
        style={{
          maxWidth: '440px',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {/* Announcement */}
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--accent-gold)',
            letterSpacing: '2px',
            marginBottom: 'var(--space-3)',
          }}>
            A NEW PLACE HAS BEEN BUILT
          </h2>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-muted)',
          }}>
            {regionName} &mdash; <span style={{ color: 'var(--text-primary)' }}>{milestoneTitle}</span>
          </p>
        </div>

        {/* Prompt */}
        <p style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-base)',
          color: 'var(--text-primary)',
        }}>
          What will you call it?
        </p>

        {/* Input form */}
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          alignItems: 'center',
        }}>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 24))}
            maxLength={24}
            placeholder="Name this landmark..."
            style={{
              width: '100%',
              padding: 'var(--space-3) var(--space-4)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-base)',
              color: 'var(--text-primary)',
              background: 'var(--bg-surface)',
              border: '3px solid var(--border-retro)',
              borderRadius: 0,
              outline: 'none',
              textAlign: 'center',
              letterSpacing: '1px',
              transition: 'border-color var(--duration-fast) var(--ease-out)',
            }}
            onFocus={(e) => e.target.style.borderColor = 'var(--accent-gold)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--border-retro)'}
          />

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}>
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--text-xs)',
              color: 'var(--text-dim)',
            }}>
              {name.length}/24
            </span>
          </div>

          <div style={{
            display: 'flex',
            gap: 'var(--space-3)',
          }}>
            <button
              type="submit"
              className="btn-retro"
              disabled={name.trim().length < 2}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Name It
            </button>
            <button
              type="button"
              className="btn-retro btn-retro--secondary"
              onClick={handleDismiss}
              style={{ fontSize: 'var(--text-sm)' }}
            >
              Skip
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
