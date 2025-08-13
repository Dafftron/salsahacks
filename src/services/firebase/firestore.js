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
  serverTimestamp,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './config';

// Colecciones principales
const COLLECTIONS = {
  USERS: 'users',
  NOTES: 'notes',
  CATEGORIES: 'categories',
  EVENTS: 'events',
  FIGURES: 'figures',
  SCHOOL: 'school',
  INVITATIONS: 'invitations',
  VIDEOS: 'videos',
  ESCUELA_VIDEOS: 'escuela-videos',
  EVENTOS_VIDEOS: 'eventos-videos'
};

// Función para obtener la colección de videos según la página
const getVideosCollection = (page = 'figuras') => {
  switch(page) {
    case 'escuela':
      return COLLECTIONS.ESCUELA_VIDEOS;
    case 'eventos':
      return COLLECTIONS.EVENTOS_VIDEOS;
    case 'figuras':
    default:
      return COLLECTIONS.VIDEOS;
  }
};

// (Comentarios eliminados por solicitud)

// ===== USUARIOS =====
export const createUserProfile = async (userId, userData) => {
  try {
    console.log('📝 Creando perfil de usuario en Firestore:', userId)
    
    // Usar setDoc con el UID como ID del documento para evitar duplicados
    await setDoc(doc(db, COLLECTIONS.USERS, userId), {
      uid: userId,
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Perfil de usuario creado exitosamente en Firestore')
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Error al crear perfil de usuario:', error)
    return { success: false, error: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    console.log('🔍 Buscando perfil de usuario:', userId)
    
    // Usar getDoc directamente con el UID como ID del documento
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const userData = { id: docSnap.id, ...docSnap.data() };
      console.log('✅ Perfil de usuario encontrado:', userData)
      return { user: userData, error: null };
    }
    
    console.log('❌ Usuario no encontrado en Firestore')
    return { user: null, error: 'Usuario no encontrado' };
  } catch (error) {
    console.error('❌ Error al obtener perfil de usuario:', error)
    return { user: null, error: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    console.log('📝 Actualizando perfil de usuario:', userId, updates)
    
    // Usar updateDoc directamente con el UID como ID del documento
    const docRef = doc(db, COLLECTIONS.USERS, userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Perfil de usuario actualizado exitosamente')
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ Error al actualizar perfil de usuario:', error)
    return { success: false, error: error.message };
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

// Función para crear una invitación
export const createInvitation = async (invitationData) => {
  try {
    // Generar código único de invitación
    const invitationCode = generateInvitationCode()
    
    // Calcular fecha de expiración
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + invitationData.expiresInDays)
    
    const invitation = {
      code: invitationCode,
      email: invitationData.email,
      displayName: invitationData.displayName,
      username: invitationData.username,
      role: invitationData.role,
      createdBy: invitationData.createdBy,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
      status: 'pending', // pending, used, expired
      usedAt: null,
      usedBy: null
    }
    
    // Guardar en Firestore
    await setDoc(doc(db, 'invitations', invitationCode), invitation)
    
    return { 
      success: true, 
      invitationCode: invitationCode,
      invitation: invitation 
    }
  } catch (error) {
    console.error('Error creating invitation:', error)
    return { success: false, error: error.message }
  }
}

// Función para validar una invitación
export const validateInvitation = async (invitationCode) => {
  try {
    const invitationRef = doc(db, 'invitations', invitationCode)
    const invitationSnap = await getDoc(invitationRef)
    
    if (!invitationSnap.exists()) {
      return { success: false, error: 'Invitación no encontrada' }
    }
    
    const invitation = invitationSnap.data()
    
    // Verificar si ya fue usada
    if (invitation.status === 'used') {
      return { success: false, error: 'Esta invitación ya ha sido utilizada' }
    }
    
    // Verificar si ha expirado
    if (invitation.expiresAt && invitation.expiresAt.toDate() < new Date()) {
      return { success: false, error: 'Esta invitación ha expirado' }
    }
    
    return { 
      success: true, 
      invitation: invitation 
    }
  } catch (error) {
    console.error('Error validating invitation:', error)
    return { success: false, error: error.message }
  }
}

// Función para marcar invitación como usada
export const markInvitationAsUsed = async (invitationCode, userId) => {
  try {
    const invitationRef = doc(db, 'invitations', invitationCode)
    await updateDoc(invitationRef, {
      status: 'used',
      usedAt: serverTimestamp(),
      usedBy: userId
    })
    
    return { success: true }
  } catch (error) {
    console.error('Error marking invitation as used:', error)
    return { success: false, error: error.message }
  }
}

// Función para obtener invitaciones de un usuario
export const getUserInvitations = async (userId) => {
  try {
    const invitationsRef = collection(db, 'invitations')
    const q = query(
      invitationsRef,
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const invitations = []
    
    querySnapshot.forEach((doc) => {
      invitations.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    return { success: true, invitations }
  } catch (error) {
    console.error('Error getting user invitations:', error)
    return { success: false, error: error.message }
  }
}

// Función para eliminar una invitación
export const deleteInvitation = async (invitationCode) => {
  try {
    await deleteDoc(doc(db, 'invitations', invitationCode))
    return { success: true }
  } catch (error) {
    console.error('Error deleting invitation:', error)
    return { success: false, error: error.message }
  }
}

// Función auxiliar para generar código de invitación único
const generateInvitationCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let result = ''
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// ===== VIDEO MANAGEMENT FUNCTIONS =====

export const createVideoDocument = async (videoData, page = 'figuras') => {
  try {
    console.log(`📹 [DEBUG] Creando documento de video - Título: ${videoData.title}, Página: ${page}`)
    const videosCollection = getVideosCollection(page);
    console.log(`📂 [DEBUG] Colección de destino: ${videosCollection}`)
    console.log(`🎯 [DEBUG] Documento se guardará en: ${videosCollection}`)
    const videoRef = doc(collection(db, videosCollection))
    await setDoc(videoRef, {
      ...videoData,
      id: videoRef.id,

      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    console.log('✅ Documento de video creado exitosamente:', videoRef.id)
    return { success: true, id: videoRef.id, error: null }
  } catch (error) {
    console.error('❌ Error al crear documento de video:', error)
    return { success: false, error: error.message }
  }
}

// ===== BÚSQUEDA AVANZADA =====
export const searchVideos = async ({ text = '', style = 'todos', pages = ['figuras', 'escuela', 'eventos'], limitPerCollection = 50 } = {}) => {
  try {
    const normalizedText = (text || '').trim().toLowerCase()
    const targetPages = pages && pages.length > 0 ? pages : ['figuras', 'escuela']

    const queries = targetPages.map(async (pageKey) => {
      const collectionName = getVideosCollection(pageKey)
      try {
        const baseConstraints = []
        if (style && style !== 'todos') {
          baseConstraints.push(where('style', '==', style))
        }
        baseConstraints.push(orderBy('createdAt', 'desc'))
        baseConstraints.push(limit(limitPerCollection))

        const q = query(collection(db, collectionName), ...baseConstraints)
        const snap = await getDocs(q)
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), _page: pageKey }))
        return list
      } catch (error) {
        // Fallback si falta índice: quitar where y filtrar cliente
        if (String(error?.message || '').includes('index') || error.code === 'failed-precondition') {
          const q = query(collection(db, collectionName), orderBy('createdAt', 'desc'), limit(limitPerCollection))
          const snap = await getDocs(q)
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data(), _page: pageKey }))
          return style && style !== 'todos' ? list.filter(v => v.style === style) : list
        }
        console.error('❌ Error en búsqueda por colección:', collectionName, error)
        return []
      }
    })

    const resultsByPage = await Promise.all(queries)
    let results = resultsByPage.flat()

    if (normalizedText) {
      results = results.filter((v) => {
        const title = (v.title || v.originalTitle || '').toLowerCase()
        const description = (v.description || '').toLowerCase()
        // Búsqueda superficial en tags (si existen como objeto de arrays)
        const tagStrings = []
        if (v.tags && typeof v.tags === 'object') {
          Object.values(v.tags).forEach((arr) => {
            if (Array.isArray(arr)) tagStrings.push(...arr.map(String))
          })
        }
        const tagsJoined = tagStrings.join(' ').toLowerCase()
        return title.includes(normalizedText) || description.includes(normalizedText) || tagsJoined.includes(normalizedText)
      })
    }

    // Ordenar por fecha si está disponible
    results.sort((a, b) => {
      const aTime = a?.createdAt?.toMillis ? a.createdAt.toMillis() : 0
      const bTime = b?.createdAt?.toMillis ? b.createdAt.toMillis() : 0
      return bTime - aTime
    })

    return { success: true, results }
  } catch (error) {
    console.error('❌ Error en searchVideos:', error)
    return { success: false, results: [], error: error.message }
  }
}

export const getVideoDocument = async (videoId) => {
  try {
    console.log('🔍 Buscando video:', videoId)
    const docRef = doc(db, COLLECTIONS.VIDEOS, videoId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const videoData = { id: docSnap.id, ...docSnap.data() }
      console.log('✅ Video encontrado:', videoData.title)
      return { video: videoData, error: null }
    }
    console.log('❌ Video no encontrado en Firestore')
    return { video: null, error: 'Video no encontrado' }
  } catch (error) {
    console.error('❌ Error al obtener video:', error)
    return { video: null, error: error.message }
  }
}

export const updateVideoDocument = async (videoId, updates, page = 'figuras') => {
  try {
    console.log('📝 Actualizando video:', videoId, updates)
    const videosCollection = getVideosCollection(page);
    const docRef = doc(db, videosCollection, videoId)
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    })
    console.log('✅ Video actualizado exitosamente')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Error al actualizar video:', error)
    return { success: false, error: error.message }
  }
}



// ===== SISTEMA DE LIKES =====
export const toggleVideoLike = async (videoId, userId, page = 'figuras') => {
  try {
    console.log('❤️ Toggle like para video:', videoId, 'usuario:', userId)
    
    const videosCollection = getVideosCollection(page);
    const docRef = doc(db, videosCollection, videoId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Video no encontrado')
    }
    
    const videoData = docSnap.data()
    const likedBy = videoData.likedBy || []
    const currentLikes = videoData.likes || 0
    
    // Verificar si el usuario ya dio like
    const userLikedIndex = likedBy.indexOf(userId)
    let newLikedBy, newLikes
    
    if (userLikedIndex === -1) {
      // Usuario no ha dado like, agregarlo
      newLikedBy = [...likedBy, userId]
      newLikes = currentLikes + 1
      console.log('✅ Like agregado por usuario:', userId)
    } else {
      // Usuario ya dio like, removerlo
      newLikedBy = likedBy.filter(id => id !== userId)
      newLikes = currentLikes - 1
      console.log('✅ Like removido por usuario:', userId)
    }
    
    // Actualizar el documento del video
    await updateDoc(docRef, {
      likes: newLikes,
      likedBy: newLikedBy,
      updatedAt: serverTimestamp()
    })
    
    // También manejar favoritos automáticamente (comportamiento determinista)
    let favoriteResult = null
    try {
      if (userLikedIndex === -1) {
        // Si está dando like, asegurar que quede en favoritos
        favoriteResult = await setUserFavorite(videoId, userId, true)
        console.log('⭐ Video marcado como favorito automáticamente')
      } else {
        // Si está quitando like, asegurar que se quite de favoritos
        favoriteResult = await setUserFavorite(videoId, userId, false)
        console.log('⭐ Video removido de favoritos automáticamente')
      }
    } catch (favoriteError) {
      console.error('⚠️ Error al manejar favoritos automáticamente:', favoriteError)
      // No fallar si hay error en favoritos, solo en likes
    }
    
    console.log(`✅ Video actualizado: ${newLikes} likes, ${newLikedBy.length} usuarios`)
    return { 
      success: true, 
      likes: newLikes, 
      likedBy: newLikedBy, 
      userLiked: userLikedIndex === -1,
      isFavorite: favoriteResult?.isFavorite || false,
      error: null 
    }
  } catch (error) {
    console.error('❌ Error al toggle like:', error)
    return { success: false, error: error.message }
  }
}

export const checkUserLikedVideo = async (videoId, userId) => {
  try {
    const docRef = doc(db, COLLECTIONS.VIDEOS, videoId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return { userLiked: false, error: 'Video no encontrado' }
    }
    
    const videoData = docSnap.data()
    const likedBy = videoData.likedBy || []
    const userLiked = likedBy.includes(userId)
    
    return { userLiked, error: null }
  } catch (error) {
    console.error('❌ Error al verificar like del usuario:', error)
    return { userLiked: false, error: error.message }
  }
}

// ===== SISTEMA DE FAVORITOS POR USUARIO =====
export const toggleUserFavorite = async (videoId, userId) => {
  try {
    console.log('⭐ Toggle favorito para video:', videoId, 'usuario:', userId)
    
    // Obtener el perfil del usuario
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }
    
    const userData = userDocSnap.data()
    const favorites = userData.favorites || []
    
    // Verificar si el video ya está en favoritos
    const videoIndex = favorites.indexOf(videoId)
    let newFavorites
    
    if (videoIndex === -1) {
      // Video no está en favoritos, agregarlo
      newFavorites = [...favorites, videoId]
      console.log('✅ Video agregado a favoritos del usuario:', userId)
    } else {
      // Video ya está en favoritos, removerlo
      newFavorites = favorites.filter(id => id !== videoId)
      console.log('✅ Video removido de favoritos del usuario:', userId)
    }
    
    // Actualizar el perfil del usuario
    await updateDoc(userDocRef, {
      favorites: newFavorites,
      updatedAt: serverTimestamp()
    })
    
    console.log(`✅ Perfil de usuario actualizado: ${newFavorites.length} favoritos`)
    return { 
      success: true, 
      favorites: newFavorites, 
      isFavorite: videoIndex === -1,
      error: null 
    }
  } catch (error) {
    console.error('❌ Error al toggle favorito:', error)
    return { success: false, error: error.message }
  }
}

