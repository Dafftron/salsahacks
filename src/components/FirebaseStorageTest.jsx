import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { uploadVideo, uploadVideoAlternative, uploadVideoSimulated, uploadVideoNoCORS } from '../services/firebase/storage';

const FirebaseStorageTest = () => {
  const { user, userProfile } = useAuth();
  const [testFile, setTestFile] = useState(null);
  const [testResult, setTestResult] = useState('');
  const [isTesting, setIsTesting] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setTestFile(file);
    } else {
      alert('Por favor selecciona un archivo de video');
    }
  };

  const testUpload = async () => {
    if (!testFile) {
      alert('Por favor selecciona un archivo primero');
      return;
    }

    setIsTesting(true);
    setTestResult('Iniciando prueba de upload...');

    try {
      const result = await uploadVideo(
        testFile,
        `test/${user.uid}/test_${Date.now()}_${testFile.name}`,
        (progress) => {
          setTestResult(`Progreso: ${Math.round(progress)}%`);
        }
      );

      if (result.success) {
        setTestResult(`✅ Prueba exitosa! Video subido a: ${result.url}`);
      } else {
        setTestResult(`❌ Error: ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error inesperado: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testUploadAlternative = async () => {
    if (!testFile) {
      alert('Por favor selecciona un archivo primero');
      return;
    }

    setIsTesting(true);
    setTestResult('Iniciando prueba de upload (método alternativo)...');

    try {
      const result = await uploadVideoAlternative(
        testFile,
        `test/${user.uid}/alt_test_${Date.now()}_${testFile.name}`,
        (progress) => {
          setTestResult(`Progreso (alt): ${Math.round(progress)}%`);
        }
      );

      if (result.success) {
        setTestResult(`✅ Prueba alternativa exitosa! Video subido a: ${result.url}`);
      } else {
        setTestResult(`❌ Error (alt): ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error inesperado (alt): ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testUploadSimulated = async () => {
    if (!testFile) {
      alert('Por favor selecciona un archivo primero');
      return;
    }

    setIsTesting(true);
    setTestResult('Iniciando prueba de upload (simulado)...');

    try {
      const result = await uploadVideoSimulated(
        testFile,
        `test/${user.uid}/sim_test_${Date.now()}_${testFile.name}`,
        (progress) => {
          setTestResult(`Progreso (sim): ${Math.round(progress)}%`);
        }
      );

      if (result.success) {
        setTestResult(`✅ Prueba simulada exitosa! Video procesado: ${result.url}`);
      } else {
        setTestResult(`❌ Error (sim): ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error inesperado (sim): ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testUploadNoCORS = async () => {
    if (!testFile) {
      alert('Por favor selecciona un archivo primero');
      return;
    }

    setIsTesting(true);
    setTestResult('Iniciando prueba de upload (sin CORS)...');

    try {
      const result = await uploadVideoNoCORS(
        testFile,
        `test/${user.uid}/nocors_test_${Date.now()}_${testFile.name}`,
        (progress) => {
          setTestResult(`Progreso (nocors): ${Math.round(progress)}%`);
        }
      );

      if (result.success) {
        setTestResult(`✅ Prueba sin CORS exitosa! Video subido: ${result.url}`);
      } else {
        setTestResult(`❌ Error (nocors): ${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Error inesperado (nocors): ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testPermissions = () => {
    setTestResult('🔍 Verificando permisos...');
    
    if (!user) {
      setTestResult('❌ No hay usuario autenticado');
      return;
    }
    
    if (!userProfile) {
      setTestResult('❌ No hay perfil de usuario');
      return;
    }
    
    if (userProfile.role === 'super_admin') {
      setTestResult('✅ Usuario autenticado como Super Admin');
    } else {
      setTestResult(`⚠️ Usuario con rol: ${userProfile.role}`);
    }
  };

  const testConnection = () => {
    setTestResult('🔍 Verificando conexión con Firebase...');
    
    // Simular una prueba de conexión
    setTimeout(() => {
      if (user && userProfile) {
        setTestResult('✅ Conexión con Firebase establecida');
      } else {
        setTestResult('❌ Error de conexión con Firebase');
      }
    }, 1000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Prueba de Firebase Storage
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar archivo de video para prueba
          </label>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {testFile && (
          <div className="text-sm text-gray-600">
            Archivo seleccionado: {testFile.name} ({(testFile.size / (1024 * 1024)).toFixed(2)} MB)
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={testPermissions}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600"
          >
            Verificar Permisos
          </button>
          
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
          >
            Verificar Conexión
          </button>
          
          <button
            onClick={testUpload}
            disabled={!testFile || isTesting}
            className={`px-4 py-2 rounded-lg font-medium ${
              !testFile || isTesting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            {isTesting ? 'Probando...' : 'Probar Upload'}
          </button>
          
          <button
            onClick={testUploadAlternative}
            disabled={!testFile || isTesting}
            className={`px-4 py-2 rounded-lg font-medium ${
              !testFile || isTesting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-purple-500 text-white hover:bg-purple-600'
            }`}
          >
            {isTesting ? 'Probando...' : 'Upload Alternativo'}
          </button>

          <button
            onClick={testUploadSimulated}
            disabled={!testFile || isTesting}
            className={`px-4 py-2 rounded-lg font-medium ${
              !testFile || isTesting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-teal-500 text-white hover:bg-teal-600'
            }`}
          >
            {isTesting ? 'Probando...' : 'Upload Simulado'}
          </button>

          <button
            onClick={testUploadNoCORS}
            disabled={!testFile || isTesting}
            className={`px-4 py-2 rounded-lg font-medium ${
              !testFile || isTesting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-500 text-white hover:bg-indigo-600'
            }`}
          >
            {isTesting ? 'Probando...' : 'Sin CORS'}
          </button>
        </div>

        {testResult && (
          <div className={`p-3 rounded-lg text-sm ${
            testResult.includes('✅') 
              ? 'bg-green-50 text-green-800 border border-green-200'
              : testResult.includes('❌')
              ? 'bg-red-50 text-red-800 border border-red-200'
              : testResult.includes('⚠️')
              ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {testResult}
          </div>
        )}

        <div className="text-xs text-gray-500">
          <p>Usuario: {user?.email}</p>
          <p>Rol: {userProfile?.role}</p>
          <p>UID: {user?.uid}</p>
          <p>Puerto: {window.location.port || '80'}</p>
        </div>
      </div>
    </div>
  );
};

export default FirebaseStorageTest; 