import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    api
      .get('/polls', { params: { page } })
      .then((response) => {
        setPolls(response.data.data)
        setLastPage(response.data.last_page)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Enquetes públicas</h1>

        {loading && <p className="text-gray-500">Carregando enquetes...</p>}

        {!loading && polls.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              Nenhuma enquete ainda. Que tal criar a primeira?
            </p>
            <Link
              to="/polls/create"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
            >
              Criar enquete
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {polls.map((poll) => (
            <Link
              key={poll.id}
              to={`/polls/${poll.id}`}
              className="rounded-xl bg-white p-5 shadow transition hover:shadow-md"
            >
              <h2 className="mb-1 font-semibold text-gray-800">{poll.title}</h2>

              {poll.description && (
                <p className="mb-3 line-clamp-2 text-sm text-gray-500">
                  {poll.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>por {poll.user?.name}</span>
                <span>
                  {poll.votes_count} {poll.votes_count === 1 ? 'voto' : 'votos'}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {lastPage > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="rounded-lg bg-white px-4 py-2 text-sm shadow disabled:opacity-40"
            >
              Anterior
            </button>

            <span className="text-sm text-gray-600">
              Página {page} de {lastPage}
            </span>

            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === lastPage}
              className="rounded-lg bg-white px-4 py-2 text-sm shadow disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  )
}