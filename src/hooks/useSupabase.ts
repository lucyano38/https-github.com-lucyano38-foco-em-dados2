import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import type {
  Dashboard,
  DataUpload,
  Notification,
  Payment,
  Subscription,
} from '../types/database'

// ── Dashboards ──────────────────────────────────────────────
export function useDashboards() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['dashboards', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as Dashboard[]
    },
    enabled: !!user,
  })
}

export function useCreateDashboard() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (input: { title: string; description?: string; config?: any }) => {
      const { data, error } = await supabase
        .from('dashboards')
        .insert({ user_id: user!.id, title: input.title, description: input.description, config: input.config })
        .select()
        .single()
      if (error) throw error
      return data as Dashboard
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] }),
  })
}

export function useDeleteDashboard() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('dashboards').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dashboards'] }),
  })
}

// ── Data Uploads ────────────────────────────────────────────
export function useDataUploads() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['data_uploads', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_uploads')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as DataUpload[]
    },
    enabled: !!user,
  })
}

export function useUploadFile() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ file }: { file: File }) => {
      const { data: { session } } = await supabase.auth.getSession()

      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${session?.access_token}` },
          body: formData,
        }
      )
      if (!res.ok) {
        const err = await res.json().catch(() => null)
        throw new Error(err?.message || 'Upload failed')
      }
      return res.json()
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['data_uploads', user?.id] }),
  })
}

// ── Notifications ───────────────────────────────────────────
export function useNotifications() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20)
      if (error) throw error
      return data as Notification[]
    },
    refetchInterval: 30_000,
    enabled: !!user,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', user?.id] })
    },
  })
}

// ── Subscriptions & Payments (Billing) ─────────────────────
export function useSubscription() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*, plans(*)')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as Subscription | null
    },
    enabled: !!user,
  })
}

export function usePayments() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['payments', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'succeeded')
        .order('created_at', { ascending: false })
        .limit(50)
      if (error) throw error
      return data as Payment[]
    },
    enabled: !!user,
  })
}

// ── Plan & Usage ────────────────────────────────────────────
export function usePlanUsage() {
  const { profile, plan } = useAuth()
  return useQuery({
    queryKey: ['plan-usage', profile?.id],
    queryFn: async () => {
      if (!profile || !plan) return null
      const { data, error } = await supabase
        .from('usage_logs')
        .select('feature, quantity')
        .eq('user_id', profile.id)
        .gte('period', new Date().toISOString().slice(0, 7) + '-01')
      if (error) throw error

      const usage: Record<string, number> = {}
      for (const row of data || []) {
        usage[row.feature] = (usage[row.feature] || 0) + row.quantity
      }

      return {
        dashboards: { used: usage.dashboard || 0, limit: plan.limits_dashboards },
        uploads: { used: usage.upload || 0, limit: plan.limits_rows },
        chatbots: { used: usage.chatbot || 0, limit: plan.limits_chatbots },
        integrations: { used: usage.integration || 0, limit: plan.limits_marketplaces },
      }
    },
    enabled: !!profile && !!plan,
  })
}
