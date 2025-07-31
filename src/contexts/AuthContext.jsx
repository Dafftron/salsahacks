import { createContext, useContext, useState, useEffect } from 'react'
import {
  onAuthStateChange,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  logout as firebaseLogout,
  resetPassword,
  createUserProfile,
  getUserProfile
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

  useEffect(() => {
    // Observar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        
        // Obtener perfil del usuario
        try {
          const { user: profile } = await getUserProfile(firebaseUser.uid)
          setUserProfile(profile)
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

  const register = async (email, password, displayName, role = ROLES.USER) => {
    try {
      const { user: firebaseUser, error } = await registerWithEmail(email, password, displayName)
      if (error) throw new Error(error)
      
      // Crear perfil de usuario
      if (firebaseUser) {
        await createUserProfile(firebaseUser.uid, {
          displayName,
          email,
          role: role,
          createdAt: new Date(),
          permissions: getRolePermissions(role)
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

  const updateUserProfile = (profileData) => {
    setUserProfile(profileData)
  }

  const value = {
    user,
    userProfile,
    loading,
    login,
    loginWithGoogle: loginWithGoogleAuth,
    register,
    logout,
    resetPassword: resetUserPassword,
    updateUserProfile,
    isAuthenticated: !!user,
    isAdmin: userProfile?.role === ROLES.ADMIN,
    isInstructor: userProfile?.role === ROLES.INSTRUCTOR,
    isPremium: userProfile?.role === ROLES.PREMIUM,
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