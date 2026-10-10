import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface Chatbot {
  id: string
  user_id: string
  name: string
  description?: string
  config?: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

interface ChatbotsResult {
  chatbots: Chatbot[]
  createChatbot: (data: {
    name: string
    description?: string
    config?: Record<string, any>
  }) => Promise<void>
  updateChatbot: (
    id: string,
    data: Partial<{
      name: string
      description: string
      config: Record<string, any>
      is_active: boolean
    }>
  ) => Promise<void>
  deleteChatbot: (id: string) => Promise<void>
}

export function useChatbots(): ChatbotsResult {
  const { user } = useAuth()
  const [chatbots, setChatbots] = useState<Chatbot[]>([])

  useEffect(() => {
    if (!user) return

    async function fetchChatbots() {
      const { data } = await supabase
        .from('chatbots')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setChatbots(data as Chatbot[])
    }

    fetchChatbots()
  }, [user])

  async function createChatbot(data: {
    name: string
    description?: string
    config?: Record<string, any>
  }) {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase.from('chatbots').insert({
      user_id: user.id,
      ...data,
    })

    if (error) throw error

    setChatbots((prev) => [
      {
        id: crypto.randomUUID(),
        user_id: user.id,
        name: data.name,
        description: data.description,
        config: data.config,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      ...prev,
    ])
  }

  async function updateChatbot(
    id: string,
    data: Partial<{
      name: string
      description: string
      config: Record<string, any>
      is_active: boolean
    }>
  ) {
    const { error } = await supabase
      .from('chatbots')
      .update(data)
      .eq('id', id)

    if (error) throw error

    setChatbots((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    )
  }

  async function deleteChatbot(id: string) {
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id)

    if (error) throw error
    setChatbots((prev) => prev.filter((c) => c.id !== id))
  }

  return { chatbots, createChatbot, updateChatbot, deleteChatbot }
}
