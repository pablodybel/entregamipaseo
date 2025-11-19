import { useState } from 'react'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { Plus, Dog, Edit, Trash2, Clock } from 'lucide-react'
import { petsService } from '../../services/pets'
import { AVAILABLE_HOURS, DOG_BREEDS } from '../../utils/constants'
import toast from 'react-hot-toast'

const MisMascotas = () => {
  const [showForm, setShowForm] = useState(false)
  const [editingPet, setEditingPet] = useState(null)
  const [selectedPhoto, setSelectedPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [selectedWalkTimes, setSelectedWalkTimes] = useState([])

  const { data: pets, isLoading, refetch } = useFetch(
    ['pets'],
    petsService.getPets
  )

  const createMutation = useMutation(petsService.createPet, {
    onSuccess: () => {
      refetch()
      setShowForm(false)
      setEditingPet(null)
      setSelectedPhoto(null)
      setPhotoPreview(null)
      toast.success('Mascota creada exitosamente')
    }
  })

  const updateMutation = useMutation(
    ({ id, data }) => petsService.updatePet(id, data),
    {
      onSuccess: () => {
        refetch()
        setShowForm(false)
        setEditingPet(null)
        setSelectedPhoto(null)
        setPhotoPreview(null)
        toast.success('Mascota actualizada exitosamente')
      }
    }
  )

  const deleteMutation = useMutation(petsService.deletePet, {
    onSuccess: () => {
      refetch()
      toast.success('Mascota eliminada')
    }
  })

  const toggleWalkTime = (hour) => {
    setSelectedWalkTimes(prev => {
      if (prev.includes(hour)) {
        return prev.filter(h => h !== hour)
      } else {
        return [...prev, hour].sort()
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)

    const petData = {
      name: formData.get('name'),
      breed: formData.get('breed'),
      age: parseInt(formData.get('age')),
      weightKg: parseFloat(formData.get('weightKg')),
      routine: {
        walkTimes: selectedWalkTimes,
        feedingNotes: formData.get('feedingNotes'),
        specialCare: formData.get('specialCare')
      },
      preferences: {
        sociable: formData.get('sociable') === 'on',
        needsMuzzle: formData.get('needsMuzzle') === 'on',
        soloWalks: formData.get('soloWalks') === 'on'
      }
    }

    if (selectedPhoto) {
      petData.photo = selectedPhoto
    }

    if (editingPet) {
      updateMutation.mutate({ id: editingPet._id, data: petData })
    } else {
      createMutation.mutate(petData)
    }
  }

  const handleEdit = (pet) => {
    setEditingPet(pet)
    setPhotoPreview(null)
    setSelectedPhoto(null)
    setSelectedWalkTimes(pet.routine?.walkTimes || [])
    setShowForm(true)
  }

  const handleCancelEdit = () => {
    setEditingPet(null)
    setShowForm(false)
    setSelectedPhoto(null)
    setPhotoPreview(null)
    setSelectedWalkTimes([])
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedPhoto(file)
      // Crear preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mis Mascotas</h1>
        <button
          onClick={() => {
            setEditingPet(null)
            setSelectedWalkTimes([])
            setShowForm(!showForm)
          }}
          className="btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar Mascota
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">
            {editingPet ? 'Editar Mascota' : 'Nueva Mascota'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input 
                  name="name" 
                  type="text" 
                  required 
                  className="input" 
                  placeholder="Max"
                  defaultValue={editingPet?.name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raza
                </label>
                <select 
                  name="breed" 
                  required 
                  className="input" 
                  defaultValue={editingPet?.breed || ''}
                >
                  <option value="">Selecciona una raza</option>
                  {DOG_BREEDS.map((breed) => (
                    <option key={breed} value={breed}>
                      {breed}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Edad (años)
                </label>
                <input 
                  name="age" 
                  type="number" 
                  required 
                  min="0" 
                  max="30" 
                  className="input"
                  defaultValue={editingPet?.age || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Peso (kg)
                </label>
                <input 
                  name="weightKg" 
                  type="number" 
                  required 
                  min="0.1" 
                  step="0.1" 
                  className="input"
                  defaultValue={editingPet?.weightKg || ''}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <Clock className="inline h-5 w-5 mr-2 text-gray-600" />
                Horarios preferidos de paseo (paseos de 1 hora)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Selecciona los horarios en los que prefieres que tu mascota salga a pasear.
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                {AVAILABLE_HOURS.map((hour) => (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => toggleWalkTime(hour)}
                    className={`
                      py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200
                      ${selectedWalkTimes.includes(hour)
                        ? 'bg-primary-600 text-white shadow-md hover:bg-primary-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }
                      cursor-pointer
                    `}
                  >
                    {hour}
                  </button>
                ))}
              </div>
              {selectedWalkTimes.length > 0 && (
                <p className="mt-3 text-sm text-primary-600">
                  {selectedWalkTimes.length} {selectedWalkTimes.length === 1 ? 'horario seleccionado' : 'horarios seleccionados'}
                </p>
              )}
              {selectedWalkTimes.length === 0 && (
                <p className="mt-3 text-sm text-amber-600">
                  Selecciona al menos un horario preferido
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas de alimentación
              </label>
              <textarea 
                name="feedingNotes" 
                rows="2" 
                className="input" 
                placeholder="Come dos veces al día..."
                defaultValue={editingPet?.routine?.feedingNotes || ''}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cuidados especiales
              </label>
              <textarea 
                name="specialCare" 
                rows="2" 
                className="input" 
                placeholder="Le gusta el agua..."
                defaultValue={editingPet?.routine?.specialCare || ''}
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Foto {editingPet && '(dejar vacío para mantener la actual)'}
              </label>
              {(photoPreview || editingPet?.photoUrl) && (
                <div className="mb-3">
                  <img 
                    src={photoPreview || `${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${editingPet.photoUrl}`}
                    alt={editingPet?.name || 'Preview'}
                    className="h-32 w-32 object-cover rounded-lg border-2 border-gray-200"
                  />
                  {photoPreview && (
                    <p className="text-xs text-green-600 mt-1">✓ Nueva foto seleccionada</p>
                  )}
                </div>
              )}
              <input 
                name="photo" 
                type="file" 
                accept="image/*" 
                className="input" 
                onChange={handlePhotoChange}
              />
              <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WEBP (máx. 5MB)</p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">Preferencias</h4>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    name="sociable" 
                    type="checkbox" 
                    className="mr-2"
                    defaultChecked={editingPet?.preferences?.sociable || false}
                  />
                  <span className="text-sm">Es sociable con otros perros</span>
                </label>
                <label className="flex items-center">
                  <input 
                    name="needsMuzzle" 
                    type="checkbox" 
                    className="mr-2"
                    defaultChecked={editingPet?.preferences?.needsMuzzle || false}
                  />
                  <span className="text-sm">Necesita bozal</span>
                </label>
                <label className="flex items-center">
                  <input 
                    name="soloWalks" 
                    type="checkbox" 
                    className="mr-2"
                    defaultChecked={editingPet?.preferences?.soloWalks || false}
                  />
                  <span className="text-sm">Prefiere paseos en solitario</span>
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={createMutation.isLoading || updateMutation.isLoading}
              >
                {(createMutation.isLoading || updateMutation.isLoading) ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="btn-outline"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {pets?.pets?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.pets.map((pet) => (
            <div key={pet._id} className="card p-6">
              {pet.photoUrl && (
                <img
                  src={`${import.meta.env.VITE_API_BASE?.replace('/api/v1', '') || 'http://localhost:4000'}${pet.photoUrl}`}
                  alt={pet.name}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{pet.name}</h3>
              <div className="space-y-1 text-sm text-gray-600 mb-4">
                <p><strong>Raza:</strong> {pet.breed}</p>
                <p><strong>Edad:</strong> {pet.age} años</p>
                <p><strong>Peso:</strong> {pet.weightKg} kg</p>
              </div>

              {pet.routine?.walkTimes?.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Clock className="h-4 w-4 mr-1" />
                    Horarios preferidos
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {pet.routine.walkTimes.map((hour) => (
                      <span
                        key={hour}
                        className="inline-block px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded"
                      >
                        {hour}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex space-x-2 mb-4">
                {pet.preferences?.sociable && (
                  <span className="badge badge-info">Sociable</span>
                )}
                {pet.preferences?.needsMuzzle && (
                  <span className="badge badge-warning">Bozal</span>
                )}
                {pet.preferences?.soloWalks && (
                  <span className="badge badge-info">Paseos solos</span>
                )}
              </div>

              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEdit(pet)}
                  className="btn-outline flex-1"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Seguro que quieres eliminar esta mascota?')) {
                      deleteMutation.mutate(pet._id)
                    }
                  }}
                  className="btn-outline text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Dog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes mascotas registradas</h3>
          <p className="text-gray-500 mb-4">Comienza agregando información sobre tu primera mascota</p>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Mi Primera Mascota
          </button>
        </div>
      )}
    </div>
  )
}

export default MisMascotas