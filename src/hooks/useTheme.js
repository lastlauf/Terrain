import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

const DEFAULT_THEME = {
  sky_color: 'night',
  ground_style: 'natural',
  particle_fx: 'fireflies',
  character_color: '#D4A853',
  ambient_music: false,
}

export function useTheme() {
  const { user } = useAuth()
  const [theme, setTheme] = useState(DEFAULT_THEME)

  useEffect(() => {
    if (!user) return

    async function loadTheme() {
      const { data } = await supabase
        .from('profiles')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (data?.theme && Object.keys(data.theme).length > 0) {
        setTheme({ ...DEFAULT_THEME, ...data.theme })
      }
    }

    loadTheme()
  }, [user])

  const updateTheme = useCallback(async (updates) => {
    const newTheme = { ...theme, ...updates }
    setTheme(newTheme)

    if (user) {
      await supabase
        .from('profiles')
        .update({ theme: newTheme })
        .eq('id', user.id)
    }
  }, [user, theme])

  return {
    theme,
    updateTheme,
  }
}
