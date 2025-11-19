import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { User, Review } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, validateQuery, updateProfileSchema, searchWalkersByNeighborhoodSchema } from '../utils/validation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

// Configuración de multer para avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueName = `avatar-${req.user._id}-${Date.now()}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimeType = allowedTypes.test(file.mimetype)

    if (mimeType && extName) {
      return cb(null, true)
    } else {
      cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'))
    }
  }
})

// Obtener conteo de paseadores activos
router.get('/walkers/count', async (req, res) => {
  try {
    const count = await User.countDocuments({
      role: 'WALKER',
      isActive: true
    })
    
    res.json({ count })
  } catch (error) {
    console.error('Error obteniendo conteo de paseadores:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Buscar paseadores por nombre
router.get('/search', async (req, res) => {
  try {
    const { name, neighborhood } = req.query

    // Construir el query
    const query = {
      role: 'WALKER',
      isActive: true
    }

    // Si hay búsqueda por nombre
    if (name && name.trim()) {
      query.name = { $regex: name.trim(), $options: 'i' }
    }

    // Si hay filtro por barrio
    if (neighborhood && neighborhood.trim()) {
      query.neighborhood = neighborhood.trim()
    }

    const walkers = await User.find(query).select('-passwordHash -refreshTokens')

    // Obtener ratings para cada paseador
    const walkersWithRatings = await Promise.all(
      walkers.map(async (walker) => {
        const ratingData = await Review.getAverageRating(walker._id)
        return {
          ...walker.toObject(),
          averageRating: ratingData.averageRating,
          totalReviews: ratingData.totalReviews
        }
      })
    )

    res.json({
      walkers: walkersWithRatings,
      total: walkersWithRatings.length,
      filters: {
        name: name || null,
        neighborhood: neighborhood || null
      }
    })
  } catch (error) {
    console.error('Error buscando paseadores:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Buscar paseadores por barrio
router.get('/by-neighborhood', validateQuery(searchWalkersByNeighborhoodSchema), async (req, res) => {
  try {
    const { neighborhood } = req.validatedQuery

    const walkers = await User.find({
      role: 'WALKER',
      isActive: true,
      neighborhood: neighborhood
    }).select('-passwordHash -refreshTokens')

    // Obtener ratings para cada paseador
    const walkersWithRatings = await Promise.all(
      walkers.map(async (walker) => {
        const ratingData = await Review.getAverageRating(walker._id)
        return {
          ...walker.toObject(),
          averageRating: ratingData.averageRating,
          totalReviews: ratingData.totalReviews
        }
      })
    )

    res.json({
      walkers: walkersWithRatings,
      neighborhood: neighborhood,
      total: walkersWithRatings.length
    })
  } catch (error) {
    console.error('Error buscando paseadores por barrio:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Obtener perfil público de un paseador
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const walker = await User.findOne({
      _id: id,
      role: 'WALKER',
      isActive: true
    }).select('-passwordHash -refreshTokens')

    if (!walker) {
      return res.status(404).json({
        error: 'Paseador no encontrado'
      })
    }

    // Obtener rating y reseñas
    const ratingData = await Review.getAverageRating(walker._id)
    const recentReviews = await Review.find({ walkerId: walker._id })
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .limit(5)

    res.json({
      walker: {
        ...walker.toObject(),
        averageRating: ratingData.averageRating,
        totalReviews: ratingData.totalReviews
      },
      recentReviews
    })
  } catch (error) {
    console.error('Error obteniendo paseador:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Actualizar perfil propio
router.patch('/me', authenticate, upload.single('avatar'), validate(updateProfileSchema), async (req, res) => {
  try {
    const updates = req.validatedData
    const user = await User.findById(req.user._id)

    // Si se subió un avatar, agregarlo a las actualizaciones
    if (req.file) {
      updates.avatarUrl = `/uploads/${req.file.filename}`
    }

    // Validar campos específicos según el rol
    if (user.role === 'WALKER') {
      // Los paseadores pueden actualizar todos los campos
    } else if (user.role === 'OWNER') {
      // Los dueños no pueden actualizar campos de paseador
      delete updates.experienceYears
      delete updates.bio
      delete updates.neighborhood
      delete updates.availableHours
    }

    Object.assign(user, updates)
    await user.save()

    res.json({
      message: 'Perfil actualizado exitosamente',
      user: user.getPublicProfile()
    })
  } catch (error) {
    console.error('Error actualizando perfil:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Subir avatar
router.post('/me/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No se subió ningún archivo'
      })
    }

    const avatarUrl = `/uploads/${req.file.filename}`

    await User.findByIdAndUpdate(req.user._id, { avatarUrl })

    res.json({
      message: 'Avatar subido exitosamente',
      avatarUrl
    })
  } catch (error) {
    console.error('Error subiendo avatar:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

// Obtener reseñas de un paseador
router.get('/:id/reviews', async (req, res) => {
  try {
    const { id } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    // Verificar que el usuario es un paseador
    const walker = await User.findOne({
      _id: id,
      role: 'WALKER',
      isActive: true
    })

    if (!walker) {
      return res.status(404).json({
        error: 'Paseador no encontrado'
      })
    }

    // Obtener reseñas con paginación
    const [reviews, total, ratingData] = await Promise.all([
      Review.find({ walkerId: id })
        .populate('ownerId', 'name')
        .populate('walkRequestId', 'scheduledAt durationMin')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ walkerId: id }),
      Review.getAverageRating(id)
    ])

    res.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      rating: ratingData
    })
  } catch (error) {
    console.error('Error obteniendo reseñas:', error)
    res.status(500).json({
      error: 'Error interno del servidor'
    })
  }
})

export default router