import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/auth'
import toast from 'react-hot-toast' /*Importa el toast para mostrar mensajes de éxito/error*/

const AuthContext = createContext()

const authReducer = (state, action) => {
  if (action.type === 'SET_LOADING') return { ...state, loading: action.payload } /*si el tipo es SET_LOADING, se actualiza el estado de loading*/
  if (action.type === 'SET_USER') return { ...state, user: action.payload, isAuthenticated: !!action.payload } /*si el tipo es SET_USER, se actualiza el estado de user*/
  if (action.type === 'SET_TOKENS') return { ...state, tokens: action.payload } /*si el tipo es SET_TOKENS, se actualiza el estado de tokens*/
  if (action.type === 'LOGOUT') return { ...state, user: null, isAuthenticated: false, tokens: null } /*si el tipo es LOGOUT, se actualiza el estado de user, isAuthenticated y tokens*/
  return state /*si el tipo no es ninguno de los anteriores, se retorna el estado actual*/
}

const initialState = {/*estado inicial*/
  user: null,
  isAuthenticated: false,
  tokens: null,
  loading: true
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState) /*se crea el estado y el dispatch para el reducer*/

  // Verificar si hay un usuario logueado al cargar la app buscando los tokens en el localStorage
  useEffect(() => {
    const initAuth = async () => {
      const accessToken = localStorage.getItem('accessToken')  
      const refreshToken = localStorage.getItem('refreshToken')

      if (accessToken && refreshToken) {
        try { /*si hay tokens, se obtiene el perfil del usuario*/
          const { user } = await authService.getProfile()
          dispatch({ type: 'SET_USER', payload: user }) /*asigna el usuario en el estado*/
          dispatch({ type: 'SET_TOKENS', payload: { accessToken, refreshToken } }) /*asigna los tokens en el estado*/
        } catch (error) {
          localStorage.removeItem('accessToken') /*elimina los tokens del localStorage*/
          localStorage.removeItem('refreshToken')
          dispatch({ type: 'LOGOUT' }) /*cierra la sesión*/
        }
      }
/*si no hay tokens, se cierra la sesión*/
      dispatch({ type: 'SET_LOADING', payload: false }) 
    }
/*se inicia la autenticación*/
    initAuth()
  }, [])

  const login = async (credentials, loginType = 'user') => { /*Función que maneja el proceso de login, login()*/
    try { /*se inicia el login*/
      dispatch({ type: 'SET_LOADING', payload: true })
      const { user, tokens } = await authService.login(credentials)
      
      // Si es login de admin, verificar que el usuario sea admin
      if (loginType === 'admin' && user.role !== 'ADMIN') {
        return { 
          success: false, 
          error: 'Acceso denegado. Solo administradores pueden acceder a esta área.',
          user: null
        }
      }
      
/*se guardan los tokens en el localStorage*/
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
/*se setea el usuario y los tokens en el estado*/
      dispatch({ type: 'SET_USER', payload: user })
      dispatch({ type: 'SET_TOKENS', payload: tokens })
/*se muestra un mensaje de bienvenida al usuario con dependencia de react-hot-toast*/
      toast.success(`¡Bienvenido, ${user.name}!`)
      return { success: true, user }
/*si hay un error, se muestra un mensaje de error*/
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error al iniciar sesión', user: null }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const register = async (userData) => { /*Función que maneja el proceso de registro, register()*/
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      const { user } = await authService.register(userData)
/*se muestra un mensaje de bienvenida al usuario con dependencia de react-hot-toast*/
      toast.success(
        `¡Bienvenido a MiPaseo, ${user.name}!\nPor favor, inicia sesión con tu email y contraseña.`,
        { duration: 10000 }
      )
/*se retorna el resultado del registro*/
      return { success: true }
    } catch (error) {
      return { success: false, error: error.response?.data?.error || 'Error al registrarse' }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const logout = async () => { /*Función que maneja el proceso de cerrar sesión, logout()*/
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await authService.logout(refreshToken)
      }
    } catch (error) {
      // Continuar con el logout aunque falle la llamada
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      
      dispatch({ type: 'LOGOUT' })
      toast.success('Sesión cerrada exitosamente')
    }
  }

  const updateUser = (userData) => {
    dispatch({ type: 'SET_USER', payload: userData })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }
  return context
}