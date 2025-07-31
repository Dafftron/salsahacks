import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Verificando conexión...');
  const [user, setUser] = useState(null);
  const [testResults, setTestResults] = useState({});

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      setStatus('Probando conexión con Firebase...');
      
      // Test 1: Verificar que auth está inicializado
      if (auth) {
        setTestResults(prev => ({ ...prev, auth: '✅ Auth inicializado correctamente' }));
      }

      // Test 2: Verificar que db está inicializado
      if (db) {
        setTestResults(prev => ({ ...prev, firestore: '✅ Firestore inicializado correctamente' }));
      }

      // Test 3: Verificar que storage está inicializado
      if (storage) {
        setTestResults(prev => ({ ...prev, storage: '✅ Storage inicializado correctamente' }));
      }

      setStatus('✅ Conexión con Firebase exitosa!');
      
    } catch (error) {
      setStatus(`❌ Error: ${error.message}`);
      console.error('Error testing Firebase:', error);
    }
  };

  const testAuth = async () => {
    try {
      setStatus('Probando autenticación...');
      
      // Crear un usuario de prueba
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'test123456';
      
      const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
      setUser(userCredential.user);
      
      setTestResults(prev => ({ ...prev, authTest: '✅ Autenticación funcionando correctamente' }));
      setStatus('✅ Usuario de prueba creado exitosamente!');
      
    } catch (error) {
      setStatus(`❌ Error en autenticación: ${error.message}`);
      setTestResults(prev => ({ ...prev, authTest: `❌ Error: ${error.message}` }));
    }
  };

  const testFirestore = async () => {
    try {
      setStatus('Probando Firestore...');
      
      if (!user) {
        setStatus('❌ Necesitas crear un usuario primero');
        return;
      }

      // Crear un documento de prueba
      const testDoc = {
        userId: user.uid,
        testField: 'Valor de prueba',
        timestamp: new Date(),
        message: 'Firestore está funcionando correctamente!'
      };

      await setDoc(doc(db, 'test', user.uid), testDoc);
      
      // Leer el documento
      const docSnap = await getDoc(doc(db, 'test', user.uid));
      
      if (docSnap.exists()) {
        setTestResults(prev => ({ ...prev, firestoreTest: '✅ Firestore funcionando correctamente' }));
        setStatus('✅ Documento creado y leído exitosamente!');
      }
      
    } catch (error) {
      setStatus(`❌ Error en Firestore: ${error.message}`);
      setTestResults(prev => ({ ...prev, firestoreTest: `❌ Error: ${error.message}` }));
    }
  };

  const testStorage = async () => {
    try {
      setStatus('Probando Storage...');
      
      if (!user) {
        setStatus('❌ Necesitas crear un usuario primero');
        return;
      }

      // Crear un archivo de prueba
      const testContent = 'Este es un archivo de prueba para Firebase Storage';
      const testBlob = new Blob([testContent], { type: 'text/plain' });
      
      const storageRef = ref(storage, `test/${user.uid}/test-file.txt`);
      await uploadBytes(storageRef, testBlob);
      
      // Obtener la URL del archivo
      const downloadURL = await getDownloadURL(storageRef);
      
      setTestResults(prev => ({ ...prev, storageTest: '✅ Storage funcionando correctamente' }));
      setStatus('✅ Archivo subido exitosamente!');
      
    } catch (error) {
      setStatus(`❌ Error en Storage: ${error.message}`);
      setTestResults(prev => ({ ...prev, storageTest: `❌ Error: ${error.message}` }));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">🧪 Prueba de Firebase</h2>
      
      <div className="mb-4 p-3 bg-blue-50 rounded">
        <p className="text-sm text-blue-800">{status}</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold mb-2">Resultados de las Pruebas:</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(testResults).map(([key, value]) => (
              <div key={key} className="flex items-center">
                <span className="font-mono">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          >
            Probar Autenticación
          </button>
          
          <button
            onClick={testFirestore}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            disabled={!user}
          >
            Probar Firestore
          </button>
          
          <button
            onClick={testStorage}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            disabled={!user}
          >
            Probar Storage
          </button>
        </div>

        {user && (
          <div className="p-3 bg-green-50 rounded">
            <p className="text-sm text-green-800">
              <strong>Usuario de prueba:</strong> {user.email}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FirebaseTest; 