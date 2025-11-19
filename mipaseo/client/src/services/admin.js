import api from './api'

export const adminService = {
  // ============================================
  // DASHBOARD - ESTADÍSTICAS
  // ============================================
  async getDashboardStats() {
    const response = await api.get('/admin/dashboard/stats')
    return response.data
  },

  // ============================================
  // GESTIÓN DE USUARIOS
  // ============================================
  async getUsers(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.role) params.append('role', filters.role)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive)
    if (filters.search) params.append('search', filters.search)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await api.get(`/admin/users?${params.toString()}`)
    return response.data
  },

  async getUserById(userId) {
    const response = await api.get(`/admin/users/${userId}`)
    return response.data
  },

  async toggleUserActive(userId) {
    const response = await api.patch(`/admin/users/${userId}/toggle-active`)
    return response.data
  },

  async deleteUser(userId) {
    const response = await api.delete(`/admin/users/${userId}`)
    return response.data
  },

  // ============================================
  // GESTIÓN DE PASEOS
  // ============================================
  async getWalkRequests(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.status) params.append('status', filters.status)
    if (filters.walkerId) params.append('walkerId', filters.walkerId)
    if (filters.ownerId) params.append('ownerId', filters.ownerId)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await api.get(`/admin/walk-requests?${params.toString()}`)
    return response.data
  },

  async cancelWalkRequest(walkRequestId, reason) {
    const response = await api.patch(`/admin/walk-requests/${walkRequestId}/cancel`, { reason })
    return response.data
  },

  // ============================================
  // GESTIÓN DE RESEÑAS
  // ============================================
  async getReviews(filters = {}) {
    const params = new URLSearchParams()
    
    if (filters.walkerId) params.append('walkerId', filters.walkerId)
    if (filters.ownerId) params.append('ownerId', filters.ownerId)
    if (filters.minRating) params.append('minRating', filters.minRating)
    if (filters.maxRating) params.append('maxRating', filters.maxRating)
    if (filters.page) params.append('page', filters.page)
    if (filters.limit) params.append('limit', filters.limit)

    const response = await api.get(`/admin/reviews?${params.toString()}`)
    return response.data
  },

  async deleteReview(reviewId) {
    const response = await api.delete(`/admin/reviews/${reviewId}`)
    return response.data
  }
}




