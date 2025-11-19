import mongoose from 'mongoose'

const reviewSchema = new mongoose.Schema({
  walkRequestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WalkRequest',
    required: true,
    unique: true // Una reseña por solicitud de paseo
  },
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500,
    minlength: 10
  }
}, {
  timestamps: true
})

// Índices (walkRequestId ya tiene índice por unique: true)
reviewSchema.index({ walkerId: 1 })
reviewSchema.index({ ownerId: 1 })
reviewSchema.index({ walkerId: 1, createdAt: -1 })

// Middleware para validaciones
reviewSchema.pre('save', async function(next) {
  if (this.isNew) {
    const WalkRequest = mongoose.model('WalkRequest')
    const User = mongoose.model('User')

    // Verificar que la solicitud existe y está completada
    const walkRequest = await WalkRequest.findById(this.walkRequestId)
    if (!walkRequest) {
      throw new Error('La solicitud de paseo no existe')
    }

    if (walkRequest.status !== 'COMPLETED') {
      throw new Error('Solo se pueden reseñar paseos completados')
    }

    // Verificar que los IDs coinciden
    if (walkRequest.ownerId.toString() !== this.ownerId.toString()) {
      throw new Error('Solo el dueño puede reseñar este paseo')
    }

    if (walkRequest.walkerId.toString() !== this.walkerId.toString()) {
      throw new Error('El ID del paseador no coincide')
    }

    // Verificar roles
    const [owner, walker] = await Promise.all([
      User.findById(this.ownerId),
      User.findById(this.walkerId)
    ])

    if (!owner || owner.role !== 'OWNER') {
      throw new Error('El reseñador debe ser OWNER')
    }

    if (!walker || walker.role !== 'WALKER') {
      throw new Error('El reseñado debe ser WALKER')
    }
  }

  next()
})

// Método estático para calcular rating promedio
reviewSchema.statics.getAverageRating = async function(walkerId) {
  const result = await this.aggregate([
    { $match: { walkerId: new mongoose.Types.ObjectId(walkerId) } },
    {
      $group: {
        _id: '$walkerId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ])

  return result.length > 0 ? {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews
  } : {
    averageRating: 0,
    totalReviews: 0
  }
}

const Review = mongoose.model('Review', reviewSchema)

export default Review