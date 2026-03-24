/**
 * Loader — Animated terrain logo loading screen.
 * Embeds the terrain-logo.html animation via iframe.
 * Used for initial auth loading and any full-page loading state.
 */
export default function Loader({ message = 'Loading...' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-base)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <iframe
        src="/terrain-logo.html"
        title="Terrain loading"
        style={{
          width: '100vw',
          height: '80vh',
          border: 'none',
          pointerEvents: 'none',
        }}
      />
      <div
        className="mono-label"
        style={{
          position: 'absolute',
          bottom: '64px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 'var(--text-sm, 14px)',
          color: 'var(--text-muted)',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          fontFamily: "var(--font-heading, 'Inter', sans-serif)",
          animation: 'pulse-subtle 2s ease-in-out infinite',
        }}
      >
        {message}
      </div>

      <style>{`
        @keyframes pulse-subtle {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
