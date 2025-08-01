import { useState, useRef, useEffect } from 'react'
import { X, Upload, Tag, Trash2, CheckCircle, AlertCircle } from 'lucide-react'
import { uploadVideo, uploadFile, generateVideoThumbnail } from '../../services/firebase/storage'
import { createVideoDocument, checkVideoDuplicate } from '../../services/firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import Toast from '../common/Toast'

const VideoUploadModal = ({ isOpen, onClose, onVideoUploaded, page = 'figuras', style = 'salsa' }) => {
  const { user } = useAuth()
  const { currentCategories, categoriesList, getColorClasses } = useCategories(page, style)
  const fileInputRef = useRef(null)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [videoData, setVideoData] = useState({})
  const [toasts, setToasts] = useState([])

  // Estados para tags organizados por categorías
  const [selectedTags, setSelectedTags] = useState({})

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  useEffect(() => {
    // Inicializar selectedTags con las categorías disponibles
    if (currentCategories) {
      const initialTags = {}
      Object.keys(currentCategories).forEach(categoryKey => {
        initialTags[categoryKey] = []
      })
      setSelectedTags(initialTags)
    }
  }, [currentCategories])

  const resetForm = () => {
    setSelectedFiles([])
    setUploading(false)
    setUploadProgress({})
    setCurrentStep(1)
    setVideoData({})
    if (currentCategories) {
      const initialTags = {}
      Object.keys(currentCategories).forEach(categoryKey => {
        initialTags[categoryKey] = []
      })
      setSelectedTags(initialTags)
    }
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    
    if (videoFiles.length !== files.length) {
      addToast('Solo se permiten archivos de video', 'error')
      return
    }

    // Verificar duplicados en la selección actual
    const newFiles = videoFiles.filter(newFile => 
      !selectedFiles.some(existingFile => 
        existingFile.name === newFile.name && existingFile.size === newFile.size
      )
    )

    if (newFiles.length === 0) {
      addToast('Algunos archivos ya están seleccionados', 'warning')
      return
    }

    setSelectedFiles(prev => [...prev, ...newFiles])
    addToast(`${newFiles.length} video(s) seleccionado(s)`, 'success')
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleTagToggle = (category, tag) => {
    setSelectedTags(prev => {
      const currentTags = prev[category] || []
      const isSelected = currentTags.includes(tag)
      
      if (isSelected) {
        return {
          ...prev,
          [category]: currentTags.filter(t => t !== tag)
        }
      } else {
        return {
          ...prev,
          [category]: [...currentTags, tag]
        }
      }
    })
  }

  const generateThumbnail = async (file) => {
    try {
      const result = await generateVideoThumbnail(file)
      if (result.success && result.blob) {
        // Subir thumbnail a Firebase Storage
        const thumbnailPath = `thumbnails/${Date.now()}_${file.name.replace(/\.[^/.]+$/, '.jpg')}`
        const uploadResult = await uploadFile(result.blob, thumbnailPath)
        
        if (uploadResult.success) {
          // Limpiar blob URL temporal
          URL.revokeObjectURL(result.thumbnailURL)
          return { url: uploadResult.url, path: uploadResult.path }
        }
      }
      return { url: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO', path: null }
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      return { url: 'https://via.placeholder.com/400x225/1a1a1a/ffffff?text=VIDEO', path: null }
    }
  }

  const uploadVideoFile = async (file, index) => {
    try {
      // Verificar duplicado en base de datos
      const duplicateCheck = await checkVideoDuplicate(file.name)
      if (duplicateCheck.isDuplicate) {
        addToast(`Video "${file.name}" ya existe en la base de datos`, 'warning')
        return null
      }

      // Generar thumbnail
      const thumbnailResult = await generateThumbnail(file)

      // Subir video
      const videoPath = `videos/${Date.now()}_${file.name}`
      const uploadResult = await uploadVideo(file, videoPath, (progress) => {
        setUploadProgress(prev => ({ ...prev, [index]: progress }))
      })

      if (!uploadResult.success) {
        addToast(`Error al subir ${file.name}: ${uploadResult.error}`, 'error')
        return null
      }

      // Asegurar que el estilo esté incluido en los tags
      const tagsWithStyle = {
        ...selectedTags,
        estilo: selectedTags.estilo ? [...selectedTags.estilo, style] : [style]
      }

      // Crear documento en Firestore
      const videoDoc = {
        title: file.name.replace(/\.[^/.]+$/, ''),
        originalTitle: file.name,
        description: videoData[file.name]?.description || '',
        videoUrl: uploadResult.url,
        thumbnailUrl: thumbnailResult.url,
        videoPath: uploadResult.path,
        thumbnailPath: thumbnailResult.path,
        fileSize: file.size,
        fileType: file.type,
        duration: 0, // Se puede calcular después
        style: style, // Agregar el estilo del video
        tags: tagsWithStyle,
        uploadedBy: user?.uid || 'anonymous',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0
      }

      const docResult = await createVideoDocument(videoDoc)
      if (!docResult.success) {
        addToast(`Error al guardar metadatos de ${file.name}`, 'error')
        return null
      }

      addToast(`${file.name} subido exitosamente`, 'success')
      return { ...videoDoc, id: docResult.id }
    } catch (error) {
      console.error('Error uploading video:', error)
      addToast(`Error inesperado al subir ${file.name}`, 'error')
      return null
    }
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      addToast('Selecciona al menos un video', 'error')
      return
    }

    setUploading(true)
    const uploadedVideos = []

    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      const result = await uploadVideoFile(file, i)
      if (result) {
        uploadedVideos.push(result)
      }
    }

    setUploading(false)
    
    if (uploadedVideos.length > 0) {
      addToast(`${uploadedVideos.length} video(s) subido(s) correctamente`, 'success')
      uploadedVideos.forEach(video => onVideoUploaded(video))
      onClose()
    }
  }

  const FileSelectionStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Seleccionar Videos</h3>
        <p className="text-gray-600">Selecciona uno o varios videos para subir</p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-pink-400 transition-colors duration-200">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center space-y-2 text-gray-600 hover:text-pink-500 transition-colors duration-200"
        >
          <Upload className="h-12 w-12" />
          <span className="font-medium">Haz clic para seleccionar videos</span>
          <span className="text-sm">MP4, AVI, MOV, etc. (máx. 100MB cada uno)</span>
        </button>
      </div>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Videos seleccionados ({selectedFiles.length})</h4>
          {selectedFiles.map((file, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const TagsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurar Etiquetas</h3>
        <p className="text-gray-600">Selecciona las etiquetas que describan tus videos</p>
      </div>

             {categoriesList.map((category) => (
         <div key={category.key} className="space-y-3">
           <h4 className="font-medium text-gray-900 capitalize">{category.name}</h4>
           <div className="flex flex-wrap gap-2">
             {category.tags.map(tag => (
               <button
                 key={tag}
                 onClick={() => handleTagToggle(category.key, tag)}
                 className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                   selectedTags[category.key]?.includes(tag)
                      ? 'bg-gradient-to-r from-pink-500 to-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                 }`}
               >
                 {tag}
               </button>
             ))}
           </div>
         </div>
       ))}

      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 font-medium">Información</p>
            <p className="text-sm text-blue-700">Las etiquetas ayudarán a otros usuarios a encontrar tus videos más fácilmente.</p>
          </div>
        </div>
      </div>
    </div>
  )

  const UploadStep = () => (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Subiendo Videos</h3>
        <p className="text-gray-600">Procesando {selectedFiles.length} video(s)...</p>
      </div>

      {selectedFiles.map((file, index) => (
        <div key={index} className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">{file.name}</span>
            <span className="text-sm text-gray-500">{uploadProgress[index] || 0}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress[index] || 0}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <FileSelectionStep />
      case 2:
        return <TagsStep />
      case 3:
        return <UploadStep />
      default:
        return <FileSelectionStep />
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return selectedFiles.length > 0
      case 2:
        return true // Siempre se puede proceder desde tags
      case 3:
        return false // No se puede proceder durante upload
      default:
        return false
    }
  }

  const handleNext = () => {
    if (currentStep === 2) {
      handleUpload()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    setCurrentStep(prev => Math.max(1, prev - 1))
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full">
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Subir Videos</h2>
                <p className="text-sm text-gray-500">Paso {currentStep} de 3</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {renderStep()}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={handleBack}
              disabled={currentStep === 1 || uploading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Atrás
            </button>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={uploading}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              
              {currentStep < 3 && (
                <button
                  onClick={handleNext}
                  disabled={!canProceed() || uploading}
                  className="px-6 py-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {currentStep === 2 ? 'Subir Videos' : 'Siguiente'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toasts */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  )
}

export default VideoUploadModal 