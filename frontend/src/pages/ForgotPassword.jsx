import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSubmitting(true)

    try {
      const response = await api.post('/forgot-password', { email })
      setMessage(response.data.message)
    } catch (err) {
      setError(err.response?.data?.message || 'Algo deu errado. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <h1 className="mb-2 text-2xl font-bold text-gray-800">Recuperar senha</h1>
        <p className="mb-6 text-sm text-gray-500">
          Informe seu email e enviaremos um link para redefinir sua senha.
        </p>

        {message && (
          <div className="mb-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-600 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Enviando...' : 'Enviar link de recuperação'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Lembrou a senha?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}