import axios from 'axios'

// Instancia unica do Axios para toda a aplicacao.
// baseURL vem do .env: em producao, so trocar a variavel.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    Accept: 'application/json',
  },
})

// Interceptor de REQUEST: anexa o token Bearer automaticamente
// em toda chamada, se o usuario estiver logado.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Interceptor de RESPONSE: se a API responder 401 (token invalido/expirado),
// limpa a sessao local e manda o usuario para o login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')

      // evita loop de redirecionamento se ja estiver no login
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

export default api