// Establecer favorito de forma determinista (sin toggle)
export const setUserFavorite = async (videoId, userId, shouldBeFavorite) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }

    const userData = userDocSnap.data()
    const favorites = userData.favorites || []

    const alreadyFavorite = favorites.includes(videoId)
    let newFavorites = favorites

    if (shouldBeFavorite && !alreadyFavorite) {
      newFavorites = [...favorites, videoId]
    } else if (!shouldBeFavorite && alreadyFavorite) {
      newFavorites = favorites.filter(id => id !== videoId)
    }

    if (newFavorites !== favorites) {
      await updateDoc(userDocRef, {
        favorites: newFavorites,
        updatedAt: serverTimestamp()
      })
    }

    return {
      success: true,
      favorites: newFavorites,
      isFavorite: shouldBeFavorite,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al establecer favorito:', error)
    return { success: false, error: error.message }
  }
}

export const checkUserFavorite = async (videoId, userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      return { isFavorite: false, error: 'Usuario no encontrado' }
    }
    
    const userData = userDocSnap.data()
    const favorites = userData.favorites || []
    const isFavorite = favorites.includes(videoId)
    
    return { isFavorite, error: null }
  } catch (error) {
    console.error('❌ Error al verificar favorito del usuario:', error)
    return { isFavorite: false, error: error.message }
  }
}

