import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthCard from '../components/AuthCard'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setSubmitting(true)

    try {
      await register(name, email, password, passwordConfirmation)
      navigate('/')
    } catch (err) {
      // 422 do Laravel: errors = { campo: [mensagens] }
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ geral: ['Não foi possível cadastrar. Tente novamente.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  // Helper: pega a primeira mensagem de erro de um campo
  const fieldError = (field) => errors[field]?.[0]

  return (
    <AuthCard>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Criar conta</h1>
      <p className="mb-6 text-sm text-slate-500">Cadastre-se para participar das enquetes</p>

      {fieldError('geral') && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {fieldError('geral')}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
            Nome
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          {fieldError('name') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('name')}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          {fieldError('email') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('email')}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
          {fieldError('password') && (
            <p className="mt-1 text-sm text-red-600">{fieldError('password')}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirmar senha
          </label>
          <input
            id="password_confirmation"
            type="password"
            required
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
        >
          {submitting ? 'Cadastrando...' : 'Cadastrar'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthCard>
  )
}
