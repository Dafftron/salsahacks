import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import { SequenceBuilderProvider } from './contexts/SequenceBuilderContext'
import { CardSizeProvider } from './contexts/CardSizeContext'
import Navigation from './components/layout/Navigation'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { ROLES } from './constants/roles'

// Lazy loading de páginas para Code Splitting
const HomePage = lazy(() => import('./pages/HomePage'))
const NotasPage = lazy(() => import('./pages/NotasPage'))
const CategoriesPage = lazy(() => import('./pages/CategoriesPage'))
const FigurasPage = lazy(() => import('./pages/FigurasPage'))
const EscuelaPage = lazy(() => import('./pages/EscuelaPage'))
// const EventosPage = lazy(() => import('./pages/EventosPage')) // TEMPORAL - Recrearemos después
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
  const isEscuelaPage = location.pathname === '/escuela'
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-salsa-light to-white">
      <Navigation />
      <main className={isFigurasPage || isEscuelaPage ? 'w-full' : 'container mx-auto px-4 py-8'}>
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/invite/:invitationCode" element={<InvitePage />} />
            
            {/* Rutas protegidas - requieren autenticación */}
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } />
            <Route path="/notas" element={
              <ProtectedRoute>
                <NotasPage />
              </ProtectedRoute>
            } />
            <Route path="/categorias" element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            } />
            <Route path="/figuras" element={
              <ProtectedRoute>
                <FigurasPage />
              </ProtectedRoute>
            } />
            <Route path="/escuela" element={
              <ProtectedRoute>
                <EscuelaPage />
              </ProtectedRoute>
            } />
            {/* <Route path="/eventos" element={<EventosPage />} /> */} {/* TEMPORAL - Recrearemos después */}
            
            {/* Ruta de administración - requiere rol específico */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole={ROLES.SUPER_ADMIN}>
                <AdminPage />
              </ProtectedRoute>
            } />
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