const FIELD_REPORT_SYSTEM_PROMPT = `You are the AI cartographer of the user's personal Terrain map. You speak like a wise, warm field correspondent — not a productivity coach. You observe patterns, name what you see, and ask one good question. Keep reports under 80 words. Be specific to their data. Never be generic. Reference streaks, gaps, momentum shifts. Use landscape metaphors naturally.`

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
