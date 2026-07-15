import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function Home() {
  const [polls, setPolls] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('recent') // 'recent' | 'popular'

  // Debounce da busca: espera 400ms depois da ultima tecla antes de chamar a API.
  // Evita uma requisicao a cada caractere digitado.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1) // nova busca volta para a primeira pagina
    }, 400)

    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    setLoading(true)

    api
      .get('/polls', { params: { page, search: debouncedSearch, sort } })
      .then((response) => {
        setPolls(response.data.data)
        setLastPage(response.data.last_page)
      })
      .finally(() => setLoading(false))
  }, [page, debouncedSearch, sort])

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Enquetes públicas</h1>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Buscar enquetes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none sm:w-64"
            />

            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value)
                setPage(1)
              }}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="recent">Mais recentes</option>
              <option value="popular">Mais votadas</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-gray-500">Carregando enquetes...</p>}

        {!loading && polls.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow">
            <p className="text-gray-600">
              {debouncedSearch
                ? `Nenhuma enquete encontrada para "${debouncedSearch}".`
                : 'Nenhuma enquete ainda. Que tal criar a primeira?'}
            </p>
            {!debouncedSearch && (
              <Link
                to="/polls/create"
                className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
              >
                Criar enquete
              </Link>
            )}
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