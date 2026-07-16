import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  return (
    <nav className="bg-white shadow">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-lg font-bold text-blue-600">
          Impar Enquetes
        </Link>

        {user ? (
          // ---------- Usuário logado ----------
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/my-votes"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Meus votos
            </Link>

            <Link
              to="/polls/create"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              + Nova
            </Link>

            <span className="hidden text-sm text-gray-600 md:block">
              Olá, {user.name}
            </span>

            <button
              onClick={handleLogout}
              className="text-sm font-medium text-red-600 hover:underline"
            >
              Sair
            </button>
          </div>
        ) : (
          // ---------- Visitante ----------
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-600 hover:text-blue-600"
            >
              Entrar
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Criar conta
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}