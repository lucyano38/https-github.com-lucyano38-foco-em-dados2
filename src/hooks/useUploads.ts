import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

interface DataUpload {
  id: string
  user_id: string
  filename: string
  status: string
  rows_count?: number
  columns?: string[]
  created_at: string
}

interface UploadsResult {
  uploads: DataUpload[]
  uploadFile: (file: File) => Promise<void>
  getUploadStatus: (id: string) => Promise<string>
}

export function useUploads(): UploadsResult {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<DataUpload[]>([])

  useEffect(() => {
    if (!user) return

    async function fetchUploads() {
      const { data } = await supabase
        .from('data_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setUploads(data as DataUpload[])
    }

    fetchUploads()
  }, [user])

  async function uploadFile(file: File) {
    if (!user) throw new Error('Not authenticated')

    const formData = new FormData()
    formData.append('file', file)

    const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload`

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const err = await response.json().catch(() => null)
      throw new Error(err?.message || 'Upload failed')
    }

    const result = await response.json()
    if (result?.id) {
      setUploads((prev) => [
        {
          id: result.id,
          user_id: user.id,
          filename: file.name,
          status: 'processing',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ])
    }
  }

  async function getUploadStatus(id: string): Promise<string> {
    const { data } = await supabase
      .from('data_uploads')
      .select('status')
      .eq('id', id)
      .single()

    return (data as { status: string } | null)?.status ?? 'unknown'
  }

  return { uploads, uploadFile, getUploadStatus }
}
