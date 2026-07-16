import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import api from '../api/axios'
import echo from '../api/echo'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

export default function PollDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [poll, setPoll] = useState(null)
  const [userVoteOptionId, setUserVoteOptionId] = useState(null)
  const [isExpired, setIsExpired] = useState(false)
  const [isOwner, setIsOwner] = useState(false)
  const [totalVotes, setTotalVotes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [voting, setVoting] = useState(false)
  const [feedback, setFeedback] = useState('')

  // Carrega a enquete
  useEffect(() => {
    api
      .get(`/polls/${id}`)
      .then((response) => {
        setPoll(response.data.poll)
        setUserVoteOptionId(response.data.user_vote_option_id)
        setIsExpired(response.data.is_expired)
        setIsOwner(response.data.is_owner)
        setTotalVotes(response.data.poll.votes_count)
      })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  // Tempo real: escuta o canal da enquete enquanto a tela estiver aberta
  useEffect(() => {
    const channel = echo.channel(`poll.${id}`)

    // O "." antes do nome e obrigatorio: indica que usamos broadcastAs()
    // no evento do Laravel (nome customizado, sem o namespace da classe).
    channel.listen('.vote.registered', (event) => {
      setTotalVotes(event.total_votes)

      setPoll((current) => {
        if (!current) return current

        return {
          ...current,
          options: current.options.map((option) => {
            const updated = event.options.find((o) => o.id === option.id)
            return updated
              ? { ...option, votes_count: updated.votes_count }
              : option
          }),
        }
      })
    })

    // Cleanup: ao sair da tela, desinscreve do canal
    // (evita listeners duplicados e vazamento de memoria)
    return () => {
      echo.leave(`poll.${id}`)
    }
  }, [id])

  async function handleVote(optionId) {
    // Visitante: convida a entrar (leva junto a intencao de voltar aqui)
    if (!user) {
      navigate('/login')
      return
    }

    setVoting(true)
    setFeedback('')

    try {
      await api.post(`/polls/${id}/votes`, { poll_option_id: optionId })
      setUserVoteOptionId(optionId)
      // Nao atualizamos as contagens aqui: o evento do WebSocket faz isso.
      // Uma unica fonte de verdade evita contagem dupla na tela.
    } catch (err) {
      setFeedback(err.response?.data?.message || 'Não foi possível votar.')
    } finally {
      setVoting(false)
    }
  }

  async function handleShare() {
    const url = window.location.href

    try {
      // API nativa de compartilhamento (mobile). Se nao existir, cai no catch.
      if (navigator.share) {
        await navigator.share({ title: poll.title, url })
      } else {
        await navigator.clipboard.writeText(url)
        setFeedback('Link copiado para a área de transferência!')
      }
    } catch {
      // usuario cancelou o compartilhamento — silencioso
    }
  }

  async function handleDelete() {
    if (!window.confirm('Excluir esta enquete? Essa ação não tem volta.')) return

    await api.delete(`/polls/${id}`)
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <p className="p-8 text-center text-gray-500">Carregando...</p>
      </div>
    )
  }

  const hasVoted = userVoteOptionId !== null
  const showResults = hasVoted || isOwner || isExpired
  const chartData = poll.options.map((option) => ({
    name: option.text,
    votos: option.votes_count,
  }))

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-8">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← Voltar
        </Link>

        <div className="mt-3 rounded-xl bg-white p-6 shadow">
          <div className="mb-1 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-gray-800">{poll.title}</h1>

            {isOwner && (
              <div className="flex shrink-0 gap-2">
                <Link
                  to={`/polls/${id}/edit`}
                  className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Excluir
                </button>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-400">
            por {poll.user?.name}
            {poll.expires_at && (
              <>
                {' · '}
                {isExpired ? 'encerrada em ' : 'expira em '}
                {new Date(poll.expires_at).toLocaleString('pt-BR')}
              </>
            )}
          </p>

          <button
            onClick={handleShare}
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            🔗 Compartilhar
          </button>

          {poll.description && (
            <p className="mt-3 text-gray-600">{poll.description}</p>
          )}

          {isExpired && (
            <div className="mt-4 rounded-lg bg-yellow-50 p-3 text-sm text-yellow-800">
              Esta enquete está encerrada. Confira os resultados finais abaixo.
            </div>
          )}

          {feedback && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {feedback}
            </div>
          )}

          {/* ---------- MODO VOTACAO ---------- */}
          {!showResults && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700">Escolha uma opção:</p>

              {poll.options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={voting}
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-left transition hover:border-blue-500 hover:bg-blue-50 disabled:opacity-50"
                >
                  {option.text}
                </button>
              ))}
            </div>
          )}

          {/* ---------- MODO RESULTADOS (tempo real) ---------- */}
          {showResults && (
            <div className="mt-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-gray-700">Resultados</p>
                <span className="flex items-center gap-1.5 text-xs text-gray-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500"></span>
                  </span>
                  ao vivo · {totalVotes} {totalVotes === 1 ? 'voto' : 'votos'}
                </span>
              </div>

              {/* Barras de progresso (diferencial de UX do edital) */}
              <div className="space-y-3">
                {poll.options.map((option) => {
                  const percent =
                    totalVotes > 0
                      ? Math.round((option.votes_count / totalVotes) * 100)
                      : 0
                  const isUserChoice = option.id === userVoteOptionId

                  return (
                    <div key={option.id}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className={isUserChoice ? 'font-semibold text-blue-700' : 'text-gray-700'}>
                          {option.text} {isUserChoice && '· seu voto'}
                        </span>
                        <span className="text-gray-500">
                          {percent}% ({option.votes_count})
                        </span>
                      </div>
                      <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isUserChoice ? 'bg-blue-600' : 'bg-blue-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Grafico (diferencial de UX do edital) */}
              {totalVotes > 0 && (
                <div className="mt-8 h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="votos" fill="#2563eb" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}