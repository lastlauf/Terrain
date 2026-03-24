import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  SPRITES, PALETTES, REGION_COLORS,
} from '../lib/sprites.js'
import { getWeatherStatus } from '../lib/terrain.js'

// ── Helpers ──

const CATEGORIES = ['All', 'Physical', 'Creative', 'Financial', 'Relationships', 'Learning']

const CATEGORY_COLORS = {
  physical: '#4A6FA5',
  creative: '#C45A1A',
  financial: '#4A8C5C',
  relationships: '#3A7D9E',
  learning: '#7A5AB5',
  other: '#7A7268',
}

const WEATHER_ICONS = {
  clear: String.fromCodePoint(0x2600),   // sun
  partial: String.fromCodePoint(0x26C5), // partly cloudy
  cloudy: String.fromCodePoint(0x2601),  // cloud
  storm: String.fromCodePoint(0x26C8),   // thunder
}

const MOOD_EMOJI = {
  1: String.fromCodePoint(0x1F629),
  2: String.fromCodePoint(0x1F615),
  3: String.fromCodePoint(0x1F610),
  4: String.fromCodePoint(0x1F642),
  5: String.fromCodePoint(0x1F525),
}

function relativeTime(dateStr) {
  if (!dateStr) return 'Never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  return `${weeks}w ago`
}

// ── Inline SVG sprite (small, for list rows) ──

function SmallSprite({ type, size = 24 }) {
  const sprite = SPRITES[type] || SPRITES.mountains
  const palette = PALETTES[type] || PALETTES.mountains
  const scale = size / sprite.length
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: 'pixelated', display: 'block', flexShrink: 0 }}>
      {sprite.map((row, y) => row.map((c, x) => c ? (
        <rect key={`${x}-${y}`} x={x * scale} y={y * scale} width={scale} height={scale} fill={palette[c]} />
      ) : null))}
    </svg>
  )
}

// ── Region Row ──

