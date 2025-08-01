import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', duration = 4000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Esperar a que termine la animación
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500 to-emerald-500',
          icon: <CheckCircle className="h-5 w-5 text-white" />,
          border: 'border-green-200'
        }
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          icon: <XCircle className="h-5 w-5 text-white" />,
          border: 'border-red-200'
        }
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-yellow-500',
          icon: <AlertCircle className="h-5 w-5 text-white" />,
          border: 'border-orange-200'
        }
      default:
        return {
          bg: 'bg-gradient-to-r from-blue-500 to-indigo-500',
          icon: <CheckCircle className="h-5 w-5 text-white" />,
          border: 'border-blue-200'
        }
    }
  }

  const styles = getToastStyles()

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className={`${styles.bg} text-white px-6 py-4 rounded-lg shadow-lg border ${styles.border} min-w-80 max-w-md`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {styles.icon}
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={() => {
              setIsVisible(false)
              setTimeout(() => onClose(), 300)
            }}
            className="text-white hover:text-gray-200 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default Toast 