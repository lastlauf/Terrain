import { supabase } from './supabase.js'

const MOOD_EMOJI = ['', '\u{1F629}', '\u{1F615}', '\u{1F610}', '\u{1F642}', '\u{1F525}']

/**
 * Get the best quote for a region from field reports or checkin notes.
 */
export async function getBestQuote(userId, regionId) {
  // Try field reports first
  const { data: reports } = await supabase
    .from('field_reports')
    .select('content')
    .eq('user_id', userId)
    .eq('region_id', regionId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (reports?.length) {
    const sentences = reports
      .flatMap(r => r.content.split(/[.!?]/))
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 80)
    if (sentences.length) return sentences[0]
  }

  // Fall back to most recent checkin note
  const { data: checkin } = await supabase
    .from('checkins')
    .select('notes')
    .eq('region_id', regionId)
    .not('notes', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return checkin?.notes || null
}

/**
 * Generate a Markdown export of a user's terrain journey.
 *
 * @param {Array} regions
 * @param {Array} checkins
 * @param {Array} milestones
 * @param {Array} fieldReports
 * @param {string} username
 * @returns {string} Markdown string
 */
export function generateMarkdown(regions, checkins, milestones, fieldReports, username) {
  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let md = `# Terrain \u{2014} ${username}'s Journey\n\n`
  md += `> Exported from Terrain on ${date}\n\n`
  md += `---\n`

  for (const region of regions) {
    md += `\n## ${region.name}\n`
    md += `**Type:** ${capitalize(region.type)} | **Category:** ${capitalize(region.category)} | **Progress:** ${region.progress || 0}%\n\n`

    if (region.description) {
      md += `> ${region.description}\n\n`
    }

    // Check-ins for this region
    const regionCheckins = checkins
      .filter(c => c.region_id === region.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    if (regionCheckins.length > 0) {
      md += `### Check-ins\n`
      for (const c of regionCheckins) {
        const d = new Date(c.created_at)
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        const moodStr = MOOD_EMOJI[c.mood] || MOOD_EMOJI[3]
        const durationStr = c.duration_minutes ? `${c.duration_minutes} min` : ''
        const notesStr = c.notes ? ` \u{2014} ${c.notes}` : ''
        md += `- **${dateStr}** (${durationStr}, mood: ${moodStr})${notesStr}\n`
      }
      md += `\n`
    }

    // Milestones for this region
    const regionMilestones = milestones
      .filter(m => m.region_id === region.id)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

    if (regionMilestones.length > 0) {
      md += `### Milestones\n`
      for (const m of regionMilestones) {
        const check = m.completed ? 'x' : ' '
        md += `- [${check}] ${m.title}\n`
      }
      md += `\n`
    }

    // Field reports for this region
    const regionReports = fieldReports
      .filter(r => r.region_id === region.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    if (regionReports.length > 0) {
      md += `### Field Reports\n`
      for (const r of regionReports) {
        const d = new Date(r.created_at)
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        md += `> **${dateStr}:** ${r.content}\n\n`
      }
    }

    md += `---\n`
  }

  return md.trim() + '\n'
}

/**
 * Generate a Markdown export for a single region.
 */
export function generateRegionMarkdown(region, checkins, milestones, fieldReports) {
  return generateMarkdown([region], checkins, milestones, fieldReports, region.name)
}

function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
