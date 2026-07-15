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
     * Lista todas as enquetes públicas (paginadas, mais recentes primeiro).
     */
    public function index(Request $request): JsonResponse
    {
        $polls = Poll::query()
            ->with('user:id,name')        // dono da enquete (so id e nome, sem dados sensiveis)
            ->withCount('votes')          // total de votos, calculado pelo banco
            ->latest()                    // mais recentes primeiro
            ->paginate(9);                // 9 por pagina (grade 3x3 no front)

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
     * Detalhes de uma enquete, com contagem de votos por opção
     * e qual opção o usuário logado votou (se votou).
     */
    public function show(Request $request, Poll $poll): JsonResponse
    {
        $poll->load(['user:id,name', 'options' => fn ($q) => $q->withCount('votes')]);
        $poll->loadCount('votes');

        $userVote = $poll->votes()
            ->where('user_id', $request->user()->id)
            ->first();

        return response()->json([
            'poll' => $poll,
            'user_vote_option_id' => $userVote?->poll_option_id,
            'is_expired' => $poll->isExpired(),
            'is_owner' => $poll->user_id === $request->user()->id,
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
}