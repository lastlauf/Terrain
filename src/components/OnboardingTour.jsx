import { useState, useEffect, useCallback } from 'react'

const STEPS = [
  {
    title: 'Welcome to Terrain',
    description: 'Your personal pixel map for tracking what matters. Each part of your life becomes a region on the map you explore and grow.',
    highlight: 'canvas',
  },
  {
    title: 'Your Regions',
    description: 'Regions are the areas of your life you want to track — fitness, creative projects, learning, anything. Create them from scratch or use a template.',
    highlight: 'canvas',
  },
  {
    title: 'Check In',
    description: 'Click any region to log a session. Record how long you worked, your mood, and quick notes. Consistency builds your terrain.',
    highlight: 'canvas',
  },
  {
    title: 'Field Reports',
    description: 'After each check-in, AI analyzes your progress and generates a field report — patterns, streaks, and insights about your journey.',
    highlight: 'canvas',
  },
  {
    title: 'Morning Dispatch',
    description: 'Every day you get a personalized letter reviewing your recent activity across all regions. Think of it as a dispatch from your expedition team.',
    highlight: 'fab-dispatch',
  },
  {
    title: 'Export Your Journey',
    description: 'Download your full terrain log as markdown — check-ins, field reports, milestones, and stats. Your data, your way.',
    highlight: 'fab-export',
  },
  {
    title: 'Explore Mode',
    description: 'Switch to the platformer view and walk through your terrain as a pixel character. A different way to see your progress.',
    highlight: 'fab-explore',
  },
  {
    title: "You're Ready",
    description: 'Start by creating your first region or pick a template. Your terrain awaits.',
    highlight: null,
  },
]

const STORAGE_KEY = 'terrain_onboarding_completed'

export function useOnboarding() {
  const [showTour, setShowTour] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY)
    if (!completed) {
      setShowTour(true)
    }
  }, [])

  const completeTour = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShowTour(false)
  }, [])

  const replayTour = useCallback(() => {
    setShowTour(true)
  }, [])

  return { showTour, completeTour, replayTour }
}

export default function OnboardingTour({ onComplete }) {
  const [step, setStep] = useState(0)
  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  const handleNext = () => {
    if (isLast) {
      onComplete()
    } else {
      setStep((s) => s + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  // Close on escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onComplete()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onComplete])

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      pointerEvents: 'auto',
    }}>
      {/* Warm overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(26, 23, 20, 0.35)',
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)',
      }} />

      {/* Content card */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '420px',
        maxWidth: 'calc(100vw - 48px)',
        background: 'var(--bg-surface-raised)',
        border: '1px solid var(--border-mid)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        padding: 'var(--space-8)',
        animation: 'slide-up 300ms var(--ease-out)',
      }}>
        {/* Step counter */}
        <div
          className="mono-label"
          style={{
            fontSize: '11px',
            color: 'var(--text-dim)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '0.1em',
          }}
        >
          {step + 1} of {STEPS.length}
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 700,
          fontSize: 'var(--text-2xl)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-3)',
          lineHeight: 1.2,
        }}>
          {current.title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          marginBottom: 'var(--space-8)',
        }}>
          {current.description}
        </p>

        {/* Progress dots */}
        <div style={{
          display: 'flex',
          gap: '6px',
          justifyContent: 'center',
          marginBottom: 'var(--space-6)',
        }}>
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === step ? '16px' : '6px',
                height: '6px',
                background: i === step ? 'var(--accent-orange)' : i < step ? 'var(--border-mid)' : 'var(--border-light)',
                transition: 'all 200ms var(--ease-out)',
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-3)',
        }}>
          {!isLast ? (
            <button
              onClick={handleSkip}
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-dim)',
                padding: 'var(--space-2) var(--space-3)',
                transition: 'color var(--duration-fast)',
              }}
              onMouseEnter={(e) => e.target.style.color = 'var(--text-muted)'}
              onMouseLeave={(e) => e.target.style.color = 'var(--text-dim)'}
            >
              Skip
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="btn-retro"
            style={{
              padding: 'var(--space-2) var(--space-6)',
              fontSize: 'var(--text-sm)',
            }}
          >
            {isLast ? 'Get Started' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  )
}
