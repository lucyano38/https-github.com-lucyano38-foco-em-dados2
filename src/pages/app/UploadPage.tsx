import { useState, useRef, useCallback } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useUsage } from '../../hooks/useUsage'
import { useUploads } from '../../hooks/useUploads'

const INTEGRACOES = [
  { name: 'Shopify', icon: '🛒' },
  { name: 'WooCommerce', icon: '🐘' },
  { name: 'Mercado Livre', icon: '📦' },
  { name: 'Google Planilhas', icon: '📊' },
]

export default function UploadPage() {
  const { uploads, uploadFile } = useUploads()
  const { usage, limits } = useUsage()
  const [dragOver, setDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(async (file: File) => {
    setSelectedFile(file)
    setUploading(true)
    try {
      await uploadFile(file)
    } catch {
      alert('Erro ao enviar arquivo')
    }
    setUploading(false)
  }, [uploadFile])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const statusColor: Record<string, string> = {
    completed: 'text-emerald-400',
    processing: 'text-yellow-400',
    error: 'text-red-400',
    pending: 'text-slate-400',
  }

  const usedDashboards = usage.dashboards ?? 0
  const limitDashboards = limits.dashboards ?? 10
  const usagePct = limitDashboards > 0 ? Math.round((usedDashboards / limitDashboards) * 100) : 0

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Upload de Planilha</h1>
        <p className="text-slate-400 mt-1">Faça upload de arquivos CSV ou Excel para gerar dashboards inteligentes.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`glass-card p-12 flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed transition-all ${
          dragOver ? 'border-purple-500 bg-purple-500/10' : 'border-white/10 hover:border-purple-500/50'
        }`}
      >
        <input ref={inputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleChange} className="hidden" />
        <span className={`material-symbols-outlined text-6xl ${dragOver ? 'text-purple-400' : 'text-slate-500'}`}>
          cloud_upload
        </span>
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-purple-400 animate-pulse">sync</span>
            <p className="text-sm font-mono text-purple-400">Enviando...</p>
            {selectedFile && <p className="text-xs text-slate-500">{selectedFile.name}</p>}
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center gap-2">
            <span className="material-symbols-outlined text-4xl text-emerald-400">check_circle</span>
            <p className="text-sm font-mono text-emerald-400">{selectedFile.name}</p>
            <p className="text-xs text-slate-500">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        ) : (
          <>
            <p className="text-lg font-bold text-slate-300">Arraste sua planilha aqui ou clique para selecionar</p>
            <p className="text-sm font-mono text-slate-500">CSV, Excel (.xlsx, .xls) até 10MB</p>
          </>
        )}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-mono text-slate-400">
            Dashboards: {usedDashboards}/{limitDashboards} usado
          </span>
          {usagePct > 70 && (
            <button className="text-xs font-mono uppercase tracking-wider text-purple-400 hover:text-cyan-400 transition-colors">
              Upgrade
            </button>
          )}
        </div>
        <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              usagePct > 95 ? 'bg-red-500' : usagePct > 80 ? 'bg-yellow-500' : 'bg-purple-500'
            }`}
            style={{ width: `${Math.min(usagePct, 100)}%` }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Uploads Recentes</h2>
        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Arquivo</th>
                <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Status</th>
                <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Linhas</th>
                <th className="text-left p-4 text-slate-500 font-mono text-[11px] uppercase tracking-wider">Data</th>
              </tr>
            </thead>
            <tbody>
              {uploads.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">Nenhum upload encontrado</td>
                </tr>
              ) : (
                uploads.map((u) => (
                  <tr key={u.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-4 text-white font-medium">{u.filename}</td>
                    <td className="p-4">
                      <span className={`font-mono text-xs ${statusColor[u.status] || 'text-slate-400'}`}>
                        {u.status === 'completed' ? 'Concluído' : u.status === 'processing' ? 'Processando' : u.status === 'error' ? 'Erro' : u.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{(u as any).rows_count ?? '-'}</td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-white mb-4">Ou conecte uma fonte</h2>
        <div className="flex flex-wrap gap-3">
          {INTEGRACOES.map((int) => (
            <button
              key={int.name}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-all"
            >
              <span className="text-lg">{int.icon}</span>
              <span>{int.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
