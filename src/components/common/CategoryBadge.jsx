// 🏷️ COMPONENTE BADGE DE CATEGORÍA - SALSAHACKS V2.0

import { getCategoryColor, isHardcodedCategory } from '../../constants/categories'
import { Lock, X } from 'lucide-react'

const CategoryBadge = ({ 
  category, 
  onRemove, 
  showLock = false, 
  size = 'md',
  variant = 'default',
  className = ''
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-1 text-xs'
      case 'lg':
        return 'px-4 py-2 text-sm'
      default:
        return 'px-3 py-1 text-xs'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'outline':
        return 'border-2 bg-transparent text-gray-700 border-gray-300 hover:border-gray-400'
      case 'ghost':
        return 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      case 'gradient':
        return 'text-white shadow-md'
      default:
        return 'text-white'
    }
  }

  const isHardcoded = isHardcodedCategory(category)
  const colorClass = getCategoryColor(category)
  const sizeClasses = getSizeClasses()
  const variantClasses = getVariantClasses()

  return (
    <div className={`
      inline-flex items-center space-x-1 rounded-full font-medium transition-all duration-200
      ${colorClass} ${sizeClasses} ${variantClasses} ${className}
      ${onRemove ? 'cursor-pointer hover:scale-105' : ''}
      ${isHardcoded && showLock ? 'pr-2' : ''}
    `}>
      {/* Icono de candado para categorías hardcodeadas */}
      {isHardcoded && showLock && (
        <Lock className="h-3 w-3" />
      )}
      
      {/* Texto de la categoría */}
      <span>{category}</span>
      
      {/* Botón de eliminar */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove(category)
          }}
          className="ml-1 hover:bg-white hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
          disabled={isHardcoded}
          title={isHardcoded ? 'Esta categoría no se puede eliminar' : 'Eliminar categoría'}
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  )
}

export default CategoryBadge 