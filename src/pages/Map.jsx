import { useState, useEffect, useCallback, useMemo } from 'react'
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
import DashboardView from '../components/DashboardView.jsx'
import OnboardingTour, { useOnboarding } from '../components/OnboardingTour.jsx'
import { useRegions } from '../hooks/useRegions.js'
import { useCheckins } from '../hooks/useCheckins.js'
import { useTheme } from '../hooks/useTheme.js'
import { useAuth } from '../hooks/useAuth.js'
import { useIsMobile } from '../hooks/useIsMobile.js'
import { supabase } from '../lib/supabase.js'
import { buildDispatchContext, generateDispatch } from '../lib/claude.js'

// FAB with hover label
function Fab({ onClick, className, style, title, children, 'data-tour': dataTour, small }) {
  const [hovered, setHovered] = useState(false)
  const size = small ? '40px' : '48px'
  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
      {hovered && (
        <span style={{
          position: 'absolute',
          right: small ? '52px' : '64px',
          whiteSpace: 'nowrap',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-retro)',
          padding: '4px 8px',
          pointerEvents: 'none',
          animation: 'fade-in 100ms ease-out',
        }}>
          {title}
        </span>
      )}
      <button
        onClick={onClick}
        className={className}
        data-tour={dataTour}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: size,
          height: size,
          padding: 0,
          fontSize: small ? 'var(--text-base)' : 'var(--text-lg)',
          ...style,
        }}
        title={title}
      >
        {children}
      </button>
    </div>
  )
}

