import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import RegionCard from '../components/RegionCard.jsx'
import AddRegionModal from '../components/AddRegionModal.jsx'
import CheckinModal from '../components/CheckinModal.jsx'
import FieldReport from '../components/FieldReport.jsx'
import ThemePanel from '../components/ThemePanel.jsx'
import ExportModal from '../components/ExportModal.jsx'
import { useRegions } from '../hooks/useRegions.js'
import { useCheckins } from '../hooks/useCheckins.js'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../hooks/useAuth.js'
import { supabase } from '../lib/supabase.js'

export default function Map() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { regions, createRegion } = useRegions()
  const { checkins, fetchCheckins, createCheckin } = useCheckins()
  const { theme, updateTheme } = useTheme()

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [checkinRegion, setCheckinRegion] = useState(null)
  const [reportRegion, setReportRegion] = useState(null)
  const [reportOpen, setReportOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [exportData, setExportData] = useState({ milestones: [], fieldReports: [] })

  // Fetch all checkins on mount
  useEffect(() => {
    fetchCheckins()
  }, [fetchCheckins])

  // Fetch milestones + field reports when export modal opens
  useEffect(() => {
    if (!exportOpen || !user) return

    async function loadExportData() {
      const [milestonesRes, reportsRes] = await Promise.all([
        supabase
          .from('milestones')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('field_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ])

      setExportData({
        milestones: milestonesRes.data || [],
        fieldReports: reportsRes.data || [],
      })
    }

    loadExportData()
  }, [exportOpen, user])

  // Get last checkin date for each region
  const getLastCheckinDate = useCallback((regionId) => {
    const regionCheckins = checkins.filter(c => c.region_id === regionId)
    if (regionCheckins.length === 0) return null
    return regionCheckins.reduce((latest, c) =>
      new Date(c.created_at) > new Date(latest.created_at) ? c : latest
    ).created_at
  }, [checkins])

  const handleRegionClick = (region) => {
    setCheckinRegion(region)
  }

  const handleCheckinSubmit = async (data) => {
    await createCheckin(data)
    await fetchCheckins()
    // Show field report after check-in
    setReportRegion(checkinRegion)
    setReportOpen(true)
  }

  const handleAddRegion = async (data) => {
    // Calculate position
    const cols = Math.ceil(Math.sqrt(regions.length + 1))
    const col = regions.length % cols
    const row = Math.floor(regions.length / cols)
    await createRegion({
      ...data,
      position_x: col * 224 + 24,
      position_y: row * 184 + 24,
    })
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      <Navbar onThemeToggle={() => setThemeOpen(true)} />

      {/* Main canvas */}
      <div style={{
        flex: 1,
        marginTop: '56px',
        position: 'relative',
      }}>
        <TerrainCanvas
          regions={regions}
          checkins={checkins}
          onRegionClick={handleRegionClick}
          onAddClick={() => setAddModalOpen(true)}
          theme={theme}
        />

        {/* FABs */}
        <div style={{
          position: 'absolute',
          bottom: '120px',
          right: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          zIndex: 10,
        }}>
          {/* Export FAB */}
          <button
            onClick={() => setExportOpen(true)}
            className="btn-retro btn-retro--secondary"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: 0,
              fontSize: 'var(--text-lg)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.2), 0 0 20px rgba(212, 168, 83, 0.15)',
            }}
            title="Export journey"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <path d="M10 3v10M10 13l-3.5-3.5M10 13l3.5-3.5M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Explore FAB */}
          <button
            onClick={() => navigate('/explore')}
            className="btn-retro btn-retro--teal"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: 0,
              fontSize: 'var(--text-xl)',
              boxShadow: '0 3px 0 #008A82, 0 0 20px rgba(0, 212, 200, 0.3)',
            }}
            title="Explore mode"
          >
            {String.fromCodePoint(0x1F3AE)}
          </button>

          {/* Add FAB */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-retro"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              padding: 0,
              fontSize: 'var(--text-xl)',
            }}
            title="Add region"
          >
            +
          </button>
        </div>
      </div>

      {/* Bottom bar — Region cards */}
      <div style={{
        height: '100px',
        background: 'rgba(13, 10, 6, 0.9)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderTop: '2px solid var(--border-retro)',
        display: 'flex',
        alignItems: 'center',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
        overflowX: 'auto',
        overflowY: 'hidden',
        flexShrink: 0,
      }}>
        {regions.length === 0 ? (
          <div style={{
            flex: 1,
            textAlign: 'center',
            color: 'var(--text-dim)',
            fontSize: 'var(--text-sm)',
          }}>
            No regions yet. Click + to create your first.
          </div>
        ) : (
          regions.map((region) => (
            <RegionCard
              key={region.id}
              region={region}
              lastCheckinDate={getLastCheckinDate(region.id)}
            />
          ))
        )}
      </div>

      {/* Modals & Panels */}
      {addModalOpen && (
        <AddRegionModal
          onClose={() => setAddModalOpen(false)}
          onSubmit={handleAddRegion}
        />
      )}

      {checkinRegion && (
        <CheckinModal
          region={checkinRegion}
          onClose={() => setCheckinRegion(null)}
          onSubmit={handleCheckinSubmit}
        />
      )}

      <FieldReport
        region={reportRegion}
        checkins={reportRegion ? checkins.filter(c => c.region_id === reportRegion.id) : []}
        open={reportOpen}
        onClose={() => setReportOpen(false)}
      />

      <ThemePanel
        open={themeOpen}
        onClose={() => setThemeOpen(false)}
        theme={theme}
        onUpdate={updateTheme}
      />

      {exportOpen && (
        <ExportModal
          regions={regions}
          checkins={checkins}
          milestones={exportData.milestones}
          fieldReports={exportData.fieldReports}
          username={user?.user_metadata?.username || user?.email?.split('@')[0] || 'Explorer'}
          onClose={() => setExportOpen(false)}
        />
      )}
    </div>
  )
}