export const getUserFavorites = async (userId) => {
  try {
    console.log('🔍 Obteniendo favoritos del usuario:', userId)
    
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      return { favorites: [], error: 'Usuario no encontrado' }
    }
    
    const userData = userDocSnap.data()
    const favoriteIds = userData.favorites || []
    
    if (favoriteIds.length === 0) {
      return { favorites: [], error: null }
    }
    
    // Obtener los videos favoritos
    const videos = []
    for (const videoId of favoriteIds) {
      try {
        const videoDocRef = doc(db, COLLECTIONS.VIDEOS, videoId)
        const videoDocSnap = await getDoc(videoDocRef)
        
        if (videoDocSnap.exists()) {
          videos.push({ id: videoDocSnap.id, ...videoDocSnap.data() })
        }
      } catch (error) {
        console.error(`Error al obtener video ${videoId}:`, error)
      }
    }
    
    console.log(`✅ ${videos.length} favoritos encontrados para usuario: ${userId}`)
    return { favorites: videos, error: null }
  } catch (error) {
    console.error('❌ Error al obtener favoritos del usuario:', error)
    return { favorites: [], error: error.message }
  }
}

// ===== SISTEMA DE VIDEOS OCULTOS POR USUARIO =====
export const toggleUserHiddenVideo = async (videoId, userId) => {
  try {
    console.log('👁️ Toggle video oculto para video:', videoId, 'usuario:', userId)
    
    // Obtener el perfil del usuario
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }
    
    const userData = userDocSnap.data()
    const hiddenVideos = userData.hiddenVideos || []
    
    // Verificar si el video ya está oculto
    const videoIndex = hiddenVideos.indexOf(videoId)
    let newHiddenVideos
    
    if (videoIndex === -1) {
      // Video no está oculto, ocultarlo
      newHiddenVideos = [...hiddenVideos, videoId]
      console.log('✅ Video ocultado para el usuario:', userId)
    } else {
      // Video ya está oculto, mostrarlo
      newHiddenVideos = hiddenVideos.filter(id => id !== videoId)
      console.log('✅ Video mostrado para el usuario:', userId)
    }
    
    // Actualizar el perfil del usuario
    await updateDoc(userDocRef, {
      hiddenVideos: newHiddenVideos,
      updatedAt: serverTimestamp()
    })
    
    console.log(`✅ Perfil de usuario actualizado: ${newHiddenVideos.length} videos ocultos`)
    return { 
      success: true, 
      hiddenVideos: newHiddenVideos, 
      isHidden: videoIndex === -1,
      error: null 
    }
  } catch (error) {
    console.error('❌ Error al toggle video oculto:', error)
    return { success: false, error: error.message }
  }
}

