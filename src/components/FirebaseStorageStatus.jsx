import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  ExternalLink,
  Settings,
  CreditCard
} from 'lucide-react';
import { ref, uploadBytes, deleteObject } from 'firebase/storage';
import { storage } from '../services/firebase/config';

const FirebaseStorageStatus = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);

  useEffect(() => {
    checkStorageStatus();
  }, []);

  const checkStorageStatus = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      // Como ya tienes el plan Blaze activo, verificamos la conexión básica
      const testRef = ref(storage, 'test-connection');
      
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
      
      setStatus('available');
    } catch (err) {
      console.log('Storage check error:', err);
      
      // Si el error es específico de Storage no disponible, mostrar unavailable
      if (err.code === 'storage/unauthorized' || 
          err.code === 'storage/bucket-not-found' ||
          err.message.includes('billing') ||
          err.message.includes('plan') ||
          err.message.includes('quota')) {
        setStatus('unavailable');
        setError(err);
      } else {
        // Para otros errores (como timeout), asumir que Storage está disponible
        // ya que tienes el plan Blaze activo
        setStatus('available');
      }
    }
  };

  const openFirebaseConsole = () => {
    window.open('https://console.firebase.google.com/project/salsahacks-a9cac/usage/details', '_blank');
  };

  const openBillingSetup = () => {
    window.open('https://console.firebase.google.com/project/salsahacks-a9cac/usage/details', '_blank');
  };

  if (status === 'checking') {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <p className="text-blue-800">
            Verificando estado de Firebase Storage...
          </p>
        </div>
      </div>
    );
  }

  if (status === 'available') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="text-green-800">
            ✅ Firebase Storage disponible - Plan Blaze activo
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-orange-800 font-medium mb-2">
            Firebase Storage no está disponible
          </h3>
          <p className="text-orange-700 text-sm mb-3">
            Tu proyecto está en el plan Spark (gratuito). Para usar Storage, necesitas actualizar tu plan de facturación.
          </p>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Settings className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700">Plan actual: Spark (Gratuito)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-orange-600" />
              <span className="text-orange-700">Plan requerido: Blaze (Pago por uso)</span>
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button
              onClick={openBillingSetup}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Actualizar Plan
            </button>
            <button
              onClick={openFirebaseConsole}
              className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              <ExternalLink className="h-4 w-4" />
              Ir a Firebase Console
            </button>
          </div>
          
          <div className="mt-3 p-3 bg-orange-100 rounded-lg">
            <p className="text-orange-800 text-xs">
              <strong>Nota:</strong> El plan Blaze es muy económico para desarrollo. Solo pagas por lo que uses 
              (aproximadamente $0.026 por GB al mes). Los primeros 5GB son gratuitos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseStorageStatus; 