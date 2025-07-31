import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider } from './contexts/AuthContext'
import Navigation from './components/layout/Navigation'
import HomePage from './pages/HomePage'
import NotasPage from './pages/NotasPage'
import CategoriesPage from './pages/CategoriesPage'
import FigurasPage from './pages/FigurasPage'
import EscuelaPage from './pages/EscuelaPage'
import EventosPage from './pages/EventosPage'
import AdminPage from './pages/AdminPage'
import AuthPage from './pages/AuthPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
                             <div className="min-h-screen bg-gradient-to-br from-pink-50 via-salsa-light to-white">
            <Navigation />
            <main className="container mx-auto px-4 py-8">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notas" element={<NotasPage />} />
                <Route path="/categorias" element={<CategoriesPage />} />
                <Route path="/figuras" element={<FigurasPage />} />
                <Route path="/escuela" element={<EscuelaPage />} />
                <Route path="/eventos" element={<EventosPage />} />
                <Route path="/admin" element={<AdminPage />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App 