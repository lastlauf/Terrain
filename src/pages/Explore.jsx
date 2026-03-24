import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import PlatformerCanvas from '../components/PlatformerCanvas.jsx'
import { useRegions } from '../hooks/useRegions.js'

export default function Explore() {
  const navigate = useNavigate()
  const { regions } = useRegions()
  const [showOverlay, setShowOverlay] = useState(false)

  const handleExit = useCallback(() => {
    setShowOverlay(true)
  }, [])

  const handleConfirmExit = () => {
    navigate('/map')
  }

  const handleCancelExit = () => {
    setShowOverlay(false)
  }

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: 'var(--bg-base)',
      overflow: 'hidden',
      position: 'relative',
    }}>
      <PlatformerCanvas
        regions={regions}
        onExit={handleExit}
      />

      {/* Empty state */}
      {regions.length === 0 && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-lg)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-6)',
          }}>
            No regions to explore yet.
          </p>
          <button
            className="btn-retro"
            onClick={() => navigate('/map')}
          >
            Go to Map
          </button>
        </div>
      )}

      {/* ESC overlay */}
      {showOverlay && (
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(26, 23, 20, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 20,
          animation: 'fade-in var(--duration-fast) var(--ease-out)',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--text-2xl)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-6)',
          }}>
            Return to Map?
          </h2>
          <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
            <button
              className="btn-retro"
              onClick={handleConfirmExit}
            >
              Yes, Exit
            </button>
            <button
              className="btn-retro btn-retro--secondary"
              onClick={handleCancelExit}
            >
              Keep Exploring
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