export const checkUserHiddenVideo = async (videoId, userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      return { isHidden: false, error: 'Usuario no encontrado' }
    }
    
    const userData = userDocSnap.data()
    const hiddenVideos = userData.hiddenVideos || []
    const isHidden = hiddenVideos.includes(videoId)
    
    return { isHidden, error: null }
  } catch (error) {
    console.error('❌ Error al verificar video oculto del usuario:', error)
    return { isHidden: false, error: error.message }
  }
}

export const getUserHiddenVideos = async (userId) => {
  try {
    console.log('🔍 Obteniendo videos ocultos del usuario:', userId)
    
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    
    if (!userDocSnap.exists()) {
      return { hiddenVideos: [], error: 'Usuario no encontrado' }
    }
    
    const userData = userDocSnap.data()
    const hiddenVideoIds = userData.hiddenVideos || []
    
    if (hiddenVideoIds.length === 0) {
      return { hiddenVideos: [], error: null }
    }
    
    // Obtener los videos ocultos
    const videos = []
    for (const videoId of hiddenVideoIds) {
      try {
        // Buscar en todas las colecciones de videos
        const collections = [COLLECTIONS.VIDEOS, COLLECTIONS.ESCUELA_VIDEOS, COLLECTIONS.EVENTOS_VIDEOS]
        
        for (const collectionName of collections) {
          const videoDocRef = doc(db, collectionName, videoId)
          const videoDocSnap = await getDoc(videoDocRef)
          
          if (videoDocSnap.exists()) {
            videos.push({ 
              id: videoDocSnap.id, 
              ...videoDocSnap.data(),
              collection: collectionName 
            })
            break // Video encontrado, salir del bucle de colecciones
          }
        }
      } catch (error) {
        console.error(`Error al obtener video oculto ${videoId}:`, error)
      }
    }
    
    console.log(`✅ ${videos.length} videos ocultos encontrados para usuario: ${userId}`)
    return { hiddenVideos: videos, error: null }
  } catch (error) {
    console.error('❌ Error al obtener videos ocultos del usuario:', error)
    return { hiddenVideos: [], error: error.message }
  }
}

// ===== SISTEMA DE ESTUDIOS (to-study y completado) =====
export const toggleUserStudy = async (videoId, userId, page = 'figuras') => {
  try {
    console.log('📘 Toggle estudio para video:', videoId, 'usuario:', userId)
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }
    const userData = userDocSnap.data()
    const study = userData.study || []
    // Normalizar a objetos { id, page }
    const asObjects = study.map(item => typeof item === 'string' ? { id: item, page: 'figuras' } : item)
    const index = asObjects.findIndex(i => i?.id === videoId)
    let newStudy
    if (index === -1) {
      newStudy = [...asObjects, { id: videoId, page }]
      console.log('✅ Video agregado a estudio')
    } else {
      newStudy = asObjects.filter(i => i.id !== videoId)
      console.log('✅ Video removido de estudio')
    }
    await updateDoc(userDocRef, { study: newStudy, updatedAt: serverTimestamp() })
    return { success: true, isInStudy: index === -1, study: newStudy, error: null }
  } catch (error) {
    console.error('❌ Error al toggle estudio:', error)
    return { success: false, isInStudy: false, error: error.message }
  }
}

export const setUserStudyCompleted = async (videoId, userId, completed = true) => {
  try {
    console.log('✅ Marcar estudio completado:', completed, 'video:', videoId)
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }
    const userData = userDocSnap.data()
    const studyCompleted = userData.studyCompleted || []
    const has = studyCompleted.includes(videoId)
    let newCompleted
    if (completed && !has) newCompleted = [...studyCompleted, videoId]
    else if (!completed && has) newCompleted = studyCompleted.filter(id => id !== videoId)
    else newCompleted = studyCompleted
    await updateDoc(userDocRef, { studyCompleted: newCompleted, updatedAt: serverTimestamp() })
    return { success: true, isCompleted: completed, studyCompleted: newCompleted, error: null }
  } catch (error) {
    console.error('❌ Error al actualizar estado de estudio completado:', error)
    return { success: false, isCompleted: false, error: error.message }
  }
}

