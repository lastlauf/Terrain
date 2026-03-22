import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase.js'
import { useAuth } from './useAuth.js'

export function useRegions() {
  const { user } = useAuth()
  const [regions, setRegions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchRegions = useCallback(async () => {
    if (!user) {
      setRegions([])
      setLoading(false)
      return
    }

    setLoading(true)
    const { data, error } = await supabase
      .from('regions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching regions:', error)
    } else {
      setRegions(data || [])
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchRegions()
  }, [fetchRegions])

  const createRegion = useCallback(async (regionData) => {
    if (!user) return null

    const { data, error } = await supabase
      .from('regions')
      .insert({
        user_id: user.id,
        name: regionData.name,
        type: regionData.type,
        category: regionData.category || 'other',
        description: regionData.description || '',
        color: regionData.color || null,
        progress: regionData.progress || 0,
        position_x: regionData.position_x ?? null,
        position_y: regionData.position_y ?? null,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating region:', error)
      throw error
    }

    setRegions((prev) => [...prev, data])
    return data
  }, [user])

  const updateRegion = useCallback(async (id, updates) => {
    const { data, error } = await supabase
      .from('regions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating region:', error)
      throw error
    }

    setRegions((prev) => prev.map((r) => (r.id === id ? data : r)))
    return data
  }, [])

  const deleteRegion = useCallback(async (id) => {
    const { error } = await supabase
      .from('regions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting region:', error)
      throw error
    }

    setRegions((prev) => prev.filter((r) => r.id !== id))
  }, [])

  return {
    regions,
    loading,
    fetchRegions,
    createRegion,
    updateRegion,
    deleteRegion,
  }
}
