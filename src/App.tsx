import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import Pricing from './pages/Pricing'
import RegisterPage from './pages/public/RegisterPage'
import LoginPage from './pages/public/LoginPage'
import PrivacyPolicy from './pages/PrivacyPolicy'
import TermsOfService from './pages/TermsOfService'
import NotFound from './pages/NotFound'
import AppLayout from './components/layout/AppLayout'
import DashboardPage from './pages/app/DashboardPage'
import UploadPage from './pages/app/UploadPage'
import ChatbotsPage from './pages/app/ChatbotsPage'
import TemplatesPage from './pages/app/TemplatesPage'
import SettingsPage from './pages/app/SettingsPage'
import BillingPage from './pages/app/BillingPage'
import AffiliatePage from './pages/app/AffiliatePage'
import HelpPage from './pages/app/HelpPage'
import PrivateRoute from './components/auth/PrivateRoute'
import { useAuth } from './contexts/AuthContext'
import AdminAutomacao from './pages/AdminAutomacao'
import PreviewProposta from './pages/PreviewProposta'
import ProtectedRouteMaster from './components/ProtectedRouteMaster'

function LandingPageWrapper() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const onNavigateToBI = () => {
    if (user) {
      navigate('/app/dashboard')
    } else {
      navigate('/login')
    }
  }

  const onNavigateToBotFactory = () => {
    if (user) {
      navigate('/app/chatbots')
    } else {
      navigate('/login')
    }
  }

  return (
    <LandingPage
      onNavigateToBI={onNavigateToBI}
      onNavigateToLogin={() => navigate('/login')}
      onNavigateToPrivacy={() => navigate('/privacidade')}
      onNavigateToTerms={() => navigate('/termos')}
      onNavigateToBotFactory={onNavigateToBotFactory}
      user={user as any}
      setUser={() => {}}
    />
  )
}

function SEOUpdater() {
  const location = useLocation()
  const titles: Record<string, string> = {
    '/': 'Foco em Dados | Inteligência Artificial e BI Analytics para Empresas',
    '/precos': 'Planos e Preços | Foco em Dados',
    '/login': 'Entrar | Foco em Dados',
    '/registrar': 'Criar Conta | Foco em Dados',
    '/privacidade': 'Política de Privacidade | Foco em Dados',
    '/termos': 'Termos de Serviço | Foco em Dados',
  }

  useEffect(() => {
    const path = location.pathname
    document.title = titles[path] || 'Foco em Dados'
  }, [location, titles])

  return null
}

export default function App() {
  return (
    <>
      <SEOUpdater />
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/precos" element={<Pricing />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/privacidade" element={<PrivacyPolicy onBack={() => window.history.back()} />} />
        <Route path="/termos" element={<TermsOfService onBack={() => window.history.back()} />} />

        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="chatbots" element={<ChatbotsPage />} />
          <Route path="templates" element={<TemplatesPage />} />
          <Route path="configuracoes" element={<SettingsPage />} />
          <Route path="faturamento" element={<BillingPage />} />
          <Route path="afiliado" element={<AffiliatePage />} />
          <Route path="ajuda" element={<HelpPage />} />
        </Route>

        <Route path="/bi" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="/fabrica-bots" element={<Navigate to="/app/chatbots" replace />} />
        <Route path="/painel-bi" element={<Navigate to="/app/dashboard" replace />} />

        <Route path="/preview/:id" element={<PreviewProposta />} />

        <Route
          path="/admin/automacao"
          element={
            <ProtectedRouteMaster>
              <AdminAutomacao />
            </ProtectedRouteMaster>
          }
        />

        <Route path="*" element={<NotFound onBack={() => window.history.back()} />} />
      </Routes>
    </>
  )
}
