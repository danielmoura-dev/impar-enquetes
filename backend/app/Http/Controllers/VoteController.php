<?php

namespace App\Http\Controllers;

use App\Events\VoteRegistered;
use App\Mail\VoteConfirmationMail;
use App\Mail\VoteReceivedMail;
use App\Models\Poll;
use App\Models\PollOption;
use App\Models\Vote;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class VoteController extends Controller
{
    /**
     * Registra um voto na enquete.
     */
    public function store(Request $request, Poll $poll): JsonResponse
    {
        $validated = $request->validate([
            'poll_option_id' => ['required', 'integer'],
        ]);

        // Regra 1: enquete expirada nao aceita votos
        if ($poll->isExpired()) {
            return response()->json([
                'message' => 'Esta enquete já foi encerrada.',
            ], 422);
        }

        // Regra 2: o dono nao vota na propria enquete
        if ($poll->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'Você não pode votar na sua própria enquete.',
            ], 403);
        }

        // Regra 3: a opcao precisa pertencer A ESTA enquete (protecao IDOR)
        $option = $poll->options()->find($validated['poll_option_id']);

        if (! $option) {
            return response()->json([
                'message' => 'Opção inválida para esta enquete.',
            ], 422);
        }

        // Regra 4 (camada 1): verificacao amigavel de voto duplicado
        $alreadyVoted = $poll->votes()
            ->where('user_id', $request->user()->id)
            ->exists();

        if ($alreadyVoted) {
            return response()->json([
                'message' => 'Você já votou nesta enquete.',
            ], 409);
        }

        // Regra 4 (camada 2): a constraint UNIQUE cobre a condicao de corrida
        try {
            $vote = Vote::create([
                'user_id' => $request->user()->id,
                'poll_id' => $poll->id,
                'poll_option_id' => $option->id,
            ]);
        } catch (UniqueConstraintViolationException) {
            return response()->json([
                'message' => 'Você já votou nesta enquete.',
            ], 409);
        }

        // Real-time: transmite as novas contagens para quem esta vendo a enquete
        VoteRegistered::dispatch($poll);

        // Emails (processados em fila para nao atrasar a resposta):
        // 1. Confirmacao para quem votou
        Mail::to($request->user())->queue(
            new VoteConfirmationMail($poll, $option)
        );

        // 2. Aviso para o dono da enquete
        Mail::to($poll->user)->queue(
            new VoteReceivedMail($poll, $request->user())
        );

        return response()->json([
            'message' => 'Voto registrado com sucesso!',
            'vote' => $vote,
        ], 201);
    }
}