export const checkUserStudy = async (videoId, userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      return { isInStudy: false, error: 'Usuario no encontrado' }
    }
    const userData = userDocSnap.data()
    const study = userData.study || []
    const isInStudy = study.some(item => (typeof item === 'string' ? item === videoId : item?.id === videoId))
    return { isInStudy, error: null }
  } catch (error) {
    console.error('❌ Error al verificar estudio:', error)
    return { isInStudy: false, error: error.message }
  }
}

export const checkUserStudyCompleted = async (videoId, userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      return { isCompleted: false, error: 'Usuario no encontrado' }
    }
    const userData = userDocSnap.data()
    const studyCompleted = userData.studyCompleted || []
    return { isCompleted: studyCompleted.includes(videoId), error: null }
  } catch (error) {
    console.error('❌ Error al verificar estudio completado:', error)
    return { isCompleted: false, error: error.message }
  }
}

export const getUserStudy = async (userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      return { videos: [], error: 'Usuario no encontrado' }
    }
    const userData = userDocSnap.data()
    const studyItems = (userData.study || []).map(item => typeof item === 'string' ? { id: item, page: 'figuras' } : item)
    if (studyItems.length === 0) return { videos: [], error: null }
    const videos = []
    for (const it of studyItems) {
      try {
        const collectionName = it.page === 'escuela' ? COLLECTIONS.ESCUELA_VIDEOS : (it.page === 'eventos' ? COLLECTIONS.EVENTOS_VIDEOS : COLLECTIONS.VIDEOS)
        const videoDocRef = doc(db, collectionName, it.id)
        const videoDocSnap = await getDoc(videoDocRef)
        if (videoDocSnap.exists()) {
          videos.push({ id: videoDocSnap.id, ...videoDocSnap.data(), _page: it.page })
        }
      } catch (e) {}
    }
    return { videos, error: null }
  } catch (error) {
    return { videos: [], error: error.message }
  }
}

// ===== ÚLTIMO VIDEO VISTO =====
export const setUserLastWatched = async (userId, video, page = 'figuras') => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) {
      throw new Error('Usuario no encontrado')
    }
    const payload = {
      lastWatched: {
        id: video?.id,
        title: video?.title || video?.originalTitle || 'Video',
        thumbnailUrl: video?.thumbnailUrl || null,
        page,
        watchedAt: new Date()
      },
      updatedAt: serverTimestamp()
    }
    await updateDoc(userDocRef, payload)
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Error al guardar último visto:', error)
    return { success: false, error: error.message }
  }
}

export const getUserLastWatched = async (userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) return { lastWatched: null, error: 'Usuario no encontrado' }
    const data = userDocSnap.data()
    return { lastWatched: data?.lastWatched || null, error: null }
  } catch (error) {
    console.error('❌ Error al obtener último visto:', error)
    return { lastWatched: null, error: error.message }
  }
}

export const deleteVideoDocument = async (videoId, page = 'figuras') => {
  try {
    console.log('🗑️ Eliminando video de Firestore:', videoId)
    const videosCollection = getVideosCollection(page);
    console.log('📁 Colección:', videosCollection)
    
    const docRef = doc(db, videosCollection, videoId)
    console.log('📄 Referencia del documento:', docRef.path)
    
    try {
      await deleteDoc(docRef)
      console.log('✅ Video eliminado exitosamente de Firestore')
      return { success: true, error: null }
    } catch (err) {
      // Si el doc ya no existe, considerar eliminación lógica exitosa para desatascar UI
      if (err?.code === 'not-found' || /No document to update:/.test(String(err?.message))) {
        console.warn('⚠️ Documento ya no existe; se considera eliminado')
        return { success: true, error: null }
      }
      throw err
    }
  } catch (error) {
    console.error('❌ Error al eliminar video de Firestore:', error)
    console.error('❌ Código de error:', error.code)
    console.error('❌ Mensaje de error:', error.message)
    return { success: false, error: error.message }
  }
}

export const getVideosByCategory = async (category) => {
  try {
    console.log('🔍 Buscando videos por categoría:', category)
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const videos = []
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() })
    })
    console.log(`✅ ${videos.length} videos encontrados para categoría: ${category}`)
    return { videos, error: null }
  } catch (error) {
    console.error('❌ Error al obtener videos por categoría:', error)
    return { videos: [], error: error.message }
  }
}

export const getVideosByUser = async (userId) => {
  try {
    console.log('🔍 Buscando videos del usuario:', userId)
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      where('uploadedBy', '==', userId),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const videos = []
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() })
    })
    console.log(`✅ ${videos.length} videos encontrados del usuario: ${userId}`)
    return { videos, error: null }
  } catch (error) {
    console.error('❌ Error al obtener videos del usuario:', error)
    return { videos: [], error: error.message }
  }
}

