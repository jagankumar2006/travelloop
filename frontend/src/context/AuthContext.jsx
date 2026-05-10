import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('traveloop_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('traveloop_token')
    if (token) {
      authAPI.getMe()
        .then(res => setUser(res.data))
        .catch(() => { localStorage.removeItem('traveloop_token'); localStorage.removeItem('traveloop_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password })
    localStorage.setItem('traveloop_token', res.data.token)
    localStorage.setItem('traveloop_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const signup = async (formData) => {
    const res = await authAPI.signup(formData)
    localStorage.setItem('traveloop_token', res.data.token)
    localStorage.setItem('traveloop_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data
  }

  const logout = () => {
    localStorage.removeItem('traveloop_token')
    localStorage.removeItem('traveloop_user')
    setUser(null)
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('traveloop_user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
