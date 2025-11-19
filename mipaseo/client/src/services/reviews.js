import api from './api'

export const reviewsService = {
  // Obtener reseñas del usuario autenticado
  async getMyReviews(page = 1, limit = 10) {
    const response = await api.get(`/reviews/mine?page=${page}&limit=${limit}`)
    return response.data
  },

  // Obtener estadísticas de reseñas de un paseador
  async getWalkerStats(walkerId) {
    const response = await api.get(`/reviews/walker/${walkerId}/stats`)
    return response.data
  },

  // Crear una nueva reseña
  async createReview(walkRequestId, rating, comment) {
    const response = await api.post('/reviews', {
      walkRequestId,
      rating,
      comment
    })
    return response.data
  },

  // Obtener reseñas pendientes (para OWNER)
  async getPendingReviews() {
    const response = await api.get('/reviews/pending')
    return response.data
  }
}

