import React, { useEffect, useMemo, useState } from 'react'
import ConfirmModal from './ConfirmModal'

const ShareVideoModal = ({ isOpen, onClose, video, page = 'figuras', currentUser, onShared }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const { listAllUsers } = await import('../../services/firebase/firestore')
        const res = await listAllUsers(currentUser?.uid || null)
        if (mounted) {
          setUsers(res.users || [])
        }
      } catch (e) {
        if (mounted) setUsers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [isOpen, currentUser?.uid])

  const canSend = useMemo(() => Boolean(selectedUserId && video?.id && currentUser?.uid && !loading), [selectedUserId, video?.id, currentUser?.uid, loading])

  const handleSend = async () => {
    try {
      setError('')
      if (!canSend) return
      const { sendVideoMessage } = await import('../../services/firebase/firestore')
      const res = await sendVideoMessage({
        toUserId: selectedUserId,
        fromUser: currentUser,
        video,
        page,
        text: message
      })
      if (res.success) {
        onShared && onShared()
        onClose && onClose()
      } else {
        setError(res.error || 'Error al enviar')
      }
    } catch (e) {
      setError(e?.message || 'Error al enviar')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Reenviar video</h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Para</label>
            <select
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading}
            >
              <option value="">Selecciona un usuario...</option>
              {users.map((u) => (
                <option key={u.uid} value={u.uid}>
                  {u.displayName} {u.username ? `(@${u.username})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Mensaje (opcional)</label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-y min-h-[80px]"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={500}
              placeholder="Mira, ¡este video mola!"
            />
            <div className="text-xs text-gray-400 text-right">{message.length}/500</div>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50">Cancelar</button>
            <button onClick={handleSend} disabled={!canSend} className={`px-4 py-2 rounded-md text-white ${canSend ? 'bg-pink-600 hover:bg-pink-700' : 'bg-pink-300 cursor-not-allowed'}`}>Enviar</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShareVideoModal


