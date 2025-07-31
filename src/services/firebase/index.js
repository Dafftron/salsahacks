// Exportaciones principales de Firebase
export { default as app } from './config';
export { auth } from './config';

// Servicios de autenticación
export {
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  logout,
  resetPassword,
  onAuthStateChange,
  getCurrentUser
} from './auth';

// Servicios de Firestore
export {
  createUserProfile,
  getUserProfile,
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  getCategories,
  createEvent,
  getEvents,
  createFigure,
  getFigures,
  createSchoolContent,
  getSchoolContent,
  subscribeToNotes,
  subscribeToEvents
} from './firestore';

// Servicios de Storage
export {
  uploadFile,
  uploadImage,
  getFileURL,
  deleteFile,
  listFiles,
  uploadProfileImage,
  uploadNoteImage,
  uploadEventImage,
  uploadFigureImage,
  uploadVideo,
  uploadFigureVideo
} from './storage'; 