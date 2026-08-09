import { createContext, useContext, useEffect, useState } from 'react'
import { authApi } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('mc_access_token')
    const userJson = localStorage.getItem('mc_user')
    if (token && userJson) {
      try {
        setUser(JSON.parse(userJson))
      } catch (e) {
        localStorage.removeItem('mc_user')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    const data = await authApi.login(email, password)
    if (!data) throw new Error('Invalid credentials')
    localStorage.setItem('mc_access_token', data.accessToken)
    localStorage.setItem('mc_refresh_token', data.refreshToken)
    localStorage.setItem('mc_user', JSON.stringify(data.user))
    setUser(data.user)
    return data.user
  }

  const logout = async () => {
    try { await authApi.logout() } catch {}
    localStorage.removeItem('mc_access_token')
    localStorage.removeItem('mc_refresh_token')
    localStorage.removeItem('mc_user')
    setUser(null)
  }

  const updateUser = (next) => {
    localStorage.setItem('mc_user', JSON.stringify(next))
    setUser(next)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
