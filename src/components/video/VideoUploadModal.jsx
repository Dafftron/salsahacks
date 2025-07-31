import React, { useState, useRef, useCallback } from 'react'
import { 
  Upload, 
  X, 
  FileVideo, 
  Youtube, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Trash2,
  Edit3,
  Play
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { uploadFile, getFileURL } from '../../services/firebase'
import { createVideoDocument } from '../../services/firebase/firestore'

const VideoUploadModal = ({ isOpen, onClose, onVideoUploaded }) => {
  const { user, userProfile } = useAuth()
  const [uploadMethod, setUploadMethod] = useState('files') // 'files' or 'youtube'
  const [files, setFiles] = useState([])
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [uploadProgress, setUploadProgress] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedVideos, setUploadedVideos] = useState([])
  const [currentStep, setCurrentStep] = useState('upload') // 'upload' or 'edit'
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Verificar permisos de upload
  const canUpload = () => {
    if (!userProfile) return false
    return ['SUPER_ADMIN', 'MAESE', 'SOLDADO'].includes(userProfile.role)
  }

  // Drag & Drop handlers
  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('video/')
      )
      setFiles(prev => [...prev, ...droppedFiles])
    }
  }, [])

  // File selection
  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(
      file => file.type.startsWith('video/')
    )
    setFiles(prev => [...prev, ...selectedFiles])
  }

  // Remove file
  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Upload videos
  const handleUpload = async () => {
    if (!canUpload()) {
      alert('No tienes permisos para subir videos')
      return
    }

    setIsUploading(true)
    const uploadedVideosList = []

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.name.replace(/\.[^/.]+$/, '') // Remove extension
        
        // Check for duplicates
        const isDuplicate = uploadedVideos.some(video => 
          video.originalTitle === file.name
        )
        
        if (isDuplicate) {
          alert(`El video "${file.name}" ya existe`)
          continue
        }

        // Upload to Firebase Storage
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        const uploadResult = await uploadFile(
          file, 
          `videos/${user.uid}/${Date.now()}_${file.name}`,
          (progress) => {
            setUploadProgress(prev => ({ 
              ...prev, 
              [file.name]: Math.round(progress) 
            }))
          }
        )

        if (uploadResult.success) {
          // Generate thumbnail (first frame)
          const thumbnailUrl = await generateThumbnail(file)
          
          // Create video document in Firestore
          const videoData = {
            title: fileName,
            originalTitle: file.name,
            description: '',
            fileUrl: uploadResult.url,
            thumbnailUrl: thumbnailUrl,
            category: 'FIGURAS', // Default, will be editable
            style: 'SALSA', // Default, will be editable
            tags: {
              normales: [],
              iniciales: [],
              finales: []
            },
            uploadedBy: user.uid,
            uploadedAt: new Date(),
            lastModified: new Date(),
            fileSize: file.size,
            duration: 0, // Will be extracted later
            isDuplicate: false
          }

          const videoDoc = await createVideoDocument(videoData)
          
          if (videoDoc.success) {
            uploadedVideosList.push({
              ...videoData,
              id: videoDoc.id,
              file: file
            })
          }
        }
      }

      setUploadedVideos(prev => [...prev, ...uploadedVideosList])
      setFiles([])
      setCurrentStep('edit')
      
      if (uploadedVideosList.length > 0) {
        alert(`¡${uploadedVideosList.length} video(s) subido(s) exitosamente!`)
      }

    } catch (error) {
      console.error('Error uploading videos:', error)
      alert('Error al subir los videos')
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  // Generate thumbnail from video
  const generateThumbnail = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video')
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        video.currentTime = 1 // Get frame at 1 second
      }
      
      video.onseeked = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.8)
        resolve(thumbnailUrl)
      }
      
      video.src = URL.createObjectURL(file)
    })
  }

  // Close modal
  const handleClose = () => {
    setFiles([])
    setYoutubeUrl('')
    setUploadProgress({})
    setIsUploading(false)
    setUploadedVideos([])
    setCurrentStep('upload')
    setDragActive(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {currentStep === 'upload' ? 'Subir Videos' : 'Editar Videos'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {currentStep === 'upload' ? (
            <UploadStep
              uploadMethod={uploadMethod}
              setUploadMethod={setUploadMethod}
              files={files}
              setFiles={setFiles}
              youtubeUrl={youtubeUrl}
              setYoutubeUrl={setYoutubeUrl}
              uploadProgress={uploadProgress}
              isUploading={isUploading}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileSelect={handleFileSelect}
              removeFile={removeFile}
              handleUpload={handleUpload}
              fileInputRef={fileInputRef}
              canUpload={canUpload}
            />
          ) : (
            <EditStep
              uploadedVideos={uploadedVideos}
              setUploadedVideos={setUploadedVideos}
              onClose={handleClose}
              onVideoUploaded={onVideoUploaded}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// Upload Step Component
const UploadStep = ({
  uploadMethod,
  setUploadMethod,
  files,
  youtubeUrl,
  setYoutubeUrl,
  uploadProgress,
  isUploading,
  dragActive,
  handleDrag,
  handleDrop,
  handleFileSelect,
  removeFile,
  handleUpload,
  fileInputRef,
  canUpload
}) => {
  return (
    <div className="space-y-6">
      {/* Upload Method Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setUploadMethod('files')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            uploadMethod === 'files'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <FileVideo className="h-5 w-5" />
          Archivos de Video
        </button>
        <button
          onClick={() => setUploadMethod('youtube')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            uploadMethod === 'youtube'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Youtube className="h-5 w-5" />
          URL de YouTube
        </button>
      </div>

      {/* Upload Area */}
      {uploadMethod === 'files' ? (
        <div className="space-y-4">
          {/* Drag & Drop Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Arrastra videos aquí o haz clic para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Soporta múltiples archivos de video
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Seleccionar Videos
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Selected Files */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800">
                Videos seleccionados ({files.length})
              </h3>
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-8 w-8 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {uploadProgress[file.name] !== undefined && (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {uploadProgress[file.name]}%
                        </span>
                      </div>
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 hover:bg-red-100 rounded text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de YouTube
            </label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={handleUpload}
            disabled={isUploading || !canUpload()}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
              isUploading || !canUpload()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Subir Videos
              </>
            )}
          </button>
        </div>
      )}

      {/* Permissions Warning */}
      {!canUpload() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              No tienes permisos para subir videos. Contacta a un administrador.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Edit Step Component
const EditStep = ({ uploadedVideos, setUploadedVideos, onClose, onVideoUploaded }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          Videos subidos ({uploadedVideos.length})
        </h3>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Finalizar
        </button>
      </div>

      <div className="grid gap-4">
        {uploadedVideos.map((video, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg p-4"
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail */}
              <div className="w-24 h-16 bg-gray-200 rounded-lg overflow-hidden">
                {video.thumbnailUrl && (
                  <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Video Info */}
              <div className="flex-1">
                <h4 className="font-medium text-gray-800">{video.title}</h4>
                <p className="text-sm text-gray-500">{video.originalTitle}</p>
                <p className="text-sm text-gray-500">
                  {(video.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg text-blue-500">
                  <Play className="h-4 w-4" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <Edit3 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-1 text-green-500">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Subido</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoUploadModal 