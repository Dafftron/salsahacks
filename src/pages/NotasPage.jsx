import { useState } from 'react'
import { Plus, GitCommit, Calendar, CheckCircle, Clock, AlertCircle } from 'lucide-react'

const NotasPage = () => {
  const [activeTab, setActiveTab] = useState('commits')

  const commits = [
    {
      id: '2f0e0ee',
      date: '2025-01-27',
      message: 'Initial commit: Project structure and documentation',
      description: 'Configuración inicial del proyecto con documentación completa',
      files: ['README.md', 'PLAN_COMPLETO.md', 'leviosa.bat', 'start.bat'],
      status: 'completed',
      notes: 'Repositorio Git inicializado, rama principal configurada'
    },
    {
      id: '153bf64',
      date: '2025-01-27',
      message: 'Add: Sistema de seguimiento de commits en NOTAS_COMMITS.md',
      description: 'Implementación del sistema de documentación de commits',
      files: ['NOTAS_COMMITS.md', 'leviosa.bat'],
      status: 'completed',
      notes: 'Sistema de documentación implementado, script mejorado'
    }
  ]

  const milestones = [
    {
      id: 1,
      title: 'Configuración Inicial',
      description: 'Proyecto base con documentación y scripts',
      status: 'completed',
      date: '2025-01-27',
      progress: 100
    },
    {
      id: 2,
      title: 'Fase 1: Fundación',
      description: 'React + Vite + Firebase + Estructura base',
      status: 'in-progress',
      date: '2025-01-27',
      progress: 60
    },
    {
      id: 3,
      title: 'Fase 2: Arquitectura Base',
      description: 'Componentes comunes y sistema de temas',
      status: 'pending',
      date: 'Pendiente',
      progress: 0
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in-progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'pending':
        return <AlertCircle className="h-5 w-5 text-gray-400" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'in-progress':
        return 'text-yellow-600 bg-yellow-100'
      case 'pending':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-salsa-primary mb-2">Notas de Desarrollo</h1>
        <p className="text-gray-600">Seguimiento de commits y control de hitos del proyecto</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('commits')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'commits'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <GitCommit className="h-4 w-4" />
          <span>Commits</span>
        </button>
        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeTab === 'milestones'
              ? 'bg-white text-salsa-primary shadow-sm'
              : 'text-gray-600 hover:text-salsa-primary'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span>Hitos</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === 'commits' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Historial de Commits</h2>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Commit</span>
            </button>
          </div>

          <div className="space-y-4">
            {commits.map((commit) => (
              <div key={commit.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <GitCommit className="h-5 w-5 text-salsa-primary" />
                      <span className="font-mono text-sm text-gray-500">{commit.id}</span>
                      <span className="text-sm text-gray-500">{commit.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {commit.message}
                    </h3>
                    <p className="text-gray-600 mb-3">{commit.description}</p>
                    
                    <div className="mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Archivos modificados:</h4>
                      <div className="flex flex-wrap gap-2">
                        {commit.files.map((file) => (
                          <span
                            key={file}
                            className="px-2 py-1 bg-salsa-light text-salsa-dark text-xs rounded"
                          >
                            {file}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      <strong>Notas:</strong> {commit.notes}
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(commit.status)}`}>
                      {commit.status === 'completed' ? 'Completado' : 'En progreso'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'milestones' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Hitos del Proyecto</h2>
            <button className="btn-primary flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Nuevo Hito</span>
            </button>
          </div>

          <div className="space-y-4">
            {milestones.map((milestone) => (
              <div key={milestone.id} className="card p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(milestone.status)}
                      <span className="text-sm text-gray-500">{milestone.date}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{milestone.description}</p>
                    
                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progreso</span>
                        <span>{milestone.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-salsa-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${milestone.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(milestone.status)}`}>
                      {milestone.status === 'completed' ? 'Completado' : 
                       milestone.status === 'in-progress' ? 'En progreso' : 'Pendiente'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default NotasPage 