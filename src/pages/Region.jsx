import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { useAuth } from '../hooks/useAuth.js'
import { useCheckins } from '../hooks/useCheckins.js'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import CheckinModal from '../components/CheckinModal.jsx'
import FieldReport from '../components/FieldReport.jsx'
import ExportModal from '../components/ExportModal.jsx'
import LandmarkNaming from '../components/LandmarkNaming.jsx'
import ShareCard from '../components/ShareCard.jsx'
import Navbar from '../components/Navbar.jsx'
import { getBestQuote } from '../lib/export.js'

const MOOD_EMOJI = ['', String.fromCodePoint(0x1F629), String.fromCodePoint(0x1F615), String.fromCodePoint(0x1F610), String.fromCodePoint(0x1F642), String.fromCodePoint(0x1F525)]

export default function Region() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { checkins, fetchCheckins, createCheckin } = useCheckins()

  const [region, setRegion] = useState(null)
  const [milestones, setMilestones] = useState([])
  const [loading, setLoading] = useState(true)
  const [checkinOpen, setCheckinOpen] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')
  const [exportOpen, setExportOpen] = useState(false)
  const [fieldReports, setFieldReports] = useState([])
  const [landmarkMilestone, setLandmarkMilestone] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareQuote, setShareQuote] = useState(null)

  // Load region data
  useEffect(() => {
    if (!user || !id) return

    async function load() {
      setLoading(true)

      const { data: regionData } = await supabase
        .from('regions')
        .select('*')
        .eq('id', id)
        .single()

      if (!regionData) {
        navigate('/map')
        return
      }

      setRegion(regionData)

      const { data: ms } = await supabase
        .from('milestones')
        .select('*')
        .eq('region_id', id)
        .order('created_at', { ascending: true })

      setMilestones(ms || [])
      setLoading(false)
    }

    load()
    fetchCheckins(id)
  }, [user, id, navigate, fetchCheckins])

  // Fetch field reports when export opens
  useEffect(() => {
    if (!exportOpen || !user || !id) return

    async function loadFieldReports() {
      const { data } = await supabase
        .from('field_reports')
        .select('*')
        .eq('region_id', id)
        .eq('user_id', user.id)
        .order('generated_at', { ascending: false })

      setFieldReports(data || [])
    }

    loadFieldReports()
  }, [exportOpen, user, id])

  const handleCheckinSubmit = async (data) => {
    await createCheckin(data)
    await fetchCheckins(id)
  }

  const handleToggleMilestone = async (milestone) => {
    const completed = !milestone.completed
    await supabase
      .from('milestones')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', milestone.id)

    const updated = { ...milestone, completed, completed_at: completed ? new Date().toISOString() : null }

    setMilestones((prev) =>
      prev.map((m) => m.id === milestone.id ? updated : m)
    )

    // If just completed, open landmark naming modal
    if (completed && !milestone.landmark_name) {
      setLandmarkMilestone(updated)
    }
  }

  function getLandmarkPosition(milestoneIndex) {
    const angle = (milestoneIndex / 5) * Math.PI * 0.8 - Math.PI * 0.4
    const radius = 0.3 + (milestoneIndex % 3) * 0.1
    return { x: 0.5 + Math.cos(angle) * radius, y: 0.5 + Math.sin(angle) * radius * 0.6 }
  }

  const handleLandmarkName = async (name) => {
    if (!landmarkMilestone) return

    const milestoneIndex = milestones.findIndex(m => m.id === landmarkMilestone.id)
    const { x, y } = getLandmarkPosition(milestoneIndex >= 0 ? milestoneIndex : 0)

    await supabase
      .from('milestones')
      .update({
        landmark_name: name,
        landmark_x: x,
        landmark_y: y,
      })
      .eq('id', landmarkMilestone.id)

    setMilestones((prev) =>
      prev.map((m) =>
        m.id === landmarkMilestone.id ? { ...m, landmark_name: name, landmark_x: x, landmark_y: y } : m
      )
    )
    setLandmarkMilestone(null)
  }

  const handleShare = async () => {
    if (!user || !region) return
    const quote = await getBestQuote(user.id, region.id)
    setShareQuote(quote)
    setShareOpen(true)
  }

  const handleAddMilestone = async (e) => {
    e.preventDefault()
    if (!newMilestone.trim() || !user) return

    const { data } = await supabase
      .from('milestones')
      .insert({
        region_id: id,
        user_id: user.id,
        title: newMilestone.trim(),
        completed: false,
      })
      .select()
      .single()

    if (data) {
      setMilestones((prev) => [...prev, data])
      setNewMilestone('')
    }
  }

  if (loading || !region) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-base)',
      }}>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
    }}>
      <Navbar />

      <div style={{
        paddingTop: '56px',
        maxWidth: '960px',
        margin: '0 auto',
        padding: '80px var(--space-6) var(--space-8)',
      }}>
        {/* Back link */}
        <Link to="/map" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          fontSize: 'var(--text-sm)',
          color: 'var(--text-muted)',
          marginBottom: 'var(--space-6)',
          textDecoration: 'none',
        }}>
          &larr; Back to Map
        </Link>

        {/* Region header */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-8)',
          flexWrap: 'wrap',
          gap: 'var(--space-4)',
        }}>
          <div>
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-3xl)',
              color: region.color || 'var(--accent-gold)',
              marginBottom: 'var(--space-2)',
            }}>
              {region.name}
            </h1>
            {region.description && (
              <p style={{
                fontSize: 'var(--text-base)',
                color: 'var(--text-muted)',
                marginBottom: 'var(--space-3)',
                maxWidth: '480px',
              }}>
                {region.description}
              </p>
            )}
            <div style={{
              display: 'flex',
              gap: 'var(--space-3)',
              fontSize: 'var(--text-sm)',
              color: 'var(--text-dim)',
            }}>
              <span style={{ textTransform: 'capitalize' }}>{region.type}</span>
              <span>&middot;</span>
              <span style={{ textTransform: 'capitalize' }}>{region.category}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <button
              className="btn-retro"
              onClick={() => setCheckinOpen(true)}
            >
              Log Session
            </button>
            <button
              className="btn-retro btn-retro--secondary"
              onClick={() => setReportOpen(true)}
            >
              Field Report
            </button>
            <button
              className="btn-retro btn-retro--secondary"
              onClick={() => setExportOpen(true)}
            >
              Export Region
            </button>
            <button
              className="btn-retro btn-retro--secondary"
              onClick={handleShare}
            >
              Share
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 'var(--space-8)' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-2)',
          }}>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', fontWeight: 600 }}>
              Progress
            </span>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-sm)',
              color: region.color || 'var(--accent-gold)',
            }}>
              {region.progress || 0}%
            </span>
          </div>
          <div style={{
            height: '8px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-retro)',
            borderRadius: '4px',
          }}>
            <div style={{
              height: '100%',
              width: `${region.progress || 0}%`,
              background: region.color || 'var(--accent-gold)',
              borderRadius: '4px',
              transition: 'width var(--duration-slow) var(--ease-out)',
            }} />
          </div>
        </div>

        {/* Terrain preview */}
        <div className="glass-panel" style={{
          height: '280px',
          marginBottom: 'var(--space-8)',
          overflow: 'hidden',
        }}>
          <TerrainCanvas
            regions={[]}
            checkins={checkins}
            milestones={milestones}
            singleRegion={region}
            interactive={false}
          />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 'var(--space-6)',
        }}>
          {/* Check-in history */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              Check-in History
            </h2>

            {checkins.length === 0 ? (
              <p style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--text-dim)',
                padding: 'var(--space-6)',
                textAlign: 'center',
                border: '1px dashed var(--border-retro)',
                borderRadius: 'var(--radius-md)',
              }}>
                No check-ins yet. Log your first session.
              </p>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}>
                {checkins.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: 'var(--space-4)',
                      background: 'var(--bg-glass)',
                      border: '1px solid var(--border-retro)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: `3px solid ${region.color || 'var(--accent-gold)'}`,
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: c.notes ? 'var(--space-2)' : 0,
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                      }}>
                        <span style={{ fontSize: 'var(--text-lg)' }}>
                          {MOOD_EMOJI[c.mood] || MOOD_EMOJI[3]}
                        </span>
                        <span style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: 'var(--text-sm)',
                          color: 'var(--text-primary)',
                        }}>
                          {c.duration_minutes} min
                        </span>
                      </div>
                      <span style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-dim)',
                      }}>
                        {new Date(c.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {c.notes && (
                      <p style={{
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-muted)',
                        lineHeight: 1.5,
                      }}>
                        {c.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestones */}
          <div>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 'var(--text-lg)',
              color: 'var(--text-primary)',
              marginBottom: 'var(--space-4)',
            }}>
              Milestones
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
              marginBottom: 'var(--space-4)',
            }}>
              {milestones.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleToggleMilestone(m)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: 'var(--space-3) var(--space-4)',
                    background: 'var(--bg-glass)',
                    border: '1px solid var(--border-retro)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background var(--duration-fast)',
                    width: '100%',
                  }}
                >
                  <div style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '4px',
                    border: `2px solid ${m.completed ? (region.color || 'var(--accent-gold)') : 'var(--border-retro)'}`,
                    background: m.completed ? (region.color || 'var(--accent-gold)') : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all var(--duration-fast)',
                    fontSize: '12px',
                    color: 'var(--bg-base)',
                  }}>
                    {m.completed && String.fromCodePoint(0x2713)}
                  </div>
                  <span style={{
                    fontSize: 'var(--text-sm)',
                    color: m.completed ? 'var(--text-dim)' : 'var(--text-primary)',
                    textDecoration: m.completed ? 'line-through' : 'none',
                  }}>
                    {m.title}
                  </span>
                </button>
              ))}
            </div>

            {/* Add milestone */}
            <form onSubmit={handleAddMilestone} style={{
              display: 'flex',
              gap: 'var(--space-2)',
            }}>
              <input
                className="input-retro"
                value={newMilestone}
                onChange={(e) => setNewMilestone(e.target.value)}
                placeholder="Add a milestone..."
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                className="btn-retro"
                disabled={!newMilestone.trim()}
                style={{ flexShrink: 0 }}
              >
                Add
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Modals */}
      {checkinOpen && (
        <CheckinModal
          region={region}
          onClose={() => setCheckinOpen(false)}
          onSubmit={handleCheckinSubmit}
        />
      )}

      <FieldReport
        region={region}
        checkins={checkins}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      {exportOpen && (
        <ExportModal
          regions={[region]}
          checkins={checkins}
          milestones={milestones}
          fieldReports={fieldReports}
          singleRegion={region}
          onClose={() => setExportOpen(false)}
        />
      )}

      {landmarkMilestone && (
        <LandmarkNaming
          regionName={region.name}
          milestoneTitle={landmarkMilestone.title}
          onSubmit={handleLandmarkName}
          onClose={() => setLandmarkMilestone(null)}
        />
      )}

      {shareOpen && (
        <ShareCard
          region={region}
          checkins={checkins}
          milestones={milestones}
          quote={shareQuote}
          onClose={() => setShareOpen(false)}
        />
      )}
    </div>
  )
}
