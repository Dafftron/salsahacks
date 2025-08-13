import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Play, Check, Trash2 } from 'lucide-react'

const InboxPage = () => {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.uid) return
    setLoading(true)
    let unsubscribe = () => {}
    ;(async () => {
      const { subscribeToInbox } = await import('../services/firebase/firestore')
      unsubscribe = subscribeToInbox(user.uid, (msgs) => {
        setMessages(msgs)
        setLoading(false)
      })
    })()
    return () => unsubscribe && unsubscribe()
  }, [user?.uid])

  const markRead = async (id, read = true) => {
    try {
      const { markInboxMessageRead } = await import('../services/firebase/firestore')
      await markInboxMessageRead(user.uid, id, read)
    } catch (_) {}
  }
  const removeMessage = async (id) => {
    try {
      const { deleteInboxMessage } = await import('../services/firebase/firestore')
      await deleteInboxMessage(user.uid, id)
    } catch (_) {}
  }

  const handleOpenVideo = (msg) => {
    try {
      const pagePath = msg.page === 'escuela' ? '/escuela' : (msg.page === 'eventos' ? '/eventos' : (msg.page === 'musica' ? '/musica' : '/figuras'))
      window.location.href = `${pagePath}?play=${encodeURIComponent(msg.videoId)}`
    } catch (_) {}
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Inbox</h1>
      {loading ? (
        <div className="text-gray-500">Cargando...</div>
      ) : messages.length === 0 ? (
        <div className="text-gray-500">No tienes mensajes</div>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex items-start gap-3 p-3 border rounded-lg ${m.read ? 'bg-white' : 'bg-pink-50'}`}>
              <div className="w-16 h-10 bg-gray-100 rounded overflow-hidden flex items-center justify-center">
                {m.videoThumbnail ? (
                  <img src={m.videoThumbnail} alt={m.videoTitle} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-400">Sin miniatura</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-800 truncate">{m.videoTitle || 'Video'}</div>
                  {!m.read && (
                    <span className="text-xs text-pink-700 bg-pink-100 px-2 py-0.5 rounded-full">Nuevo</span>
                  )}
                </div>
                <div className="text-sm text-gray-600 mt-0.5">De: {m.senderName || 'Usuario'}</div>
                {m.text && (
                  <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{m.text}</div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => { markRead(m.id, true); handleOpenVideo(m) }} className="inline-flex items-center gap-1 text-pink-700 hover:text-pink-800 px-2 py-1 rounded hover:bg-pink-100">
                    <Play className="h-4 w-4" /> Ver
                  </button>
                  {!m.read && (
                    <button onClick={() => markRead(m.id, true)} className="inline-flex items-center gap-1 text-gray-600 hover:text-green-700 px-2 py-1 rounded hover:bg-green-50">
                      <Check className="h-4 w-4" /> Marcar leído
                    </button>
                  )}
                  <button onClick={() => removeMessage(m.id)} className="inline-flex items-center gap-1 text-gray-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default InboxPage


