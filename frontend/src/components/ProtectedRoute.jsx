import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Ainda verificando a sessao (F5 com token salvo): nao decide nada ainda.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Carregando...</p>
      </div>
    )
  }

  // Sem sessao: manda para o login.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}