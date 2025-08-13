// 🎬 SERVICIOS DE FIREBASE PARA SECUENCIAS - SALSAHACKS V2.0

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './config'

// Colecciones de secuencias
const SEQUENCES_COLLECTIONS = {
  FIGURAS: 'sequences',
  ESCUELA: 'escuela-sequences',
  EVENTOS: 'eventos-sequences',
  MUSICA: 'musica-sequences'
};

// Función para obtener la colección de secuencias según la página
 const getSequencesCollection = (page = 'figuras') => {
  switch(page) {
    case 'escuela':
      return SEQUENCES_COLLECTIONS.ESCUELA;
    case 'eventos':
      return SEQUENCES_COLLECTIONS.EVENTOS;
    case 'musica':
      return SEQUENCES_COLLECTIONS.MUSICA;
    case 'figuras':
    default:
      return SEQUENCES_COLLECTIONS.FIGURAS;
  }
};

// Crear una nueva secuencia
export const createSequence = async (sequenceData, page = 'figuras') => {
  console.log('🔥 Firebase: Creando secuencia...')
  console.log('📦 Datos de secuencia:', sequenceData)
  
  try {
    const sequenceWithTimestamp = {
      ...sequenceData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    console.log('⏰ Secuencia con timestamps:', sequenceWithTimestamp)
    const sequencesCollection = getSequencesCollection(page);
    console.log(`📂 Usando colección: ${sequencesCollection} para página: ${page}`);
    const docRef = await addDoc(collection(db, sequencesCollection), sequenceWithTimestamp)
    console.log('📄 Documento creado con ID:', docRef.id)
    
    const result = {
      id: docRef.id,
      ...sequenceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    console.log('✅ Secuencia creada exitosamente:', result)
    return result
  } catch (error) {
    console.error('❌ Error al crear secuencia:', error)
    throw new Error('No se pudo crear la secuencia')
  }
}

// Obtener todas las secuencias
export const getSequences = async (page = 'figuras') => {
  try {
    const sequencesCollection = getSequencesCollection(page);
    const q = query(
      collection(db, sequencesCollection),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const sequences = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      sequences.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      })
    })
    
    return sequences
  } catch (error) {
    console.error('Error al obtener secuencias:', error)
    throw new Error('No se pudieron obtener las secuencias')
  }
}

// Obtener secuencias por estilo
export const getSequencesByStyle = async (style) => {
  try {
    const q = query(
      collection(db, SEQUENCES_COLLECTION),
      where('style', '==', style),
      orderBy('createdAt', 'desc')
    )
    
    const querySnapshot = await getDocs(q)
    const sequences = []
    
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      sequences.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
      })
    })
    
    return sequences
  } catch (error) {
    console.error('Error al obtener secuencias por estilo:', error)
    throw new Error('No se pudieron obtener las secuencias')
  }
}

// Actualizar una secuencia
export const updateSequence = async (sequenceId, updateData) => {
  try {
    const sequenceRef = doc(db, SEQUENCES_COLLECTION, sequenceId)
    const updateWithTimestamp = {
      ...updateData,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(sequenceRef, updateWithTimestamp)
    
    return {
      id: sequenceId,
      ...updateData,
      updatedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error al actualizar secuencia:', error)
    throw new Error('No se pudo actualizar la secuencia')
  }
}

// Eliminar una secuencia (por ID) en la colección correspondiente a la página
export const deleteSequence = async (sequenceId, page = 'figuras') => {
  try {
    const sequencesCollection = getSequencesCollection(page)
    const sequenceRef = doc(db, sequencesCollection, sequenceId)
    await deleteDoc(sequenceRef)
    return { success: true }
  } catch (error) {
    console.error('Error al eliminar secuencia:', error)
    throw new Error('No se pudo eliminar la secuencia')
  }
}

// Eliminar una secuencia por nombre (toma la primera coincidencia exacta)
export const deleteSequenceByName = async (name, page = 'figuras') => {
  try {
    const sequencesCollection = getSequencesCollection(page)
    const q = query(
      collection(db, sequencesCollection),
      where('name', '==', name)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) {
      throw new Error(`No se encontró secuencia con nombre "${name}"`)
    }
    const docRef = snapshot.docs[0].ref
    await deleteDoc(docRef)
    return { success: true, deletedId: snapshot.docs[0].id }
  } catch (error) {
    console.error('Error al eliminar por nombre:', error)
    throw new Error('No se pudo eliminar la secuencia por nombre')
  }
}

// Suscribirse a cambios en tiempo real de secuencias
export const subscribeToSequences = (callback) => {
  try {
    const q = query(
      collection(db, SEQUENCES_COLLECTION),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const sequences = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        sequences.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        })
      })
      
      callback(sequences)
    })
  } catch (error) {
    console.error('Error al suscribirse a secuencias:', error)
    throw new Error('No se pudo suscribir a las secuencias')
  }
}

// Suscribirse a cambios en tiempo real de secuencias por estilo
export const subscribeToSequencesByStyle = (style, callback, page = 'figuras') => {
  console.log('🎬 Firebase: Suscribiéndose a secuencias para estilo:', style)
  
  try {
    const sequencesCollection = getSequencesCollection(page);
    console.log(`📂 Usando colección secuencias: ${sequencesCollection} para página: ${page}`);
    const q = query(
      collection(db, sequencesCollection),
      where('style', '==', style),
      orderBy('createdAt', 'desc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      console.log(`🎬 Firebase: Actualización recibida - ${querySnapshot.size} secuencias para ${style}`)
      
      const sequences = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        const sequence = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt
        }
        sequences.push(sequence)
        console.log(`📋 Secuencia cargada: ${sequence.name} (${sequence.videos?.length || 0} videos)`)
      })
      
      console.log(`🎉 Total de secuencias cargadas: ${sequences.length}`)
      callback(sequences)
    })
  } catch (error) {
    console.error('❌ Error al suscribirse a secuencias por estilo:', error)
    throw new Error('No se pudo suscribir a las secuencias')
  }
}

// Buscar secuencias por nombre o descripción
export const searchSequences = async (searchTerm) => {
  try {
    const allSequences = await getSequences()
    
    const normalizedSearchTerm = searchTerm.toLowerCase().trim()
    
    return allSequences.filter(sequence => {
      const name = sequence.name?.toLowerCase() || ''
      const description = sequence.description?.toLowerCase() || ''
      
      return name.includes(normalizedSearchTerm) || 
             description.includes(normalizedSearchTerm)
    })
  } catch (error) {
    console.error('Error al buscar secuencias:', error)
    throw new Error('No se pudo buscar las secuencias')
  }
}

// Obtener estadísticas de secuencias
export const getSequenceStats = async () => {
  try {
    const sequences = await getSequences()
    
    const stats = {
      total: sequences.length,
      byStyle: {},
      averageVideosPerSequence: 0,
      totalVideos: 0
    }
    
    sequences.forEach(sequence => {
      // Contar por estilo
      const style = sequence.style || 'unknown'
      stats.byStyle[style] = (stats.byStyle[style] || 0) + 1
      
      // Contar videos totales
      stats.totalVideos += sequence.videos?.length || 0
    })
    
    // Calcular promedio
    if (stats.total > 0) {
      stats.averageVideosPerSequence = Math.round(stats.totalVideos / stats.total)
    }
    
    return stats
  } catch (error) {
    console.error('Error al obtener estadísticas de secuencias:', error)
    throw new Error('No se pudieron obtener las estadísticas')
  }
} 