export const checkVideoDuplicate = async (originalTitle, page = 'figuras') => {
  try {
    console.log('🔍 Verificando duplicado:', originalTitle, 'en página:', page)
    
    // Determinar la colección correcta según la página (usar el mismo mapeo que el resto del sistema)
    const videosCollection = getVideosCollection(page)
    
    const q = query(
      collection(db, videosCollection),
      where('originalTitle', '==', originalTitle)
    )
    const querySnapshot = await getDocs(q)
    const isDuplicate = !querySnapshot.empty
    console.log(`✅ Verificación de duplicado: ${isDuplicate ? 'SÍ' : 'NO'} en ${videosCollection}`)
    return { isDuplicate, error: null }
  } catch (error) {
    console.error('❌ Error al verificar duplicado:', error)
    return { isDuplicate: false, error: error.message }
  }
}

export const getVideos = async () => {
  try {
    console.log('🔍 Obteniendo todos los videos...')
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      orderBy('createdAt', 'desc')
    )
    const querySnapshot = await getDocs(q)
    const videos = []
    querySnapshot.forEach((doc) => {
      videos.push({ id: doc.id, ...doc.data() })
    })
    console.log(`✅ ${videos.length} videos obtenidos`)
    return videos
  } catch (error) {
    console.error('❌ Error al obtener videos:', error)
    return []
  }
}

// ===== CONSULTAS PARA DASHBOARD =====

export const getVideosCount = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.VIDEOS))
    const snap = await getDocs(q)
    return { count: snap.size, error: null }
  } catch (error) {
    return { count: 0, error: error.message }
  }
}

export const getEscuelaVideosCount = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.ESCUELA_VIDEOS))
    const snap = await getDocs(q)
    return { count: snap.size, error: null }
  } catch (error) {
    return { count: 0, error: error.message }
  }
}

export const getEventosVideosCount = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.EVENTOS_VIDEOS))
    const snap = await getDocs(q)
    return { count: snap.size, error: null }
  } catch (error) {
    return { count: 0, error: error.message }
  }
}

// Aliases para compatibilidad con código existente
export const getEventsCount = getEventosVideosCount
export const getSchoolContentCount = getEscuelaVideosCount

export const getUsersCount = async () => {
  try {
    const q = query(collection(db, COLLECTIONS.USERS))
    const snap = await getDocs(q)
    return { count: snap.size, error: null }
  } catch (error) {
    return { count: 0, error: error.message }
  }
}

export const getLatestVideos = async (limitCount = 8, page = 'figuras') => {
  try {
    const videosCollection = getVideosCollection(page)
    const q = query(
      collection(db, videosCollection),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    )
    const snap = await getDocs(q)
    return { videos: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
  } catch (error) {
    return { videos: [], error: error.message }
  }
}

export const getTopLikedVideos = async (limitCount = 8, page = 'figuras') => {
  try {
    const videosCollection = getVideosCollection(page)
    const q = query(
      collection(db, videosCollection),
      orderBy('likes', 'desc'),
      limit(limitCount)
    )
    const snap = await getDocs(q)
    return { videos: snap.docs.map(d => ({ id: d.id, ...d.data() })), error: null }
  } catch (error) {
    // Fallback: tomar últimos y ordenar en cliente
    try {
      const fallback = await getLatestVideos(50, page)
      const sorted = [...fallback.videos].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, limitCount)
      return { videos: sorted, error: null }
    } catch (e) {
      return { videos: [], error: error.message || String(e) }
    }
  }
}

export const getUserContinueStudy = async (userId) => {
  try {
    const userDocRef = doc(db, COLLECTIONS.USERS, userId)
    const userDocSnap = await getDoc(userDocRef)
    if (!userDocSnap.exists()) return { videos: [], error: 'Usuario no encontrado' }
    const userData = userDocSnap.data()
    const studyItems = (userData.study || []).map(item => typeof item === 'string' ? { id: item, page: 'figuras' } : item)
    const completed = new Set(userData.studyCompleted || [])
    const pending = studyItems.filter(it => !completed.has(it.id))
    if (pending.length === 0) return { videos: [], error: null }
    const videos = []
    for (const it of pending.slice(0, 12)) {
      try {
        const collectionName = it.page === 'escuela' ? COLLECTIONS.ESCUELA_VIDEOS : (it.page === 'eventos' ? COLLECTIONS.EVENTOS_VIDEOS : COLLECTIONS.VIDEOS)
        const vref = doc(db, collectionName, it.id)
        const vsnap = await getDoc(vref)
        if (vsnap.exists()) videos.push({ id: vsnap.id, ...vsnap.data(), _page: it.page })
      } catch (_) {}
    }
    return { videos, error: null }
  } catch (error) {
    return { videos: [], error: error.message }
  }
}

// ===== SINCRONIZACIÓN EN TIEMPO REAL =====

export const subscribeToVideos = (callback) => {
  try {
    console.log('🔄 Iniciando suscripción en tiempo real a videos...')
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      orderBy('createdAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videos = []
      snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() })
      })
      console.log(`🔄 Actualización en tiempo real: ${videos.length} videos`)
      callback(videos)
    }, (error) => {
      console.error('❌ Error en suscripción de videos:', error)
    })
    
    return unsubscribe
  } catch (error) {
    console.error('❌ Error al iniciar suscripción de videos:', error)
    return () => {}
  }
}

