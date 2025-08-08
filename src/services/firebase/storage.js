// Servicios de Firebase Storage
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  uploadBytesResumable
} from 'firebase/storage';
import { storage } from './config';

// Función para generar thumbnail del video completo - ALTA CALIDAD
export const generateVideoThumbnail = (videoFile) => {
  return new Promise((resolve, reject) => {
    try {
      // Crear URL temporal del video
      const videoURL = URL.createObjectURL(videoFile);
      
      // Crear elemento de video
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      
      // Crear canvas para capturar el frame
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Configurar canvas para thumbnails de ALTA CALIDAD
      const maxWidth = 1280; // Aumentar de 400 a 1280 para mejor calidad
      const maxHeight = 720; // Aumentar de 400 a 720 para mejor calidad
      
      video.onloadedmetadata = () => {
        try {
          // Calcular las dimensiones manteniendo las proporciones
          const videoAspectRatio = video.videoWidth / video.videoHeight;
          let canvasWidth, canvasHeight;
          
          if (videoAspectRatio > 1) {
            // Video horizontal
            canvasWidth = maxWidth;
            canvasHeight = maxWidth / videoAspectRatio;
          } else {
            // Video vertical
            canvasHeight = maxHeight;
            canvasWidth = maxHeight * videoAspectRatio;
          }
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
          // Buscar un frame en el medio del video (como al principio)
          const duration = video.duration;
          const targetTime = Math.min(duration * 0.5, 1); // 50% del video o máximo 1 segundo
          
          video.currentTime = targetTime;
          
          video.onseeked = () => {
            try {
              // Dibujar el frame completo en el canvas
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              
              // Convertir a blob
              canvas.toBlob((blob) => {
                if (blob) {
                  // Crear URL del thumbnail
                  const thumbnailURL = URL.createObjectURL(blob);
                  
                  // Limpiar recursos
                  URL.revokeObjectURL(videoURL);
                  video.remove();
                  canvas.remove();
                  
                  resolve({
                    success: true,
                    thumbnailURL,
                    blob,
                    error: null
                  });
                } else {
                  reject(new Error('No se pudo generar el thumbnail'));
                }
              }, 'image/jpeg', 0.95); // Aumentar calidad de 0.8 a 0.95
              
            } catch (error) {
              reject(new Error(`Error al capturar frame: ${error.message}`));
            }
          };
          
          video.onerror = () => {
            reject(new Error('Error al cargar el video para thumbnail'));
          };
          
        } catch (error) {
          reject(new Error(`Error al procesar metadata: ${error.message}`));
        }
      };
      
      video.onerror = () => {
        // Limpiar recursos en caso de error
        URL.revokeObjectURL(videoURL);
        video.remove();
        canvas.remove();
        reject(new Error('Error al cargar el video'));
      };
      
      // Cargar el video
      video.src = videoURL;
      
    } catch (error) {
      reject(new Error(`Error al generar thumbnail: ${error.message}`));
    }
  });
};

