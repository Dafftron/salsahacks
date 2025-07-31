// Servicios de Firestore
import { 
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Colecciones principales
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  CATEGORIES: 'categories',
  EVENTS: 'events',
  FIGURES: 'figures',
  SCHOOL: 'school'
};

// ===== USUARIOS =====
export const createUserProfile = async (userId, userData) => {
  try {
    await addDoc(collection(db, COLLECTIONS.USERS), {
      uid: userId,
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS), where('uid', '==', userId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { user: { id: doc.id, ...doc.data() }, error: null };
    }
    
    return { user: null, error: 'Usuario no encontrado' };
  } catch (error) {
    return { user: null, error: error.message };
  }
};

// ===== NOTAS =====
export const createNote = async (noteData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTES), {
      ...noteData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getNotes = async (userId) => {
  try {
    const q = query(
      collection(db, COLLECTIONS.NOTES),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const notes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { notes, error: null };
  } catch (error) {
    return { notes: [], error: error.message };
  }
};

export const updateNote = async (noteId, updates) => {
  try {
    const noteRef = doc(db, COLLECTIONS.NOTES, noteId);
    await updateDoc(noteRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

export const deleteNote = async (noteId) => {
  try {
    await deleteDoc(doc(db, COLLECTIONS.NOTES, noteId));
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// ===== CATEGORÍAS =====
export const getCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.CATEGORIES));
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { categories, error: null };
  } catch (error) {
    return { categories: [], error: error.message };
  }
};

// ===== EVENTOS =====
export const createEvent = async (eventData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
      ...eventData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getEvents = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.EVENTS),
      orderBy('date', 'asc')
    );
    const querySnapshot = await getDocs(q);
    
    const events = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { events, error: null };
  } catch (error) {
    return { events: [], error: error.message };
  }
};

// ===== FIGURAS =====
export const createFigure = async (figureData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.FIGURES), {
      ...figureData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getFigures = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTIONS.FIGURES));
    const figures = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    return { figures, error: null };
  } catch (error) {
    return { figures: [], error: error.message };
  }
};

// ===== ESCUELA =====
export const createSchoolContent = async (contentData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTIONS.SCHOOL), {
      ...contentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, error: null };
  } catch (error) {
    return { id: null, error: error.message };
  }
};

export const getSchoolContent = async () => {
  try {
    const q = query(
      collection(db, COLLECTIONS.SCHOOL),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const content = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { content, error: null };
  } catch (error) {
    return { content: [], error: error.message };
  }
};

// ===== LISTENERS EN TIEMPO REAL =====
export const subscribeToNotes = (userId, callback) => {
  const q = query(
    collection(db, COLLECTIONS.NOTES),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(notes);
  });
};

export const subscribeToEvents = (callback) => {
  const q = query(
    collection(db, COLLECTIONS.EVENTS),
    orderBy('date', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(events);
  });
}; 