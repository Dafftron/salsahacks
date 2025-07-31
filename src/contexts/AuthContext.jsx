import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChange,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword,
  createUserProfile,
  getUserProfile,
  updateUserProfile as firebaseUpdateUserProfile
} from '../services/firebase'
import { ROLES, hasPermission, getRolePermissions, hasPageAccess } from '../constants/roles'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  // Función para determinar el rol por defecto basado en el email
  const getDefaultRole = (email) => {
    // David como Super Administrador
    if (email === 'david_exile_92@hotmail.com') {
      return ROLES.SUPER_ADMIN
    }
    // Por defecto Pollito para otros usuarios
    return ROLES.POLLITO
  }

  // Función para actualizar automáticamente el rol de David si es necesario
  const updateDavidRole = async (profile) => {
    if (profile?.email === 'david_exile_92@hotmail.com' && profile?.role !== ROLES.SUPER_ADMIN) {
      try {
        await firebaseUpdateUserProfile(profile.uid, {
          role: ROLES.SUPER_ADMIN,
          permissions: getRolePermissions(ROLES.SUPER_ADMIN),
          updatedAt: new Date()
        })
        return { ...profile, role: ROLES.SUPER_ADMIN, permissions: getRolePermissions(ROLES.SUPER_ADMIN) }
      } catch (error) {
        console.error('Error al actualizar rol de David:', error)
      }
    }
    return profile
  }

  useEffect(() => {
    // Observar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Obtener perfil del usuario
        try {
          const { user: profile } = await getUserProfile(firebaseUser.uid)
          if (profile) {
            // Actualizar rol de David si es necesario
            const updatedProfile = await updateDavidRole(profile)
            setUserProfile(updatedProfile)
          }
        } catch (error) {
          console.log('Usuario nuevo, perfil no encontrado')
        }
      } else {
        setUser(null)
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const { user: firebaseUser, error } = await loginWithEmail(email, password)
      if (error) throw new Error(error)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const loginWithGoogleAuth = async () => {
    try {
      const { user: firebaseUser, error } = await loginWithGoogle()
      if (error) throw new Error(error)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // Función para crear usuario por invitación (solo Super Admin)
  const createUserByInvitation = async (email, password, displayName, role, username) => {
    try {
      // Verificar que el usuario actual es Super Admin
      if (!userProfile || userProfile.role !== ROLES.SUPER_ADMIN) {
        throw new Error('Solo el Super Administrador puede crear usuarios')
      }

      const { user: firebaseUser, error } = await registerWithEmail(email, password, displayName)
      if (error) throw new Error(error)
      
      // Crear perfil de usuario
      if (firebaseUser) {
        await createUserProfile(firebaseUser.uid, {
          displayName,
          email,
          role: role,
          username: username || displayName?.toLowerCase().replace(/\s+/g, ''),
          createdAt: new Date(),
          permissions: getRolePermissions(role),
          photoURL: firebaseUser.photoURL || null,
          invitedBy: userProfile.uid,
          invitationDate: new Date()
        })
      }
      
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await firebaseLogout()
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const resetUserPassword = async (email) => {
    try {
      const { error } = await resetPassword(email)
      if (error) throw new Error(error)
      return { success: true, error: null }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const updateUserProfile = async (profileData) => {
    try {
      if (!user?.uid) throw new Error('Usuario no autenticado')
      
      // Generar username automáticamente si no existe
      const updatedData = {
        ...profileData,
        username: profileData.username || profileData.displayName?.toLowerCase().replace(/\s+/g, ''),
        updatedAt: new Date()
      }
      
      // Actualizar en Firebase
      await firebaseUpdateUserProfile(user.uid, updatedData)
      
      // Actualizar estado local
      setUserProfile(prev => ({ ...prev, ...updatedData }))
      
      return { success: true, error: null }
    } catch (error) {
      console.error('Error al actualizar perfil:', error)
      return { success: false, error: error.message }
    }
  }

  // Función para obtener el username del usuario
  const getUserUsername = () => {
    return userProfile?.username || userProfile?.displayName?.toLowerCase().replace(/\s+/g, '') || 'usuario'
  }

  // Función para obtener la foto de perfil
  const getUserPhoto = () => {
    return userProfile?.photoURL || user?.photoURL || null
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle: loginWithGoogleAuth,
    createUserByInvitation,
    logout,
    resetPassword: resetUserPassword,
    updateUserProfile,
    getUserUsername,
    getUserPhoto,
    isAuthenticated: !!user,
    isSuperAdmin: userProfile?.role === ROLES.SUPER_ADMIN,
    isMaese: userProfile?.role === ROLES.MAESE,
    isUser: userProfile?.role === ROLES.USER,
    isPollito: userProfile?.role === ROLES.POLLITO,
    hasPermission: (permission) => hasPermission(userProfile?.role, permission),
    hasPageAccess: (pagePath) => hasPageAccess(userProfile?.role, pagePath),
    getRolePermissions: () => getRolePermissions(userProfile?.role)
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 