import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import logoIcon from '../assets/logo-icon.png'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-2 text-lg font-bold text-slate-800"
        >
          <img src={logoIcon} alt="" className="h-8 w-8 rounded-md" />
          Impar <span className="text-brand-600">Enquetes</span>
        </Link>

        {/* ---------- Links (desktop) ---------- */}
        <div className="hidden items-center gap-4 sm:flex sm:gap-5">
          {user ? (
            <>
              <Link
                to="/my-votes"
                className="text-sm font-medium text-slate-600 transition hover:text-brand-600"
              >
                Meus votos
              </Link>
              <Link
                to="/polls/create"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                + Nova enquete
              </Link>
              <span className="hidden text-sm text-slate-500 md:block">Olá, {user.name}</span>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-slate-500 transition hover:text-red-600"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-slate-600 transition hover:text-brand-600"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-700"
              >
                Criar conta
              </Link>
            </>
          )}
        </div>

        {/* ---------- Botão hamburguer (mobile) ---------- */}
        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 sm:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ---------- Menu (mobile) ---------- */}
      {menuOpen && (
        <div className="border-t border-slate-200 px-4 py-3 sm:hidden">
          <div className="flex flex-col gap-1">
            {user ? (
              <>
                <span className="px-2 py-1 text-sm text-slate-500">Olá, {user.name}</span>
                <Link
                  to="/my-votes"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Meus votos
                </Link>
                <Link
                  to="/polls/create"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  + Nova enquete
                </Link>
                <button
                  onClick={handleLogout}
                  className="mt-1 rounded-lg px-2 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-2 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Entrar
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                >
                  Criar conta
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
