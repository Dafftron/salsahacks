// Servicios de Firebase Storage
import { 
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { storage } from './config';

// Subir archivo
export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { 
      url: downloadURL, 
      path: snapshot.ref.fullPath,
      error: null 
    };
  } catch (error) {
    return { 
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

// Subir video
export const uploadVideo = async (file, path) => {
  // Para videos, no comprimimos
  return await uploadFile(file, path);
};

// Subir video de figura
export const uploadFigureVideo = async (file, figureId) => {
  const path = `figures/${figureId}/videos/${Date.now()}_${file.name}`;
  return await uploadVideo(file, path);
}; 