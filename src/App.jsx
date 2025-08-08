import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { SequenceBuilderProvider } from './contexts/SequenceBuilderContext'
import { CardSizeProvider } from './contexts/CardSizeContext'
import Navigation from './components/layout/Navigation'

// Lazy loading de páginas para Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const NotasPage = lazy(() => import('./pages/NotasPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const FigurasPage = lazy(() => import('./pages/FigurasPage'))
const EscuelaPage = lazy(() => import('./pages/EscuelaPage'))
const EventosPage = lazy(() => import('./pages/EventosPage'))
const AdminPage = lazy(() => import('./pages/AdminPage'))
const AuthPage = lazy(() => import('./pages/AuthPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const InvitePage = lazy(() => import('./pages/InvitePage'))

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
  </div>
)

// Componente wrapper para manejar el layout dinámico
function AppContent() {
  const location = useLocation()
  const isFigurasPage = location.pathname === '/figuras'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-salsa-light to-white">
      <Navigation />
      <main className={isFigurasPage ? 'w-full' : 'container mx-auto px-4 py-8'}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/invite/:invitationCode" element={<InvitePage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/notas" element={<NotasPage />} />
            <Route path="/categorias" element={<CategoriesPage />} />
            <Route path="/figuras" element={<FigurasPage />} />
            <Route path="/escuela" element={<EscuelaPage />} />
            <Route path="/eventos" element={<EventosPage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SequenceBuilderProvider>
          <CardSizeProvider>
            <Router>
              <AppContent />
            </Router>
          </CardSizeProvider>
        </SequenceBuilderProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 