// Función para generar thumbnail simple (como fig006)
export const generateBestVideoThumbnail = async (videoFile) => {
  try {
    const videoURL = URL.createObjectURL(videoFile);
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.muted = true;
    video.playsInline = true;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        // Configurar canvas para thumbnails de ALTA CALIDAD
        const maxWidth = 1280; // Aumentar de 400 a 1280 para mejor calidad
        const maxHeight = 720; // Aumentar de 400 a 720 para mejor calidad
        
        // Calcular las dimensiones manteniendo las proporciones
        const videoAspectRatio = video.videoWidth / video.videoHeight;
        let canvasWidth, canvasHeight;
        
        if (videoAspectRatio > 1) {
          // Video horizontal
          canvasWidth = maxWidth;
          canvasHeight = maxWidth / videoAspectRatio;
        } else {
          // Video vertical
          canvasHeight = maxHeight;
          canvasWidth = maxHeight * videoAspectRatio;
        }
        
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        
        const duration = video.duration;
        
        // Usar solo el punto medio del video (como fig006) o máximo 1 segundo
        video.currentTime = Math.min(duration * 0.5, 1);
        
        video.onseeked = () => {
          try {
            // Dibujar el frame completo en el canvas
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob((blob) => {
              if (blob) {
                const thumbnailURL = URL.createObjectURL(blob);
                
                URL.revokeObjectURL(videoURL);
                video.remove();
                canvas.remove();
                
                resolve({
                  success: true,
                  thumbnailURL,
                  blob,
                  error: null
                });
              } else {
                reject(new Error('No se pudo generar el thumbnail'));
              }
            }, 'image/jpeg', 0.95); // Aumentar calidad de 0.8 a 0.95
            
          } catch (error) {
            reject(new Error(`Error al capturar frame: ${error.message}`));
          }
        };
        
        video.onerror = () => {
          reject(new Error('Error al cargar el video para thumbnail'));
        };
      };
      
      video.onerror = () => {
        URL.revokeObjectURL(videoURL);
        video.remove();
        canvas.remove();
        reject(new Error('Error al cargar el video'));
      };
      
      video.src = videoURL;
    });
    
  } catch (error) {
    return {
      success: false,
      thumbnailURL: 'https://via.placeholder.com/300x200/1a1a1a/ffffff?text=VIDEO',
      blob: null,
      error: error.message
    };
  }
};

// Función de upload simulado para desarrollo (cuando Firebase Storage no está disponible)
export const uploadVideoSimulated = async (file, path, onProgress) => {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      throw new Error('El archivo debe ser un video');
    }
    
    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('El video es demasiado grande. Máximo 100MB');
    }
    
    // Simular progreso de upload
    for (let i = 0; i <= 100; i += 10) {
      if (onProgress) {
        onProgress(i);
      }
      await new Promise(resolve => setTimeout(resolve, 200)); // Simular delay
    }
    
    // Crear URL temporal del archivo
    const fileUrl = URL.createObjectURL(file);
    
    // Simular metadata
    const metadata = {
      uploadedAt: new Date().toISOString(),
      originalName: file.name,
      fileSize: file.size.toString(),
      fileType: 'video',
      simulated: true
    };
    
    return { 
      success: true,
      url: fileUrl, 
      path: path,
      error: null,
      simulated: true,
      metadata
    };
    
  } catch (error) {
    console.error('Error uploading video (simulated):', error);
    
    return { 
      success: false,
      url: null, 
      path: null,
      error: error.message,
      simulated: true
    };
  }
};

// Subir archivo con progreso
export const uploadFile = async (file, path, onProgress) => {
  try {
    const storageRef = ref(storage, path);
    
    // Crear metadata para el archivo
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString()
      }
    };
    
    // Subir archivo con metadata
    const snapshot = await uploadBytes(storageRef, file, metadata);
    
    // Obtener URL de descarga
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true,
      url: downloadURL, 
      path: snapshot.ref.fullPath,
      error: null 
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return { 
      success: false,
      url: null, 
      path: null,
      error: error.message 
    };
  }
};

// Subir imagen con compresión
export const uploadImage = async (file, path, maxSize = 1024 * 1024) => {
  try {
    // Comprimir imagen si es muy grande
    let fileToUpload = file;
    
    if (file.size > maxSize) {
      const compressedFile = await compressImage(file, maxSize);
      fileToUpload = compressedFile;
    }
    
    return await uploadFile(fileToUpload, path);
  } catch (error) {
    return { 
      url: null, 
      path: null,
      error: error.message 
    };
  }
};

// Comprimir imagen
const compressImage = (file, maxSize) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      let { width, height } = img;
      
      // Calcular nuevas dimensiones
      const ratio = Math.min(maxSize / file.size, 1);
      width *= ratio;
      height *= ratio;
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        const compressedFile = new File([blob], file.name, {
          type: file.type,
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, file.type, 0.8);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Obtener URL de descarga
export const getFileURL = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const url = await getDownloadURL(storageRef);
    return { url, error: null };
  } catch (error) {
    return { url: null, error: error.message };
  }
};

