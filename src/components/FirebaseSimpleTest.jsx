import React, { useState, useEffect } from 'react';

const FirebaseSimpleTest = () => {
  const [status, setStatus] = useState('Iniciando prueba...');
  const [error, setError] = useState(null);

  useEffect(() => {
    testFirebaseStepByStep();
  }, []);

  const testFirebaseStepByStep = async () => {
    try {
      setStatus('Paso 1: Importando Firebase...');
      
      // Importación dinámica para evitar errores
      const { initializeApp } = await import('firebase/app');
      setStatus('✅ Firebase App importado correctamente');
      
      setStatus('Paso 2: Importando Auth...');
      const { getAuth } = await import('firebase/auth');
      setStatus('✅ Firebase Auth importado correctamente');
      
      setStatus('Paso 3: Importando Firestore...');
      const { getFirestore } = await import('firebase/firestore');
      setStatus('✅ Firebase Firestore importado correctamente');
      
      setStatus('Paso 4: Importando Storage...');
      const { getStorage } = await import('firebase/storage');
      setStatus('✅ Firebase Storage importado correctamente');
      
      setStatus('Paso 5: Configurando Firebase...');
      
      // Configuración de Firebase
      const firebaseConfig = {
        apiKey: "AIzaSyBxqEJAHyV4jyeE1-GW-dOeECyLXRAsjiM",
        authDomain: "salsahacks-a9cac.firebaseapp.com",
        projectId: "salsahacks-a9cac",
        storageBucket: "salsahacks-a9cac.firebasestorage.app",
        messagingSenderId: "934621871243",
        appId: "1:934621871243:web:9107fa3b61d9b9928fa88e"
      };

      const app = initializeApp(firebaseConfig);
      setStatus('✅ Firebase App inicializado correctamente');
      
      const auth = getAuth(app);
      setStatus('✅ Firebase Auth inicializado correctamente');
      
      const db = getFirestore(app);
      setStatus('✅ Firebase Firestore inicializado correctamente');
      
      const storage = getStorage(app);
      setStatus('✅ Firebase Storage inicializado correctamente');
      
      setStatus('🎉 ¡Firebase completamente funcional!');
      
    } catch (error) {
      setError(error.message);
      setStatus(`❌ Error: ${error.message}`);
      console.error('Error en Firebase:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔥 Prueba Simple de Firebase
      </h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Estado:</p>
        <p className={`text-sm font-medium ${
          status.includes('✅') ? 'text-green-600' : 
          status.includes('❌') ? 'text-red-600' : 'text-blue-600'
        }`}>
          {status}
        </p>
      </div>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">
            <strong>Error detallado:</strong> {error}
          </p>
        </div>
      )}
      
      <div className="text-xs text-gray-500">
        Esta prueba verifica que Firebase se pueda importar e inicializar sin errores.
      </div>
    </div>
  );
};

export default FirebaseSimpleTest; 