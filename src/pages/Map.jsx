import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import TerrainCanvas from '../components/TerrainCanvas.jsx'
import AddRegionModal from '../components/AddRegionModal.jsx'
import CheckinModal from '../components/CheckinModal.jsx'
import FieldReport from '../components/FieldReport.jsx'
import ThemePanel from '../components/ThemePanel.jsx'
import ExportModal from '../components/ExportModal.jsx'
import DispatchOverlay from '../components/DispatchOverlay.jsx'
import TemplatesModal from '../components/TemplatesModal.jsx'
import OnboardingTour, { useOnboarding } from '../components/OnboardingTour.jsx'
import { useRegions } from '../hooks/useRegions.js'
import { useCheckins } from '../hooks/useCheckins.js'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../hooks/useAuth.js'
import { supabase } from '../lib/supabase.js'
import { buildDispatchContext, generateDispatch } from '../lib/claude.js'

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
  const [dispatch, setDispatch] = useState(null)
  const [showDispatch, setShowDispatch] = useState(false)
  const [pastDispatches, setPastDispatches] = useState([])
  const [mapBlurred, setMapBlurred] = useState(false)
  const [templatesOpen, setTemplatesOpen] = useState(false)

  // Live theme preview state — overrides saved theme while ThemePanel is open
  const [previewTheme, setPreviewTheme] = useState(null)
  const activeTheme = previewTheme || theme

  // Onboarding tour
  const { showTour, completeTour, replayTour } = useOnboarding()

  // Fetch all checkins on mount
  useEffect(() => {
    fetchCheckins()
  }, [fetchCheckins])

  // Check morning dispatch after auth resolves
  useEffect(() => {
    if (!user) return

    async function checkMorningDispatch() {
      const today = new Date().toISOString().split('T')[0]

      // 1. Check if today's dispatch exists
      const { data: existing } = await supabase
        .from('morning_dispatches')
        .select('*')
        .eq('user_id', user.id)
        .eq('dispatched_date', today)
        .single()

      if (existing) {
        // Already read today? Don't show
        if (existing.read_at) {
          setDispatch(existing)
          return
        }
        // Show unread dispatch
        setDispatch(existing)
        setShowDispatch(true)
        return
      }

      // 2. No dispatch today — generate one
      try {
        const context = await buildDispatchContext(user.id)
        if (!context) return // No regions yet

        const content = await generateDispatch(context)

        const { data: newDispatch } = await supabase
          .from('morning_dispatches')
          .insert({
            user_id: user.id,
            dispatched_date: today,
            content,
          })
          .select()
          .single()

        if (newDispatch) {
          setDispatch(newDispatch)
          setShowDispatch(true)
        }
      } catch (err) {
        console.error('Morning dispatch error:', err)
      }
    }

    checkMorningDispatch()
  }, [user])

  // Fetch past dispatches for archive
  useEffect(() => {
    if (!user) return

    async function loadPastDispatches() {
      const { data } = await supabase
        .from('morning_dispatches')
        .select('*')
        .eq('user_id', user.id)
        .order('dispatched_date', { ascending: false })
        .limit(30)

      setPastDispatches(data || [])
    }

    loadPastDispatches()
  }, [user, dispatch])

  // Dismiss dispatch handler
  const handleDismissDispatch = useCallback(async () => {
    setShowDispatch(false)
    if (dispatch && !dispatch.read_at) {
      const now = new Date().toISOString()
      await supabase
        .from('morning_dispatches')
        .update({ read_at: now })
        .eq('id', dispatch.id)
      setDispatch(prev => ({ ...prev, read_at: now }))
    }
  }, [dispatch])

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
          .order('generated_at', { ascending: false }),
      ])

      setExportData({
        milestones: milestonesRes.data || [],
        fieldReports: reportsRes.data || [],
      })
    }

    loadExportData()
  }, [exportOpen, user])

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

  // Live theme preview callback
  const handleThemePreview = useCallback((previewData) => {
    setPreviewTheme(previewData)
  }, [])

  // When ThemePanel closes, clear preview
  const handleThemeClose = useCallback(() => {
    setPreviewTheme(null)
    setThemeOpen(false)
  }, [])

  // When ThemePanel saves, persist to DB and clear preview
  const handleThemeSave = useCallback((newTheme) => {
    setPreviewTheme(null)
    updateTheme(newTheme)
  }, [updateTheme])

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      <Navbar onThemeToggle={() => setThemeOpen(true)} onReplayTour={replayTour} />

      {/* Main canvas — fills full viewport below navbar */}
      <div style={{
        flex: 1,
        marginTop: '56px',
        position: 'relative',
        filter: mapBlurred ? 'blur(6px)' : 'none',
        transition: 'filter 300ms var(--ease-out)',
      }}>
        <TerrainCanvas
          regions={regions}
          checkins={checkins}
          onRegionClick={handleRegionClick}
          onAddClick={() => setAddModalOpen(true)}
          theme={activeTheme}
        />

        {/* FABs */}
        <div style={{
          position: 'absolute',
          bottom: 'var(--space-6)',
          right: 'var(--space-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          zIndex: 10,
        }}>
          {/* Letters FAB */}
          <button
            onClick={() => setShowDispatch(true)}
            className="btn-retro btn-retro--secondary"
            data-tour="fab-dispatch"
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              fontSize: 'var(--text-lg)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.2), 0 0 20px rgba(212, 168, 83, 0.15)',
            }}
            title="Morning dispatches"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <path d="M2 5l8 5 8-5M2 5v10h16V5H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" fill="none"/>
            </svg>
          </button>

          {/* Export FAB */}
          <button
            onClick={() => setExportOpen(true)}
            className="btn-retro btn-retro--secondary"
            data-tour="fab-export"
            style={{
              width: '56px',
              height: '56px',
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
            data-tour="fab-explore"
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              fontSize: 'var(--text-lg)',
              boxShadow: '0 3px 0 #2A5486, 0 0 20px rgba(74, 144, 217, 0.3)',
            }}
            title="Explore mode"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15l-5 3 1-5.5-4-4 5.5-1z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/>
            </svg>
          </button>

          {/* Templates FAB */}
          <button
            onClick={() => setTemplatesOpen(true)}
            className="btn-retro btn-retro--secondary"
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              fontSize: 'var(--text-lg)',
              boxShadow: '0 3px 0 rgba(0,0,0,0.2), 0 0 20px rgba(212, 168, 83, 0.15)',
            }}
            title="Map templates"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}>
              <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
              <rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
          </button>

          {/* Add FAB */}
          <button
            onClick={() => setAddModalOpen(true)}
            className="btn-retro"
            style={{
              width: '56px',
              height: '56px',
              padding: 0,
              fontSize: 'var(--text-xl)',
            }}
            title="Add region"
          >
            +
          </button>
        </div>
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
        onClose={handleThemeClose}
        theme={theme}
        onUpdate={handleThemeSave}
        onPreview={handleThemePreview}
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

      {showDispatch && (
        <DispatchOverlay
          dispatch={dispatch}
          pastDispatches={pastDispatches}
          onDismiss={handleDismissDispatch}
          onBlurMap={setMapBlurred}
        />
      )}

      {templatesOpen && (
        <TemplatesModal
          onClose={() => setTemplatesOpen(false)}
          onCreateRegions={handleAddRegion}
        />
      )}

      {/* Onboarding Tour */}
      {showTour && (
        <OnboardingTour onComplete={completeTour} />
      )}
    </div>
  )
}
