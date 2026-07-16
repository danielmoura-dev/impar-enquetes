<?php

namespace App\Http\Controllers;

use App\Http\Requests\Poll\StorePollRequest;
use App\Http\Requests\Poll\UpdatePollRequest;
use App\Models\Poll;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class PollController extends Controller
{
    /**
     * Lista enquetes públicas com busca, ordenação e paginação.
     *
     * Query params aceitos:
     *  - search: filtra por título ou descrição
     *  - sort: 'recent' (padrão) ou 'popular' (mais votadas)
     */
    public function index(Request $request): JsonResponse
    {
        $polls = Poll::query()
            ->with('user:id,name')
            ->withCount('votes')
            // Busca: aplicada somente se o parametro 'search' vier preenchido.
            ->when($request->filled('search'), function ($query) use ($request) {
                $term = $request->string('search');

                $query->where(function ($q) use ($term) {
                    $q->where('title', 'like', "%{$term}%")
                      ->orWhere('description', 'like', "%{$term}%");
                });
            })
            // Ordenacao: 'popular' ordena por votos; padrao e mais recentes.
            ->when($request->input('sort') === 'popular', function ($query) {
                $query->orderByDesc('votes_count');
            }, function ($query) {
                $query->latest();
            })
            ->paginate(9)
            ->withQueryString(); // mantem search/sort nos links de paginacao

        return response()->json($polls);
    }

    /**
     * Cria uma enquete com suas opções (transação: tudo ou nada).
     */
    public function store(StorePollRequest $request): JsonResponse
    {
        $poll = DB::transaction(function () use ($request) {
            $poll = $request->user()->polls()->create([
                'title' => $request->title,
                'description' => $request->description,
                'expires_at' => $request->expires_at,
            ]);

            foreach ($request->options as $text) {
                $poll->options()->create(['text' => $text]);
            }

            return $poll;
        });

        return response()->json($poll->load('options'), 201);
    }

    /**
     * Detalhes de uma enquete (rota pública).
     * Se um token válido for enviado, personaliza a resposta
     * (voto do usuário, se é o dono). Visitantes veem dados neutros.
     */
    public function show(Request $request, Poll $poll): JsonResponse
    {
        $poll->load(['user:id,name', 'options' => fn ($q) => $q->withCount('votes')]);
        $poll->loadCount('votes');

        // Em rota publica, user('sanctum') resolve o usuario SE um token
        // valido vier no header — sem exigir autenticacao (retorna null se nao).
        $user = $request->user('sanctum');

        $userVote = $user
            ? $poll->votes()->where('user_id', $user->id)->first()
            : null;

        return response()->json([
            'poll' => $poll,
            'user_vote_option_id' => $userVote?->poll_option_id,
            'is_expired' => $poll->isExpired(),
            'is_owner' => $user !== null && $poll->user_id === $user->id,
        ]);
    }

    /**
     * Atualiza título, descrição e expiração (apenas o dono).
     * Opções não são editáveis para preservar a integridade dos votos.
     */
    public function update(UpdatePollRequest $request, Poll $poll): JsonResponse
    {
        Gate::authorize('update', $poll); // PollPolicy: 403 se nao for o dono

        $poll->update($request->validated());

        return response()->json($poll->load('options'));
    }

    /**
     * Exclui a enquete (apenas o dono). Opções e votos caem em cascata (FK).
     */
    public function destroy(Poll $poll): JsonResponse
    {
        Gate::authorize('delete', $poll);

        $poll->delete();

        return response()->json(['message' => 'Enquete excluída com sucesso.']);
    }

    /**
     * Lista as enquetes em que o usuário autenticado votou,
     * com a opção que ele escolheu em cada uma.
     */
    public function myVotes(Request $request): JsonResponse
    {
        $polls = Poll::query()
            ->with('user:id,name')
            ->withCount('votes')
            // Traz junto o voto DESTE usuario (para mostrar o que ele escolheu)
            ->with(['votes' => function ($query) use ($request) {
                $query->where('user_id', $request->user()->id)
                      ->with('option:id,text');
            }])
            // Apenas enquetes onde existe voto deste usuario
            ->whereHas('votes', function ($query) use ($request) {
                $query->where('user_id', $request->user()->id);
            })
            ->latest()
            ->paginate(9)
            ->withQueryString();

        return response()->json($polls);
    }
}