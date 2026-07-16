import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  // Ainda verificando a sessao (F5 com token salvo): nao decide nada ainda.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    )
  }

  // Sem sessao: manda para o login.
  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}