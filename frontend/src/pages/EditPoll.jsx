import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { toDatetimeLocalValue, toUtcIso } from '../utils/datetime'

export default function EditPoll() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    api
      .get(`/polls/${id}`)
      .then((response) => {
        const { poll, is_owner } = response.data

        // Protecao extra no front: se nao for o dono, nem mostra o formulario.
        // (A protecao REAL e a Policy no back — isso aqui e so UX.)
        if (!is_owner) {
          navigate(`/polls/${id}`)
          return
        }

        setTitle(poll.title)
        setDescription(poll.description || '')
        setExpiresAt(toDatetimeLocalValue(poll.expires_at))
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setSubmitting(true)

    try {
      await api.put(`/polls/${id}`, {
        title,
        description: description || null,
        expires_at: toUtcIso(expiresAt),
      })

      navigate(`/polls/${id}`)
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ geral: ['Não foi possível salvar as alterações.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (field) => errors[field]?.[0]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />
        <p className="p-8 text-center text-slate-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to={`/polls/${id}`} className="text-sm text-brand-600 hover:underline">
          ← Voltar para a enquete
        </Link>

        <h1 className="mt-3 mb-6 text-2xl font-bold text-slate-800">Editar enquete</h1>

        {fieldError('geral') && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {fieldError('geral')}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6"
        >
          <div>
            <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-700">
              Título *
            </label>
            <input
              id="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
            {fieldError('title') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('title')}</p>
            )}
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700">
              Descrição (opcional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="expires_at" className="mb-1 block text-sm font-medium text-slate-700">
              Expira em (opcional)
            </label>
            <input
              id="expires_at"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
            />
            {fieldError('expires_at') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('expires_at')}</p>
            )}
          </div>

          <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
            As opções de resposta não podem ser alteradas após a criação, para
            preservar a integridade dos votos já registrados.
          </p>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </main>
    </div>
  )
}
