import express from 'express'
import { User, Pet, WalkRequest, Review } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'

const router = express.Router()

// Todas las rutas requieren autenticación y rol ADMIN
router.use(authenticate, authorize('ADMIN'))

router.get('/dashboard/stats', async (req, res) => {
  try {
    // Usuarios
    const totalUsers = await User.countDocuments({ isActive: true })
    const totalOwners = await User.countDocuments({ role: 'OWNER', isActive: true })
    const totalWalkers = await User.countDocuments({ role: 'WALKER', isActive: true })
    const totalPets = await Pet.countDocuments({ isActive: true })

    res.json({
      users: {
        total: totalUsers,
        owners: totalOwners,
        walkers: totalWalkers
      },
      platform: {
        totalPets
      }
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})
router.get('/users', async (req, res) => {
  try {
    const { role, isActive, search, page = 1, limit = 20 } = req.query
    const skip = (page - 1) * limit

    let query = {}

    // Filtros
    if (role && role !== 'ALL') {
      query.role = role
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true'
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ]
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash -refreshTokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(query)
    ])

    const usersData = await Promise.all(
      users.map(async (user) => {
        const userObj = user.toObject()

        if (user.role === 'WALKER') {
          const walkRequests = await WalkRequest.countDocuments({ walkerId: user._id })
          const completedWalks = await WalkRequest.countDocuments({
            walkerId: user._id,
            status: 'COMPLETED'
          })
          const reviews = await Review.find({ walkerId: user._id })
          const avgRating = reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0

          userObj.stats = {
            totalWalks: walkRequests,
            completedWalks,
            averageRating: avgRating.toFixed(2),
            totalReviews: reviews.length
          }
        } else if (user.role === 'OWNER') {
          const [pets, totalPets] = await Promise.all([
            Pet.find({ ownerId: user._id, isActive: true })
              .select('name breed age photoUrl')
              .limit(5),
            Pet.countDocuments({ ownerId: user._id, isActive: true })
          ])
          const walkRequests = await WalkRequest.countDocuments({ ownerId: user._id })

          userObj.stats = {
            totalPets,
            totalWalkRequests: walkRequests
          }
          userObj.pets = pets
        }

        return userObj
      })
    )

    res.json({
      users: usersData,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error obteniendo usuarios:', error)
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
})

router.get('/users/:id', async (req, res) => {
  const { id } = req.params

  const user = await User.findById(id).select('-passwordHash -refreshTokens')
  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  const userObj = user.toObject()

  if (user.role === 'WALKER') {
    const walkRequests = await WalkRequest.find({ walkerId: user._id })
      .populate('ownerId', 'name email')
      .populate('petId', 'name breed')
      .sort({ createdAt: -1 })
      .limit(10)

    const reviews = await Review.find({ walkerId: user._id })
      .populate('ownerId', 'name')
      .sort({ createdAt: -1 })
      .limit(10)

    userObj.recentWalks = walkRequests
    userObj.recentReviews = reviews
  } else if (user.role === 'OWNER') {
    const pets = await Pet.find({ ownerId: user._id, isActive: true })
    const walkRequests = await WalkRequest.find({ ownerId: user._id })
      .populate('walkerId', 'name email')
      .populate('petId', 'name breed')
      .sort({ createdAt: -1 })
      .limit(10)

    userObj.pets = pets
    userObj.recentWalks = walkRequests
  }

  res.json({ user: userObj })
})

router.patch('/users/:id/toggle-active', async (req, res) => {
  const { id } = req.params
  const user = await User.findById(id)

  if (!user) {
    return res.status(404).json({ error: 'Usuario no encontrado' })
  }

  user.isActive = !user.isActive
  await user.save()

  res.json({
    message: `Usuario ${user.isActive ? 'activado' : 'suspendido'} exitosamente`,
    user: user.getPublicProfile()
  })
})

router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params
    const user = await User.findById(id)

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' })
    }

    if (user.role === 'ADMIN') {
      return res.status(403).json({ error: 'No se pueden eliminar administradores' })
    }

    if (user.role === 'OWNER') {
      await Pet.deleteMany({ ownerId: user._id })
    }

    await WalkRequest.deleteMany({ 
      $or: [
        { ownerId: user._id },
        { walkerId: user._id }
      ]
    })

    await Review.deleteMany({
      $or: [
        { ownerId: user._id },
        { walkerId: user._id }
      ]
    })

    await User.findByIdAndDelete(id)

    res.json({ message: 'Usuario eliminado exitosamente' })
  } catch (error) {
    console.error('Error eliminando usuario:', error)
    res.status(500).json({ error: 'Error al eliminar usuario' })
  }
})

export default router




