import { supabase } from './supabase.js'

const FIELD_REPORT_SYSTEM_PROMPT = `You are the AI cartographer of the user's personal Terrain map. You speak like a wise, warm field correspondent — not a productivity coach. You observe patterns, name what you see, and ask one good question. Keep reports under 80 words. Be specific to their data. Never be generic. Reference streaks, gaps, momentum shifts. Use landscape metaphors naturally.`

const DISPATCH_SYSTEM_PROMPT = `You are the cartographer of this user's personal Terrain map.
Each morning you write them a short dispatch — like a letter from the field.

Rules:
- Under 60 words. Every word earns its place.
- Mention 1-2 specific regions by name.
- Reference something real: a streak, a gap, a recent check-in note, a completed milestone.
- End with one open question. Not a task. A question.
- Tone: warm, observant, unhurried. Like a letter from someone who knows you well.
- Never use the words: "journey", "productivity", "goals", "achieve", "crush".
- Sign off as: "-- Your Cartographer"`

export async function generateFieldReport(regionName, regionType, checkins) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return `Field report unavailable — no API key configured. To enable AI field reports, add your Anthropic API key to the .env file.`
  }

  const checkinSummary = checkins.length === 0
    ? 'No check-ins recorded yet.'
    : checkins.map((c, i) => {
        const date = new Date(c.created_at).toLocaleDateString()
        const mood = ['', 'struggling', 'low', 'neutral', 'good', 'on fire'][c.mood] || 'unknown'
        return `${date}: ${c.duration_minutes}min, mood=${mood}${c.notes ? `, notes="${c.notes}"` : ''}`
      }).join('\n')

  const userMessage = `Region: "${regionName}" (type: ${regionType})

Recent check-in data:
${checkinSummary}

Write a field report for this region.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: FIELD_REPORT_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || 'No report generated.'
  } catch (error) {
    console.error('Field report error:', error)
    return `Field report transmission interrupted. ${error.message}`
  }
}

/**
 * Build context for morning dispatch by fetching all regions,
 * their checkin data, streaks, weather states, and recent notes.
 */
export async function buildDispatchContext(userId) {
  // Fetch all regions
  const { data: regions } = await supabase
    .from('regions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (!regions || regions.length === 0) return null

  // Fetch all checkins
  const { data: allCheckins } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  // Fetch completed milestones
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('user_id', userId)
    .eq('completed', true)
    .order('completed_at', { ascending: false })
    .limit(5)

  const checkins = allCheckins || []
  const now = Date.now()

  const regionContexts = regions.map(region => {
    const regionCheckins = checkins.filter(c => c.region_id === region.id)
    const lastCheckin = regionCheckins[0] || null
    const lastDate = lastCheckin ? new Date(lastCheckin.created_at) : null
    const daysSince = lastDate ? (now - lastDate.getTime()) / (1000 * 60 * 60 * 24) : null

    // Calculate streak (consecutive days with at least one checkin)
    let streak = 0
    if (regionCheckins.length > 0) {
      const dates = [...new Set(regionCheckins.map(c =>
        new Date(c.created_at).toISOString().split('T')[0]
      ))].sort().reverse()

      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

      if (dates[0] === today || dates[0] === yesterday) {
        streak = 1
        for (let i = 1; i < dates.length; i++) {
          const prev = new Date(dates[i - 1])
          const curr = new Date(dates[i])
          const diff = (prev - curr) / (1000 * 60 * 60 * 24)
          if (diff <= 1.5) streak++
          else break
        }
      }
    }

    // Weather state
    let weather = 'storm'
    if (daysSince !== null) {
      if (daysSince < 1) weather = 'clear'
      else if (daysSince < 3) weather = 'partial'
      else if (daysSince < 7) weather = 'cloudy'
    }

    // Recent notes
    const recentNotes = regionCheckins
      .filter(c => c.notes && c.notes.trim())
      .slice(0, 5)
      .map(c => c.notes)

    return {
      name: region.name,
      type: region.type,
      progress: region.progress || 0,
      lastCheckinDate: lastDate ? lastDate.toISOString().split('T')[0] : 'never',
      daysSinceLastCheckin: daysSince !== null ? Math.floor(daysSince) : null,
      streak,
      weather,
      totalCheckins: regionCheckins.length,
      recentNotes,
    }
  })

  return {
    regions: regionContexts,
    recentMilestones: (milestones || []).map(m => ({
      title: m.title,
      completedAt: m.completed_at,
      landmarkName: m.landmark_name || null,
    })),
  }
}

/**
 * Generate a morning dispatch using Claude API.
 */
export async function generateDispatch(context) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY
  if (!apiKey || apiKey === 'your_anthropic_api_key_here') {
    return `The cartographer's pen is dry — no API key configured.`
  }

  if (!context || !context.regions || context.regions.length === 0) {
    return `The map is empty. No regions to report on yet.`
  }

  const regionSummaries = context.regions.map(r => {
    let line = `"${r.name}" (${r.type}, progress: ${r.progress}%, weather: ${r.weather})`
    line += ` — last checkin: ${r.lastCheckinDate}, streak: ${r.streak} days, total sessions: ${r.totalCheckins}`
    if (r.recentNotes.length > 0) {
      line += `\n  Recent notes: ${r.recentNotes.map(n => `"${n}"`).join('; ')}`
    }
    return line
  }).join('\n')

  const milestoneSummary = context.recentMilestones.length > 0
    ? `\nRecently completed milestones:\n${context.recentMilestones.map(m => `- "${m.title}"${m.landmarkName ? ` (landmark: ${m.landmarkName})` : ''}`).join('\n')}`
    : ''

  const userMessage = `Here is the current state of the user's terrain:\n\n${regionSummaries}${milestoneSummary}\n\nWrite today's morning dispatch.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: DISPATCH_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: userMessage }
        ],
      }),
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content?.[0]?.text || 'No dispatch generated.'
  } catch (error) {
    console.error('Dispatch error:', error)
    return `Dispatch interrupted. ${error.message}`
  }
}
