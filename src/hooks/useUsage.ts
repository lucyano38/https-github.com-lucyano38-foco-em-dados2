import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface UsageResult {
  usage: Record<string, number>
  limits: Record<string, number>
  percentages: Record<string, number>
}

export function useUsage(): UsageResult {
  const { user, plan } = useAuth()
  const [usage, setUsage] = useState<Record<string, number>>({})
  const [limits, setLimits] = useState<Record<string, number>>({})
  const [percentages, setPercentages] = useState<Record<string, number>>({})

  useEffect(() => {
    if (!user || !plan) return

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    async function fetchUsage() {
      const { data } = await supabase
        .from('usage_logs')
        .select('feature, quantity')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonth)

      const aggregated: Record<string, number> = {}
      if (data) {
        for (const row of data) {
          aggregated[row.feature] = (aggregated[row.feature] || 0) + row.quantity
        }
      }

      setUsage(aggregated)

      const planLimits: Record<string, number> = {
        dashboards: plan.limits_dashboards,
        rows: plan.limits_rows,
        marketplaces: plan.limits_marketplaces,
        chatbots: plan.limits_chatbots,
        api_calls: plan.limits_api_calls,
        storage_mb: plan.limits_storage_mb,
      }
      setLimits(planLimits)

      const pcts: Record<string, number> = {}
      for (const [key, limit] of Object.entries(planLimits)) {
        const used = aggregated[key] || 0
        pcts[key] = limit > 0 ? Math.round((used / limit) * 100) : 0
      }
      setPercentages(pcts)
    }

    fetchUsage()
    const interval = setInterval(fetchUsage, 30000)
    return () => clearInterval(interval)
  }, [user, plan])

  return { usage, limits, percentages }
}
