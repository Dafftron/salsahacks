// Configuración de Firebase
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Configuración de Firebase - Credenciales reales
const firebaseConfig = {
  apiKey: "AIzaSyBxqEJAHyV4jyeE1-GW-dOeECyLXRAsjiM",
  authDomain: "salsahacks-a9cac.firebaseapp.com",
  projectId: "salsahacks-a9cac",
  storageBucket: "salsahacks-a9cac.firebasestorage.app",
  messagingSenderId: "934621871243",
  appId: "1:934621871243:web:9107fa3b61d9b9928fa88e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app; 