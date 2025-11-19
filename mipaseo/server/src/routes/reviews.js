import express from 'express'
import mongoose from 'mongoose'
import { Review, WalkRequest, User } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, createReviewSchema } from '../utils/validation.js'

const router = express.Router()

router.post('/', authenticate, authorize('OWNER'), validate(createReviewSchema), async (req, res) => {
  try {
    const { walkRequestId, rating, comment } = req.validatedData

    const walkRequest = await WalkRequest.findById(walkRequestId)
    if (!walkRequest) {
      return res.status(404).json({ error: 'Solicitud de paseo no encontrada' })
    }

    if (walkRequest.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Solo se pueden reseñar paseos completados' })
    }

    if (walkRequest.ownerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Solo puedes reseñar tus propios paseos' })
    }

    const existingReview = await Review.findOne({ walkRequestId })
    if (existingReview) {
      return res.status(400).json({ error: 'Ya existe una reseña para este paseo' })
    }

    const review = new Review({
      walkRequestId,
      ownerId: req.user._id,
      walkerId: walkRequest.walkerId,
      rating,
      comment
    })

    await review.save()
    await review.populate([
      { path: 'ownerId', select: 'name' },
      { path: 'walkerId', select: 'name' },
      { path: 'walkRequestId', select: 'scheduledAt durationMin', populate: { path: 'petId', select: 'name breed' } }
    ])

    res.status(201).json({
      message: 'Reseña creada exitosamente',
      review
    })
  } catch (error) {
    console.error('Error creando reseña:', error)
    res.status(500).json({ error: 'Error al crear reseña' })
  }
})

router.get('/mine', authenticate, async (req, res) => {
  const { page = 1, limit = 10 } = req.query
  const skip = (page - 1) * limit

  let query = {}
  if (req.user.role === 'OWNER') {
    query.ownerId = req.user._id
  } else if (req.user.role === 'WALKER') {
    query.walkerId = req.user._id
  }

  const [reviews, total] = await Promise.all([
    Review.find(query)
      .populate('ownerId', 'name')
      .populate('walkerId', 'name')
      .populate({
        path: 'walkRequestId',
        select: 'scheduledAt durationMin',
        populate: { path: 'petId', select: 'name breed' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Review.countDocuments(query)
  ])

  res.json({
    reviews,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

router.get('/walker/:walkerId/stats', async (req, res) => {
  try {
    const { walkerId } = req.params

    const walker = await User.findOne({
      _id: walkerId,
      role: 'WALKER',
      isActive: true
    })

    if (!walker) {
      return res.status(404).json({ error: 'Paseador no encontrado' })
    }

    const [ratingData, ratingDistribution] = await Promise.all([
      Review.getAverageRating(walkerId),
      Review.aggregate([
        { $match: { walkerId: new mongoose.Types.ObjectId(walkerId) } },
        {
          $group: {
            _id: '$rating',
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ])
    ])

    const distribution = {}
    for (let i = 1; i <= 5; i++) {
      distribution[i] = 0
    }
    ratingDistribution.forEach(item => {
      distribution[item._id] = item.count
    })

    res.json({
      walkerId,
      averageRating: ratingData.averageRating,
      totalReviews: ratingData.totalReviews,
      ratingDistribution: distribution
    })
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error)
    res.status(500).json({ error: 'Error al obtener estadísticas' })
  }
})

router.get('/pending', authenticate, authorize('OWNER'), async (req, res) => {
  const completedWalks = await WalkRequest.find({
    ownerId: req.user._id,
    status: 'COMPLETED'
  }).populate([
    { path: 'walkerId', select: 'name avatarUrl' },
    { path: 'petId', select: 'name breed' }
  ])

  const reviewedWalkIds = await Review.find({
    ownerId: req.user._id
  }).distinct('walkRequestId')

  const pendingReviews = completedWalks.filter(walk =>
    !reviewedWalkIds.some(reviewedId => reviewedId.toString() === walk._id.toString())
  )

  res.json({
    pendingReviews: pendingReviews.map(walk => ({
      walkRequestId: walk._id,
      scheduledAt: walk.scheduledAt,
      durationMin: walk.durationMin,
      completedAt: walk.completedAt,
      walker: walk.walkerId,
      pet: walk.petId,
      walkerNotes: walk.walkerNotes
    }))
  })
})

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params

  const review = await Review.findById(id)
    .populate('ownerId', 'name')
    .populate('walkerId', 'name avatarUrl')
    .populate({
      path: 'walkRequestId',
      select: 'scheduledAt durationMin completedAt walkerNotes',
      populate: { path: 'petId', select: 'name breed photoUrl' }
    })

  if (!review) {
    return res.status(404).json({ error: 'Reseña no encontrada' })
  }

  if (review.ownerId._id.toString() !== req.user._id.toString() &&
      review.walkerId._id.toString() !== req.user._id.toString()) {
    return res.status(403).json({ error: 'No tienes permisos para ver esta reseña' })
  }

  res.json({ review })
})

export default router