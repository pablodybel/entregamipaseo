import api from './api'

export const petsService = {
  async getPets() {
    const response = await api.get('/pets')
    return response.data
  },

  async createPet(petData) {
    const formData = new FormData()

    Object.keys(petData).forEach(key => {
      if (key === 'photo' && petData[key]) {
        formData.append('photo', petData[key])
      } else if (typeof petData[key] === 'object') {
        formData.append(key, JSON.stringify(petData[key]))
      } else {
        formData.append(key, petData[key])
      }
    })

    const response = await api.post('/pets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async updatePet(id, petData) {
    const formData = new FormData()

    Object.keys(petData).forEach(key => {
      if (key === 'photo' && petData[key]) {
        formData.append('photo', petData[key])
      } else if (typeof petData[key] === 'object') {
        formData.append(key, JSON.stringify(petData[key]))
      } else {
        formData.append(key, petData[key])
      }
    })

    const response = await api.patch(`/pets/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  },

  async deletePet(id) {
    const response = await api.delete(`/pets/${id}`)
    return response.data
  },

  async getPet(id) {
    const response = await api.get(`/pets/${id}`)
    return response.data
  }
}