import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import petRoutes from './routes/pets.js'
import walkRequestRoutes from './routes/walkRequests.js'
import reviewRoutes from './routes/reviews.js'
import adminRoutes from './routes/admin.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

// Crear carpeta uploads si no existe
const uploadsDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('📁 Carpeta uploads creada')
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}))
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Servir archivos estáticos (uploads) con CORS habilitado
app.use('/uploads', (req, res, next) => {
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
  res.setHeader('Access-Control-Allow-Origin', '*')
  next()
}, express.static(path.join(__dirname, '../uploads')))

// Rutas
app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/walkers', userRoutes) // Compartido con users
app.use('/api/v1/pets', petRoutes)
app.use('/api/v1/walk-requests', walkRequestRoutes)
app.use('/api/v1/reviews', reviewRoutes)
app.use('/api/v1/admin', adminRoutes)

// Ruta de health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Error de validación',
      details: Object.values(err.errors).map(e => e.message)
    })
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido'
    })
  }

  res.status(500).json({
    error: 'Error interno del servidor'
  })
})

// Conexión a MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('Conectado a MongoDB')
  } catch (error) {
    console.error('Error conectando a MongoDB:', error)
    process.exit(1)
  }
}

const PORT = process.env.PORT || 4000

// Iniciar servidor
const startServer = async () => {
  await connectDB()
  app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`)
  })
}

startServer()

export default app