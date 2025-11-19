import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    return response.data
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  async refresh(refreshToken) {
    const response = await api.post('/auth/refresh', { refreshToken })
    return response.data
  },

  async getProfile() {
    const response = await api.get('/auth/me')
    return response.data
  },

  async logout(refreshToken) {
    const response = await api.post('/auth/logout', { refreshToken })
    return response.data
  }
}