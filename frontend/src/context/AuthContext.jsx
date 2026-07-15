import { createContext, useContext, useEffect, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true) // true ate sabermos se ha sessao

  // Ao carregar a aplicacao (ou dar F5), verifica se o token salvo ainda vale.
  useEffect(() => {
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return
    }

    api
      .get('/me')
      .then((response) => setUser(response.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false))
  }, [])

  async function login(email, password) {
    const response = await api.post('/login', { email, password })

    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
  }

  async function register(name, email, password, passwordConfirmation) {
    const response = await api.post('/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })

    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
  }

  async function logout() {
    try {
      await api.post('/logout') // revoga o token no servidor
    } finally {
      // limpa a sessao local mesmo se a API falhar (ex: sem internet)
      localStorage.removeItem('token')
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook customizado: os componentes usam useAuth() em vez de useContext(AuthContext).
export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }

  return context
}