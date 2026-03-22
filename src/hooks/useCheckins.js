import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

export function useCheckins() {
  const { user } = useAuth()
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCheckins = useCallback(async (regionId) => {
    if (!user) {
      setCheckins([])
      return
    }

    setLoading(true)
    let query = supabase
      .from('checkins')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (regionId) {
      query = query.eq('region_id', regionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching checkins:', error)
    } else {
      setCheckins(data || [])
    }
    setLoading(false)
  }, [user])

  const createCheckin = useCallback(async (checkinData) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('checkins')
      .insert({
        user_id: user.id,
        region_id: checkinData.region_id,
        duration_minutes: checkinData.duration_minutes,
        notes: checkinData.notes || '',
        mood: checkinData.mood,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating checkin:', error)
      throw error
    }

    // Create a collected note if there are notes
    if (checkinData.notes && checkinData.notes.trim()) {
      await supabase.from('collected_notes').insert({
        user_id: user.id,
        checkin_id: data.id,
        content: checkinData.notes.trim(),
        collected: false,
      })
    }

    setCheckins((prev) => [data, ...prev])
    return data
  }, [user])

  return {
    checkins,
    loading,
    fetchCheckins,
    createCheckin,
  }
}
