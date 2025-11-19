import mongoose from 'mongoose'

const routineSchema = new mongoose.Schema({
  walkTimes: [{
    type: String,
    trim: true
  }],
  feedingNotes: {
    type: String,
    maxlength: 300,
    default: ''
  },
  specialCare: {
    type: String,
    maxlength: 300,
    default: ''
  }
}, { _id: false })

const preferencesSchema = new mongoose.Schema({
  sociable: {
    type: Boolean,
    default: true
  },
  needsMuzzle: {
    type: Boolean,
    default: false
  },
  soloWalks: {
    type: Boolean,
    default: false
  }
}, { _id: false })

const petSchema = new mongoose.Schema({
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  breed: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 30
  },
  weightKg: {
    type: Number,
    required: true,
    min: 0.1,
    max: 100
  },
  photoUrl: {
    type: String,
    default: null
  },
  routine: {
    type: routineSchema,
    default: () => ({})
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({})
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
})

// Índices
petSchema.index({ ownerId: 1 })
petSchema.index({ ownerId: 1, isActive: 1 })

// Middleware para validar que el owner existe y es OWNER
petSchema.pre('save', async function(next) {
  if (this.isNew || this.isModified('ownerId')) {
    const User = mongoose.model('User')
    const owner = await User.findById(this.ownerId)

    if (!owner) {
      throw new Error('El dueño especificado no existe')
    }

    if (owner.role !== 'OWNER') {
      throw new Error('Solo los usuarios con rol OWNER pueden tener mascotas')
    }
  }
  next()
})

const Pet = mongoose.model('Pet', petSchema)

export default Pet