import { verifyAccessToken } from '../utils/jwt.js'
import { User } from '../models/index.js'

export const authenticate = async (req, res, next) => { /*Middleware para ver si el usuario tiene el token*/
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token de acceso requerido'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyAccessToken(token)

    const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens')

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Usuario no encontrado o inactivo'
      })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido o expirado'
    })
  }
}

export const authorize = (...roles) => { /*si tioene el rol? */
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Autenticación requerida'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'No tienes permisos para realizar esta acción'
      })
    }

    next()
  }
}

export const optionalAuth = async (req, res, next) => { /* si no lo tiene continua sin usuario autenticado*/
  try {
    const authHeader = req.headers.authorization

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const decoded = verifyAccessToken(token)
      const user = await User.findById(decoded.userId).select('-passwordHash -refreshTokens')

      if (user && user.isActive) {
        req.user = user
      }
    }

    next()
  } catch (error) {
    // Continúa sin usuario autenticado
    next()
  }
}