import mongoose from 'mongoose'

const walkRequestSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  walkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  petId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: true
  },
  scheduledAt: {
    type: Date,
    required: true
  },
  durationMin: {
    type: Number,
    required: true,
    min: 15,
    max: 180
  },
  notes: {
    type: String,
    maxlength: 500,
    default: ''
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'CANCELLED'],
    default: 'PENDING'
  },
  // Campos adicionales para tracking
  acceptedAt: Date,
  completedAt: Date,
  cancelledAt: Date,
  rejectedAt: Date,
  walkerNotes: {
    type: String,
    maxlength: 500,
    default: ''
  }
}, {
  timestamps: true
})

// Índices
walkRequestSchema.index({ ownerId: 1, status: 1 })
walkRequestSchema.index({ walkerId: 1, status: 1 })
walkRequestSchema.index({ petId: 1 })
walkRequestSchema.index({ scheduledAt: 1 })
walkRequestSchema.index({ status: 1 })

// Middleware para validaciones
walkRequestSchema.pre('save', async function(next) {
  // Validar que la fecha es futura (solo en creación)
  if (this.isNew && this.scheduledAt <= new Date()) {
    throw new Error('La fecha del paseo debe ser futura')
  }

  // Validar roles al crear
  if (this.isNew) {
    const User = mongoose.model('User')
    const Pet = mongoose.model('Pet')

    const [owner, walker, pet] = await Promise.all([
      User.findById(this.ownerId),
      User.findById(this.walkerId),
      Pet.findById(this.petId)
    ])

    if (!owner || owner.role !== 'OWNER') {
      throw new Error('El dueño debe tener rol OWNER')
    }

    if (!walker || walker.role !== 'WALKER') {
      throw new Error('El paseador debe tener rol WALKER')
    }

    if (!pet || pet.ownerId.toString() !== this.ownerId.toString()) {
      throw new Error('La mascota debe pertenecer al dueño')
    }
  }

  // Actualizar timestamps según el estado
  if (this.isModified('status')) {
    switch (this.status) {
      case 'ACCEPTED':
        this.acceptedAt = new Date()
        break
      case 'COMPLETED':
        this.completedAt = new Date()
        break
      case 'CANCELLED':
        this.cancelledAt = new Date()
        break
      case 'REJECTED':
        this.rejectedAt = new Date()
        break
    }
  }

  next()
})

// Método para verificar si se puede cambiar el estado
walkRequestSchema.methods.canTransitionTo = function(newStatus, userRole) {
  const validTransitions = {
    PENDING: {
      WALKER: ['ACCEPTED', 'REJECTED'],
      OWNER: ['CANCELLED']
    },
    ACCEPTED: {
      WALKER: ['COMPLETED'],
      OWNER: ['CANCELLED']
    },
    REJECTED: {},
    COMPLETED: {},
    CANCELLED: {}
  }

  return validTransitions[this.status][userRole]?.includes(newStatus) || false
}

const WalkRequest = mongoose.model('WalkRequest', walkRequestSchema)

export default WalkRequest