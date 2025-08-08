import React, { useState, useRef, useEffect } from 'react'
import { X, Upload, Tag, Trash2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp, Music } from 'lucide-react'
import { uploadVideo, uploadFile, generateVideoThumbnail, generateBestVideoThumbnail } from '../../services/firebase/storage'
import { createVideoDocument, checkVideoDuplicate } from '../../services/firebase/firestore'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import Toast from '../common/Toast'
import VideoPlayer from './VideoPlayer'
import { extractBPMFromVideo, validateBPM, getBPMDescription } from '../../services/audio/bpmDetection'

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
  
  // Refs para mantener los valores de los campos
  const fieldRefs = useRef({})
  
  // Estado para videos plegados/desplegados - TODOS PLEGADOS POR DEFECTO
  const [collapsedVideos, setCollapsedVideos] = useState(new Set())

  useEffect(() => {
    if (!isOpen) {
      resetForm()
    } else {
      // Resetear el paso cuando se abre el modal
      setCurrentStep(1)
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
    // Limpiar URLs de vista previa antes de resetear
    Object.values(videoData).forEach(data => {
      if (data.videoPreview) {
        URL.revokeObjectURL(data.videoPreview)
      }
      if (data.thumbnailPreview) {
        URL.revokeObjectURL(data.thumbnailPreview)
      }
    })
    
    setSelectedFiles([])
    setVideoData({})
    setCollapsedVideos(new Set())
    setUploadProgress({})
    setUploading(false)
    setCurrentStep(1)
    
    // Limpiar el input de archivos
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Función para alternar el estado plegado/desplegado de un video
  const toggleVideoCollapse = (fileName) => {
    setCollapsedVideos(prev => {
      const newSet = new Set(prev)
      if (newSet.has(fileName)) {
        newSet.delete(fileName)
      } else {
        newSet.add(fileName)
      }
      return newSet
    })
  }

  // Función para plegar/desplegar todos los videos
  const toggleAllVideos = (collapse) => {
    if (collapse) {
      setCollapsedVideos(new Set(selectedFiles.map(file => file.name)))
    } else {
      setCollapsedVideos(new Set())
    }
  }

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files)
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    
    if (videoFiles.length === 0) {
      addToast('Por favor selecciona archivos de video válidos', 'error')
      return
    }

    // Filtrar archivos que ya están seleccionados
    const newFiles = videoFiles.filter(file => 
      !selectedFiles.some(existingFile => existingFile.name === file.name)
    )

    if (newFiles.length === 0) {
      addToast('Algunos archivos ya están seleccionados', 'warning')
      return
    }

    // Actualizar archivos seleccionados
    setSelectedFiles(prev => [...prev, ...newFiles])

    // Generar vistas previas y thumbnails para los nuevos archivos
    newFiles.forEach(async (file) => {
      const videoPreview = URL.createObjectURL(file)
      
      // Generar thumbnail para la vista previa del modal
      try {
        const thumbnailBlob = await generateDefaultThumbnail(file)
        const thumbnailURL = URL.createObjectURL(thumbnailBlob)
        
        setVideoData(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            videoPreview,
            thumbnailPreview: thumbnailURL
          }
        }))
      } catch (error) {
        console.warn('Error generando thumbnail para vista previa:', error)
        setVideoData(prev => ({
          ...prev,
          [file.name]: {
            ...prev[file.name],
            videoPreview
          }
        }))
      }
    })

    addToast(`${newFiles.length} video(s) agregado(s)`, 'success')
  }

  const removeFile = (index) => {
    const fileToRemove = selectedFiles[index]
    if (fileToRemove && videoData[fileToRemove.name]) {
      if (videoData[fileToRemove.name].videoPreview) {
        URL.revokeObjectURL(videoData[fileToRemove.name].videoPreview)
      }
      if (videoData[fileToRemove.name].thumbnailPreview) {
        URL.revokeObjectURL(videoData[fileToRemove.name].thumbnailPreview)
      }
    }
    
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
    setVideoData(prev => {
      const newData = { ...prev }
      delete newData[fileToRemove.name]
      return newData
    })
    setCollapsedVideos(prev => {
      const newSet = new Set(prev)
      newSet.delete(fileToRemove.name)
      return newSet
    })
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
        // Usar Set para evitar duplicados automáticamente
        const newTags = [...new Set([...currentTags, tag])]
        return {
          ...prev,
          [category]: newTags
        }
      }
    })
  }



  const generateThumbnail = async (file) => {
    try {
      // Si hay un thumbnail personalizado, usarlo
      if (videoData[file.name]?.customThumbnailFile) {
        const customThumbnailFile = videoData[file.name].customThumbnailFile
        const thumbnailPath = `thumbnails/${page}/${style}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, '.jpg')}`
        const uploadResult = await uploadFile(customThumbnailFile, thumbnailPath)
        
        if (uploadResult.success) {
          return { url: uploadResult.url, path: uploadResult.path }
        }
      }
      
      // Intentar generar thumbnail de ALTA CALIDAD automáticamente con timeout
      try {
        const result = await Promise.race([
          generateBestVideoThumbnail(file), // Usar la función de alta calidad
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout')), 15000) // Aumentar timeout para mejor calidad
          )
        ])
        
        if (result.success && result.blob) {
          // Subir thumbnail a Firebase Storage
          const thumbnailPath = `thumbnails/${page}/${style}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, '.jpg')}`
          const uploadResult = await uploadFile(result.blob, thumbnailPath)
          
          if (uploadResult.success) {
            // Limpiar blob URL temporal
            if (result.thumbnailURL) {
              URL.revokeObjectURL(result.thumbnailURL)
            }
            return { url: uploadResult.url, path: uploadResult.path }
          }
        }
      } catch (thumbnailError) {
        console.warn('Error generando thumbnail automático:', thumbnailError)
        // Continuar sin thumbnail
      }
      
      // Fallback: usar thumbnail por defecto de Windows o generar uno simple
      try {
        // Intentar usar el thumbnail nativo del archivo (si está disponible)
        const defaultThumbnail = await generateDefaultThumbnail(file)
        if (defaultThumbnail) {
          const thumbnailPath = `thumbnails/${page}/${style}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, '.jpg')}`
          const uploadResult = await uploadFile(defaultThumbnail, thumbnailPath)
          
          if (uploadResult.success) {
            return { url: uploadResult.url, path: uploadResult.path }
          }
        }
      } catch (defaultError) {
        console.warn('Error generando thumbnail por defecto:', defaultError)
      }
      
      // Fallback final: no thumbnail, se mostrará el placeholder en la UI
      return { url: null, path: null }
    } catch (error) {
      console.error('Error en generateThumbnail:', error)
      return { url: null, path: null }
    }
  }

  // Función para generar thumbnail por defecto usando el video
  const generateDefaultThumbnail = async (file) => {
    return new Promise((resolve, reject) => {
      try {
        const videoURL = URL.createObjectURL(file)
        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.muted = true
        video.playsInline = true
        
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        // Configurar canvas con ALTA CALIDAD para thumbnail
        canvas.width = 1280 // Aumentar de 400 a 1280 para mejor calidad
        canvas.height = 720 // Aumentar de 225 a 720 para mejor calidad (16:9)
        
        video.onloadedmetadata = () => {
          try {
            // Intentar capturar frame al inicio del video (0.1 segundos)
            video.currentTime = 0.1
            
            video.onseeked = () => {
              try {
                // Dibujar el frame en el canvas
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                
                // Convertir a blob
                canvas.toBlob((blob) => {
                  if (blob) {
                    // Limpiar recursos
                    URL.revokeObjectURL(videoURL)
                    video.remove()
                    canvas.remove()
                    
                    resolve(blob)
                  } else {
                    reject(new Error('No se pudo generar el thumbnail por defecto'))
                  }
                }, 'image/jpeg', 0.95) // Aumentar calidad de 0.8 a 0.95
                
              } catch (error) {
                reject(new Error(`Error al capturar frame por defecto: ${error.message}`))
              }
            }
            
            video.onerror = () => {
              reject(new Error('Error al cargar el video para thumbnail por defecto'))
            }
            
          } catch (error) {
            reject(new Error(`Error al procesar metadata por defecto: ${error.message}`))
          }
        }
        
        video.onerror = () => {
          URL.revokeObjectURL(videoURL)
          video.remove()
          canvas.remove()
          reject(new Error('Error al cargar el video por defecto'))
        }
        
        // Cargar el video
        video.src = videoURL
        
      } catch (error) {
        reject(new Error(`Error al generar thumbnail por defecto: ${error.message}`))
      }
    })
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

      // Subir video con estructura organizada por página y estilo
      const videoPath = `videos/${page}/${style}/${Date.now()}_${file.name}`
      const uploadResult = await uploadVideo(file, videoPath, (progress) => {
        setUploadProgress(prev => ({ ...prev, [index]: progress }))
      })

      if (!uploadResult.success) {
        addToast(`Error al subir ${file.name}: ${uploadResult.error}`, 'error')
        return null
      }

      // Usar solo los tags seleccionados por el usuario, sin agregar automáticamente el style
      const tagsWithStyle = {
        ...selectedTags,
        estilo: selectedTags.estilo || []
      }

      // Obtener los valores actuales de los campos de entrada usando refs
      const titleInput = fieldRefs.current[`${file.name}-title`]
      const descriptionInput = fieldRefs.current[`${file.name}-description`]
      
      const currentTitle = titleInput?.value?.trim() || videoData[file.name]?.title || file.name.replace(/\.[^/.]+$/, '')
      const currentDescription = descriptionInput?.value?.trim() || videoData[file.name]?.description || ''
     
      // Detectar resolución del video
      let videoResolution = null
      let videoWidth = null
      let videoHeight = null
      try {
        const video = document.createElement('video')
        video.src = URL.createObjectURL(file)
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = () => {
            videoWidth = video.videoWidth
            videoHeight = video.videoHeight
            const maxDimension = Math.max(videoWidth, videoHeight)
            
            if (maxDimension >= 3840) videoResolution = '4K'
            else if (maxDimension >= 1920) videoResolution = '1080p'
            else if (maxDimension >= 1280) videoResolution = '720p'
            else if (maxDimension >= 854) videoResolution = '480p'
            else videoResolution = '360p'
            
            URL.revokeObjectURL(video.src)
            resolve()
          }
          video.onerror = reject
        })
      } catch (error) {
        console.warn('No se pudo detectar la resolución del video:', error)
        videoResolution = 'Unknown'
      }

      // Detectar BPM del video
      let bpm = null
      let bpmDetected = false
      try {
        const bpmResult = await extractBPMFromVideo(file)
        if (bpmResult.success && validateBPM(bpmResult.bpm)) {
          bpm = bpmResult.bpm
          bpmDetected = true
        }
      } catch (error) {
        console.error('❌ Error al detectar BPM:', error)
      }

      // Crear documento en Firestore
      const videoDoc = {
        title: currentTitle,
        originalTitle: file.name,
        description: currentDescription,
        videoUrl: uploadResult.url,
        thumbnailUrl: thumbnailResult.url || null,
        videoPath: uploadResult.path,
        thumbnailPath: thumbnailResult.path || null,
        fileSize: file.size,
        fileType: file.type,
        duration: 0, // Se puede calcular después
        resolution: videoResolution, // Resolución detectada
        videoWidth, // Dimensiones del video
        videoHeight,
        style: style, // Agregar el estilo del video
        tags: tagsWithStyle,
        uploadedBy: user?.uid || 'anonymous',
        uploadedAt: new Date().toISOString(),
        views: 0,
        likes: 0,
        likedBy: [],
        bpm: bpm, // BPM detectado
        bpmDetected: bpmDetected // Indicar si se detectó BPM
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

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-pink-400 transition-colors duration-200">
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
          className="w-full flex flex-col items-center justify-center space-y-2 text-gray-600 hover:text-pink-500 transition-colors duration-200"
        >
          <Upload className="h-12 w-12" />
          <span className="font-medium text-center">Haz clic para seleccionar videos</span>
          <span className="text-sm text-center">MP4, AVI, MOV, etc. (máx. 100MB cada uno)</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Configurar Videos</h3>
        <p className="text-gray-600">Personaliza la información de tus videos antes de subirlos</p>
      </div>

      {/* Controles globales para plegar/desplegar */}
      {selectedFiles.length > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => toggleAllVideos(true)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <ChevronsDown className="h-4 w-4" />
            <span>Plegar Todo</span>
          </button>
          <button
            onClick={() => toggleAllVideos(false)}
            className="flex items-center space-x-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            <ChevronsUp className="h-4 w-4" />
            <span>Desplegar Todo</span>
          </button>
        </div>
      )}

      {/* Configuración por video */}
      {selectedFiles.map((file, fileIndex) => {
        const isCollapsed = collapsedVideos.has(file.name)
        return (
          <div key={fileIndex} className="border border-gray-200 rounded-lg overflow-hidden">
            {/* Header del video con botón de plegado */}
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-9 bg-gray-100 rounded flex items-center justify-center relative overflow-hidden">
                  {videoData[file.name]?.thumbnailPreview ? (
                    <img 
                      src={videoData[file.name].thumbnailPreview} 
                      alt="Vista previa del video"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                  ) : null}
                  <span className="text-xs text-gray-500" style={{ display: videoData[file.name]?.thumbnailPreview ? 'none' : 'flex' }}>
                    VIDEO
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => toggleVideoCollapse(file.name)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title={isCollapsed ? "Desplegar" : "Plegar"}
                >
                  {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Contenido del video (condicionalmente visible) */}
            {!isCollapsed && (
              <div className="p-4 space-y-4">
                {/* Reproductor de video */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Vista previa del video</h4>
                  <div className="flex justify-center">
                    <VideoPlayer
                      src={videoData[file.name]?.videoPreview || URL.createObjectURL(file)}
                      size="medium"
                      loop={true}
                      showControls={true}
                      autoplay={false}
                      muted={false}
                      className="w-full max-w-2xl"
                      resolutions={['auto', '4k', '1080p', '720p', '480p', '360p']}
                      currentResolution="auto"
                      videoTitle={videoData[file.name]?.title || file.name.replace(/\.[^/.]+$/, '')}
                      onResolutionChange={(resolution) => {
                        // Aquí se implementaría la lógica para cambiar la resolución del video
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{file.name}</span>
                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                </div>

                {/* Nombre personalizado */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del video
                  </label>
                  <input
                    type="text"
                    data-file={file.name}
                    data-field="title"
                    ref={(el) => {
                      if (el) {
                        fieldRefs.current[`${file.name}-title`] = el
                        if (!el.value) {
                          el.value = videoData[file.name]?.title || file.name.replace(/\.[^/.]+$/, '')
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const newTitle = e.target.value.trim()
                      if (newTitle !== (videoData[file.name]?.title || file.name.replace(/\.[^/.]+$/, ''))) {
                        setVideoData(prev => ({
                          ...prev,
                          [file.name]: {
                            ...prev[file.name],
                            title: newTitle
                          }
                        }))
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Ingresa un nombre para el video"
                  />
                </div>

                {/* Descripción */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Descripción (opcional)
                  </label>
                  <textarea
                    data-file={file.name}
                    data-field="description"
                    ref={(el) => {
                      if (el) {
                        fieldRefs.current[`${file.name}-description`] = el
                        if (!el.value) {
                          el.value = videoData[file.name]?.description || ''
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const newDescription = e.target.value.trim()
                      if (newDescription !== (videoData[file.name]?.description || '')) {
                        setVideoData(prev => ({
                          ...prev,
                          [file.name]: {
                            ...prev[file.name],
                            description: newDescription
                          }
                        }))
                      }
                    }}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Describe brevemente el contenido del video..."
                  />
                </div>

                                 {/* Thumbnail personalizado - TAMBIÉN DOBLE DE GRANDE */}
                 <div className="space-y-2">
                   <label className="block text-sm font-medium text-gray-700">
                     Thumbnail personalizado (opcional)
                   </label>
                   <div className="flex items-center space-x-3">
                     <div className="w-40 h-24 bg-gray-100 rounded border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
                       {videoData[file.name]?.customThumbnail ? (
                         <img 
                           src={videoData[file.name].customThumbnail} 
                           alt="Thumbnail personalizado" 
                           className="w-full h-full object-cover rounded"
                         />
                       ) : (
                         <span className="text-xs text-gray-500">IMG</span>
                       )}
                     </div>
                     <input
                       type="file"
                       accept="image/*"
                       onChange={(e) => {
                         const thumbnailFile = e.target.files[0]
                         if (thumbnailFile) {
                           const reader = new FileReader()
                           reader.onload = (e) => {
                             setVideoData(prev => ({
                               ...prev,
                               [file.name]: {
                                 ...prev[file.name],
                                 customThumbnail: e.target.result,
                                 customThumbnailFile: thumbnailFile
                               }
                             }))
                           }
                           reader.readAsDataURL(thumbnailFile)
                         }
                       }}
                       className="flex-1 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                     />
                   </div>
                 </div>

                 
              </div>
            )}
          </div>
        )
      })}

      {/* Etiquetas globales */}
      <div className="border-t pt-6">
        <h4 className="font-medium text-gray-900 mb-4">Etiquetas para todos los videos</h4>
        
        {categoriesList.map((category) => (
          <div key={category.key} className="space-y-3 mb-4">
            <h5 className="font-medium text-gray-700 capitalize">{category.name}</h5>
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
      </div>

             <div className="bg-blue-50 p-4 rounded-lg">
         <div className="flex items-start space-x-2">
           <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
           <div>
             <p className="text-sm text-blue-800 font-medium">Información</p>
                           <p className="text-sm text-blue-700">Personaliza cada video individualmente y aplica etiquetas que se usarán para todos los videos seleccionados.</p>
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
      // Cuando se avanza al paso 2, plegar todos los videos
      if (currentStep === 1) {
        setCollapsedVideos(new Set(selectedFiles.map(file => file.name)))
      }
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