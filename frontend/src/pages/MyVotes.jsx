import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function MyVotes() {
  const [polls, setPolls] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)

    api
      .get('/my-votes', { params: { page } })
      .then((response) => {
        setPolls(response.data.data)
        setLastPage(response.data.last_page)
      })
      .finally(() => setLoading(false))
  }, [page])

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-slate-800">Meus votos</h1>

        {loading && <p className="text-slate-500">Carregando...</p>}

        {!loading && polls.length === 0 && (
          <div className="rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-slate-600">Você ainda não votou em nenhuma enquete.</p>
            <Link
              to="/"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700"
            >
              Explorar enquetes
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {polls.map((poll) => {
            // O back trouxe apenas o voto deste usuario no array 'votes'
            const myVote = poll.votes?.[0]

            return (
              <Link
                key={poll.id}
                to={`/polls/${poll.id}`}
                className="group rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <h2 className="mb-1 font-semibold text-slate-800 group-hover:text-brand-700">
                  {poll.title}
                </h2>

                {myVote?.option && (
                  <p className="mb-2 text-sm text-accent-700">
                    Você votou em: <strong>{myVote.option.text}</strong>
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>por {poll.user?.name}</span>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">
                    {poll.votes_count} {poll.votes_count === 1 ? 'voto' : 'votos'}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>

        {lastPage > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => setPage((p) => p - 1)}
              disabled={page === 1}
              className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200 disabled:opacity-40"
            >
              Anterior
            </button>
            <span className="text-sm text-slate-600">
              Página {page} de {lastPage}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === lastPage}
              className="rounded-lg bg-white px-4 py-2 text-sm shadow-sm ring-1 ring-slate-200 disabled:opacity-40"
            >
              Próxima
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
