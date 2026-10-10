import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Dashboard {
  id: string
  user_id: string
  title: string
  description?: string
  config?: Record<string, any>
  created_at: string
  updated_at: string
}

interface DashboardsResult {
  dashboards: Dashboard[]
  createDashboard: (data: {
    title: string
    description?: string
    config?: Record<string, any>
  }) => Promise<Dashboard>
  deleteDashboard: (id: string) => Promise<void>
}

export function useDashboards(): DashboardsResult {
  const { user } = useAuth()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])

  useEffect(() => {
    if (!user) return

    async function fetchDashboards() {
      const { data } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setDashboards(data as Dashboard[])
    }

    fetchDashboards()
  }, [user])

  async function createDashboard(data: {
    title: string
    description?: string
    config?: Record<string, any>
  }): Promise<Dashboard> {
    if (!user) throw new Error('Not authenticated')

    const { data: inserted, error } = await supabase
      .from('dashboards')
      .insert({ user_id: user.id, ...data })
      .select()
      .single()

    if (error) throw error
    const dashboard = inserted as Dashboard
    setDashboards((prev) => [dashboard, ...prev])
    return dashboard
  }

  async function deleteDashboard(id: string) {
    const { error } = await supabase
      .from('dashboards')
      .delete()
      .eq('id', id)

    if (error) throw error
    setDashboards((prev) => prev.filter((d) => d.id !== id))
  }

  return { dashboards, createDashboard, deleteDashboard }
}
