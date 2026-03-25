import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase.js'
import { generateFieldReport } from '../lib/claude.js'
import { useAuth } from '../hooks/useAuth.js'

export default function FieldReport({ region, checkins, open, onClose }) {
  const { user } = useAuth()
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [pastReports, setPastReports] = useState([])

  useEffect(() => {
    if (!open || !region || !user) return

    // Fetch past reports
    async function loadPastReports() {
      const { data } = await supabase
        .from('field_reports')
        .select('*')
        .eq('region_id', region.id)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(3)

      setPastReports(data || [])
    }

    loadPastReports()
  }, [open, region, user])

  const handleGenerate = async () => {
    if (!region || !user) return

    setLoading(true)
    setReport('')

    try {
      const reportText = await generateFieldReport(
        region.name,
        region.type,
        checkins || []
      )

      setReport(reportText)

      // Save to database
      await supabase.from('field_reports').insert({
        user_id: user.id,
        region_id: region.id,
        report_text: reportText,
      })

      // Refresh past reports
      const { data } = await supabase
        .from('field_reports')
        .select('*')
        .eq('region_id', region.id)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })
        .limit(3)

      setPastReports(data || [])
    } catch (err) {
      setReport('Signal lost. Could not complete field report.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Auto-generate on first open if no report yet
  useEffect(() => {
    if (open && region && !report && pastReports.length === 0) {
      handleGenerate()
    }
  }, [open, region, pastReports.length])

  if (!open) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '380px',
      maxWidth: '100vw',
      background: 'var(--bg-surface-raised)',
      borderLeft: '1px solid var(--border-light)',
      boxShadow: 'var(--shadow-lg)',
      zIndex: 60,
      display: 'flex',
      flexDirection: 'column',
      animation: 'slide-in-right var(--duration-slow) var(--ease-out)',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: 'var(--space-6)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 400,
            fontSize: 'var(--text-xl)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-1)',
            letterSpacing: '0.06em',
          }}>
            FIELD REPORT
          </h2>
          {region && (
            <p style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
            }}>
              {region.name} &middot; {new Date().toLocaleDateString()}
            </p>
          )}
        </div>
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

      {/* Content */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: 'var(--space-6)',
      }}>
        {/* Current report */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <div style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-muted)',
              marginBottom: 'var(--space-4)',
            }}>
              Transmitting
            </div>
            <div className="loading-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : report ? (
          <div style={{
            padding: 'var(--space-4)',
            background: 'var(--bg-muted)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-6)',
          }}>
            <p style={{
              fontSize: 'var(--text-sm)',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              whiteSpace: 'pre-wrap',
            }}>
              {report}
            </p>
          </div>
        ) : null}

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          className="btn-retro btn-retro--secondary"
          disabled={loading}
          style={{ width: '100%', marginBottom: 'var(--space-6)' }}
        >
          {loading ? 'Generating...' : 'New Report'}
        </button>

        {/* Past reports */}
        {pastReports.length > 0 && (
          <div>
            <h3 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-secondary)',
              marginBottom: 'var(--space-3)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}>
              Past Reports
            </h3>
            {pastReports.map((r) => (
              <div
                key={r.id}
                style={{
                  padding: 'var(--space-3)',
                  marginBottom: 'var(--space-3)',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-light)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <p style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-dim)',
                  marginBottom: 'var(--space-1)',
                }}>
                  {new Date(r.created_at).toLocaleDateString()}
                </p>
                <p style={{
                  fontSize: 'var(--text-sm)',
                  lineHeight: 1.6,
                  color: 'var(--text-muted)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
