// Hook personalizado para Firebase
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  createNote,
  getNotes,
  updateNote,
  deleteNote,
  createEvent,
  getEvents,
  createFigure,
  getFigures,
  createSchoolContent,
  getSchoolContent,
  subscribeToNotes,
  subscribeToEvents,
  uploadImage,
  uploadVideo,
  deleteFile
} from '../services/firebase';

// Hook para notas
export const useNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const unsubscribe = subscribeToNotes(user.uid, (notesData) => {
      setNotes(notesData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, [user]);

  const addNote = async (noteData) => {
    if (!user) return { success: false, error: 'Usuario no autenticado' };

    try {
      const { id, error } = await createNote({
        ...noteData,
        userId: user.uid
      });

      if (error) throw new Error(error);
      return { success: true, id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const updateNoteById = async (noteId, updates) => {
    try {
      const { success, error } = await updateNote(noteId, updates);
      if (error) throw new Error(error);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const deleteNoteById = async (noteId) => {
    try {
      const { success, error } = await deleteNote(noteId);
      if (error) throw new Error(error);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote: updateNoteById,
    deleteNote: deleteNoteById
  };
};

// Hook para eventos
export const useEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToEvents((eventsData) => {
      setEvents(eventsData);
      setLoading(false);
      setError(null);
    });

    return () => unsubscribe();
  }, []);

  const addEvent = async (eventData) => {
    try {
      const { id, error } = await createEvent(eventData);
      if (error) throw new Error(error);
      return { success: true, id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    events,
    loading,
    error,
    addEvent
  };
};

// Hook para figuras
export const useFigures = () => {
  const [figures, setFigures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadFigures();
  }, []);

  const loadFigures = async () => {
    try {
      setLoading(true);
      const { figures: figuresData, error } = await getFigures();
      if (error) throw new Error(error);
      setFigures(figuresData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addFigure = async (figureData) => {
    try {
      const { id, error } = await createFigure(figureData);
      if (error) throw new Error(error);
      await loadFigures(); // Recargar figuras
      return { success: true, id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    figures,
    loading,
    error,
    addFigure,
    reload: loadFigures
  };
};

// Hook para contenido de escuela
export const useSchoolContent = () => {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      setLoading(true);
      const { content: contentData, error } = await getSchoolContent();
      if (error) throw new Error(error);
      setContent(contentData);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addContent = async (contentData) => {
    try {
      const { id, error } = await createSchoolContent(contentData);
      if (error) throw new Error(error);
      await loadContent(); // Recargar contenido
      return { success: true, id };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    content,
    loading,
    error,
    addContent,
    reload: loadContent
  };
};

// Hook para archivos
export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const uploadImageFile = async (file, path) => {
    try {
      setUploading(true);
      setError(null);
      const result = await uploadImage(file, path);
      if (result.error) throw new Error(result.error);
      return result;
    } catch (err) {
      setError(err.message);
      return { url: null, path: null, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const uploadVideoFile = async (file, path) => {
    try {
      setUploading(true);
      setError(null);
      const result = await uploadVideo(file, path);
      if (result.error) throw new Error(result.error);
      return result;
    } catch (err) {
      setError(err.message);
      return { url: null, path: null, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const deleteFileByPath = async (path) => {
    try {
      setError(null);
      const result = await deleteFile(path);
      if (result.error) throw new Error(result.error);
      return result;
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  return {
    uploading,
    error,
    uploadImage: uploadImageFile,
    uploadVideo: uploadVideoFile,
    deleteFile: deleteFileByPath
  };
}; 