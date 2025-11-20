import { useState, useCallback } from 'react'

// Caché simple en memoria
const cache = new Map()

/**
 * Hook simple para invalidar queries del caché
 * Simula la funcionalidad básica de QueryClient
 */
export const useQueryClient = () => {
  const invalidateQueries = useCallback((queryKey) => {
    const keysToInvalidate = Array.isArray(queryKey) ? queryKey : [queryKey]
    
    // Si es un array, buscar todas las keys que empiecen con ese prefijo
    if (Array.isArray(queryKey)) {
      const keyPrefix = queryKey.join('-')
      for (const [key] of cache.entries()) {
        if (key.startsWith(keyPrefix)) {
          cache.delete(key)
        }
      }
    } else {
      cache.delete(queryKey)
    }
    
    // Disparar evento personalizado para que useFetch escuche y refetch
    window.dispatchEvent(new CustomEvent('invalidateQuery', {
      detail: { keys: keysToInvalidate }
    }))
  }, [])

  const clear = useCallback(() => {
    cache.clear()
  }, [])

  return {
    invalidateQueries,
    clear
  }
}

