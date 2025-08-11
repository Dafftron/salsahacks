import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { createVideoComment, subscribeToVideoComments, toggleLikeVideoComment, softDeleteVideoComment } from '../../services/firebase/firestore'
import { Heart, Trash2 } from 'lucide-react'

const MAX_LENGTH = 500

const CommentItem = ({ comment, onToggleLike, onDelete, canDelete }) => {
  const date = useMemo(() => {
    try {
      if (comment?.createdAt?.toDate) return comment.createdAt.toDate()
      if (typeof comment?.createdAt === 'string') return new Date(comment.createdAt)
    } catch (_) {}
    return null
  }, [comment])

  return (
    <div className="flex space-x-3 p-3 bg-gray-50 rounded-lg">
      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 overflow-hidden flex items-center justify-center text-white text-xs">
        {comment.userPhotoURL ? (
          <img src={comment.userPhotoURL} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          (comment.userDisplayName || 'U')[0]?.toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-800 truncate">{comment.userDisplayName || 'Usuario'}</span>
          {date && <span className="text-xs text-gray-500">{date.toLocaleString()}</span>}
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words mt-1">{comment.text}</p>
        <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
          <button
            onClick={() => onToggleLike(comment)}
            className={`flex items-center space-x-1 ${comment._userLiked ? 'text-pink-600' : 'text-gray-500'} hover:text-pink-600 transition-colors`}
          >
            <Heart className={`h-4 w-4 ${comment._userLiked ? 'fill-pink-600' : ''}`} />
            <span>{comment.likes || 0}</span>
          </button>
          {canDelete && (
            <button
              onClick={() => onDelete(comment)}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Eliminar</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const CommentsSection = ({ videoId, page = 'figuras' }) => {
  const { user, userProfile } = useAuth()
  const [comments, setComments] = useState([])
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  useEffect(() => {
    if (!videoId) return
    const unsubscribe = subscribeToVideoComments(videoId, page, (items) => {
      // Mostrar solo activos y marcar si el usuario actual le dio like
      const mapped = items
        .filter(c => c.status !== 'deleted')
        .map(c => ({
          ...c,
          _userLiked: user ? (Array.isArray(c.likedBy) ? c.likedBy.includes(user.uid) : false) : false
        }))
      setComments(mapped)
    })
    return () => unsubscribe && unsubscribe()
  }, [videoId, page, user])

  const remaining = MAX_LENGTH - text.length
  const canPost = !!user && text.trim().length > 0 && text.trim().length <= MAX_LENGTH

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canPost || posting) return
    setPosting(true)
    try {
      const payload = {
        text: text.trim(),
        userId: user.uid,
        userDisplayName: userProfile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Usuario',
        userPhotoURL: userProfile?.photoURL || user?.photoURL || null
      }
      const res = await createVideoComment(videoId, page, payload)
      if (res.success) setText('')
    } finally {
      setPosting(false)
    }
  }

  const handleToggleLike = async (comment) => {
    if (!user) return
    const res = await toggleLikeVideoComment(videoId, page, comment.id, user.uid)
    if (res.success) {
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: res.likes, _userLiked: res.userLiked } : c))
    }
  }

  const handleDelete = async (comment) => {
    if (!user) return
    const res = await softDeleteVideoComment(videoId, page, comment.id, user.uid, false)
    if (res.success) {
      setComments(prev => prev.filter(c => c.id !== comment.id))
    }
  }

  return (
    <div className="mt-4">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Comentarios</h4>
      {user ? (
        <form onSubmit={handleSubmit} className="mb-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
            rows={2}
            placeholder="Escribe un comentario..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
          />
          <div className="flex items-center justify-between mt-1">
            <span className={`text-xs ${remaining < 0 ? 'text-red-500' : 'text-gray-500'}`}>{remaining} caracteres</span>
            <button
              type="submit"
              disabled={!canPost || posting}
              className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-md text-sm font-medium disabled:opacity-50"
            >
              {posting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="text-xs text-gray-500 mb-3">Inicia sesión para comentar</div>
      )}

      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <div className="text-xs text-gray-500">Sé el primero en comentar</div>
        ) : (
          comments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              onToggleLike={handleToggleLike}
              onDelete={handleDelete}
              canDelete={!!user && c.userId === user.uid}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CommentsSection