export default function Map() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { regions, createRegion, updateRegion } = useRegions()
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

  // Dashboard panel state
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [hiddenRegions, setHiddenRegions] = useState(new Set())
  const [regionOrder, setRegionOrder] = useState([])

  // Initialize region order when regions change
  useEffect(() => {
    setRegionOrder(prev => {
      // Keep existing order, append new regions
      const existing = new Set(prev)
      const newIds = regions.map(r => r.id).filter(id => !existing.has(id))
      if (newIds.length === 0 && prev.length === regions.length) return prev
      // Remove ids no longer in regions
      const regionIds = new Set(regions.map(r => r.id))
      const cleaned = prev.filter(id => regionIds.has(id))
      return [...cleaned, ...newIds]
    })
  }, [regions])

  // Filtered regions for the map (respects visibility)
  const visibleRegions = useMemo(() => {
    return regions.filter(r => !hiddenRegions.has(r.id))
  }, [regions, hiddenRegions])

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
    try {
      // Use winding path positions matching generateMapLayout
      const pathPattern = [
        { dx: 1, dy: 0 }, { dx: 1, dy: 1 }, { dx: 1, dy: 0 },
        { dx: 1, dy: -1 }, { dx: 1, dy: 0 }, { dx: 0, dy: 1 },
      ]
      const CELL = 100
      let px = 80, py = 200
      for (let j = 0; j < regions.length; j++) {
        const step = pathPattern[j % pathPattern.length]
        px += step.dx * CELL
        py += step.dy * CELL
      }
      const result = await createRegion({
        ...data,
        position_x: px,
        position_y: py,
      })
      console.log('Region created:', result)
    } catch (err) {
      console.error('Failed to create region:', err)
      alert('Failed to create region: ' + (err.message || 'Unknown error'))
    }
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

  // Dashboard: progress change handler
  const handleDashboardProgressChange = useCallback(async (regionId, newProgress) => {
    try {
      await updateRegion(regionId, { progress: newProgress })
    } catch (err) {
      console.error('Failed to update progress:', err)
    }
  }, [updateRegion])

  // Dashboard: toggle visibility
  const handleToggleVisibility = useCallback((regionId) => {
    setHiddenRegions(prev => {
      const next = new Set(prev)
      if (next.has(regionId)) next.delete(regionId)
      else next.add(regionId)
      return next
    })
  }, [])

  // Dashboard: checkin from dashboard
  const handleDashboardCheckin = useCallback((region) => {
    setCheckinRegion(region)
  }, [])

  // Detect mobile
  const isMobile = useIsMobile()

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-base)',
      overflow: 'hidden',
    }}>
      <Navbar onThemeToggle={() => setThemeOpen(true)} onReplayTour={replayTour} />

      {/* Main area below navbar */}
      <div style={{
        flex: 1,
        marginTop: '56px',
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Map canvas — shrinks when dashboard is open on desktop */}
        <div style={{
          flex: dashboardOpen && !isMobile ? '0 0 60%' : '1 1 100%',
          position: 'relative',
          filter: mapBlurred ? 'blur(6px)' : 'none',
          transition: 'flex var(--duration-slow) var(--ease-out), filter 300ms var(--ease-out)',
          overflow: 'hidden',
        }}>
          <TerrainCanvas
            regions={visibleRegions}
            checkins={checkins}
            onRegionClick={handleRegionClick}
            onAddClick={() => setAddModalOpen(true)}
            theme={activeTheme}
          />

          {/* FABs with hover labels */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? 'var(--space-4)' : 'var(--space-6)',
            right: isMobile ? 'var(--space-4)' : 'var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            zIndex: 10,
          }}>
            <Fab small={isMobile} onClick={() => setDashboardOpen(!dashboardOpen)} className={dashboardOpen ? 'btn-retro' : 'btn-retro btn-retro--secondary'} data-tour="fab-dashboard" title={dashboardOpen ? 'Close List' : 'List View'}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}><path d="M3 4h14M3 8h14M3 12h10M3 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="square" /></svg>
            </Fab>

            <Fab small={isMobile} onClick={() => setShowDispatch(true)} className="btn-retro btn-retro--secondary" data-tour="fab-dispatch" title="Letters">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}><path d="M2 5l8 5 8-5M2 5v10h16V5H2z" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter" fill="none"/></svg>
            </Fab>

            <Fab small={isMobile} onClick={() => setExportOpen(true)} className="btn-retro btn-retro--secondary" data-tour="fab-export" title="Export">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}><path d="M10 3v10M10 13l-3.5-3.5M10 13l3.5-3.5M4 17h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </Fab>

            <Fab small={isMobile} onClick={() => navigate('/explore')} className="btn-retro btn-retro--teal" data-tour="fab-explore" title="Explore" style={{ boxShadow: '0 3px 0 #2A5486, 0 0 20px rgba(74, 144, 217, 0.3)' }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}><path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15l-5 3 1-5.5-4-4 5.5-1z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>
            </Fab>

            <Fab small={isMobile} onClick={() => setTemplatesOpen(true)} className="btn-retro btn-retro--secondary" title="Templates">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" style={{ display: 'block', margin: '0 auto' }}><rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/><rect x="11" y="11" width="6" height="6" stroke="currentColor" strokeWidth="2" fill="none"/></svg>
            </Fab>

            <Fab small={isMobile} onClick={() => setAddModalOpen(true)} className="btn-retro" title="Add Region">
              <span style={{ fontSize: isMobile ? '18px' : '20px', lineHeight: 1 }}>+</span>
            </Fab>
          </div>
        </div>

        {/* Dashboard panel */}
        {dashboardOpen && (
          isMobile ? (
            // Mobile: full-screen overlay
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              animation: 'slide-in-right var(--duration-slow) var(--ease-out)',
            }}>
              <DashboardView
                regions={regions}
                checkins={checkins}
                onCheckin={handleDashboardCheckin}
                onProgressChange={handleDashboardProgressChange}
                hiddenRegions={hiddenRegions}
                onToggleVisibility={handleToggleVisibility}
                regionOrder={regionOrder}
                onReorder={setRegionOrder}
                onClose={() => setDashboardOpen(false)}
              />
            </div>
          ) : (
            // Desktop: side panel 40%
            <div style={{
              flex: '0 0 40%',
              height: '100%',
              animation: 'slide-in-right var(--duration-slow) var(--ease-out)',
              overflow: 'hidden',
            }}>
              <DashboardView
                regions={regions}
                checkins={checkins}
                onCheckin={handleDashboardCheckin}
                onProgressChange={handleDashboardProgressChange}
                hiddenRegions={hiddenRegions}
                onToggleVisibility={handleToggleVisibility}
                regionOrder={regionOrder}
                onReorder={setRegionOrder}
                onClose={() => setDashboardOpen(false)}
              />
            </div>
          )
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
