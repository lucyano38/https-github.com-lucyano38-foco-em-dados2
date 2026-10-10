import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import Sidebar from './Sidebar'
import AppHeader from './AppHeader'
import ChatWidget from '../ChatWidget'

const routeTitles: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/upload': 'Upload',
  '/app/chatbots': 'Chatbots',
  '/app/templates': 'Templates',
  '/app/configuracoes': 'Configurações',
  '/app/faturamento': 'Faturamento',
  '/app/afiliado': 'Afiliado',
  '/app/ajuda': 'Ajuda',
}

export default function AppLayout() {
  const { user, profile, loading } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const pageTitle = Object.entries(routeTitles).find(([path]) =>
    path === '/app' ? location.pathname === '/app' : location.pathname.startsWith(path)
  )?.[1] || 'Dashboard'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-vivid-purple border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-on-surface-variant">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user && !profile?.plan_id) {
    return <Navigate to="/precos" replace />
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader title={pageTitle} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ChatWidget />
    </div>
  )
}
