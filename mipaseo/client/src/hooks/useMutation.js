import { useState, useCallback } from 'react'

/**
 * Hook personalizado para hacer mutaciones (POST, PUT, DELETE, PATCH)
 * @param {Function} mutationFn - Función que ejecuta la mutación
 * @param {Object} options - Opciones adicionales
 * @param {Function} options.onSuccess - Callback cuando la mutación es exitosa
 * @param {Function} options.onError - Callback cuando la mutación falla
 */
export const useMutation = (mutationFn, options = {}) => {
  const { onSuccess, onError } = options

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [data, setData] = useState(null)

  const mutate = useCallback(async (variables, localOptions = {}) => {
    const localOnSuccess = localOptions.onSuccess || onSuccess
    const localOnError = localOptions.onError || onError

    try {
      setIsLoading(true)
      setError(null)
      const result = await mutationFn(variables)
      setData(result)
      
      if (localOnSuccess) {
        localOnSuccess(result, variables)
      }
      
      return result
    } catch (err) {
      setError(err)
      setData(null)
      
      if (localOnError) {
        localOnError(err, variables)
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [mutationFn, onSuccess, onError])

  return {
    mutate,
    mutateAsync: mutate,
    isLoading,
    error,
    data
  }
}

