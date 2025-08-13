import React, { useEffect, useMemo, useState } from 'react'
import ConfirmModal from './ConfirmModal'

const ShareVideoModal = ({ isOpen, onClose, video, page = 'figuras', currentUser, onShared }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedUserIds, setSelectedUserIds] = useState([])
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

  const canSend = useMemo(() => Boolean(selectedUserIds.length > 0 && video?.id && currentUser?.uid && !loading), [selectedUserIds.length, video?.id, currentUser?.uid, loading])

  const handleSend = async () => {
    try {
      setError('')
      if (!canSend) return
      const { sendVideoMessage } = await import('../../services/firebase/firestore')
      const results = []
      for (const uid of selectedUserIds) {
        // eslint-disable-next-line no-await-in-loop
        const res = await sendVideoMessage({ toUserId: uid, fromUser: currentUser, video, page, text: message })
        results.push(res)
      }
      if (results.every(r => r?.success)) {
        onShared && onShared()
        onClose && onClose()
      } else {
        const firstError = results.find(r => !r?.success)?.error
        setError(firstError || 'Error al enviar a alguno de los usuarios')
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
            <label className="block text-sm text-gray-600 mb-1">Para (puedes seleccionar varios)</label>
            <div className="max-h-56 overflow-y-auto border rounded-lg p-2">
              {users.map((u) => {
                const checked = selectedUserIds.includes(u.uid)
                return (
                  <label key={u.uid} className="flex items-center gap-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-pink-600"
                      checked={checked}
                      onChange={(e) => {
                        setSelectedUserIds(prev => e.target.checked ? [...prev, u.uid] : prev.filter(x => x !== u.uid))
                      }}
                      disabled={loading}
                    />
                    <span className="text-sm text-gray-800">{u.displayName} {u.username ? `(@${u.username})` : ''}</span>
                  </label>
                )
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">Seleccionados: {selectedUserIds.length}</div>
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


