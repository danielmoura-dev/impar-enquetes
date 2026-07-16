import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import api from '../api/axios'
import AuthCard from '../components/AuthCard'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // token e email vem na URL do link enviado por email
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await api.post('/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })

      // Sucesso: leva ao login para entrar com a nova senha
      navigate('/login')
    } catch (err) {
      const data = err.response?.data
      setError(
        data?.errors?.password?.[0] ||
          data?.message ||
          'Não foi possível redefinir a senha.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <AuthCard>
        <p className="text-center text-slate-700">Link de recuperação inválido.</p>
        <Link
          to="/forgot-password"
          className="mt-2 block text-center text-sm font-medium text-brand-600 hover:underline"
        >
          Solicitar um novo link
        </Link>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <h1 className="mb-1 text-2xl font-bold text-slate-800">Nova senha</h1>
      <p className="mb-6 text-sm text-slate-500">
        Defina a nova senha para <strong>{email}</strong>
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Nova senha
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Confirmar nova senha
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
          {submitting ? 'Salvando...' : 'Redefinir senha'}
        </button>
      </form>
    </AuthCard>
  )
}