export const subscribeToVideosByStyle = (style, callback, page = 'figuras') => {
  try {
    console.log(`🔄 [DEBUG] Iniciando suscripción - Estilo: ${style}, Página: ${page}`)
    
    // Primero intentar con la consulta optimizada (requiere índice)
    const videosCollection = getVideosCollection(page);
    console.log(`📂 [DEBUG] Colección calculada: ${videosCollection}`)
    console.log(`📊 [DEBUG] COLLECTIONS.ESCUELA_VIDEOS = ${COLLECTIONS.ESCUELA_VIDEOS}`)
    console.log(`📊 [DEBUG] COLLECTIONS.VIDEOS = ${COLLECTIONS.VIDEOS}`);
    
    const q = query(
      collection(db, videosCollection),
      where('style', '==', style),
      orderBy('createdAt', 'desc')
    )
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videos = []
      snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() })
      })
      console.log(`🔄 Actualización en tiempo real para ${style}: ${videos.length} videos`)
      callback(videos)
    }, (error) => {
      console.error(`❌ Error en suscripción de videos de ${style}:`, error)
      
      // Si falla por falta de índice, usar consulta simple y filtrar en cliente
      if (error.code === 'failed-precondition' || error.message.includes('index')) {
        console.log(`⚠️ Usando fallback para ${style} (sin índice)`)
        
        const fallbackQuery = query(
          collection(db, videosCollection),
          orderBy('createdAt', 'desc')
        )
        
        const fallbackUnsubscribe = onSnapshot(fallbackQuery, (snapshot) => {
          const allVideos = []
          snapshot.forEach((doc) => {
            allVideos.push({ id: doc.id, ...doc.data() })
          })
          
          // Filtrar por estilo en el cliente (solo por el campo style)
          const filteredVideos = allVideos.filter(video => 
            video.style === style
          )
          
          console.log(`🔄 Fallback: ${filteredVideos.length} videos de ${style} de ${allVideos.length} total`)
          callback(filteredVideos)
        }, (fallbackError) => {
          console.error(`❌ Error en fallback para ${style}:`, fallbackError)
        })
        
        return fallbackUnsubscribe
      }
    })
    
    return unsubscribe
  } catch (error) {
    console.error(`❌ Error al iniciar suscripción de videos de ${style}:`, error)
    return () => {}
  }
}

// Suscripción por página (sin filtro por style) para casos como 'eventos'
export const subscribeToPageVideos = (page = 'figuras', callback) => {
  try {
    const videosCollection = getVideosCollection(page)
    const q = query(
      collection(db, videosCollection),
      orderBy('createdAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videos = []
      snapshot.forEach((doc) => {
        videos.push({ id: doc.id, ...doc.data() })
      })
      callback(videos)
    }, (error) => {
      console.error(`❌ Error en suscripción por página (${page}):`, error)
    })
    return unsubscribe
  } catch (error) {
    console.error('❌ Error al iniciar suscripción por página:', error)
    return () => {}
  }
}

// ===== FUNCIONES DE LIMPIEZA DE DATOS =====

export const deleteAllVideos = async () => {
  try {
    console.log('🗑️ Iniciando eliminación de todos los videos...')
    
    // Obtener todos los videos
    const videos = await getVideos()
    console.log(`📊 Videos a eliminar: ${videos.length}`)
    
    if (videos.length === 0) {
      console.log('✅ No hay videos para eliminar')
      return { success: true, deletedCount: 0, error: null }
    }
    
    // Eliminar documentos en lotes
    const batch = writeBatch(db)
    let deletedCount = 0
    
    videos.forEach((video) => {
      const videoRef = doc(db, COLLECTIONS.VIDEOS, video.id)
      batch.delete(videoRef)
      deletedCount++
    })
    
    await batch.commit()
    console.log(`✅ ${deletedCount} videos eliminados de Firestore`)
    
    return { success: true, deletedCount, error: null }
  } catch (error) {
    console.error('❌ Error al eliminar todos los videos:', error)
    return { success: false, deletedCount: 0, error: error.message }
  }
}

export const updateVideoThumbnailPaths = async () => {
  try {
    console.log('🔧 Iniciando actualización de rutas de thumbnails...')
    
    const videos = await getVideos()
    console.log(`📊 Videos a actualizar: ${videos.length}`)
    
    if (videos.length === 0) {
      console.log('✅ No hay videos para actualizar')
      return { success: true, updatedCount: 0, error: null }
    }
    
    const batch = writeBatch(db)
    let updatedCount = 0
    
    videos.forEach((video) => {
      // Si el video no tiene thumbnailPath o es incorrecto, intentar corregirlo
      if (!video.thumbnailPath || video.thumbnailPath === 'placeholder') {
        const videoRef = doc(db, COLLECTIONS.VIDEOS, video.id)
        batch.update(videoRef, {
          thumbnailPath: null, // Establecer como null para que se maneje en la eliminación
          updatedAt: serverTimestamp()
        })
        updatedCount++
      }
    })
    
    if (updatedCount > 0) {
      await batch.commit()
      console.log(`✅ ${updatedCount} videos actualizados`)
    } else {
      console.log('✅ No se requirieron actualizaciones')
    }
    
    return { success: true, updatedCount, error: null }
  } catch (error) {
    console.error('❌ Error al actualizar rutas de thumbnails:', error)
    return { success: false, updatedCount: 0, error: error.message }
  }
} 

// ===== FUNCIONES DE DIAGNÓSTICO =====

