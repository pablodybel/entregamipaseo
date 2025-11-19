import api from './api'

export const walkersService = {
  async searchWalkers({ name, neighborhood }) {
    const params = new URLSearchParams()
    if (name) params.append('name', name)
    if (neighborhood) params.append('neighborhood', neighborhood)
    
    const response = await api.get(`/users/search?${params.toString()}`)
    return response.data
  },

  async searchByNeighborhood(neighborhood) {
    const response = await api.get(`/users/by-neighborhood?neighborhood=${encodeURIComponent(neighborhood)}`)
    return response.data
  },

  async getWalker(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async getWalkerReviews(id, page = 1, limit = 10) {
    const response = await api.get(`/users/${id}/reviews?page=${page}&limit=${limit}`)
    return response.data
  },

  async getActiveWalkersCount() {
    const response = await api.get('/users/walkers/count')
    return response.data
  }
}