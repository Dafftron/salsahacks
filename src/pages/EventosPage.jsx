import React, { lazy, Suspense, useState, useEffect } from 'react'
import { Maximize2, Minimize2, Upload } from 'lucide-react'
import { useCategories } from '../hooks/useCategories'
import { useAuth } from '../contexts/AuthContext'
import { useCardSize } from '../contexts/CardSizeContext'
import VideoGridRenderer from '../components/gallery/VideoGridRenderer'
import ConfirmModal from '../components/common/ConfirmModal'
import Toast from '../components/common/Toast'
import { subscribeToVideosByStyle, updateVideoDocument } from '../services/firebase/firestore'

const VideoUploadModal = lazy(() => import('../components/video/VideoUploadModal'))

const EventosPage = () => {
  const { user, userProfile } = useAuth()
  const [selectedStyle, setSelectedStyle] = useState('salsa')
  const { availableStyles, getGradientClasses } = useCategories('eventos', selectedStyle)
  const { getVideoConfig } = useCardSize()

  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = 'success') => setToasts(prev => [...prev, { id: Date.now(), message, type }])

  useEffect(() => {
    setLoading(true)
    const unsubscribe = subscribeToVideosByStyle(selectedStyle, (list) => {
      setVideos(list)
      setLoading(false)
    }, 'eventos')
    return () => unsubscribe && unsubscribe()
  }, [selectedStyle])

  return (
    <div className="min-h-screen bg-white">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">
          <span className="text-pink-500">EVENTOS</span>
          <span className={`bg-gradient-to-r ${getGradientClasses(selectedStyle)} bg-clip-text text-transparent`}> - {selectedStyle.toUpperCase()}</span>
        </h1>
        <p className="text-gray-600 text-lg">Galería de videos de congresos y talleres</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        {availableStyles.map(style => (
          <button
            key={style.key}
            onClick={() => setSelectedStyle(style.key)}
            className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedStyle === style.key
                ? `bg-gradient-to-r ${getGradientClasses(style.color)} text-white shadow-lg transform scale-105`
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            <span>{style.name}</span>
          </button>
        ))}
      </div>

      {(userProfile?.role === 'maese' || userProfile?.role === 'super_admin') && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className={`flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-colors duration-200`}
          >
            <Upload className="h-5 w-5" />
            <span>SUBIR VIDEO(S) A {selectedStyle.toUpperCase()}</span>
          </button>
          <button
            onClick={() => setIsFullWidth(!isFullWidth)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
              isFullWidth ? `bg-gradient-to-r ${getGradientClasses(selectedStyle)} text-white shadow-lg` : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
          >
            {isFullWidth ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">{isFullWidth ? 'Compacto' : 'Ancho'}</span>
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
          <span className="ml-3 text-gray-600">Cargando videos...</span>
        </div>
      ) : (
        <VideoGridRenderer
          videos={videos}
          threshold={150}
          cardWidth={getVideoConfig(isFullWidth).compact ? 160 : getVideoConfig(isFullWidth).titleSize === 'text-xl' ? 320 : 240}
          cardHeight={getVideoConfig(isFullWidth).compact ? 260 : 420}
          gap={24}
          renderCard={(video) => (
            <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-gray-100">
              <div className="relative group">
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-48 object-cover" loading="lazy" />
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm line-clamp-2">{video.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{video.city || ''} {video.year ? `• ${video.year}` : ''}</p>
              </div>
            </div>
          )}
        />
      )}

      <Suspense fallback={null}>
        {isUploadModalOpen && (
          <VideoUploadModal
            isOpen={isUploadModalOpen}
            onClose={() => setIsUploadModalOpen(false)}
            onVideoUploaded={() => addToast('Video subido', 'success')}
            page="eventos"
            style={selectedStyle}
          />
        )}
      </Suspense>

      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  )
}

export default EventosPage