// Eliminar archivo
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listar archivos en una carpeta
export const listFiles = async (folderPath) => {
  try {
    const folderRef = ref(storage, folderPath);
    const result = await listAll(folderRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url
        };
      })
    );
    
    return { files, error: null };
  } catch (error) {
    return { files: [], error: error.message };
  }
};

// Subir imagen de perfil
export const uploadProfileImage = async (file, userId) => {
  const path = `profiles/${userId}/${Date.now()}_${file.name}`;
  return await uploadImage(file, path);
};

// Subir imagen de nota
export const uploadNoteImage = async (file, noteId) => {
  const path = `notes/${noteId}/${Date.now()}_${file.name}`;
  return await uploadImage(file, path);
};

// Subir imagen de evento
export const uploadEventImage = async (file, eventId) => {
  const path = `events/${eventId}/${Date.now()}_${file.name}`;
  return await uploadImage(file, path);
};

// Subir imagen de figura
export const uploadFigureImage = async (file, figureId) => {
  const path = `figures/${figureId}/${Date.now()}_${file.name}`;
  return await uploadImage(file, path);
};

// Subir video con manejo de errores mejorado y progreso
export const uploadVideo = async (file, path, onProgress) => {
  try {
    // Validar tipo de archivo
    if (!file.type.startsWith('video/')) {
      throw new Error('El archivo debe ser un video');
    }
    
    // Validar tamaño (máximo 100MB)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      throw new Error('El video es demasiado grande. Máximo 100MB');
    }
    
    // Ya tienes el plan Blaze, usar Firebase Storage real directamente
    console.log('Subiendo video a Firebase Storage...');
    
    // Crear metadata específica para videos
    const metadata = {
      contentType: file.type,
      customMetadata: {
        uploadedAt: new Date().toISOString(),
        originalName: file.name,
        fileSize: file.size.toString(),
        fileType: 'video'
      }
    };
    
    const storageRef = ref(storage, path);
    
    // Intentar primero con uploadBytes simple
    try {
      const snapshot = await uploadBytes(storageRef, file, metadata);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      console.log('Video subido exitosamente a Firebase Storage:', downloadURL);
      
      return { 
        success: true,
        url: downloadURL, 
        path: snapshot.ref.fullPath,
        error: null,
        simulated: false
      };
    } catch (uploadError) {
      console.error('Error con uploadBytes, intentando con uploadBytesResumable:', uploadError);
      
      // Si falla, intentar con uploadBytesResumable
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            // Progreso del upload
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            if (onProgress) {
              onProgress(progress);
            }
          },
          (error) => {
            // Error durante el upload
            console.error('Error uploading video:', error);
            
            let errorMessage = 'Error al subir el video';
            if (error.code === 'storage/unauthorized') {
              errorMessage = 'No tienes permisos para subir videos';
            } else if (error.code === 'storage/quota-exceeded') {
              errorMessage = 'Se ha excedido la cuota de almacenamiento';
            } else if (error.code === 'storage/retry-limit-exceeded') {
              errorMessage = 'Error de conexión. Intenta de nuevo';
            } else if (error.code === 'storage/canceled') {
              errorMessage = 'Upload cancelado';
            } else if (error.message) {
              errorMessage = error.message;
            }
            
            resolve({ 
              success: false,
              url: null, 
              path: null,
              error: errorMessage,
              simulated: false
            });
          },
          async () => {
            // Upload completado exitosamente
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              console.log('Video subido exitosamente a Firebase Storage:', downloadURL);
              resolve({ 
                success: true,
                url: downloadURL, 
                path: uploadTask.snapshot.ref.fullPath,
                error: null,
                simulated: false
              });
            } catch (error) {
              resolve({ 
                success: false,
                url: null, 
                path: null,
                error: 'Error al obtener la URL del video',
                simulated: false
              });
            }
          }
        );
      });
    }
    
  } catch (error) {
    console.error('Error uploading video:', error);
    
    // Manejar errores específicos
    let errorMessage = 'Error al subir el video';
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'No tienes permisos para subir videos';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Se ha excedido la cuota de almacenamiento';
    } else if (error.code === 'storage/retry-limit-exceeded') {
      errorMessage = 'Error de conexión. Intenta de nuevo';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false,
      url: null, 
      path: null,
      error: errorMessage,
      simulated: false
    };
  }
};

