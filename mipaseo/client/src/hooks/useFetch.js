import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook personalizado para hacer peticiones GET con caché simple
 * @param {string|Array} key - Clave única para identificar la query
 * @param {Function} fetchFn - Función que retorna una promesa con los datos
 * @param {Object} options - Opciones adicionales
 * @param {boolean} options.enabled - Si está deshabilitado, no hace la petición
 * @param {number} options.refetchInterval - Intervalo en ms para refetch automático
 */
export const useFetch = (key, fetchFn, options = {}) => {
  const { enabled = true, refetchInterval } = options

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Serializar la key para usar como dependencia estable
  const keyString = Array.isArray(key) ? JSON.stringify(key) : key
  const keyArray = Array.isArray(key) ? key : [key]
  
  // Usar refs para evitar que cambios causen re-renders
  const fetchFnRef = useRef(fetchFn)
  const enabledRef = useRef(enabled)
  const isFetchingRef = useRef(false)
  const keyArrayRef = useRef(keyArray)
  
  // Actualizar refs cuando cambian
  useEffect(() => {
    fetchFnRef.current = fetchFn
    enabledRef.current = enabled
    keyArrayRef.current = keyArray
  }, [fetchFn, enabled, keyArray])

  const fetchData = useCallback(async () => {
    if (!enabledRef.current || isFetchingRef.current) {
      if (!enabledRef.current) {
        setIsLoading(false)
      }
      return
    }

    try {
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)
      const result = await fetchFnRef.current()
      setData(result)
    } catch (err) {
      setError(err)
      setData(null)
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Escuchar eventos de invalidación de queries
  useEffect(() => {
    const handleInvalidate = (event) => {
      const invalidatedKeys = event.detail?.keys || []
      const currentKeyArray = keyArrayRef.current
      
      // Verificar si alguna de las keys invalidadas coincide con esta query
      const shouldRefetch = invalidatedKeys.some(invalidatedKey => {
        const invalidatedArray = Array.isArray(invalidatedKey) ? invalidatedKey : [invalidatedKey]
        
        // Si la key invalida es un prefijo de la key de esta query, o viceversa
        // Ejemplo: ['walkRequests', 'pending'] debería invalidar ['walkRequests', 'pending', 'count']
        if (invalidatedArray.length <= currentKeyArray.length) {
          // Verificar si la key invalida es un prefijo de la key de la query
          return invalidatedArray.every((key, index) => currentKeyArray[index] === key)
        } else {
          // Verificar si la key de la query es un prefijo de la key invalida
          return currentKeyArray.every((key, index) => invalidatedArray[index] === key)
        }
      })
      
      if (shouldRefetch && enabledRef.current && !isFetchingRef.current) {
        fetchData()
      }
    }

    window.addEventListener('invalidateQuery', handleInvalidate)
    
    return () => {
      window.removeEventListener('invalidateQuery', handleInvalidate)
    }
  }, [keyString, fetchData])

  useEffect(() => {
    // Solo hacer fetch si está habilitado
    if (enabled && !isFetchingRef.current) {
      fetchData()
    } else if (!enabled) {
      setIsLoading(false)
    }

    // Refetch automático si se especifica un intervalo
    let intervalId = null
    if (refetchInterval && enabled) {
      intervalId = setInterval(() => {
        if (!isFetchingRef.current) {
          fetchData()
        }
      }, refetchInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [keyString, enabled, refetchInterval, fetchData])

  const refetch = useCallback(() => {
    if (!isFetchingRef.current) {
      fetchData()
    }
  }, [fetchData])

  return { data, isLoading, error, refetch }
}
