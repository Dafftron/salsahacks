import { useState, useEffect } from 'react';
import { ref, listAll, getMetadata } from 'firebase/storage';
import { storage } from '../services/firebase/config';

export const useFirebaseStorage = () => {
  const [storageInfo, setStorageInfo] = useState({
    totalSize: 0,
    totalFiles: 0,
    loading: true,
    error: null
  });

  const [storageLimits] = useState({
    // Límites de Firebase Storage (en bytes)
    freeTier: 5 * 1024 * 1024 * 1024, // 5GB
    paidTier: 100 * 1024 * 1024 * 1024, // 100GB
    warningThreshold: 0.8 // 80% del límite gratuito
  });

  // Estado para seleccionar tipo de redundancia
  const [redundancyType, setRedundancyType] = useState('standard'); // 'standard' o 'reduced'

  // Precios de Firebase Storage (por GB/mes)
  const [storagePricing] = useState({
    // Precios oficiales de Firebase Storage (actualizados 2024)
    // https://firebase.google.com/pricing
    standard: 0.026, // $0.026 por GB/mes
    reducedRedundancy: 0.018, // $0.018 por GB/mes (menos redundancia)
    archive: 0.004 // $0.004 por GB/mes (archivo)
  });

  useEffect(() => {
    const calculateStorageUsage = async () => {
      try {
        setStorageInfo(prev => ({ ...prev, loading: true, error: null }));
        
        let totalSize = 0;
        let totalFiles = 0;

        // Función recursiva para calcular el tamaño de todas las carpetas
        const calculateFolderSize = async (folderPath) => {
          try {
            const folderRef = ref(storage, folderPath);
            const result = await listAll(folderRef);
            
            // Procesar archivos en esta carpeta
            for (const fileRef of result.items) {
              try {
                const metadata = await getMetadata(fileRef);
                totalSize += metadata.size || 0;
                totalFiles++;
              } catch (error) {
                console.warn(`Error al obtener metadata de ${fileRef.fullPath}:`, error);
              }
            }
            
            // Procesar subcarpetas recursivamente
            for (const prefixRef of result.prefixes) {
              await calculateFolderSize(prefixRef.fullPath);
            }
          } catch (error) {
            console.warn(`Error al procesar carpeta ${folderPath}:`, error);
          }
        };

        // Calcular tamaño de las carpetas principales
        await calculateFolderSize('videos');
        await calculateFolderSize('thumbnails');
        await calculateFolderSize('profile-images');
        await calculateFolderSize('event-images');
        await calculateFolderSize('figure-images');

        setStorageInfo({
          totalSize,
          totalFiles,
          loading: false,
          error: null
        });

      } catch (error) {
        console.error('Error al calcular uso de storage:', error);
        setStorageInfo(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    calculateStorageUsage();
  }, []);

  // Calcular porcentajes y estados
  const usagePercentage = (storageInfo.totalSize / storageLimits.freeTier) * 100;
  const isNearLimit = usagePercentage >= (storageLimits.warningThreshold * 100);
  const isOverLimit = usagePercentage >= 100;

  // Obtener estado del storage
  const getStorageStatus = () => {
    if (isOverLimit) return 'danger';
    if (isNearLimit) return 'warning';
    return 'safe';
  };

  // Obtener color del estado
  const getStatusColor = (status) => {
    switch (status) {
      case 'danger': return 'text-red-600';
      case 'warning': return 'text-yellow-600';
      case 'safe': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  // Obtener icono del estado
  const getStatusIcon = (status) => {
    switch (status) {
      case 'danger': return '🔴';
      case 'warning': return '⚠️';
      case 'safe': return '✅';
      default: return 'ℹ️';
    }
  };

  // Formatear bytes a formato legible
  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Calcular costos mensuales basados en el tipo de redundancia seleccionado
  const calculateMonthlyCosts = () => {
    if (storageInfo.totalSize <= storageLimits.freeTier) {
      return {
        current: 0,
        ifExceedFree: 0,
        ifExceedPaid: 0,
        savings: 0
      };
    }

    // Calcular costo si excedemos el límite gratuito
    const excessGB = (storageInfo.totalSize - storageLimits.freeTier) / (1024 * 1024 * 1024);
    
    // Usar el precio del tipo de redundancia seleccionado
    const currentPrice = storagePricing[redundancyType];
    const currentCost = excessGB * currentPrice;
    
    // Calcular costo si excedemos el plan de pago (100GB)
    const ifExceedPaid = Math.max(0, (storageInfo.totalSize - storageLimits.paidTier) / (1024 * 1024 * 1024)) * currentPrice;
    
    // Calcular ahorro con redundancia reducida vs estándar
    const savingsWithReduced = excessGB * (storagePricing.standard - storagePricing.reducedRedundancy);

    return {
      current: currentCost,
      ifExceedFree: currentCost,
      ifExceedPaid: ifExceedPaid,
      savings: savingsWithReduced,
      excessGB: excessGB,
      currentPrice: currentPrice
    };
  };

  // Obtener recomendaciones de costos
  const getCostRecommendations = () => {
    const costs = calculateMonthlyCosts();
    
    if (costs.current === 0) {
      return [
        'Estás dentro del plan gratuito',
        'Puedes continuar subiendo contenido sin costos',
        'Considera optimizar videos para ahorrar espacio'
      ];
    }

    const recommendations = [
      `Costo mensual actual: $${costs.current.toFixed(2)}`,
      `Exceso sobre límite gratuito: ${costs.excessGB.toFixed(2)} GB`,
      `Tipo de redundancia: ${redundancyType === 'standard' ? 'Estándar' : 'Reducida'}`
    ];

    if (redundancyType === 'standard' && costs.savings > 0) {
      recommendations.push(`💡 Ahorro con redundancia reducida: $${costs.savings.toFixed(2)}/mes`);
    }

    if (costs.ifExceedPaid > 0) {
      recommendations.push(`⚠️ Excediendo plan de pago: +$${costs.ifExceedPaid.toFixed(2)}/mes`);
    }

    recommendations.push(
      'Considera limpiar archivos no utilizados',
      'Optimiza calidad de videos para reducir tamaño'
    );

    if (redundancyType === 'standard') {
      recommendations.push('Evalúa migrar a redundancia reducida si no es crítico');
    }

    return recommendations;
  };

  // Obtener recomendaciones basadas en el uso
  const getRecommendations = () => {
    if (isOverLimit) {
      return [
        'Eliminar videos no utilizados',
        'Comprimir videos existentes',
        'Considerar upgrade a plan de pago',
        'Limpiar thumbnails duplicados'
      ];
    } else if (isNearLimit) {
      return [
        'Revisar videos antiguos',
        'Optimizar calidad de thumbnails',
        'Planificar limpieza de archivos'
      ];
    } else {
      return [
        'Uso de storage saludable',
        'Puedes continuar subiendo contenido',
        'Considerar backup de archivos importantes'
      ];
    }
  };

  // Función para cambiar tipo de redundancia
  const changeRedundancyType = (newType) => {
    setRedundancyType(newType);
  };

  // Obtener información del tipo de redundancia actual
  const getRedundancyInfo = () => {
    const info = {
      standard: {
        name: 'Estándar',
        description: 'Máxima seguridad y disponibilidad',
        availability: '99.99%',
        price: storagePricing.standard,
        icon: '🛡️'
      },
      reducedRedundancy: {
        name: 'Reducida',
        description: 'Menor seguridad, mayor ahorro',
        availability: '99.9%',
        price: storagePricing.reducedRedundancy,
        icon: '💰'
      }
    };

    return info[redundancyType];
  };

  return {
    ...storageInfo,
    storageLimits,
    usagePercentage,
    isNearLimit,
    isOverLimit,
    getStorageStatus,
    getStatusColor,
    getStatusIcon,
    formatBytes,
    getRecommendations,
    calculateMonthlyCosts,
    getCostRecommendations,
    redundancyType,
    changeRedundancyType,
    getRedundancyInfo,
    storagePricing
  };
};
