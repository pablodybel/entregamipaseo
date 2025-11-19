import express from 'express'
import { User } from '../models/index.js'
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js'
import { validate, registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.post('/register', validate(registerSchema), async (req, res) => {
  try {
    const { password, ...userData } = req.validatedData

    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      return res.status(400).json({
        error: 'Ya existe un usuario con este email'
      })
    }

    const user = new User(userData)
    await user.hashPassword(password)
    await user.save()

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role)
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Error en registro:', error)
    res.status(500).json({ error: 'Error al registrar usuario' })
  }
})

router.post('/login', validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.validatedData

    const user = await User.findOne({ email, isActive: true })
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const isValidPassword = await user.verifyPassword(password)
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' })
    }

    const { accessToken, refreshToken } = generateTokenPair(user._id, user.role)
    user.refreshTokens = user.refreshTokens.slice(-4)
    user.refreshTokens.push({ token: refreshToken })
    await user.save()

    res.json({
      message: 'Login exitoso',
      user: user.getPublicProfile(),
      tokens: {
        accessToken,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ error: 'Error al iniciar sesión' })
  }
})

router.post('/refresh', validate(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.validatedData
    const decoded = verifyRefreshToken(refreshToken)

    const user = await User.findById(decoded.userId)
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    const tokenExists = user.refreshTokens.some(rt => rt.token === refreshToken)
    if (!tokenExists) {
      return res.status(401).json({ error: 'Refresh token inválido' })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(user._id, user.role)
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken)
    user.refreshTokens.push({ token: newRefreshToken })
    await user.save()

    res.json({
      tokens: {
        accessToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('Error en refresh:', error)
    res.status(401).json({ error: 'Refresh token inválido o expirado' })
  }
})

router.get('/me', authenticate, async (req, res) => {
  res.json({ user: req.user.getPublicProfile() })
})

router.post('/logout', authenticate, validate(refreshTokenSchema), async (req, res) => {
  try {
    const { refreshToken } = req.validatedData
    const user = await User.findById(req.user._id)

    if (user) {
      user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken)
      await user.save()
    }

    res.json({ message: 'Logout exitoso' })
  } catch (error) {
    console.error('Error en logout:', error)
    res.status(500).json({ error: 'Error al cerrar sesión' })
  }
})

export default router