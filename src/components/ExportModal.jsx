import { useState, useMemo } from 'react'
import { generateMarkdown, generateRegionMarkdown } from '../lib/export.js'

export default function ExportModal({
  regions,
  checkins,
  milestones = [],
  fieldReports = [],
  username = 'Explorer',
  singleRegion = null,
  onClose,
}) {
  const [copied, setCopied] = useState(false)

  const markdown = useMemo(() => {
    if (singleRegion) {
      return generateRegionMarkdown(
        singleRegion,
        checkins.filter(c => c.region_id === singleRegion.id),
        milestones.filter(m => m.region_id === singleRegion.id),
        fieldReports.filter(r => r.region_id === singleRegion.id),
      )
    }
    return generateMarkdown(regions, checkins, milestones, fieldReports, username)
  }, [regions, checkins, milestones, fieldReports, username, singleRegion])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const textarea = document.createElement('textarea')
      textarea.value = markdown
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = singleRegion
      ? `terrain-${singleRegion.name.toLowerCase().replace(/\s+/g, '-')}.md`
      : `terrain-${username.toLowerCase().replace(/\s+/g, '-')}-journey.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content glass-panel-heavy" style={{ maxWidth: '580px' }}>
        {/* Close button */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 'var(--space-2)',
        }}>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              fontSize: 'var(--text-lg)',
              color: 'var(--text-muted)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'color var(--duration-fast)',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-muted)'}
          >
            &times;
          </button>
        </div>

        {/* Title */}
        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'var(--text-xl)',
          color: 'var(--text-primary)',
          marginBottom: 'var(--space-6)',
          letterSpacing: '-0.01em',
        }}>
          {singleRegion ? 'Export Region' : 'Export Your Journey'}
        </h2>

        {/* Messaging */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p style={{
            fontSize: 'var(--text-base)',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            marginBottom: 'var(--space-4)',
          }}>
            Your terrain is more than a map &mdash; it's a record of how you grow.
          </p>
          <p style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-muted)',
            marginBottom: 'var(--space-3)',
          }}>
            Export your journey as Markdown to:
          </p>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}>
            {[
              'Feed it to your AI as skills and context',
              'Save it in Obsidian or your notes app',
              'Turn your progress into a repeatable process',
              'Your journey becomes the way.',
            ].map((item, i) => (
              <li key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 'var(--space-3)',
                fontSize: 'var(--text-sm)',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}>
                <span style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--accent-orange)',
                  marginTop: '2px',
                  flexShrink: 0,
                }}>
                  {'>>'}
                </span>
                {i === 3 ? (
                  <span style={{ color: 'var(--text-primary)', fontStyle: 'italic' }}>{item}</span>
                ) : (
                  <span>{item}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Markdown preview */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span className="mono-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
            Preview
          </span>
          <pre style={{
            maxHeight: '300px',
            overflowY: 'auto',
            padding: 'var(--space-4)',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {markdown}
          </pre>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
          <button
            className="btn-retro"
            onClick={handleCopy}
            style={{ flex: 1 }}
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </button>
          <button
            className="btn-retro btn-retro--secondary"
            onClick={handleDownload}
            style={{ flex: 1 }}
          >
            Download .md
          </button>
        </div>
      </div>
    </div>
  )
}
