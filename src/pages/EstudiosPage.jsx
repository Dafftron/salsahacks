import React, { useEffect, useMemo, useState, lazy, Suspense } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { getUserStudy, setUserStudyCompleted, toggleUserStudy } from '../services/firebase/firestore'
import { Search, CheckCircle, Clock, X } from 'lucide-react'
import CardSizeSelector from '../components/common/CardSizeSelector'
import VideoGridRenderer from '../components/gallery/VideoGridRenderer'
import CompactCardActions from '../components/common/CompactCardActions'

const SequenceVideoPlayer = lazy(() => import('../components/sequence/SequenceVideoPlayer'))

const Loading = () => (
  <div className="flex items-center justify-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
    <span className="ml-3 text-gray-600">Cargando...</span>
  </div>
)

const EstudiosPage = () => {
  const { user } = useAuth()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [onlyPending, setOnlyPending] = useState(false)
  const [isFullWidth, setIsFullWidth] = useState(false)
  const [player, setPlayer] = useState({ open: false, video: null })

  useEffect(() => {
    const load = async () => {
      if (!user) return
      setLoading(true)
      const { videos: list } = await getUserStudy(user.uid)
      // Enriquecer con flags locales por defecto
      setVideos(list.map(v => ({ ...v, isInStudy: true, isCompleted: false })))
      setLoading(false)
    }
    load()
  }, [user])

  const filtered = useMemo(() => {
    const t = search.trim().toLowerCase()
    return videos.filter(v => {
      const text = `${v.title || ''} ${v.description || ''}`.toLowerCase()
      const match = t === '' || text.includes(t)
      const pending = !v.isCompleted
      return match && (!onlyPending || pending)
    })
  }, [videos, search, onlyPending])

  // Agrupación por página y estilo
  const grouped = useMemo(() => {
    const map = new Map()
    for (const v of filtered) {
      const page = v._page || (v.page || 'figuras')
      const style = v.style || 'general'
      const key = `${page}::${style}`
      if (!map.has(key)) map.set(key, { page, style, items: [] })
      map.get(key).items.push(v)
    }
    // Ordenar por página y estilo para estabilidad
    return Array.from(map.values()).sort((a, b) => `${a.page}-${a.style}`.localeCompare(`${b.page}-${b.style}`))
  }, [filtered])

  const handleToggleStudy = async (video) => {
    const res = await toggleUserStudy(video.id, user.uid)
    if (res.success) setVideos(prev => prev.filter(v => v.id !== video.id))
  }

  const handleToggleCompleted = async (video) => {
    const res = await setUserStudyCompleted(video.id, user.uid, !video.isCompleted)
    if (res.success) setVideos(prev => prev.map(v => v.id === video.id ? { ...v, isCompleted: res.isCompleted } : v))
  }

  const total = filtered.length

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-pink-500">ESTUDIOS</span>
            <span className="ml-2 text-gray-500 text-2xl align-top">({total})</span>
          </h1>
          <p className="text-gray-600 text-lg">Tu bandeja de videos para estudiar y marcar como completados</p>
        </div>

        {/* Barra de controles */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar en estudios..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setOnlyPending(v => !v)} className={`px-3 py-2 rounded-md text-sm border ${onlyPending ? 'bg-yellow-500 text-white border-yellow-500' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}>
              {onlyPending ? <CheckCircle className="h-4 w-4 inline mr-1" /> : <Clock className="h-4 w-4 inline mr-1" />} {onlyPending ? 'Solo pendientes' : 'Incluir completados'}
            </button>
            <button onClick={() => setIsFullWidth(s => !s)} className="px-3 py-2 rounded-md text-sm border bg-gray-50 text-gray-700 hover:bg-gray-100">{isFullWidth ? 'Compacto' : 'Ancho'}</button>
            {(search || onlyPending) && (
              <button onClick={() => { setSearch(''); setOnlyPending(false) }} className="px-3 py-2 rounded-md text-sm border bg-gray-50 text-gray-700 hover:bg-gray-100"><X className="h-4 w-4 inline mr-1" /> Limpiar</button>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay videos en estudios</div>
        ) : (
          <div className="space-y-10">
            {grouped.map(group => (
              <section key={`${group.page}-${group.style}`}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    <span className="uppercase text-gray-500 mr-2">{group.page}</span>
                    <span>{group.style.toUpperCase()}</span>
                    <span className="ml-2 text-sm text-gray-500">({group.items.length})</span>
                  </h2>
                </div>
                <VideoGridRenderer
                  videos={group.items}
                  threshold={150}
                  cardWidth={isFullWidth ? 450 : 320}
                  cardHeight={isFullWidth ? 380 : 320}
                  gap={24}
                  renderCard={(video) => (
                    <div key={video.id} className="bg-white rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02] border-gray-100">
                      <div className="relative">
                        <div className={`w-full aspect-video bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden flex items-center justify-center`}>
                          {video.thumbnailUrl && (
                            <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                          )}
                          <button onClick={() => setPlayer({ open: true, video })} className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 group">
                            <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-200">
                              <svg viewBox="0 0 24 24" className="w-8 h-8 text-gray-800 ml-1"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                          </button>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-gray-800 text-sm truncate">{video.title}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{video.description || 'Sin descripción'}</p>
                        <CompactCardActions
                          video={video}
                          onPlay={() => setPlayer({ open: true, video })}
                          onLike={() => {}}
                          onEdit={() => {}}
                          onDelete={() => {}}
                          onToggleStudy={() => handleToggleStudy(video)}
                          onToggleCompleted={() => handleToggleCompleted(video)}
                          isInStudy={true}
                          isCompleted={video.isCompleted}
                          type="video"
                        />
                      </div>
                    </div>
                  )}
                />
              </section>
            ))}
          </div>
        )}
      </div>

      {/* Player */}
      {player.open && player.video && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-3xl h-auto max-h-[90vh] bg-white rounded-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 bg-gray-50 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold text-gray-800">🎬 {player.video.title}</h3>
              <button onClick={() => setPlayer({ open: false, video: null })} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 min-h-0 p-4 overflow-y-auto">
              <div className="w-full h-full max-h-[65vh] flex items-center justify-center">
                <div className="w-full max-w-md">
                  <Suspense fallback={<Loading />}>
                    <SequenceVideoPlayer videos={[player.video]} className="w-full h-full" showControls autoplay loop={false} muted={false} />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EstudiosPage


