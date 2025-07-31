// Exportaciones principales de Firebase
export { default as app } from './config';
export { auth } from './config';

// Auth functions
export { 
  onAuthStateChange, 
  loginWithEmail, 
  loginWithGoogle, 
  registerWithEmail, 
  logout, 
  resetPassword 
} from './auth'

// Firestore functions
export { 
  createUserProfile, 
  getUserProfile, 
  updateUserProfile,
  createInvitation,
  validateInvitation,
  markInvitationAsUsed,
  getUserInvitations,
  deleteInvitation
} from './firestore'

// Storage functions
export { uploadFile, getFileURL, deleteFile } from './storage' 