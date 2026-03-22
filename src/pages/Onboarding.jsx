import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.js'
import { useRegions } from '../hooks/useRegions.js'
import AddRegionModal from '../components/AddRegionModal.jsx'

const STEPS = [
  { title: 'Welcome, Explorer', subtitle: 'Let\'s chart your first terrain.' },
  { title: 'Region 1', subtitle: 'What\'s the first thing you\'re working on?' },
  { title: 'Region 2', subtitle: 'What else matters to you right now?' },
  { title: 'Region 3', subtitle: 'One more region to round out the map.' },
  { title: 'Your Map Awaits', subtitle: 'Three regions charted. Time to explore.' },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { regions, createRegion } = useRegions()
  const [step, setStep] = useState(0)
  const [transitioning, setTransitioning] = useState(false)

  // Determine step based on regions created
  useEffect(() => {
    if (regions.length >= 3) {
      setStep(4)
    } else if (regions.length >= 2) {
      setStep(3)
    } else if (regions.length >= 1) {
      setStep(2)
    }
  }, [regions.length])

  const username = user?.user_metadata?.username || user?.email?.split('@')[0] || 'Explorer'

  const handleRegionCreated = async (regionData) => {
    // Calculate position based on index
    const index = regions.length
    const positions = [
      { position_x: 24, position_y: 24 },
      { position_x: 248, position_y: 24 },
      { position_x: 136, position_y: 208 },
    ]
    await createRegion({ ...regionData, ...positions[index] })
  }

  const handleFinish = () => {
    setTransitioning(true)
    setTimeout(() => {
      navigate('/map')
    }, 600)
  }

  const handleNextFromWelcome = () => {
    setStep(1)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-6)',
      background: 'var(--bg-base)',
      transition: 'opacity 600ms ease-out',
      opacity: transitioning ? 0 : 1,
    }}>
      {/* Progress indicator */}
      <div style={{
        position: 'fixed',
        top: 'var(--space-6)',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 'var(--space-2)',
        zIndex: 10,
      }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i <= step ? '32px' : '8px',
              height: '8px',
              borderRadius: '4px',
              background: i <= step ? 'var(--accent-gold)' : 'var(--border-retro)',
              transition: 'all var(--duration-slow) var(--ease-out)',
            }}
          />
        ))}
      </div>

      <div style={{
        width: '100%',
        maxWidth: '520px',
        animation: 'slide-up var(--duration-slow) var(--ease-out)',
      }}>
        {/* Step header */}
        <div style={{
          textAlign: 'center',
          marginBottom: 'var(--space-8)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--accent-gold)',
            marginBottom: 'var(--space-2)',
          }}>
            {step === 0 ? `Welcome, ${username}` : STEPS[step].title}
          </h1>
          <p style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 'var(--text-base)',
            color: 'var(--text-muted)',
          }}>
            {STEPS[step].subtitle}
          </p>
        </div>

        {/* Step content */}
        {step === 0 && (
          <div style={{ textAlign: 'center' }}>
            <p style={{
              fontSize: 'var(--text-base)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-8)',
              lineHeight: 1.7,
            }}>
              Terrain turns your goals into a living map. Each goal becomes a region
              with its own terrain, weather that reflects your activity, and AI field
              reports that observe your progress.
            </p>
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-dim)',
              marginBottom: 'var(--space-8)',
            }}>
              Let's create your first three regions to get started.
            </p>
            <button
              className="btn-retro"
              onClick={handleNextFromWelcome}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4) var(--space-8)' }}
            >
              Let's Go
            </button>
          </div>
        )}

        {(step === 1 || step === 2 || step === 3) && (
          <div className="glass-panel-heavy" style={{ padding: 'var(--space-8)' }}>
            <AddRegionModal
              inline
              onSubmit={handleRegionCreated}
              onClose={() => {}}
            />
          </div>
        )}

        {step === 4 && (
          <div style={{ textAlign: 'center' }}>
            {/* Mini map preview */}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              justifyContent: 'center',
              marginBottom: 'var(--space-8)',
              flexWrap: 'wrap',
            }}>
              {regions.slice(0, 3).map((r, i) => (
                <div
                  key={r.id}
                  className="glass-panel"
                  style={{
                    padding: 'var(--space-4) var(--space-6)',
                    textAlign: 'center',
                    animation: `slide-up ${300 + i * 150}ms var(--ease-out)`,
                  }}
                >
                  <div style={{ fontSize: 'var(--text-xl)', marginBottom: 'var(--space-1)' }}>
                    {r.type === 'mountains' ? String.fromCodePoint(0x26F0, 0xFE0F)
                      : r.type === 'forest' ? String.fromCodePoint(0x1F332)
                      : r.type === 'city' ? String.fromCodePoint(0x1F3D9, 0xFE0F)
                      : String.fromCodePoint(0x1F30A)}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--text-primary)',
                  }}>
                    {r.name}
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn-retro"
              onClick={handleFinish}
              style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-4) var(--space-8)' }}
            >
              Enter Your Terrain
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
