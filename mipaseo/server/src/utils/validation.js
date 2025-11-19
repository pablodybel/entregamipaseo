import { z } from 'zod'
import { CABA_NEIGHBORHOODS } from './constants.js'

// Esquemas base reutilizables
export const mongoIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, 'ID de MongoDB inválido')

// Validaciones de autenticación
export const registerSchema = z.object({
  role: z.enum(['OWNER', 'WALKER']),
  name: z.string().min(2).max(100).trim(),
  email: z.string().email().toLowerCase(),
  phone: z.string().min(8).max(20).trim(),
  password: z.string().min(6).max(100),
  address: z.string().min(5).max(200).trim(),
  // Campos para WALKER
  experienceYears: z.number().min(0).max(50).optional(),
  bio: z.string().max(500).optional(),
  neighborhood: z.enum(CABA_NEIGHBORHOODS).optional()
}).refine((data) => {
  if (data.role === 'WALKER') {
    return data.experienceYears !== undefined &&
           data.bio !== undefined &&
           data.neighborhood !== undefined
  }
  return true
}, {
  message: 'Los paseadores deben incluir experienceYears, bio y neighborhood'
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
})

// Validaciones de usuarios
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  phone: z.string().min(8).max(20).trim().optional(),
  address: z.string().min(5).max(200).trim().optional(),
  experienceYears: z.number().min(0).max(50).optional(),
  bio: z.string().max(500).optional(),
  neighborhood: z.enum(CABA_NEIGHBORHOODS).optional(),
  availableHours: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).optional()
})

// Validaciones de mascotas
export const createPetSchema = z.object({
  name: z.string().min(1).max(50).trim(),
  breed: z.string().min(1).max(100).trim(),
  age: z.number().min(0).max(30),
  weightKg: z.number().min(0.1).max(100),
  routine: z.object({
    walkTimes: z.array(z.string()).optional(),
    feedingNotes: z.string().max(300).optional(),
    specialCare: z.string().max(300).optional()
  }).optional(),
  preferences: z.object({
    sociable: z.boolean().optional(),
    needsMuzzle: z.boolean().optional(),
    soloWalks: z.boolean().optional()
  }).optional()
})

export const updatePetSchema = createPetSchema.partial()

// Validaciones de solicitudes de paseo
export const createWalkRequestSchema = z.object({
  walkerId: mongoIdSchema,
  petId: mongoIdSchema,
  scheduledAt: z.string().datetime(),
  durationMin: z.number().min(15).max(180),
  notes: z.string().max(500).optional()
})

export const updateWalkRequestStatusSchema = z.object({
  walkerNotes: z.string().max(500).optional()
})

// Validaciones de reseñas
export const createReviewSchema = z.object({
  walkRequestId: mongoIdSchema,
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(500).trim()
})

// Validaciones de búsqueda
export const searchWalkersByNeighborhoodSchema = z.object({
  neighborhood: z.enum(CABA_NEIGHBORHOODS)
})

// Middleware de validación
export const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Parsear campos JSON que vienen de FormData
      const body = { ...req.body }
      
      // Convertir strings JSON a objetos
      Object.keys(body).forEach(key => {
        if (typeof body[key] === 'string') {
          try {
            // Intentar parsear como JSON
            const parsed = JSON.parse(body[key])
            if (typeof parsed === 'object') {
              body[key] = parsed
            }
          } catch (e) {
            // Si no es JSON válido, mantener el valor original
          }
        }
      })

      // Convertir números que vienen como strings
      if (body.age !== undefined) body.age = Number(body.age)
      if (body.weightKg !== undefined) body.weightKg = Number(body.weightKg)
      if (body.experienceYears !== undefined) body.experienceYears = Number(body.experienceYears)
      if (body.durationMin !== undefined) body.durationMin = Number(body.durationMin)
      if (body.rating !== undefined) body.rating = Number(body.rating)

      const result = schema.parse(body)
      req.validatedData = result
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Error de validación',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
      return res.status(500).json({
        error: 'Error interno del servidor en validación'
      })
    }
  }
}

// Middleware de validación para query params
export const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const result = schema.parse(req.query)
      req.validatedQuery = result
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Error de validación en query parameters',
          details: error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        })
      }
      next(error)
    }
  }
}