// Subir video de figura
export const uploadFigureVideo = async (file, figureId) => {
  const path = `figures/${figureId}/videos/${Date.now()}_${file.name}`;
  return await uploadVideo(file, path);
};

// Eliminar video completo (archivo + thumbnail)
export const deleteVideo = async (videoPath, thumbnailPath) => {
  try {
    const promises = [];
    
    // Eliminar archivo de video
    if (videoPath) {
      const videoRef = ref(storage, videoPath);
      promises.push(deleteObject(videoRef));
    }
    
    // Eliminar thumbnail (solo si existe y no es null)
    if (thumbnailPath && thumbnailPath !== null) {
      const thumbnailRef = ref(storage, thumbnailPath);
      promises.push(deleteObject(thumbnailRef));
    }
    
    await Promise.all(promises);
    
    return { 
      success: true, 
      error: null 
    };
  } catch (error) {
    console.error('Error deleting video:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
};

// ===== FUNCIONES DE LIMPIEZA DE STORAGE =====

// Eliminar todos los archivos de videos
export const deleteAllVideoFiles = async () => {
  try {
    console.log('🗑️ Iniciando eliminación de todos los archivos de videos...')
    
    // Eliminar archivos de videos
    const videosResult = await deleteAllFilesInFolder('videos')
    console.log(`✅ Archivos de videos eliminados: ${videosResult.deletedCount}`)
    
    // Eliminar archivos de thumbnails
    const thumbnailsResult = await deleteAllFilesInFolder('thumbnails')
    console.log(`✅ Archivos de thumbnails eliminados: ${thumbnailsResult.deletedCount}`)
    
    return {
      success: true,
      videosDeleted: videosResult.deletedCount,
      thumbnailsDeleted: thumbnailsResult.deletedCount,
      error: null
    }
  } catch (error) {
    console.error('❌ Error al eliminar archivos de videos:', error)
    return {
      success: false,
      videosDeleted: 0,
      thumbnailsDeleted: 0,
      error: error.message
    }
  }
}

// Eliminar todos los archivos en una carpeta específica
export const deleteAllFilesInFolder = async (folderPath) => {
  try {
    console.log(`🗑️ Eliminando archivos en carpeta: ${folderPath}`)
    
    const folderRef = ref(storage, folderPath)
    const result = await listAll(folderRef)
    
    if (result.items.length === 0) {
      console.log(`✅ No hay archivos en ${folderPath}`)
      return { success: true, deletedCount: 0, error: null }
    }
    
    console.log(`📊 Archivos a eliminar en ${folderPath}: ${result.items.length}`)
    
    const deletePromises = result.items.map(async (itemRef) => {
      try {
        await deleteObject(itemRef)
        return { success: true, path: itemRef.fullPath }
      } catch (error) {
        console.error(`❌ Error eliminando ${itemRef.fullPath}:`, error)
        return { success: false, path: itemRef.fullPath, error: error.message }
      }
    })
    
    const results = await Promise.all(deletePromises)
    const successfulDeletes = results.filter(r => r.success).length
    const failedDeletes = results.filter(r => !r.success).length
    
    console.log(`✅ ${successfulDeletes} archivos eliminados exitosamente en ${folderPath}`)
    if (failedDeletes > 0) {
      console.log(`⚠️ ${failedDeletes} archivos fallaron al eliminar en ${folderPath}`)
    }
    
    return {
      success: true,
      deletedCount: successfulDeletes,
      failedCount: failedDeletes,
      error: null
    }
  } catch (error) {
    console.error(`❌ Error al eliminar archivos en ${folderPath}:`, error)
    return {
      success: false,
      deletedCount: 0,
      failedCount: 0,
      error: error.message
    }
  }
}

// Limpiar archivos huérfanos (archivos sin documento en Firestore)
export const cleanupOrphanedFiles = async (videosFromFirestore) => {
  try {
    console.log('🧹 Iniciando limpieza de archivos huérfanos...')
    
    // Obtener todos los archivos de videos y thumbnails
    const videosFolder = await listAll(ref(storage, 'videos'))
    const thumbnailsFolder = await listAll(ref(storage, 'thumbnails'))
    
    // Crear sets de rutas de archivos existentes en Firestore
    const firestoreVideoPaths = new Set(videosFromFirestore.map(v => v.videoPath).filter(Boolean))
    const firestoreThumbnailPaths = new Set(videosFromFirestore.map(v => v.thumbnailPath).filter(Boolean))
    
    // Encontrar archivos huérfanos
    const orphanedVideos = videosFolder.items.filter(item => !firestoreVideoPaths.has(item.fullPath))
    const orphanedThumbnails = thumbnailsFolder.items.filter(item => !firestoreThumbnailPaths.has(item.fullPath))
    
    console.log(`📊 Archivos huérfanos encontrados: ${orphanedVideos.length} videos, ${orphanedThumbnails.length} thumbnails`)
    
    // Eliminar archivos huérfanos
    const deletePromises = [
      ...orphanedVideos.map(item => deleteObject(item)),
      ...orphanedThumbnails.map(item => deleteObject(item))
    ]
    
    if (deletePromises.length > 0) {
      await Promise.all(deletePromises)
      console.log(`✅ ${deletePromises.length} archivos huérfanos eliminados`)
    } else {
      console.log('✅ No se encontraron archivos huérfanos')
    }
    
    return {
      success: true,
      orphanedVideosDeleted: orphanedVideos.length,
      orphanedThumbnailsDeleted: orphanedThumbnails.length,
      error: null
    }
  } catch (error) {
    console.error('❌ Error en limpieza de archivos huérfanos:', error)
    return {
      success: false,
      orphanedVideosDeleted: 0,
      orphanedThumbnailsDeleted: 0,
      error: error.message
    }
  }
}

// Función auxiliar para descargar un archivo desde Firebase Storage
const downloadFile = async (path) => {
  try {
    const fileRef = ref(storage, path)
    const url = await getDownloadURL(fileRef)
    
    // Descargar el archivo usando fetch
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al descargar archivo: ${response.status}`)
    }
    
    const blob = await response.blob()
    return blob
  } catch (error) {
    console.error(`Error descargando archivo ${path}:`, error)
    throw error
  }
}

// Función auxiliar para convertir blob a File
const blobToFile = (blob, filename) => {
  return new File([blob], filename, { type: blob.type })
}

// Migrar videos existentes a la nueva estructura organizada
export const migrateVideosToOrganizedStructure = async (videosFromFirestore) => {
  try {
    console.log('🔄 Iniciando migración de videos a estructura organizada...')
    
    const migrationResults = []
    
    for (const video of videosFromFirestore) {
      try {
        // Verificar si el video ya está en la nueva estructura
        if (video.videoPath && video.videoPath.includes('/figuras/') || 
            video.videoPath && video.videoPath.includes('/escuela/') || 
            video.videoPath && video.videoPath.includes('/eventos/')) {
          console.log(`⏭️ Video ${video.title} ya está en estructura organizada`)
          migrationResults.push({
            videoId: video.id,
            title: video.title,
            status: 'already_organized',
            error: null
          })
          continue
        }
        
        // Determinar la nueva ruta basada en el estilo del video
        const style = video.style || 'salsa' // Default a salsa si no hay estilo
        const page = 'figuras' // Default a figuras, se puede mejorar después
        
        const oldVideoPath = video.videoPath
        const oldThumbnailPath = video.thumbnailPath
        
        const newVideoPath = `videos/${page}/${style}/${oldVideoPath.split('/').pop()}`
        const newThumbnailPath = oldThumbnailPath ? 
          `thumbnails/${page}/${style}/${oldThumbnailPath.split('/').pop()}` : null
        
        console.log(`🔄 Migrando video: ${video.title}`)
        console.log(`   De: ${oldVideoPath}`)
        console.log(`   A: ${newVideoPath}`)
        
        // MIGRACIÓN REAL DE ARCHIVOS
        let videoMigrated = false
        let thumbnailMigrated = false
        
        // Migrar video
        try {
          console.log(`📥 Descargando video: ${oldVideoPath}`)
          const videoBlob = await downloadFile(oldVideoPath)
          const videoFile = blobToFile(videoBlob, oldVideoPath.split('/').pop())
          
          console.log(`📤 Subiendo video a nueva ubicación: ${newVideoPath}`)
          await uploadFile(videoFile, newVideoPath)
          videoMigrated = true
          console.log(`✅ Video migrado exitosamente`)
          
          // Eliminar archivo original
          console.log(`🗑️ Eliminando archivo original: ${oldVideoPath}`)
          await deleteFile(oldVideoPath)
          
        } catch (error) {
          console.error(`❌ Error migrando video ${video.title}:`, error)
          throw new Error(`Error migrando video: ${error.message}`)
        }
        
        // Migrar thumbnail si existe
        if (oldThumbnailPath && newThumbnailPath) {
          try {
            console.log(`📥 Descargando thumbnail: ${oldThumbnailPath}`)
            const thumbnailBlob = await downloadFile(oldThumbnailPath)
            const thumbnailFile = blobToFile(thumbnailBlob, oldThumbnailPath.split('/').pop())
            
            console.log(`📤 Subiendo thumbnail a nueva ubicación: ${newThumbnailPath}`)
            await uploadFile(thumbnailFile, newThumbnailPath)
            thumbnailMigrated = true
            console.log(`✅ Thumbnail migrado exitosamente`)
            
            // Eliminar archivo original
            console.log(`🗑️ Eliminando thumbnail original: ${oldThumbnailPath}`)
            await deleteFile(oldThumbnailPath)
            
          } catch (error) {
            console.error(`❌ Error migrando thumbnail ${video.title}:`, error)
            // No fallamos la migración completa si falla el thumbnail
          }
        }
        
        migrationResults.push({
          videoId: video.id,
          title: video.title,
          oldVideoPath,
          newVideoPath,
          oldThumbnailPath,
          newThumbnailPath,
          status: 'migrated',
          videoMigrated,
          thumbnailMigrated,
          error: null
        })
        
      } catch (error) {
        console.error(`❌ Error migrando video ${video.title}:`, error)
        migrationResults.push({
          videoId: video.id,
          title: video.title,
          status: 'error',
          error: error.message
        })
      }
    }
    
    const successfulMigrations = migrationResults.filter(r => r.status === 'migrated').length
    const alreadyOrganized = migrationResults.filter(r => r.status === 'already_organized').length
    const failedMigrations = migrationResults.filter(r => r.status === 'error').length
    
    console.log(`✅ Migración completada: ${successfulMigrations} migrados, ${alreadyOrganized} ya organizados, ${failedMigrations} fallidos`)
    
    return {
      success: true,
      totalVideos: videosFromFirestore.length,
      successfulMigrations,
      alreadyOrganized,
      failedMigrations,
      results: migrationResults,
      error: null
    }
    
  } catch (error) {
    console.error('❌ Error en migración de videos:', error)
    return {
      success: false,
      totalVideos: 0,
      successfulMigrations: 0,
      alreadyOrganized: 0,
      failedMigrations: 0,
      results: [],
      error: error.message
    }
  }
} 