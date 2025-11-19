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
  
  // Usar refs para evitar que cambios causen re-renders
  const fetchFnRef = useRef(fetchFn)
  const enabledRef = useRef(enabled)
  const isFetchingRef = useRef(false)
  
  // Actualizar refs cuando cambian
  useEffect(() => {
    fetchFnRef.current = fetchFn
    enabledRef.current = enabled
  }, [fetchFn, enabled])

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
