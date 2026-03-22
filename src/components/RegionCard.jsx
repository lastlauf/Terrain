import { useNavigate } from 'react-router-dom'
import { getWeatherStatus } from '../lib/terrain.js'

const TYPE_ICONS = {
  mountains: String.fromCodePoint(0x26F0, 0xFE0F),
  forest: String.fromCodePoint(0x1F332),
  city: String.fromCodePoint(0x1F3D9, 0xFE0F),
  coast: String.fromCodePoint(0x1F30A),
}

const WEATHER_LABELS = {
  clear: 'Clear',
  partial: 'Partly Cloudy',
  cloudy: 'Overcast',
  storm: 'Storm',
}

const WEATHER_COLORS = {
  clear: 'var(--accent-gold)',
  partial: 'var(--text-muted)',
  cloudy: 'var(--text-dim)',
  storm: 'var(--danger)',
}

export default function RegionCard({ region, lastCheckinDate }) {
  const navigate = useNavigate()
  const weather = getWeatherStatus(lastCheckinDate)
  const icon = TYPE_ICONS[region.type] || TYPE_ICONS.mountains

  const timeSince = lastCheckinDate
    ? formatTimeSince(new Date(lastCheckinDate))
    : 'No check-ins yet'

  return (
    <button
      onClick={() => navigate(`/region/${region.id}`)}
      style={{
        flex: '0 0 200px',
        padding: 'var(--space-4)',
        background: 'var(--bg-glass)',
        border: '2px solid var(--border-retro)',
        borderRadius: 'var(--radius-lg)',
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'all var(--duration-fast) var(--ease-out)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent-gold)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-retro)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {/* Icon + Name */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-2)',
      }}>
        <span style={{ fontSize: 'var(--text-lg)' }}>{icon}</span>
        <span style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {region.name}
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: '6px',
        background: 'rgba(255,255,255,0.06)',
        borderRadius: '3px',
        marginBottom: 'var(--space-2)',
        border: '1px solid var(--border-retro)',
      }}>
        <div style={{
          height: '100%',
          width: `${region.progress || 0}%`,
          background: region.color || 'var(--accent-gold)',
          borderRadius: '3px',
          transition: 'width var(--duration-slow) var(--ease-out)',
        }} />
      </div>

      {/* Weather + Time */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: WEATHER_COLORS[weather],
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          {WEATHER_LABELS[weather]}
        </span>
        <span style={{
          fontSize: 'var(--text-xs)',
          color: 'var(--text-dim)',
        }}>
          {timeSince}
        </span>
      </div>
    </button>
  )
}

function formatTimeSince(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return date.toLocaleDateString()
}
