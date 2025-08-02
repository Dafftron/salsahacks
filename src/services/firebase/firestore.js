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
  VIDEOS: 'videos'
};

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

export const createVideoDocument = async (videoData) => {
  try {
    console.log('📹 Creando documento de video en Firestore:', videoData.title)
    const videoRef = doc(collection(db, COLLECTIONS.VIDEOS))
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

export const updateVideoDocument = async (videoId, updates) => {
  try {
    console.log('📝 Actualizando video:', videoId, updates)
    const docRef = doc(db, COLLECTIONS.VIDEOS, videoId)
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

export const deleteVideoDocument = async (videoId) => {
  try {
    console.log('🗑️ Eliminando video:', videoId)
    await deleteDoc(doc(db, COLLECTIONS.VIDEOS, videoId))
    console.log('✅ Video eliminado exitosamente')
    return { success: true, error: null }
  } catch (error) {
    console.error('❌ Error al eliminar video:', error)
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

export const checkVideoDuplicate = async (originalTitle) => {
  try {
    console.log('🔍 Verificando duplicado:', originalTitle)
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      where('originalTitle', '==', originalTitle)
    )
    const querySnapshot = await getDocs(q)
    const isDuplicate = !querySnapshot.empty
    console.log(`✅ Verificación de duplicado: ${isDuplicate ? 'SÍ' : 'NO'}`)
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
      orderBy('uploadedAt', 'desc')
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

// ===== SINCRONIZACIÓN EN TIEMPO REAL =====

export const subscribeToVideos = (callback) => {
  try {
    console.log('🔄 Iniciando suscripción en tiempo real a videos...')
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      orderBy('uploadedAt', 'desc')
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

export const subscribeToVideosByStyle = (style, callback) => {
  try {
    console.log(`🔄 Iniciando suscripción en tiempo real a videos de estilo: ${style}`)
    
    // Primero intentar con la consulta optimizada (requiere índice)
    const q = query(
      collection(db, COLLECTIONS.VIDEOS),
      where('style', '==', style),
      orderBy('uploadedAt', 'desc')
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
          collection(db, COLLECTIONS.VIDEOS),
          orderBy('uploadedAt', 'desc')
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
    
    return {
      success: true,
      totalVideos: allVideos.length,
      videosByStyle,
      salsaVideos: salsaVideos.length,
      fig003Found: !!fig003Video,
      fig003Video,
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
      error: error.message
    }
  }
} 