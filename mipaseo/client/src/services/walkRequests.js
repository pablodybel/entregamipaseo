import api from './api'

export const walkRequestsService = {
  async createWalkRequest(requestData) {
    const response = await api.post('/walk-requests', requestData)
    return response.data
  },

  async getMyWalkRequests(status = null, page = 1, limit = 10) {
    let url = `/walk-requests/mine?page=${page}&limit=${limit}`
    if (status) {
      url += `&status=${status}`
    }
    const response = await api.get(url)
    return response.data
  },

  async getWalkRequest(id) {
    const response = await api.get(`/walk-requests/${id}`)
    return response.data
  },

  async acceptWalkRequest(id, walkerNotes = '') {
    const response = await api.patch(`/walk-requests/${id}/accept`, { walkerNotes })
    return response.data
  },

  async rejectWalkRequest(id, walkerNotes = '') {
    const response = await api.patch(`/walk-requests/${id}/reject`, { walkerNotes })
    return response.data
  },

  async completeWalkRequest(id, walkerNotes = '') {
    const response = await api.patch(`/walk-requests/${id}/complete`, { walkerNotes })
    return response.data
  },

  async cancelWalkRequest(id) {
    const response = await api.patch(`/walk-requests/${id}/cancel`)
    return response.data
  }
}