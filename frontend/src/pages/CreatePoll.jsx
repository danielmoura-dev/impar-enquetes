import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import { toUtcIso } from '../utils/datetime'

const MIN_OPTIONS = 2
const MAX_OPTIONS = 8

export default function CreatePoll() {
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [options, setOptions] = useState(['', '']) // comeca com o minimo do edital
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function updateOption(index, value) {
    setOptions((current) => current.map((opt, i) => (i === index ? value : opt)))
  }

  function addOption() {
    if (options.length < MAX_OPTIONS) {
      setOptions((current) => [...current, ''])
    }
  }

  function removeOption(index) {
    if (options.length > MIN_OPTIONS) {
      setOptions((current) => current.filter((_, i) => i !== index))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setSubmitting(true)

    try {
      const payload = {
        title,
        description: description || null,
        expires_at: toUtcIso(expiresAt),
        options,
      }

      const response = await api.post('/polls', payload)
      navigate(`/polls/${response.data.id}`) // vai direto para a enquete criada
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors || {})
      } else {
        setErrors({ geral: ['Não foi possível criar a enquete.'] })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fieldError = (field) => errors[field]?.[0]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Nova enquete</h1>

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

          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">
              Opções * ({MIN_OPTIONS} a {MAX_OPTIONS})
            </span>

            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={`Opção ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 focus:outline-none"
                  />
                  {options.length > MIN_OPTIONS && (
                    <button
                      type="button"
                      onClick={() => removeOption(index)}
                      className="shrink-0 rounded-lg bg-red-50 px-3 text-red-600 hover:bg-red-100"
                      title="Remover opção"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {fieldError('options') && (
              <p className="mt-1 text-sm text-red-600">{fieldError('options')}</p>
            )}

            {options.length < MAX_OPTIONS && (
              <button
                type="button"
                onClick={addOption}
                className="mt-2 text-sm font-medium text-brand-600 hover:underline"
              >
                + Adicionar opção
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Criando...' : 'Criar enquete'}
          </button>
        </form>
      </main>
    </div>
  )
}
