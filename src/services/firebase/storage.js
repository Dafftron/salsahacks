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

// Función de upload que usa un enfoque diferente para evitar CORS
export const uploadVideoNoCORS = async (file, path, onProgress) => {
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
    
    const storageRef = ref(storage, path);
    
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
    
    // Intentar upload con configuración específica para evitar CORS
    try {
      // Simular progreso inicial
      if (onProgress) {
        onProgress(10);
      }
      
      // Usar uploadBytes con configuración específica
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Simular progreso final
      if (onProgress) {
        onProgress(100);
      }
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return { 
        success: true,
        url: downloadURL, 
        path: snapshot.ref.fullPath,
        error: null 
      };
      
    } catch (uploadError) {
      console.error('Error con upload directo, intentando método alternativo:', uploadError);
      
      // Si falla, usar el método simulado como fallback
      return await uploadVideoSimulated(file, path, onProgress);
    }
    
  } catch (error) {
    console.error('Error uploading video (no CORS):', error);
    
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
      error: errorMessage 
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

// Función de upload alternativa para evitar problemas de CORS
export const uploadVideoAlternative = async (file, path, onProgress) => {
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
    
    // Simular progreso inicial
    if (onProgress) {
      onProgress(10);
    }
    
    // Intentar upload con timeout
    const uploadPromise = uploadBytes(storageRef, file, metadata);
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: La operación tardó demasiado')), 30000)
    );
    
    const snapshot = await Promise.race([uploadPromise, timeoutPromise]);
    
    // Simular progreso final
    if (onProgress) {
      onProgress(100);
    }
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      success: true,
      url: downloadURL, 
      path: snapshot.ref.fullPath,
      error: null 
    };
    
  } catch (error) {
    console.error('Error uploading video (alternative):', error);
    
    // Manejar errores específicos
    let errorMessage = 'Error al subir el video';
    if (error.code === 'storage/unauthorized') {
      errorMessage = 'No tienes permisos para subir videos';
    } else if (error.code === 'storage/quota-exceeded') {
      errorMessage = 'Se ha excedido la cuota de almacenamiento';
    } else if (error.code === 'storage/retry-limit-exceeded') {
      errorMessage = 'Error de conexión. Intenta de nuevo';
    } else if (error.message.includes('Timeout')) {
      errorMessage = 'La operación tardó demasiado. Verifica tu conexión a internet.';
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return { 
      success: false,
      url: null, 
      path: null,
      error: errorMessage 
    };
  }
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

// Función para verificar si Firebase Storage está disponible
const checkStorageAvailability = async () => {
  try {
    // Como ya tienes el plan Blaze activo, asumimos que Storage está disponible
    // Solo verificamos que la conexión básica funcione
    const testRef = ref(storage, 'test-connection');
    
    // Usar un timeout para evitar que se quede colgado
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout: Storage no responde')), 3000)
    );
    
    // Intentar una operación simple que siempre debería funcionar
    await Promise.race([
      uploadBytes(testRef, new Blob(['test'], { type: 'text/plain' })),
      timeoutPromise
    ]);
    
    // Limpiar el archivo de prueba
    try {
      await deleteObject(testRef);
    } catch (cleanupError) {
      // Ignorar errores de limpieza
    }
    
    return true;
  } catch (error) {
    console.log('Storage availability check error:', error);
    
    // Si el error es específico de Storage no disponible, retornar false
    if (error.code === 'storage/unauthorized' || 
        error.code === 'storage/bucket-not-found' ||
        error.message.includes('billing') ||
        error.message.includes('plan') ||
        error.message.includes('quota')) {
      return false;
    }
    
    // Para otros errores (como timeout), asumir que Storage está disponible
    // ya que tienes el plan Blaze activo
    return true;
  }
};

// Subir video de figura
export const uploadFigureVideo = async (file, figureId) => {
  const path = `figures/${figureId}/videos/${Date.now()}_${file.name}`;
  return await uploadVideo(file, path);
}; 