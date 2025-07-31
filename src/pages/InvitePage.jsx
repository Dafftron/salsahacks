import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle, Shield, Crown, ArrowRight } from 'lucide-react'
import { ROLE_LABELS, ROLE_COLORS } from '../constants/roles'

const InvitePage = () => {
  const { invitationCode } = useParams()
  const navigate = useNavigate()
  const { validateInvitation, createUserByInvitation } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [validating, setValidating] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [invitation, setInvitation] = useState(null)
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    validateInvitationCode()
  }, [invitationCode])

  const validateInvitationCode = async () => {
    try {
      const result = await validateInvitation(invitationCode)
      if (result.success) {
        setInvitation(result.invitation)
        setMessage({ type: '', text: '' })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al validar la invitación' })
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setValidating(true)
    setMessage({ type: '', text: '' })

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' })
      setValidating(false)
      return
    }

    if (formData.password.length < 6) {
      setMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' })
      setValidating(false)
      return
    }

    try {
      const result = await createUserByInvitation(invitationCode, formData.password)
      
      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: '¡Cuenta creada exitosamente! Redirigiendo...' 
        })
        
        // Redirigir al login después de 2 segundos
        setTimeout(() => {
          navigate('/auth')
        }, 2000)
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setValidating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Validando invitación...</p>
        </div>
      </div>
    )
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Invitación Inválida
            </h2>
            <p className="text-gray-600 mb-6">
              {message.text || 'Esta invitación no es válida o ha expirado'}
            </p>
            <button
              onClick={() => navigate('/auth')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-200"
            >
              Ir al Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Crown className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Bienvenido a SalsaHacks!
          </h2>
          <p className="text-gray-600">
            Completa tu registro para acceder a la plataforma
          </p>
        </div>

        {/* Invitation Info */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-8 w-8 text-blue-600" />
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{invitation.displayName}</h3>
              <p className="text-sm text-gray-500">{invitation.email}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[invitation.role] || 'bg-gray-500 text-white'}`}>
              {ROLE_LABELS[invitation.role] || invitation.role}
            </span>
          </div>
          
          <div className="text-xs text-gray-500">
            <p>Usuario: <strong>{invitation.username}</strong></p>
            <p>Expira: <strong>{invitation.expiresAt?.toDate?.()?.toLocaleDateString('es-ES') || 'Próximamente'}</strong></p>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`p-4 rounded-lg flex items-center space-x-2 ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={validating}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {validating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creando cuenta...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>Crear Cuenta</span>
                <ArrowRight className="h-4 w-4" />
              </div>
            )}
          </button>
        </form>

        {/* Info */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Al crear tu cuenta, aceptas los términos y condiciones de SalsaHacks
          </p>
        </div>
      </div>
    </div>
  )
}

export default InvitePage 