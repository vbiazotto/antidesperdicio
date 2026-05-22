import { createContext, useContext, useState, useEffect } from 'react'
import { authService, usuarioService } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      usuarioService.me().then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, senha) => {
    const res = await authService.login(email, senha)
    localStorage.setItem('token', res.data.access_token)
    const me = await usuarioService.me()
    setUser(me.data)
    return me.data
  }

  const register = async (dados) => {
    await authService.register(dados)
    return login(dados.email, dados.senha)
  }

  const logout = () => { localStorage.removeItem('token'); setUser(null) }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