export const diagnoseVideos = async () => {
  try {
    console.log('🔍 Iniciando diagnóstico de videos...')
    
    // Obtener todos los videos sin filtros
    const allVideos = await getVideos()
    console.log(`📊 Total de videos en Firestore: ${allVideos.length}`)
    
    // Agrupar por estilo
    const videosByStyle = {}
    allVideos.forEach(video => {
      const style = video.style || 'sin-estilo'
      if (!videosByStyle[style]) {
        videosByStyle[style] = []
      }
      videosByStyle[style].push(video)
    })
    
    console.log('📊 Videos por estilo:', videosByStyle)
    
    // Verificar videos de salsa específicamente
    const salsaVideos = allVideos.filter(video => 
      video.style === 'salsa' || 
      (video.tags && video.tags.estilo && video.tags.estilo.includes('salsa'))
    )
    
    console.log(`📊 Videos de salsa encontrados: ${salsaVideos.length}`)
    salsaVideos.forEach(video => {
      console.log(`  - ${video.title} (ID: ${video.id}, Style: ${video.style})`)
    })
    
    // Buscar específicamente el video Fig003
    const fig003Video = allVideos.find(video => 
      video.originalTitle && video.originalTitle.includes('Fig003')
    )
    
    if (fig003Video) {
      console.log('🎯 Video Fig003 encontrado:', fig003Video)
    } else {
      console.log('❌ Video Fig003 NO encontrado en Firestore')
    }
    
    // Verificar videos sin resolución
    const videosWithoutResolution = allVideos.filter(video => 
      !video.resolution || video.resolution === 'Unknown'
    )
    
    console.log(`📊 Videos sin resolución: ${videosWithoutResolution.length}`)
    videosWithoutResolution.forEach(video => {
      console.log(`  - ${video.title} (ID: ${video.id})`)
    })
    
    return {
      success: true,
      totalVideos: allVideos.length,
      videosByStyle,
      salsaVideos: salsaVideos.length,
      fig003Found: !!fig003Video,
      fig003Video,
      videosWithoutResolution: videosWithoutResolution.length,
      error: null
    }
  } catch (error) {
    console.error('❌ Error en diagnóstico de videos:', error)
    return {
      success: false,
      totalVideos: 0,
      videosByStyle: {},
      salsaVideos: 0,
      fig003Found: false,
      fig003Video: null,
      videosWithoutResolution: 0,
      error: error.message
    }
  }
} 

// ===== FUNCIÓN PARA LIMPIAR TAGS DUPLICADOS =====

export const cleanupDuplicateTags = async () => {
  try {
    console.log('🧹 Iniciando limpieza de tags duplicados...')
    
    const videos = await getVideos()
    console.log(`📊 Videos a revisar: ${videos.length}`)
    
    if (videos.length === 0) {
      console.log('✅ No hay videos para revisar')
      return { success: true, updatedCount: 0, error: null }
    }
    
    const batch = writeBatch(db)
    let updatedCount = 0
    
    videos.forEach((video) => {
      let hasChanges = false
      const updatedTags = {}
      const updatedTagsIniciales = {}
      const updatedTagsFinales = {}
      
      // Limpiar tags normales
      if (video.tags) {
        Object.keys(video.tags).forEach(category => {
          if (Array.isArray(video.tags[category])) {
            // Eliminar duplicados manteniendo el orden
            const uniqueTags = [...new Set(video.tags[category])]
            if (uniqueTags.length !== video.tags[category].length) {
              updatedTags[category] = uniqueTags
              hasChanges = true
              console.log(`🔄 ${video.title}: Eliminados ${video.tags[category].length - uniqueTags.length} tags duplicados en ${category}`)
            }
          }
        })
      }
      
      // Limpiar tags iniciales
      if (video.tagsIniciales) {
        Object.keys(video.tagsIniciales).forEach(category => {
          if (Array.isArray(video.tagsIniciales[category])) {
            const uniqueTags = [...new Set(video.tagsIniciales[category])]
            if (uniqueTags.length !== video.tagsIniciales[category].length) {
              updatedTagsIniciales[category] = uniqueTags
              hasChanges = true
              console.log(`🔄 ${video.title}: Eliminados ${video.tagsIniciales[category].length - uniqueTags.length} tags iniciales duplicados en ${category}`)
            }
          }
        })
      }
      
      // Limpiar tags finales
      if (video.tagsFinales) {
        Object.keys(video.tagsFinales).forEach(category => {
          if (Array.isArray(video.tagsFinales[category])) {
            const uniqueTags = [...new Set(video.tagsFinales[category])]
            if (uniqueTags.length !== video.tagsFinales[category].length) {
              updatedTagsFinales[category] = uniqueTags
              hasChanges = true
              console.log(`🔄 ${video.title}: Eliminados ${video.tagsFinales[category].length - uniqueTags.length} tags finales duplicados en ${category}`)
            }
          }
        })
      }
      
      if (hasChanges) {
        const videoRef = doc(db, COLLECTIONS.VIDEOS, video.id)
        const updates = {
          updatedAt: serverTimestamp()
        }
        
        if (Object.keys(updatedTags).length > 0) {
          updates.tags = { ...video.tags, ...updatedTags }
        }
        if (Object.keys(updatedTagsIniciales).length > 0) {
          updates.tagsIniciales = { ...video.tagsIniciales, ...updatedTagsIniciales }
        }
        if (Object.keys(updatedTagsFinales).length > 0) {
          updates.tagsFinales = { ...video.tagsFinales, ...updatedTagsFinales }
        }
        
        batch.update(videoRef, updates)
        updatedCount++
      }
    })
    
    if (updatedCount > 0) {
      await batch.commit()
      console.log(`✅ ${updatedCount} videos actualizados con tags limpios`)
    } else {
      console.log('✅ No se encontraron tags duplicados')
    }
    
    return { success: true, updatedCount, error: null }
  } catch (error) {
    console.error('❌ Error al limpiar tags duplicados:', error)
    return { success: false, updatedCount: 0, error: error.message }
  }
} 