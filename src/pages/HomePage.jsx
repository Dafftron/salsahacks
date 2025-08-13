import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { Music, Video, BookOpen, Calendar, Tag, FileText, TrendingUp, Clock, Heart, BarChart3 } from 'lucide-react'
import UserProfile from '../components/UserProfile'
import { useAuth } from '../contexts/AuthContext'
import {
  getVideosCount,
  getEscuelaVideosCount,
  getEventosVideosCount,
  getUsersCount,
  getLatestVideos,
  getTopLikedVideos,
  getUserContinueStudy
} from '../services/firebase/firestore'
import { getSequenceStats } from '../services/firebase/sequences'

const HomePage = () => {
  const { user, userProfile } = useAuth()

  const [loading, setLoading] = useState(true)
  const [kpis, setKpis] = useState({ videos: 0, school: 0, events: 0, users: 0 })
  const [latest, setLatest] = useState([])
  const [featured, setFeatured] = useState([])
  const [continueStudy, setContinueStudy] = useState([])
  const [quick, setQuick] = useState({ uploads24h: 0, topStyle: '-', sequencesTotal: 0, avgSeq: 0, topVideo: '-' })
  const [lastWatched, setLastWatched] = useState(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        const [v, s, e, u, latestFig, topLiked, latest100, seqStats] = await Promise.all([
          getVideosCount(),
          getEscuelaVideosCount(),
          getEventosVideosCount(),
          getUsersCount(),
          getLatestVideos(8, 'figuras'),
          getTopLikedVideos(8, 'figuras'),
          getLatestVideos(100, 'figuras'),
          getSequenceStats()
        ])
        if (!mounted) return
        setKpis({
          videos: v.count || 0,
          school: s.count || 0,
          events: e.count || 0,
          users: u.count || 0
        })
        setLatest(latestFig.videos || [])
        setFeatured(topLiked.videos || [])
        // Quick analytics
        const nowMs = Date.now()
        const uploads24h = (latest100.videos || []).filter(v => {
          const t = v?.createdAt?.toMillis ? v.createdAt.toMillis() : (v?.createdAt ? new Date(v.createdAt).getTime() : 0)
          return t > nowMs - 24 * 60 * 60 * 1000
        }).length
        const byStyle = {}
        ;(latest100.videos || []).forEach(v => {
          const style = (v.style || 'sin-estilo').toLowerCase()
          byStyle[style] = (byStyle[style] || 0) + 1
        })
        const topStyle = Object.entries(byStyle).sort((a,b)=>b[1]-a[1])[0]?.[0] || '-'
        const topVideo = (topLiked.videos || [])[0]?.title || (topLiked.videos || [])[0]?.originalTitle || '-'
        setQuick({
          uploads24h,
          topStyle,
          sequencesTotal: seqStats?.total || 0,
          avgSeq: seqStats?.averageVideosPerSequence || 0,
          topVideo
        })
      } catch (error) {
        console.error('Error cargando KPIs/feeds del dashboard:', error)
        if (mounted) {
          setKpis({ videos: 0, school: 0, events: 0, users: 0 })
          setLatest([])
          setFeatured([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadContinue = async () => {
      try {
        if (!user) { setContinueStudy([]); return }
        const res = await getUserContinueStudy(user.uid)
        if (mounted) setContinueStudy(res.videos || [])
      } catch (error) {
        console.error('Error cargando Continuar estudiando:', error)
        if (mounted) setContinueStudy([])
      }
    }
    loadContinue()
    return () => { mounted = false }
  }, [user])

  useEffect(() => {
    let mounted = true
    const loadLastWatched = async () => {
      try {
        if (!user) { setLastWatched(null); return }
        const { getUserLastWatched } = await import('../services/firebase/firestore')
        const res = await getUserLastWatched(user.uid)
        if (mounted) setLastWatched(res.lastWatched || null)
      } catch (error) {
        if (mounted) setLastWatched(null)
      }
    }
    loadLastWatched()
    return () => { mounted = false }
  }, [user])
  
  const features = [
    {
      icon: <Video className="h-8 w-8" />,
      title: 'Figuras',
      description: 'Galería de videos de figuras de salsa con filtros avanzados',
      path: '/figuras',
      color: 'text-blue-600'
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Escuela',
      description: 'Cursos y tutoriales estructurados para aprender salsa',
      path: '/escuela',
      color: 'text-green-600'
    },
    {
      icon: <Calendar className="h-8 w-8" />,
      title: 'Eventos',
      description: 'Calendario de eventos, talleres y fiestas de salsa',
      path: '/eventos',
      color: 'text-purple-600'
    },
    {
      icon: <Tag className="h-8 w-8" />,
      title: 'Categorías',
      description: 'Centro de control de categorías y etiquetas',
      path: '/categorias',
      color: 'text-orange-600'
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: 'Notas',
      description: 'Seguimiento de commits y control de hitos',
      path: '/notas',
      color: 'text-red-600'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="flex justify-center mb-6">
          <Music className="h-20 w-20 text-salsa-primary" />
        </div>
        <h1 className="text-5xl font-bold text-salsa-primary mb-4">
          ¡Bienvenido a SalsaHacks!
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          La plataforma definitiva para aprender, practicar y compartir el arte del baile de salsa.
          Descubre figuras, mejora tu técnica y conecta con la comunidad.
        </p>
        <div className="flex justify-center space-x-4">
          {user ? (
            <>
              <Link to="/figuras" className="btn-primary">
                Explorar Figuras
              </Link>
              <Link to="/escuela" className="btn-secondary">
                Empezar a Aprender
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn-primary">
                Iniciar Sesión
              </Link>
              <p className="text-gray-500 text-sm">
                Accede para ver todo el contenido
              </p>
            </>
          )}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {features.map((feature) => {
          // Solo mostrar características públicas para usuarios no autenticados
          if (!user && (feature.path === '/categorias' || feature.path === '/notas')) {
            return null;
          }
          
          return (
            <Link
              key={feature.path}
              to={user ? feature.path : '/auth'}
              className="card p-6 hover:scale-105 transition-transform duration-300"
            >
              <div className={`${feature.color} mb-4`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
              {!user && (feature.path === '/figuras' || feature.path === '/escuela') && (
                <div className="mt-2 text-xs text-gray-500">
                  🔒 Requiere autenticación
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Stats Section */}
      <div className="bg-salsa-light rounded-2xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-salsa-primary mb-8 text-center">
          Estadísticas de la Plataforma
        </h2>
        <div className="grid md:grid-cols-4 gap-6 text-center">
          <div className="card p-4">
            <div className="text-3xl font-bold text-salsa-primary mb-1">{kpis.videos}</div>
            <div className="text-gray-600">Videos de Figuras</div>
          </div>
          <div className="card p-4">
            <div className="text-3xl font-bold text-salsa-primary mb-1">{kpis.school}</div>
            <div className="text-gray-600">Cursos/Escuela</div>
          </div>
          <div className="card p-4">
            <div className="text-3xl font-bold text-salsa-primary mb-1">{kpis.events}</div>
            <div className="text-gray-600">Eventos</div>
          </div>
          <div className="card p-4">
            <div className="text-3xl font-bold text-salsa-primary mb-1">{kpis.users}</div>
            <div className="text-gray-600">Usuarios</div>
          </div>
        </div>
        {/* Quick analytics */}
        <div className="grid md:grid-cols-5 gap-4 mt-8 text-center">
          <div className="card p-4"><div className="text-xs text-gray-500">Subidas 24h</div><div className="text-2xl font-bold text-gray-800">{quick.uploads24h}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Estilo top</div><div className="text-lg font-semibold text-gray-800 capitalize">{quick.topStyle}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Secuencias</div><div className="text-2xl font-bold text-gray-800">{quick.sequencesTotal}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Prom. videos por secuencia</div><div className="text-2xl font-bold text-gray-800">{quick.avgSeq}</div></div>
          <div className="card p-4"><div className="text-xs text-gray-500">Top por likes</div><div className="text-sm font-medium text-gray-800 line-clamp-1">{quick.topVideo}</div></div>
        </div>

        {user && lastWatched && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Último video visto</h3>
            <div className="card p-4 flex items-center gap-4">
              <div className="w-32 aspect-video bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {lastWatched.thumbnailUrl ? (
                  <img src={lastWatched.thumbnailUrl} alt={lastWatched.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-400 text-sm">Sin miniatura</div>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-500 uppercase">{lastWatched.page}</div>
                <div className="text-lg font-medium text-gray-800">{lastWatched.title}</div>
              </div>
              <div>
                <a
                  href={`${lastWatched.page === 'escuela' ? '/escuela' : (lastWatched.page === 'eventos' ? '/eventos' : '/figuras')}?play=${encodeURIComponent(lastWatched.id || '')}`}
                  className="px-4 py-2 bg-salsa-primary text-white rounded-lg font-medium shadow hover:shadow-md transition"
                >
                  Reanudar
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sección Últimos Videos */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Clock className="h-6 w-6 text-salsa-primary" /> Últimos videos
          </h2>
          <Link to="/figuras" className="text-salsa-primary hover:underline">Ver todo</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {latest.map(v => (
            <Link key={v.id} to="/figuras" className="card p-3">
              <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin miniatura</div>
                )}
              </div>
              <div className="text-sm font-medium line-clamp-2">{v.title || v.originalTitle || 'Video'}</div>
            </Link>
          ))}
          {latest.length === 0 && (
            <div className="text-gray-500">No hay videos recientes.</div>
          )}
        </div>
      </div>

      {/* Sección Destacados */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-salsa-primary" /> Destacados
          </h2>
          <Link to="/figuras" className="text-salsa-primary hover:underline">Ver todo</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featured.map(v => (
            <Link key={v.id} to="/figuras" className="card p-3">
              <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                {v.thumbnailUrl ? (
                  <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">Sin miniatura</div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium line-clamp-2">{v.title || v.originalTitle || 'Video'}</div>
                <div className="flex items-center text-xs text-gray-500 gap-1"><Heart className="h-3 w-3" />{v.likes || 0}</div>
              </div>
            </Link>
          ))}
          {featured.length === 0 && (
            <div className="text-gray-500">No hay destacados aún.</div>
          )}
        </div>
      </div>

      {/* Sección Continuar estudiando */}
      {user && (
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Continuar estudiando</h2>
            <Link to="/estudios" className="text-salsa-primary hover:underline">Ver mis estudios</Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {continueStudy.map(v => (
              <Link key={v.id} to="/figuras" className="card p-3">
                <div className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden">
                  {v.thumbnailUrl ? (
                    <img src={v.thumbnailUrl} alt={v.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">Sin miniatura</div>
                  )}
                </div>
                <div className="text-sm font-medium line-clamp-2">{v.title || v.originalTitle || 'Video'}</div>
              </Link>
            ))}
            {continueStudy.length === 0 && (
              <div className="text-gray-500">No tienes elementos pendientes.</div>
            )}
          </div>
        </div>
      )}
      
      {/* User Profile Section */}
      {user && (
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Mi Perfil
          </h2>
          <div className="max-w-md mx-auto">
            <UserProfile />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage 