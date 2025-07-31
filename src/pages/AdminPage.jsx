import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Mail, Shield, Plus, Trash2, Edit, Crown, Users, Key, Link, Copy, Check } from 'lucide-react'
import { ROLES, ROLE_LABELS, ROLE_COLORS } from '../constants/roles'

const AdminPage = () => {
  const { userProfile, isSuperAdmin, hasPermission, createInvitation } = useAuth()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [users, setUsers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [copiedInvitation, setCopiedInvitation] = useState(null)
  
  const [inviteForm, setInviteForm] = useState({
    email: '',
    displayName: '',
    username: '',
    role: ROLES.POLLITO,
    expiresIn: '7' // días
  })

  // Verificar acceso
  if (!isSuperAdmin && !hasPermission('MANAGE_USERS')) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder a esta página</p>
        </div>
      </div>
    )
  }

  const handleInputChange = (e) => {
    setInviteForm({
      ...inviteForm,
      [e.target.name]: e.target.value
    })
  }

  const handleCreateInvitation = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const result = await createInvitation(
        inviteForm.email,
        inviteForm.displayName,
        inviteForm.role,
        inviteForm.username,
        parseInt(inviteForm.expiresIn)
      )

      if (result.success) {
        // Agregar invitación a la lista local
        const newInvitation = {
          id: Date.now(),
          ...inviteForm,
          invitationCode: result.invitationCode,
          invitationUrl: result.invitationUrl,
          createdAt: new Date(),
          status: 'pending',
          expiresAt: new Date(Date.now() + parseInt(inviteForm.expiresIn) * 24 * 60 * 60 * 1000)
        }
        
        setInvitations(prev => [...prev, newInvitation])
        setInviteForm({
          email: '',
          displayName: '',
          username: '',
          role: ROLES.POLLITO,
          expiresIn: '7'
        })
        
        setMessage({ 
          type: 'success', 
          text: `Invitación creada exitosamente para ${inviteForm.displayName} con rol de ${ROLE_LABELS[inviteForm.role]}` 
        })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyInvitation = async (invitationUrl) => {
    try {
      await navigator.clipboard.writeText(invitationUrl)
      setCopiedInvitation(invitationUrl)
      setTimeout(() => setCopiedInvitation(null), 2000)
    } catch (error) {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea')
      textArea.value = invitationUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopiedInvitation(invitationUrl)
      setTimeout(() => setCopiedInvitation(null), 2000)
    }
  }

  const handleDeleteInvitation = (invitationId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta invitación?')) {
      setInvitations(prev => prev.filter(inv => inv.id !== invitationId))
      setMessage({ type: 'success', text: 'Invitación eliminada exitosamente' })
    }
  }

  const formatExpiryDate = (date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isExpired = (expiresAt) => {
    return new Date(expiresAt) < new Date()
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel de Administración</h1>
        <p className="text-gray-600">Gestiona usuarios y permisos del sistema</p>
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center space-x-2 mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <span className="text-sm font-medium">{message.text}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Create Invitation Form */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Link className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Crear Invitación</h2>
          </div>

          <form onSubmit={handleCreateInvitation} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={inviteForm.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="usuario@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={inviteForm.displayName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Nombre completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={inviteForm.username}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="nombreusuario"
                  pattern="[a-zA-Z0-9_]+"
                  title="Solo letras, números y guiones bajos"
                />
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                Rol
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  name="role"
                  value={inviteForm.role}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value={ROLES.POLLITO}>Pollito (Nivel 1)</option>
                  <option value={ROLES.USER}>Soldado (Nivel 2)</option>
                  <option value={ROLES.MAESE}>Maese (Nivel 3)</option>
                  {isSuperAdmin && <option value={ROLES.SUPER_ADMIN}>Super Administrador (Nivel 4)</option>}
                </select>
              </div>
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[inviteForm.role] || 'bg-gray-500 text-white'}`}>
                  <Shield className="h-3 w-3 mr-1" />
                  {ROLE_LABELS[inviteForm.role] || inviteForm.role}
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="expiresIn" className="block text-sm font-medium text-gray-700 mb-1">
                Expira en (días)
              </label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="expiresIn"
                  name="expiresIn"
                  value={inviteForm.expiresIn}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white"
                >
                  <option value="1">1 día</option>
                  <option value="3">3 días</option>
                  <option value="7">7 días</option>
                  <option value="14">14 días</option>
                  <option value="30">30 días</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link className="h-4 w-4" />
                  <span>Crear Invitación</span>
                </div>
              )}
            </button>
          </form>
        </div>

        {/* Invitations List */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Link className="h-6 w-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-800">Invitaciones Activas</h2>
          </div>

          <div className="space-y-4">
            {invitations.length === 0 ? (
              <div className="text-center py-8">
                <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay invitaciones creadas aún</p>
                <p className="text-sm text-gray-400">Las invitaciones que crees aparecerán aquí</p>
              </div>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className={`p-4 border rounded-lg ${isExpired(invitation.expiresAt) ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{invitation.displayName}</p>
                        <p className="text-sm text-gray-500">{invitation.email}</p>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${ROLE_COLORS[invitation.role] || 'bg-gray-500 text-white'}`}>
                          <Shield className="h-3 w-3 mr-1" />
                          {ROLE_LABELS[invitation.role] || invitation.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleCopyInvitation(invitation.invitationUrl)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Copiar enlace de invitación"
                      >
                        {copiedInvitation === invitation.invitationUrl ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteInvitation(invitation.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar invitación"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-600 mb-2">
                      <strong>Enlace de invitación:</strong>
                    </p>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={invitation.invitationUrl}
                        readOnly
                        className="flex-1 text-xs bg-white border border-gray-300 rounded px-2 py-1"
                      />
                      <button
                        onClick={() => handleCopyInvitation(invitation.invitationUrl)}
                        className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition-colors"
                      >
                        {copiedInvitation === invitation.invitationUrl ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Expira: {formatExpiryDate(invitation.expiresAt)}
                      {isExpired(invitation.expiresAt) && (
                        <span className="text-red-500 ml-2">(Expirada)</span>
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Admin Info */}
      <div className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Crown className="h-8 w-8 text-purple-600" />
          <div>
            <h3 className="text-lg font-semibold text-purple-800">Sistema de Invitaciones</h3>
            <p className="text-sm text-purple-600">
              Crea invitaciones únicas que puedes compartir por WhatsApp, email o cualquier medio. 
              Cada invitación tiene un enlace único y expira automáticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPage 