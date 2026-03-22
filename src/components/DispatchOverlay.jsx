import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * DispatchOverlay — Full-screen overlay for morning dispatches.
 *
 * Props:
 *  - dispatch: { id, content, dispatched_date, read_at }
 *  - pastDispatches: array of past dispatch objects
 *  - onDismiss: () => void — called when user dismisses
 *  - onBlurMap: (blurred: boolean) => void — controls CSS blur on map container
 */
export default function DispatchOverlay({ dispatch, pastDispatches = [], onDismiss, onBlurMap }) {
  const [displayedText, setDisplayedText] = useState('')
  const [typingDone, setTypingDone] = useState(false)
  const [buttonVisible, setButtonVisible] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [archiveDispatch, setArchiveDispatch] = useState(null)
  const charIndexRef = useRef(0)
  const timerRef = useRef(null)

  const content = archiveDispatch ? archiveDispatch.content : (dispatch?.content || '')

  // Blur the map when overlay mounts
  useEffect(() => {
    if (onBlurMap) onBlurMap(true)
    return () => {
      if (onBlurMap) onBlurMap(false)
    }
  }, [onBlurMap])

  // Typewriter effect
  useEffect(() => {
    if (!content) return

    // Reset state for new content
    charIndexRef.current = 0
    setDisplayedText('')
    setTypingDone(false)
    setButtonVisible(false)

    function typeNext() {
      if (charIndexRef.current < content.length) {
        charIndexRef.current++
        setDisplayedText(content.slice(0, charIndexRef.current))
        // ~18ms with +/-4ms random variance
        const delay = 18 + (Math.random() * 8 - 4)
        timerRef.current = setTimeout(typeNext, delay)
      } else {
        setTypingDone(true)
      }
    }

    timerRef.current = setTimeout(typeNext, 400) // initial delay before typing starts

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [content])

  // Fade in button 800ms after typing finishes
  useEffect(() => {
    if (!typingDone) return
    const t = setTimeout(() => setButtonVisible(true), 800)
    return () => clearTimeout(t)
  }, [typingDone])

  const handleDismiss = useCallback(() => {
    if (archiveDispatch) {
      // Go back to archive list
      setArchiveDispatch(null)
      setShowArchive(true)
      return
    }
    onDismiss()
  }, [archiveDispatch, onDismiss])

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      handleDismiss()
    }
  }, [handleDismiss])

  const handleArchiveItemClick = (d) => {
    setShowArchive(false)
    setArchiveDispatch(d)
  }

  const today = new Date()
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Split dispatch text for signature detection
  const isSignature = (text) => text.trim().startsWith('-- Your Cartographer')
  const lines = displayedText.split('\n')

  if (showArchive) {
    return (
      <div
        onClick={handleOverlayClick}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(22, 20, 16, 0.95)',
          animation: 'fade-in 300ms var(--ease-out)',
          padding: 'var(--space-6)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '540px',
            maxHeight: '80vh',
            border: '3px solid var(--border-retro)',
            background: 'var(--bg-surface)',
            padding: 'var(--space-8)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
            animation: 'slide-up 300ms var(--ease-out)',
          }}
        >
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-lg)',
              color: 'var(--accent-gold)',
              letterSpacing: '2px',
            }}>
              PAST LETTERS
            </h2>
            <button
              onClick={() => { setShowArchive(false); onDismiss(); }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                padding: 'var(--space-1) var(--space-2)',
              }}
            >
              Close
            </button>
          </div>

          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            {pastDispatches.length === 0 ? (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-dim)',
                padding: 'var(--space-8)',
                textAlign: 'center',
              }}>
                No dispatches yet. Your first letter will arrive tomorrow morning.
              </p>
            ) : (
              pastDispatches.map((d) => {
                const dDate = new Date(d.dispatched_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
                const preview = d.content
                  ? d.content.replace(/-- Your Cartographer/g, '').trim().slice(0, 40) + (d.content.length > 40 ? '...' : '')
                  : 'No content'

                return (
                  <button
                    key={d.id}
                    onClick={() => handleArchiveItemClick(d)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-1)',
                      padding: 'var(--space-3) var(--space-4)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-retro)',
                      borderRadius: 0,
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'background var(--duration-fast)',
                      width: '100%',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-glass-heavy)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-glass)'}
                  >
                    <span style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--text-muted)',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                    }}>
                      {dDate}
                    </span>
                    <span style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-primary)',
                      lineHeight: 1.4,
                    }}>
                      {preview}
                    </span>
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={handleOverlayClick}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(22, 20, 16, 0.95)',
        animation: 'fade-in 300ms var(--ease-out)',
        padding: 'var(--space-6)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          border: '3px solid var(--border-retro)',
          background: 'var(--bg-surface)',
          padding: 'var(--space-8)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-6)',
          animation: 'slide-up 300ms var(--ease-out)',
        }}
      >
        {/* Header */}
        <div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--accent-gold)',
            letterSpacing: '2px',
            marginBottom: 'var(--space-2)',
          }}>
            MORNING DISPATCH
          </h1>
          <span className="mono-label">
            {archiveDispatch
              ? new Date(archiveDispatch.dispatched_date).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })
              : dateStr
            }
          </span>
        </div>

        {/* Dispatch text */}
        <div style={{
          fontFamily: 'var(--font-heading)',
          fontSize: '18px',
          color: 'var(--text-primary)',
          lineHeight: 1.7,
          minHeight: '120px',
        }}>
          {lines.map((line, i) => {
            if (isSignature(line)) {
              return (
                <p key={i} style={{
                  fontStyle: 'italic',
                  color: 'var(--text-muted)',
                  marginTop: 'var(--space-4)',
                }}>
                  {line}
                </p>
              )
            }
            return <p key={i} style={{ marginBottom: line ? 'var(--space-3)' : 0 }}>{line}</p>
          })}
          {!typingDone && (
            <span style={{
              display: 'inline-block',
              width: '8px',
              height: '18px',
              background: 'var(--accent-gold)',
              marginLeft: '2px',
              animation: 'pulse-glow 1s ease-in-out infinite',
            }} />
          )}
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-3)',
          opacity: buttonVisible ? 1 : 0,
          transition: 'opacity 800ms var(--ease-out)',
        }}>
          <button
            className="btn-retro"
            onClick={handleDismiss}
            style={{
              fontSize: 'var(--text-sm)',
            }}
          >
            {archiveDispatch ? 'Back to Letters' : 'Enter your world'}
          </button>

          {!archiveDispatch && pastDispatches.length > 0 && (
            <button
              onClick={() => {
                setShowArchive(true)
                setArchiveDispatch(null)
              }}
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                padding: 'var(--space-1)',
                textDecoration: 'underline',
                textUnderlineOffset: '3px',
              }}
            >
              Past Letters
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
