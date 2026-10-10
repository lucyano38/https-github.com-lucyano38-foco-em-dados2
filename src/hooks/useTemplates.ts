import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Template {
  id: string
  name: string
  description?: string
  category?: string
  config?: Record<string, any>
  is_active: boolean
  created_at: string
}

interface TemplatesResult {
  templates: Template[]
  installTemplate: (id: string) => Promise<void>
}

export function useTemplates(): TemplatesResult {
  const { user } = useAuth()
  const [templates, setTemplates] = useState<Template[]>([])

  useEffect(() => {
    async function fetchTemplates() {
      const { data } = await supabase
        .from('templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (data) setTemplates(data as Template[])
    }

    fetchTemplates()
  }, [])

  async function installTemplate(id: string) {
    if (!user) throw new Error('Not authenticated')

    const { data: template } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single()

    if (!template) throw new Error('Template not found')

    const t = template as Template

    const { error } = await supabase.from('dashboards').insert({
      user_id: user.id,
      title: t.name,
      description: t.description,
      config: t.config,
    })

    if (error) throw error
  }

  return { templates, installTemplate }
}
