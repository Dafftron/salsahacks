import { useState, useRef, useEffect } from 'react'
import { X, Edit, Tag, Save, AlertCircle, ChevronDown, ChevronUp, ChevronsDown, ChevronsUp } from 'lucide-react'
import { updateVideoDocument } from '../../services/firebase/firestore'
import { uploadFile } from '../../services/firebase/storage'
import { useAuth } from '../../contexts/AuthContext'
import { useCategories } from '../../hooks/useCategories'
import Toast from '../common/Toast'
import ThumbnailCropper from '../common/ThumbnailCropper'
import VideoPlayer from './VideoPlayer'

const VideoEditModal = ({ isOpen, onClose, video, onVideoUpdated, page = 'figuras', style = 'salsa' }) => {
  const { user } = useAuth()
  const { currentCategories, categoriesList, getColorClasses } = useCategories(page, style)
  const [loading, setLoading] = useState(false)
  const [toasts, setToasts] = useState([])
  
  // Estados para el formulario
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [customThumbnail, setCustomThumbnail] = useState(null)
  const [customThumbnailFile, setCustomThumbnailFile] = useState(null)
  const cropperRef = useRef(null)
  const captureVideoRef = useRef(null)
  const [videoDuration, setVideoDuration] = useState(0)
  const [framePercent, setFramePercent] = useState(0.5)
  const [filmstrip, setFilmstrip] = useState([]) // [{percent, url}]
  const [generatingStrip, setGeneratingStrip] = useState(false)
  const [localVideoUrl, setLocalVideoUrl] = useState(null)
  
  // Estados para tags organizados por categorías
  const [selectedTags, setSelectedTags] = useState({})
  const [tagsIniciales, setTagsIniciales] = useState({})
  const [tagsFinales, setTagsFinales] = useState({})
  
  // Estado para secciones plegadas/desplegadas
  const [collapsedSections, setCollapsedSections] = useState(new Set(['tags-iniciales', 'tags-finales']))

     useEffect(() => {
     if (!isOpen || !video) return
     
     // Inicializar datos del video
     setTitle(video.title || '')
     setDescription(video.description || '')
     setCustomThumbnail(video.thumbnailUrl || null)
     setCustomThumbnailFile(null) // Resetear archivo de thumbnail
     
     // Inicializar tags
     if (currentCategories) {
       const initialTags = {}
       const initialTagsIniciales = {}
       const initialTagsFinales = {}
       
       Object.keys(currentCategories).forEach(categoryKey => {
         initialTags[categoryKey] = video.tags?.[categoryKey] || []
         initialTagsIniciales[categoryKey] = video.tagsIniciales?.[categoryKey] || []
         initialTagsFinales[categoryKey] = video.tagsFinales?.[categoryKey] || []
       })
       
       setSelectedTags(initialTags)
       setTagsIniciales(initialTagsIniciales)
       setTagsFinales(initialTagsFinales)
     }
   }, [isOpen, video, currentCategories])

   // Resetear estados cuando se cierra el modal
   useEffect(() => {
     if (!isOpen) {
       setTitle('')
       setDescription('')
       setCustomThumbnail(null)
       setCustomThumbnailFile(null)
       setSelectedTags({})
       setTagsIniciales({})
       setTagsFinales({})
     }
   }, [isOpen])

  const addToast = (message, type = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
  }

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  // Función para alternar el estado plegado/desplegado de una sección
  const toggleSectionCollapse = (sectionName) => {
    setCollapsedSections(prev => {
      const newSet = new Set(prev)
      if (newSet.has(sectionName)) {
        newSet.delete(sectionName)
      } else {
        newSet.add(sectionName)
      }
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

  const handleTagInicialToggle = (category, tag) => {
    setTagsIniciales(prev => {
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

  const handleTagFinalToggle = (category, tag) => {
    setTagsFinales(prev => {
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

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCustomThumbnail(e.target.result)
        setCustomThumbnailFile(file)
      }
      reader.readAsDataURL(file)
    }
  }

  // Asegurar que trabajamos con un blob local (evita CORS/tainted canvas)
  const ensureLocalVideo = async () => {
    if (localVideoUrl) return localVideoUrl
    try {
      const response = await fetch(video.videoUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      setLocalVideoUrl(url)
      if (captureVideoRef.current) {
        captureVideoRef.current.src = url
      }
      return url
    } catch (e) {
      console.warn('No se pudo crear copia local del video, usando URL remota:', e)
      return video.videoUrl
    }
  }

  // Capturar un frame del video según el slider
  const handleCaptureFrame = async (percentOverride = null) => {
    try {
      const videoEl = captureVideoRef.current
      if (!videoEl) return
      // Forzar fuente local primero
      await ensureLocalVideo()
      if (!videoEl) return
      // Asegurar metadata
      if (!videoEl.duration || isNaN(videoEl.duration)) {
        await new Promise((res, rej) => {
          videoEl.onloadedmetadata = () => res()
          videoEl.onerror = rej
        })
      }
      const targetTime = (percentOverride ?? framePercent ?? 0) * (videoEl.duration || 0)
      await new Promise((res, rej) => {
        const onSeeked = () => {
          res()
          videoEl.removeEventListener('seeked', onSeeked)
        }
        videoEl.addEventListener('seeked', onSeeked)
        videoEl.currentTime = targetTime
      })
      // Dibujar en canvas con 1280x720 manteniendo proporción
      const canvas = document.createElement('canvas')
      const width = 1280
      const height = 720
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      // Calcular cover
      const videoW = videoEl.videoWidth
      const videoH = videoEl.videoHeight
      const scale = Math.max(width / videoW, height / videoH)
      const drawW = videoW * scale
      const drawH = videoH * scale
      const dx = width / 2 - drawW / 2
      const dy = height / 2 - drawH / 2
      ctx.drawImage(videoEl, dx, dy, drawW, drawH)
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95))
      if (blob) {
        const dataUrl = await new Promise((resolve) => {
          const fr = new FileReader()
          fr.onload = () => resolve(fr.result)
          fr.readAsDataURL(blob)
        })
        setCustomThumbnail(dataUrl)
        // Resetear cropper a estado base (zoom = 1, offset 0)
        try {
          // reenfocar a nueva imagen y esperar a que el hook recalcule baseScale
          // (El cropper recalcula baseScale en onload de la imagen)
        } catch (_) {}
        // Guardamos un File para fallback (nombre amigable)
        const file = new File([blob], `${video.originalTitle || 'frame'}.jpg`, { type: 'image/jpeg' })
        setCustomThumbnailFile(file)
      }
    } catch (err) {
      console.warn('Error capturando frame:', err)
    }
  }

  // Generar filmstrip de N frames
  const generateFilmstrip = async (frames = 7) => {
    try {
      const videoEl = captureVideoRef.current
      if (!videoEl) return
      await ensureLocalVideo()
      if (!videoEl.duration || isNaN(videoEl.duration)) {
        await new Promise((res, rej) => {
          videoEl.onloadedmetadata = () => res()
          videoEl.onerror = rej
        })
      }
      setGeneratingStrip(true)
      const items = []
      for (let i = 0; i < frames; i++) {
        const p = frames === 1 ? 0.5 : i / (frames - 1)
        // Capturar miniatura pequeña para filmstrip (320x180)
        await new Promise((res, rej) => {
          const onSeeked = () => {
            const canvas = document.createElement('canvas')
            const w = 320
            const h = 180
            canvas.width = w
            canvas.height = h
            const ctx = canvas.getContext('2d')
            const videoW = videoEl.videoWidth
            const videoH = videoEl.videoHeight
            const scale = Math.max(w / videoW, h / videoH)
            const drawW = videoW * scale
            const drawH = videoH * scale
            const dx = w / 2 - drawW / 2
            const dy = h / 2 - drawH / 2
            ctx.drawImage(videoEl, dx, dy, drawW, drawH)
            const url = canvas.toDataURL('image/jpeg', 0.7)
            items.push({ percent: p, url })
            videoEl.removeEventListener('seeked', onSeeked)
            res()
          }
          videoEl.addEventListener('seeked', onSeeked)
          videoEl.currentTime = p * videoEl.duration
        })
      }
      setFilmstrip(items)
      setGeneratingStrip(false)
    } catch (e) {
      setGeneratingStrip(false)
      console.warn('No se pudo generar filmstrip:', e)
    }
  }

  // Al abrir el modal preparar video local y filmstrip
  useEffect(() => {
    if (!isOpen || !video) return
    let mounted = true
    ;(async () => {
      try {
        await ensureLocalVideo()
        if (mounted) {
          generateFilmstrip(9)
        }
      } catch (_) {}
    })()
    return () => { mounted = false }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, video?.videoUrl])

  // Función para detectar resolución del video
  const detectVideoResolution = async (videoUrl) => {
    try {
      const video = document.createElement('video')
      video.src = videoUrl
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = () => {
          const width = video.videoWidth
          const height = video.videoHeight
          const maxDimension = Math.max(width, height)
          
          let resolution = 'Unknown'
          if (maxDimension >= 3840) resolution = '4K'
          else if (maxDimension >= 1920) resolution = '1080p'
          else if (maxDimension >= 1280) resolution = '720p'
          else if (maxDimension >= 854) resolution = '480p'
          else resolution = '360p'
          
          resolve({ resolution, videoWidth: width, videoHeight: height })
        }
        video.onerror = reject
        // Timeout por si el video no carga
        setTimeout(() => reject(new Error('Timeout')), 10000)
      })
    } catch (error) {
      console.warn('No se pudo detectar la resolución del video:', error)
      return { resolution: 'Unknown', videoWidth: null, videoHeight: null }
    }
  }

  const handleSave = async () => {
    if (!video) return
    
    setLoading(true)
    
    try {
             // Subir nuevo thumbnail si se seleccionó uno
       let thumbnailUrl = video.thumbnailUrl
       let thumbnailPath = video.thumbnailPath
       
       if (customThumbnailFile || customThumbnail) {
         // Si hay imagen cargada o se ha usado el cropper, exportar Blob del recorte si es posible
         let blobToUpload = null
         if (cropperRef.current && customThumbnail) {
           try {
             blobToUpload = await cropperRef.current.getCroppedBlob('image/jpeg', 0.95)
           } catch (_) {
             // fallback a archivo original si algo falla
             blobToUpload = customThumbnailFile || null
           }
         } else {
           blobToUpload = customThumbnailFile
         }

         const newThumbnailPath = `thumbnails/${page}/${style}/${Date.now()}_${video.originalTitle.replace(/\.[^/.]+$/, '.jpg')}`
         const uploadResult = await uploadFile(blobToUpload, newThumbnailPath)
         
         if (uploadResult.success) {
           thumbnailUrl = uploadResult.url
           thumbnailPath = uploadResult.path
         } else {
           addToast('Error al subir el nuevo thumbnail', 'error')
           setLoading(false)
           return
         }
       }

      // Usar solo los tags seleccionados por el usuario, sin agregar automáticamente el style
      const tagsWithStyle = {
        ...selectedTags,
        estilo: selectedTags.estilo || []
      }

      // Detectar resolución si no existe
      let resolution = video.resolution
      let videoWidth = video.videoWidth
      let videoHeight = video.videoHeight
      
      if (!resolution || resolution === 'Unknown') {
        try {
          const resolutionData = await detectVideoResolution(video.videoUrl)
          resolution = resolutionData.resolution
          videoWidth = resolutionData.videoWidth
          videoHeight = resolutionData.videoHeight
          // Resolución detectada
        } catch (error) {
          console.warn('No se pudo detectar la resolución:', error)
          resolution = 'Unknown'
        }
      }

      // Preparar datos actualizados
      const updatedData = {
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl,
        thumbnailPath,
        resolution, // Incluir la resolución detectada
        videoWidth, // Incluir dimensiones del video
        videoHeight,
        tags: tagsWithStyle,
        tagsIniciales,
        tagsFinales,
        updatedBy: user?.uid || 'anonymous',
        updatedAt: new Date().toISOString()
      }

      // Actualizar en Firestore
      const result = await updateVideoDocument(video.id, updatedData, page)
      
      if (result.success) {
        addToast('Video actualizado exitosamente', 'success')
        onVideoUpdated({ ...video, ...updatedData })
        onClose()
      } else {
        addToast(`Error al actualizar video: ${result.error}`, 'error')
      }
    } catch (error) {
      console.error('Error updating video:', error)
      addToast('Error inesperado al actualizar video', 'error')
    }
    
    setLoading(false)
  }

  if (!isOpen || !video) return null

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Editar Video</h2>
                <p className="text-sm text-gray-500">{video.title}</p>
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
            <div className="space-y-6">
                             {/* Reproductor de video */}
               <div className="space-y-4">
                 <h4 className="font-medium text-gray-900">Vista previa del video</h4>
                 <div className="flex justify-center">
                   <VideoPlayer
                     src={video.videoUrl}
                     size="medium"
                     loop={true}
                     showControls={true}
                     autoplay={false}
                     muted={false}
                     className="w-full max-w-2xl"
                     resolutions={['auto', '4k', '1080p', '720p', '480p', '360p']}
                     currentResolution="auto"
                     videoTitle={video.title || 'video'}
                                           onResolutionChange={(resolution) => {
                        // Aquí se implementaría la lógica para cambiar la resolución del video
                      }}
                   />
                 </div>
                 <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                     <span>{video.originalTitle}</span>
                     <span className="text-gray-400">•</span>
                     <span>{(video.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                     {video.resolution && video.resolution !== 'Unknown' && (
                       <>
                         <span className="text-gray-400">•</span>
                         <span>{video.resolution}</span>
                       </>
                     )}
                   </div>
                 </div>
                {/* Video oculto para captura de frame */}
                <video
                  ref={captureVideoRef}
                  src={video.videoUrl}
                  style={{ display: 'none' }}
                  onLoadedMetadata={(e) => setVideoDuration(e.currentTarget.duration || 0)}
                  crossOrigin="anonymous"
                />
               </div>

              {/* Título */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Título del video
                </label>
                                 <input
                   type="text"
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                   placeholder="Ingresa un título para el video"
                 />
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Descripción
                </label>
                                 <textarea
                   value={description}
                   onChange={(e) => setDescription(e.target.value)}
                   rows={3}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                   placeholder="Describe brevemente el contenido del video..."
                 />
              </div>

              {/* Thumbnail personalizado con paneo/zoom 16:9 */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Thumbnail personalizado</label>
                <div className="flex items-start gap-4">
                  <div>
                    <ThumbnailCropper
                      ref={cropperRef}
                      imageSrc={customThumbnail || video.thumbnailUrl}
                      aspectRatio={16/9}
                      width={360}
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <div className="mt-3 space-y-2">
                      <label className="text-xs text-gray-600">Usar frame del video</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={1}
                          value={Math.round(framePercent * 100)}
                          onChange={(e) => setFramePercent(parseInt(e.target.value, 10) / 100)}
                          className="w-full"
                        />
                        <button
                          type="button"
                          onClick={handleCaptureFrame}
                          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
                          disabled={!video.videoUrl}
                        >Capturar</button>
                        <span className="text-xs text-gray-500 w-10 text-right">{Math.round(framePercent * 100)}%</span>
                      </div>
                      {/* Filmstrip (miniaturas clicables) */}
                      <div className="flex gap-2 items-center overflow-x-auto py-1 pl-1">
                        {filmstrip.length === 0 ? (
                          <button
                            type="button"
                            onClick={() => generateFilmstrip(9)}
                            className="px-2 py-1 text-xs rounded bg-gray-100 hover:bg-gray-200"
                            disabled={generatingStrip}
                          >{generatingStrip ? 'Generando…' : 'Generar previsualizaciones'}</button>
                        ) : (
                          filmstrip.map((f, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => { setFramePercent(f.percent); handleCaptureFrame(f.percent) }}
                              className="relative border rounded overflow-hidden hover:ring-2 hover:ring-blue-500 flex-shrink-0"
                              title={`${Math.round(f.percent * 100)}%`}
                            >
                              <img src={f.url} alt={`frame-${idx}`} className="w-16 h-10 object-cover" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Arrastra para mover y usa el zoom. También puedes seleccionar un frame del video con el deslizador y capturarlo como base.</p>
                  </div>
                </div>
              </div>

              {/* Tags Normales */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Tags Normales</h4>
                {categoriesList.map((category) => (
                  <div key={category.key} className="space-y-3">
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

              {/* Tags Iniciales - Solo para FigurasPage */}
              {page === 'figuras' && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => toggleSectionCollapse('tags-iniciales')}
                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg hover:from-blue-100 hover:to-purple-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-blue-600" />
                      <h4 className="font-medium text-gray-900">Tags Iniciales (cómo empieza la figura)</h4>
                    </div>
                    {collapsedSections.has('tags-iniciales') ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
                    collapsedSections.has('tags-iniciales') ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                  }`}>
                    <div className="space-y-4 bg-blue-50 rounded-lg p-4">
                      {categoriesList.map((category) => (
                        <div key={`inicial-${category.key}`} className="space-y-2">
                          <h6 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{category.name}</h6>
                          <div className="flex flex-wrap gap-2">
                            {category.tags.map(tag => (
                              <button
                                key={`inicial-${tag}`}
                                onClick={() => handleTagInicialToggle(category.key, tag)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  tagsIniciales[category.key]?.includes(tag)
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-blue-100'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Finales - Solo para FigurasPage */}
              {page === 'figuras' && (
                <div className="border-t pt-6">
                  <button
                    onClick={() => toggleSectionCollapse('tags-finales')}
                    className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2">
                      <Tag className="h-5 w-5 text-green-600" />
                      <h4 className="font-medium text-gray-900">Tags Finales (cómo termina la figura)</h4>
                    </div>
                    {collapsedSections.has('tags-finales') ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="h-5 w-5 text-gray-500" />
                    )}
                  </button>
                  
                  <div className={`mt-4 transition-all duration-300 ease-in-out overflow-hidden ${
                    collapsedSections.has('tags-finales') ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
                  }`}>
                    <div className="space-y-4 bg-green-50 rounded-lg p-4">
                      {categoriesList.map((category) => (
                        <div key={`final-${category.key}`} className="space-y-2">
                          <h6 className="text-xs font-medium text-gray-600 uppercase tracking-wide">{category.name}</h6>
                          <div className="flex flex-wrap gap-2">
                            {category.tags.map(tag => (
                              <button
                                key={`final-${tag}`}
                                onClick={() => handleTagFinalToggle(category.key, tag)}
                                className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                                  tagsFinales[category.key]?.includes(tag)
                                    ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                                    : 'bg-white text-gray-700 hover:bg-green-100'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Información - Solo para FigurasPage */}
              {page === 'figuras' && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium">Información</p>
                      <p className="text-sm text-blue-700">Los tags iniciales y finales ayudarán a crear secuencias lógicas conectando figuras.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading || !title.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
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

export default VideoEditModal 