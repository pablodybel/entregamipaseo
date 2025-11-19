import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { Pet } from '../models/index.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validate, createPetSchema, updatePetSchema } from '../utils/validation.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const uniqueName = `pet-${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`
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

const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'El archivo es demasiado grande. Máximo 5MB'
      })
    }
    return res.status(400).json({
      error: `Error al subir archivo: ${err.message}`
    })
  } else if (err) {
    return res.status(400).json({
      error: err.message
    })
  }
  next()
}

router.get('/', authenticate, authorize('OWNER'), async (req, res) => {
  try {
    const pets = await Pet.find({
      ownerId: req.user._id,
      isActive: true
    }).sort({ createdAt: -1 })

    res.json({ pets })
  } catch (error) {
    console.error('Error obteniendo mascotas:', error)
    res.status(500).json({ error: 'Algo salió mal' })
  }
})

router.post('/', authenticate, authorize('OWNER'), upload.single('photo'), handleMulterError, validate(createPetSchema), async (req, res) => {
  try {
    const petData = {
      ...req.validatedData,
      ownerId: req.user._id
    }

    if (req.file) {
      petData.photoUrl = `/uploads/${req.file.filename}`
    }

    const pet = new Pet(petData)
    await pet.save()

    res.status(201).json({
      message: 'Mascota creada exitosamente',
      pet
    })
  } catch (error) {
    console.error('Error creando mascota:', error)
    res.status(500).json({ error: 'Error al procesar la solicitud' })
  }
})

router.get('/:id', authenticate, authorize('OWNER'), async (req, res) => {
  const { id } = req.params

  const pet = await Pet.findOne({
    _id: id,
    ownerId: req.user._id,
    isActive: true
  })

  if (!pet) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }

  res.json({ pet })
})

router.patch('/:id', authenticate, authorize('OWNER'), upload.single('photo'), handleMulterError, validate(updatePetSchema), async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.validatedData

    const pet = await Pet.findOne({
      _id: id,
      ownerId: req.user._id,
      isActive: true
    })

    if (!pet) {
      return res.status(404).json({ error: 'Mascota no encontrada' })
    }

    if (req.file) {
      updates.photoUrl = `/uploads/${req.file.filename}`
    }

    Object.assign(pet, updates)
    await pet.save()

    res.json({
      message: 'Mascota actualizada exitosamente',
      pet
    })
  } catch (error) {
    console.error('Error actualizando mascota:', error)
    res.status(500).json({ error: 'Error al actualizar' })
  }
})

router.delete('/:id', authenticate, authorize('OWNER'), async (req, res) => {
  const { id } = req.params

  const pet = await Pet.findOne({
    _id: id,
    ownerId: req.user._id,
    isActive: true
  })

  if (!pet) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }

  pet.isActive = false
  await pet.save()

  res.json({ message: 'Mascota eliminada exitosamente' })
})

router.post('/:id/photo', authenticate, authorize('OWNER'), upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' })
  }

  const { id } = req.params
  const pet = await Pet.findOne({
    _id: id,
    ownerId: req.user._id,
    isActive: true
  })

  if (!pet) {
    return res.status(404).json({ error: 'Mascota no encontrada' })
  }

  pet.photoUrl = `/uploads/${req.file.filename}`
  await pet.save()

  res.json({
    message: 'Foto subida exitosamente',
    photoUrl: pet.photoUrl
  })
})

export default router