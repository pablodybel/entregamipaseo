import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['OWNER', 'WALKER', 'ADMIN'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true,
    maxlength: 200
  },
  // Campos específicos para WALKER
  experienceYears: {
    type: Number,
    min: 0,
    max: 50,
    required: function() { return this.role === 'WALKER' }
  },
  bio: {
    type: String,
    maxlength: 500,
    required: function() { return this.role === 'WALKER' }
  },
  neighborhood: {
    type: String,
    enum: [
      "Agronomía","Almagro","Balvanera","Barracas","Belgrano","Boedo","Caballito",
      "Chacarita","Coghlan","Colegiales","Constitución","Flores","Floresta","La Boca",
      "La Paternal","Liniers","Mataderos","Monte Castro","Monserrat","Nueva Pompeya",
      "Núñez","Palermo","Parque Avellaneda","Parque Chacabuco","Parque Chas",
      "Parque Patricios","Puerto Madero","Recoleta","Retiro","Saavedra",
      "San Cristóbal","San Nicolás","San Telmo","Vélez Sarsfield","Versalles",
      "Villa Crespo","Villa del Parque","Villa Devoto","Villa Gral. Mitre",
      "Villa Lugano","Villa Luro","Villa Ortúzar","Villa Pueyrredón","Villa Real",
      "Villa Riachuelo","Villa Santa Rita","Villa Soldati","Villa Urquiza"
    ],
    required: function() { return this.role === 'WALKER' }
  },
  availableHours: {
    type: [String],
    default: [],
    validate: {
      validator: function(hours) {
        // Validar formato HH:MM
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        return hours.every(hour => timeRegex.test(hour))
      },
      message: 'Los horarios deben estar en formato HH:MM'
    }
  },
  avatarUrl: {
    type: String,
    default: null
  },
  // Campos de control
  isActive: {
    type: Boolean,
    default: true
  },
  refreshTokens: [{
    token: String,
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 2592000 // 30 días
    }
  }]
}, {
  timestamps: true
})

// Índices adicionales (email ya tiene índice por unique: true)
userSchema.index({ role: 1 })
userSchema.index({ neighborhood: 1 })

// Método para hashear password
userSchema.methods.hashPassword = async function(password) {
  this.passwordHash = await bcrypt.hash(password, 12)
}

// Método para verificar password
userSchema.methods.verifyPassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash)
}

// Método para obtener perfil público
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject()
  delete user.passwordHash
  delete user.refreshTokens
  return user
}

// Virtual para calcular rating promedio (se poblará desde las reseñas)
userSchema.virtual('averageRating', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'walkerId',
  justOne: false
})

userSchema.set('toJSON', { virtuals: true })
userSchema.set('toObject', { virtuals: true })

const User = mongoose.model('User', userSchema)

export default User