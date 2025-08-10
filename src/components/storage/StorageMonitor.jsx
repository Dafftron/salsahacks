import React from 'react';
import {
  Database,
  HardDrive,
  FileText,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  TrendingUp,
  Info,
  Shield,
  DollarSign,
  ArrowRight
} from 'lucide-react';
import { useFirebaseStorage } from '../../hooks/useFirebaseStorage';

const StorageMonitor = () => {
  const {
    totalSize,
    totalFiles,
    loading,
    error,
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
  } = useFirebaseStorage();

  const status = getStorageStatus();
  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const costs = calculateMonthlyCosts();
  const redundancyInfo = getRedundancyInfo();

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Calculando uso de storage...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-red-200">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertTriangle className="h-5 w-5" />
          <span>Error al obtener información de storage: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-white" />
            <div>
              <h3 className="text-lg font-semibold text-white">Monitoreo de Storage</h3>
              <p className="text-blue-100 text-sm">Uso de Firebase Storage en tiempo real</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{statusIcon}</span>
            <span className={`text-white font-semibold ${statusColor.replace('text-', 'text-')}`}>
              {status === 'danger' ? 'CRÍTICO' : status === 'warning' ? 'ADVERTENCIA' : 'SALUDABLE'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Barra de progreso principal */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Uso de Storage</span>
            <span className="text-sm font-semibold text-gray-900">
              {formatBytes(totalSize)} / {formatBytes(storageLimits.freeTier)}
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${
                isOverLimit
                  ? 'bg-red-500'
                  : isNearLimit
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{
                width: `${Math.min(usagePercentage, 100)}%`,
                maxWidth: '100%'
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">Gratuito (5GB)</span>
            <span className={`text-xs font-medium ${statusColor}`}>
              {usagePercentage.toFixed(1)}% usado
            </span>
            <span className="text-xs text-gray-500">Plan de pago (100GB)</span>
          </div>
        </div>

        {/* Estadísticas detalladas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center space-x-3">
              <HardDrive className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Tamaño Total</p>
                <p className="text-lg font-bold text-blue-900">{formatBytes(totalSize)}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Archivos</p>
                <p className="text-lg font-bold text-green-900">{totalFiles.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Espacio Libre</p>
                <p className="text-lg font-bold text-purple-900">
                  {formatBytes(Math.max(0, storageLimits.freeTier - totalSize))}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Selector de Redundancia */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 mb-6 border border-indigo-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <Shield className="h-4 w-4 text-indigo-600" />
            <span>Configuración de Redundancia</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Opción Estándar */}
            <div
              className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${
                redundancyType === 'standard'
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => changeRedundancyType('standard')}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">🛡️</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800">Redundancia Estándar</h5>
                  <p className="text-sm text-gray-600">Máxima seguridad</p>
                  <p className="text-xs text-gray-500">Disponibilidad: 99.99%</p>
                </div>
                {redundancyType === 'standard' && (
                  <CheckCircle className="h-5 w-5 text-indigo-600" />
                )}
              </div>
              <div className="mt-2 text-right">
                <span className="text-lg font-bold text-indigo-600">
                  ${storagePricing.standard.toFixed(3)}/GB/mes
                </span>
              </div>
            </div>

            {/* Opción Reducida */}
            <div
              className={`rounded-lg p-4 border-2 cursor-pointer transition-all ${
                redundancyType === 'reducedRedundancy'
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              onClick={() => changeRedundancyType('reducedRedundancy')}
            >
              <div className="flex items-center space-x-3">
                <div className="text-2xl">💰</div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-800">Redundancia Reducida</h5>
                  <p className="text-sm text-gray-600">Máximo ahorro</p>
                  <p className="text-xs text-gray-500">Disponibilidad: 99.9%</p>
                </div>
                {redundancyType === 'reducedRedundancy' && (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
              </div>
              <div className="mt-2 text-right">
                <span className="text-lg font-bold text-green-600">
                  ${storagePricing.reducedRedundancy.toFixed(3)}/GB/mes
                </span>
              </div>
            </div>
          </div>

          {/* Comparación de costos */}
          {costs.current > 0 && (
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Costo mensual actual:</span>
                <span className="font-semibold text-gray-900">
                  ${costs.current.toFixed(2)}/mes
                </span>
              </div>

              {redundancyType === 'standard' && costs.savings > 0 && (
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-600">Ahorro con redundancia reducida:</span>
                  <span className="font-semibold text-green-600">
                    ${costs.savings.toFixed(2)}/mes
                  </span>
                </div>
              )}

              {redundancyType === 'reducedRedundancy' && (
                <div className="flex items-center justify-between mt-2 text-sm">
                  <span className="text-gray-600">Costo extra con estándar:</span>
                  <span className="font-semibold text-red-600">
                    ${costs.savings.toFixed(2)}/mes
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Límites y costos */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <Info className="h-4 w-4 text-gray-600" />
            <span>Límites y Costos</span>
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Plan Gratuito:</span>
                <span className="text-sm font-medium text-gray-900">5GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totalSize / storageLimits.freeTier) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Plan de Pago:</span>
                <span className="text-sm font-medium text-gray-900">100GB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${Math.min((totalSize / storageLimits.paidTier) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-xs text-blue-800">
              <strong>Nota:</strong> Al superar los 5GB gratuitos, se aplicarán cargos según el uso.
              El plan de pago incluye 100GB por defecto.
            </p>
          </div>
        </div>

        {/* Costos mensuales */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 mb-6 border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>Costos Mensuales</span>
          </h4>

          {costs.current === 0 ? (
            <div className="text-center py-4">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-green-700 font-semibold">¡Plan Gratuito!</p>
              <p className="text-sm text-green-600">No hay costos mensuales</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Costo Mensual</p>
                    <p className="text-2xl font-bold text-green-600">
                      ${costs.current.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">por mes</p>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">Exceso sobre 5GB</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {costs.excessGB.toFixed(2)} GB
                    </p>
                    <p className="text-xs text-gray-500">almacenamiento extra</p>
                  </div>
                </div>
              </div>

              {costs.savings > 0 && redundancyType === 'standard' && (
                <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-yellow-800">
                      💡 Ahorro con redundancia reducida:
                    </span>
                    <span className="font-semibold text-yellow-700">
                      ${costs.savings.toFixed(2)}/mes
                    </span>
                  </div>
                </div>
              )}

              {costs.ifExceedPaid > 0 && (
                <div className="bg-red-50 rounded-lg p-3 border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-red-800">
                      ⚠️ Excediendo plan de pago:
                    </span>
                    <span className="font-semibold text-red-700">
                      +${costs.ifExceedPaid.toFixed(2)}/mes
                    </span>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-800">
                  <strong>Precio actual:</strong> ${costs.currentPrice.toFixed(3)} por GB/mes
                  ({redundancyInfo.name})
                  <br />
                  <strong>Alternativa:</strong> ${redundancyType === 'standard' ? storagePricing.reducedRedundancy.toFixed(3) : storagePricing.standard.toFixed(3)} por GB/mes
                  ({redundancyType === 'standard' ? 'Redundancia Reducida' : 'Estándar'})
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Recomendaciones */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 rounded-lg p-4 border border-orange-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <span>Recomendaciones</span>
          </h4>

          <div className="space-y-4">
            {/* Recomendaciones generales */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">📊 Gestión de Storage:</h5>
              <ul className="space-y-2">
                {getRecommendations().map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recomendaciones de costos */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-2">💰 Optimización de Costos:</h5>
              <ul className="space-y-2">
                {getCostRecommendations().map((recommendation, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones rápidas */}
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Actualizar</span>
          </button>

          <button
            onClick={() => window.open('https://console.firebase.google.com/project/salsahacks-a9cac/storage', '_blank')}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Firebase Console</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StorageMonitor;
