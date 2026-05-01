import { createContext, useContext, useReducer, useEffect } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true
}

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      }
    case 'LOGOUT':
      return { ...initialState, loading: false }
    case 'LOADED':
      return { ...state, loading: false }
    default:
      return state
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load token from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user = localStorage.getItem('user')
    if (token && user) {
      try {
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user: JSON.parse(user) }
        })
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch({ type: 'LOADED' })
      }
    } else {
      dispatch({ type: 'LOADED' })
    }
  }, [])

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } })
    return user
  }

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password })
    const { token, user } = res.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    dispatch({ type: 'LOGIN_SUCCESS', payload: { token, user } })
    return user
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    dispatch({ type: 'LOGOUT' })
  }

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
