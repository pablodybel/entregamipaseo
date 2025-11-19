import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api/v1'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // No intentar refrescar el token si el error viene del endpoint de login o register
    const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/register')
    
    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_BASE}/auth/refresh`, {
          refreshToken
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data.tokens

        localStorage.setItem('accessToken', accessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return api(originalRequest)
      } catch (refreshError) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        // Verificar si la ruta actual es de admin para redirigir al login correcto
        const isAdminRoute = window.location.pathname.startsWith('/admin')
        const loginPath = isAdminRoute ? '/admin/login' : '/login'
        window.location.href = loginPath
        return Promise.reject(refreshError)
      }
    }

        if (error.response?.data?.error) {
          toast.error(error.response.data.error)
        } else if (error.message) {
          toast.error(error.message)
        }

    return Promise.reject(error)
  }
)

export default api