function RegionRow({
  region,
  checkins,
  expanded,
  onToggle,
  onCheckin,
  onProgressChange,
  onToggleVisibility,
  hidden,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}) {
  const navigate = useNavigate()
  const regionColor = REGION_COLORS[region.type] || '#C45A1A'
  const catColor = CATEGORY_COLORS[region.category] || '#7A7268'
  const regionCheckins = checkins.filter(c => c.region_id === region.id)
  const lastCheckin = regionCheckins[0] || null
  const weather = getWeatherStatus(lastCheckin?.created_at || null)

  // Streak: count consecutive days with checkins (simplified)
  const streakCount = useMemo(() => {
    if (regionCheckins.length === 0) return 0
    let streak = 1
    const sorted = [...regionCheckins].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    for (let i = 1; i < sorted.length; i++) {
      const curr = new Date(sorted[i - 1].created_at).toDateString()
      const prev = new Date(sorted[i].created_at).toDateString()
      const diffDays = (new Date(curr) - new Date(prev)) / (1000 * 60 * 60 * 24)
      if (diffDays <= 1) streak++
      else break
    }
    return streak
  }, [regionCheckins])

  return (
    <div style={{
      borderBottom: '1px solid var(--border-light)',
      opacity: hidden ? 0.4 : 1,
      transition: 'opacity var(--duration-fast) var(--ease-out)',
    }}>
      {/* Main row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-3)',
          padding: 'var(--space-3) var(--space-4)',
          cursor: 'pointer',
        }}
        onClick={onToggle}
      >
        {/* Sprite */}
        <SmallSprite type={region.type} size={24} />

        {/* Name + pills */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}>
              {region.name}
            </span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: regionColor,
              border: `1px solid ${regionColor}`,
              padding: '0 4px',
              lineHeight: '16px',
            }}>
              {region.type}
            </span>
            <span style={{
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: catColor,
              border: `1px solid ${catColor}`,
              padding: '0 4px',
              lineHeight: '16px',
            }}>
              {region.category}
            </span>
          </div>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'var(--bg-muted)', border: 'none', marginTop: '4px' }}>
            <div style={{
              height: '100%',
              width: `${region.progress || 0}%`,
              background: regionColor,
              transition: 'width var(--duration-slow) var(--ease-out)',
            }} />
          </div>
        </div>

        {/* Weather */}
        <span style={{ fontSize: 'var(--text-sm)', flexShrink: 0 }} title={weather}>
          {WEATHER_ICONS[weather] || ''}
        </span>

        {/* Last check-in */}
        <div style={{ flexShrink: 0, textAlign: 'right', minWidth: '64px' }}>
          <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            {relativeTime(lastCheckin?.created_at)}
          </span>
          {lastCheckin?.mood && (
            <span style={{ fontSize: '12px', marginLeft: '4px' }}>
              {MOOD_EMOJI[lastCheckin.mood] || ''}
            </span>
          )}
        </div>

        {/* Expand chevron */}
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{
            flexShrink: 0,
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--duration-fast) var(--ease-out)',
          }}
        >
          <path d="M2 4l4 4 4-4" stroke="var(--text-dim)" strokeWidth="2" strokeLinecap="square" />
        </svg>
      </div>

      {/* Expanded section */}
      {expanded && (
        <div style={{
          padding: '0 var(--space-4) var(--space-4)',
          animation: 'slide-up var(--duration-fast) var(--ease-out)',
        }}>
          {/* Controls row */}
          <div style={{
            display: 'flex',
            gap: 'var(--space-2)',
            alignItems: 'center',
            marginBottom: 'var(--space-3)',
            flexWrap: 'wrap',
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onCheckin(region) }}
              className="btn-retro"
              style={{ fontSize: '11px', padding: '4px 12px', lineHeight: '16px' }}
            >
              Check In
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); navigate(`/region/${region.id}`) }}
              className="btn-retro btn-retro--secondary"
              style={{ fontSize: '11px', padding: '4px 12px', lineHeight: '16px' }}
            >
              View
            </button>

            {/* Visibility toggle */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(region.id) }}
              style={{
                padding: '4px',
                color: hidden ? 'var(--text-dim)' : 'var(--text-muted)',
                border: '1px solid var(--border-light)',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
              title={hidden ? 'Show on map' : 'Hide from map'}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                {hidden ? (
                  <>
                    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <line x1="2" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" />
                  </>
                ) : (
                  <>
                    <path d="M1 7s2.5-4 6-4 6 4 6 4-2.5 4-6 4-6-4-6-4z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5" fill="none" />
                  </>
                )}
              </svg>
            </button>

            {/* Move up/down */}
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(region.id) }}
              disabled={isFirst}
              style={{
                padding: '4px',
                color: isFirst ? 'var(--text-dim)' : 'var(--text-muted)',
                border: '1px solid var(--border-light)',
                background: 'transparent',
                cursor: isFirst ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                opacity: isFirst ? 0.3 : 1,
              }}
              title="Move up"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(region.id) }}
              disabled={isLast}
              style={{
                padding: '4px',
                color: isLast ? 'var(--text-dim)' : 'var(--text-muted)',
                border: '1px solid var(--border-light)',
                background: 'transparent',
                cursor: isLast ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                opacity: isLast ? 0.3 : 1,
              }}
              title="Move down"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
              </svg>
            </button>
          </div>

          {/* Progress slider */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Progress</span>
              <span style={{ fontSize: '10px', color: regionColor, fontFamily: 'var(--font-mono)' }}>{region.progress || 0}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={region.progress || 0}
              onChange={(e) => { e.stopPropagation(); onProgressChange(region.id, Number(e.target.value)) }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                accentColor: regionColor,
                height: '4px',
                cursor: 'pointer',
              }}
            />
          </div>

          {/* Recent checkins */}
          {regionCheckins.length > 0 && (
            <div>
              <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Recent Check-ins
              </span>
              {regionCheckins.slice(0, 3).map(c => (
                <div key={c.id} style={{
                  padding: '4px var(--space-2)',
                  borderLeft: `2px solid ${regionColor}`,
                  marginBottom: '4px',
                  background: 'var(--bg-muted)',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-primary)' }}>
                      {c.duration_minutes}min {MOOD_EMOJI[c.mood] || ''}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                      {relativeTime(c.created_at)}
                    </span>
                  </div>
                  {c.notes && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '2px' }}>
                      {c.notes.length > 80 ? c.notes.slice(0, 80) + '...' : c.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Main DashboardView ──

export default function DashboardView({
  regions,
  checkins,
  onCheckin,
  onProgressChange,
  hiddenRegions,
  onToggleVisibility,
  regionOrder,
  onReorder,
  onClose,
}) {
  const [filter, setFilter] = useState('All')
  const [expandedId, setExpandedId] = useState(null)

  // Build ordered region list
  const orderedRegions = useMemo(() => {
    if (!regionOrder || regionOrder.length === 0) return regions
    const orderMap = {}
    regionOrder.forEach((id, idx) => { orderMap[id] = idx })
    return [...regions].sort((a, b) => {
      const ai = orderMap[a.id] !== undefined ? orderMap[a.id] : 999
      const bi = orderMap[b.id] !== undefined ? orderMap[b.id] : 999
      return ai - bi
    })
  }, [regions, regionOrder])

  // Filter
  const filteredRegions = useMemo(() => {
    if (filter === 'All') return orderedRegions
    return orderedRegions.filter(r => r.category?.toLowerCase() === filter.toLowerCase())
  }, [orderedRegions, filter])

  // Group by category
  const grouped = useMemo(() => {
    const groups = {}
    for (const r of filteredRegions) {
      const cat = r.category || 'other'
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(r)
    }
    return groups
  }, [filteredRegions])

  // Stats
  const stats = useMemo(() => {
    const totalRegions = regions.length
    const totalCheckins = checkins.length
    const activeStreaks = regions.filter(r => {
      const rc = checkins.filter(c => c.region_id === r.id)
      if (rc.length === 0) return false
      const last = new Date(rc[0].created_at)
      return (Date.now() - last.getTime()) < 1000 * 60 * 60 * 24 * 2
    }).length
    const avgProgress = regions.length > 0
      ? Math.round(regions.reduce((s, r) => s + (r.progress || 0), 0) / regions.length)
      : 0
    return { totalRegions, totalCheckins, activeStreaks, avgProgress }
  }, [regions, checkins])

  const handleMoveUp = useCallback((id) => {
    const idx = regionOrder.indexOf(id)
    if (idx <= 0) return
    const newOrder = [...regionOrder]
    ;[newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]]
    onReorder(newOrder)
  }, [regionOrder, onReorder])

  const handleMoveDown = useCallback((id) => {
    const idx = regionOrder.indexOf(id)
    if (idx < 0 || idx >= regionOrder.length - 1) return
    const newOrder = [...regionOrder]
    ;[newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]]
    onReorder(newOrder)
  }, [regionOrder, onReorder])

  // Collapsed category state
  const [collapsedCats, setCollapsedCats] = useState({})
  const toggleCat = useCallback((cat) => {
    setCollapsedCats(prev => ({ ...prev, [cat]: !prev[cat] }))
  }, [])

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      borderLeft: '1px solid var(--border-light)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <h2 style={{
            fontFamily: 'var(--font-heading)',
            fontWeight: 700,
            fontSize: 'var(--text-lg)',
            color: 'var(--text-primary)',
            letterSpacing: '0.08em',
          }}>
            DASHBOARD
          </h2>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-light)',
              background: 'transparent',
              cursor: 'pointer',
              borderRadius: 'var(--radius-sm)',
            }}
            title="Close dashboard"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
            </svg>
          </button>
        </div>

        {/* Category filter pills */}
        <div style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => {
            const active = filter === cat
            const catColorVal = cat === 'All' ? 'var(--accent-orange)' : (CATEGORY_COLORS[cat.toLowerCase()] || 'var(--text-muted)')
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  padding: '2px 8px',
                  lineHeight: '16px',
                  color: active ? '#FFFFFF' : catColorVal,
                  background: active ? catColorVal : 'transparent',
                  border: `1px solid ${active ? catColorVal : 'var(--border-light)'}`,
                  cursor: 'pointer',
                  transition: 'all var(--duration-fast) var(--ease-out)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                {cat}
              </button>
            )
          })}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: 'flex',
        padding: 'var(--space-3) var(--space-4)',
        gap: 'var(--space-4)',
        borderBottom: '1px solid var(--border-light)',
        flexShrink: 0,
        flexWrap: 'wrap',
      }}>
        {[
          { label: 'Regions', value: stats.totalRegions, color: 'var(--accent-orange)' },
          { label: 'Check-ins', value: stats.totalCheckins, color: 'var(--region-mountains)' },
          { label: 'Streaks', value: stats.activeStreaks, color: 'var(--region-forest)' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: 'var(--text-primary)' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', flex: 1, minWidth: '48px' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontSize: 'var(--text-lg)', fontWeight: 700, color: s.color }}>
              {s.value}
            </div>
            <div style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-dim)' }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Region list — scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}>
        {filter === 'All' ? (
          // Grouped by category with collapsible headers
          Object.keys(grouped).map(cat => (
            <div key={cat}>
              <div
                onClick={() => toggleCat(cat)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  padding: 'var(--space-2) var(--space-4)',
                  background: 'var(--bg-muted)',
                  borderBottom: '1px solid var(--border-light)',
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                <svg
                  width="10" height="10" viewBox="0 0 10 10" fill="none"
                  style={{
                    transform: collapsedCats[cat] ? 'rotate(-90deg)' : 'rotate(0deg)',
                    transition: 'transform var(--duration-fast) var(--ease-out)',
                  }}
                >
                  <path d="M2 3l3 3 3-3" stroke={CATEGORY_COLORS[cat] || 'var(--text-muted)'} strokeWidth="2" strokeLinecap="square" />
                </svg>
                <span style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  color: CATEGORY_COLORS[cat] || 'var(--text-muted)',
                  fontWeight: 700,
                }}>
                  {cat}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                  ({grouped[cat].length})
                </span>
              </div>
              {!collapsedCats[cat] && grouped[cat].map((region, idx) => (
                <RegionRow
                  key={region.id}
                  region={region}
                  checkins={checkins}
                  expanded={expandedId === region.id}
                  onToggle={() => setExpandedId(expandedId === region.id ? null : region.id)}
                  onCheckin={onCheckin}
                  onProgressChange={onProgressChange}
                  onToggleVisibility={onToggleVisibility}
                  hidden={hiddenRegions.has(region.id)}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  isFirst={idx === 0}
                  isLast={idx === grouped[cat].length - 1}
                />
              ))}
            </div>
          ))
        ) : (
          // Flat list (filtered)
          filteredRegions.map((region, idx) => (
            <RegionRow
              key={region.id}
              region={region}
              checkins={checkins}
              expanded={expandedId === region.id}
              onToggle={() => setExpandedId(expandedId === region.id ? null : region.id)}
              onCheckin={onCheckin}
              onProgressChange={onProgressChange}
              onToggleVisibility={onToggleVisibility}
              hidden={hiddenRegions.has(region.id)}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              isFirst={idx === 0}
              isLast={idx === filteredRegions.length - 1}
            />
          ))
        )}

        {filteredRegions.length === 0 && (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-dim)' }}>
              No regions in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
