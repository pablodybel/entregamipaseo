import express from 'express'
import { WalkRequest, Pet, User } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, createWalkRequestSchema, updateWalkRequestStatusSchema } from '../utils/validation.js'

const router = express.Router()

router.post('/', authenticate, authorize('OWNER'), validate(createWalkRequestSchema), async (req, res) => {
  try {
    const { walkerId, petId, scheduledAt, durationMin, notes } = req.validatedData

    const pet = await Pet.findOne({
      _id: petId,
      ownerId: req.user._id,
      isActive: true
    })

    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' })
    }

    const walker = await User.findOne({
      _id: walkerId,
      role: 'WALKER',
      isActive: true
    })

    if (!walker) {
      return res.status(404).json({ error: 'Paseador no encontrado' })
    }

    const walkRequest = new WalkRequest({
      ownerId: req.user._id,
      walkerId,
      petId,
      scheduledAt: new Date(scheduledAt),
      durationMin,
      notes: notes || ''
    })

    await walkRequest.save()
    await walkRequest.populate([
      { path: 'walkerId', select: 'name phone avatarUrl' },
      { path: 'petId', select: 'name breed photoUrl' }
    ])

    res.status(201).json({
      message: 'Solicitud de paseo creada exitosamente',
      walkRequest
    })
  } catch (error) {
    console.error('Error creando solicitud:', error)
    res.status(500).json({ error: 'Error al crear solicitud' })
  }
})

router.get('/mine', authenticate, async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query
  const skip = (page - 1) * limit

  let query = {}
  let populateFields = []

  if (req.user.role === 'OWNER') {
    query.ownerId = req.user._id
    populateFields = [
      { path: 'walkerId', select: 'name phone avatarUrl experienceYears' },
      { path: 'petId', select: 'name breed photoUrl' }
    ]
  } else if (req.user.role === 'WALKER') {
    query.walkerId = req.user._id
    populateFields = [
      { path: 'ownerId', select: 'name phone address' },
      { path: 'petId', select: 'name breed age weightKg photoUrl routine preferences' }
    ]
  }

  if (status) {
    query.status = status
  }

  const [walkRequests, total] = await Promise.all([
    WalkRequest.find(query)
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    WalkRequest.countDocuments(query)
  ])

  res.json({
    walkRequests,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

router.patch('/:id/accept', authenticate, authorize('WALKER'), validate(updateWalkRequestStatusSchema), async (req, res) => {
  const { id } = req.params
  const { walkerNotes } = req.validatedData

  const walkRequest = await WalkRequest.findOne({
    _id: id,
    walkerId: req.user._id
  })

  if (!walkRequest) {
    return res.status(404).json({ error: 'Solicitud no encontrada' })
  }

  if (!walkRequest.canTransitionTo('ACCEPTED', 'WALKER')) {
    return res.status(400).json({
      error: 'No se puede aceptar esta solicitud en su estado actual'
    })
  }

  walkRequest.status = 'ACCEPTED'
  if (walkerNotes) {
    walkRequest.walkerNotes = walkerNotes
  }

  await walkRequest.save()
  await walkRequest.populate([
    { path: 'ownerId', select: 'name phone address' },
    { path: 'petId', select: 'name breed age weightKg photoUrl routine preferences' }
  ])

  res.json({
    message: 'Solicitud aceptada exitosamente',
    walkRequest
  })
})

router.patch('/:id/reject', authenticate, authorize('WALKER'), validate(updateWalkRequestStatusSchema), async (req, res) => {
  const { id } = req.params
  const { walkerNotes } = req.validatedData

  const walkRequest = await WalkRequest.findOne({
    _id: id,
    walkerId: req.user._id
  })

  if (!walkRequest) {
    return res.status(404).json({ error: 'Solicitud no encontrada' })
  }

  if (!walkRequest.canTransitionTo('REJECTED', 'WALKER')) {
    return res.status(400).json({
      error: 'No se puede rechazar esta solicitud en su estado actual'
    })
  }

  walkRequest.status = 'REJECTED'
  if (walkerNotes) {
    walkRequest.walkerNotes = walkerNotes
  }

  await walkRequest.save()

  res.json({
    message: 'Solicitud rechazada',
    walkRequest
  })
})

router.patch('/:id/complete', authenticate, authorize('WALKER'), validate(updateWalkRequestStatusSchema), async (req, res) => {
  try {
    const { id } = req.params
    const { walkerNotes } = req.validatedData

    const walkRequest = await WalkRequest.findOne({
      _id: id,
      walkerId: req.user._id
    })

    if (!walkRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' })
    }

    if (!walkRequest.canTransitionTo('COMPLETED', 'WALKER')) {
      return res.status(400).json({
        error: 'No se puede completar esta solicitud en su estado actual'
      })
    }

    walkRequest.status = 'COMPLETED'
    if (walkerNotes) {
      walkRequest.walkerNotes = walkerNotes
    }

    await walkRequest.save()
    await walkRequest.populate([
      { path: 'ownerId', select: 'name phone' },
      { path: 'petId', select: 'name breed' }
    ])

    res.json({
      message: 'Paseo completado exitosamente',
      walkRequest
    })
  } catch (error) {
    console.error('Error completando paseo:', error)
    res.status(500).json({ error: 'Error al completar paseo' })
  }
})

router.patch('/:id/cancel', authenticate, authorize('OWNER'), validate(updateWalkRequestStatusSchema), async (req, res) => {
  const { id } = req.params

  const walkRequest = await WalkRequest.findOne({
    _id: id,
    ownerId: req.user._id
  })

  if (!walkRequest) {
    return res.status(404).json({ error: 'Solicitud no encontrada' })
  }

  if (!walkRequest.canTransitionTo('CANCELLED', 'OWNER')) {
    return res.status(400).json({
      error: 'No se puede cancelar esta solicitud en su estado actual'
    })
  }

  walkRequest.status = 'CANCELLED'
  await walkRequest.save()

  res.json({
    message: 'Solicitud cancelada exitosamente',
    walkRequest
  })
})

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params

  let query = { _id: id }
  if (req.user.role === 'OWNER') {
    query.ownerId = req.user._id
  } else if (req.user.role === 'WALKER') {
    query.walkerId = req.user._id
  }

  const walkRequest = await WalkRequest.findOne(query)
    .populate('ownerId', 'name phone address')
    .populate('walkerId', 'name phone avatarUrl experienceYears')
    .populate('petId', 'name breed age weightKg photoUrl routine preferences')

  if (!walkRequest) {
    return res.status(404).json({ error: 'Solicitud no encontrada' })
  }

  res.json({ walkRequest })
})

export default router