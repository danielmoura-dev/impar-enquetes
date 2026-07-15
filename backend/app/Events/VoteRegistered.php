<?php

namespace App\Events;

use App\Models\Poll;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class VoteRegistered implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Contagens já calculadas, prontas para o front substituir na tela.
     *
     * @var array<int, array{id: int, votes_count: int}>
     */
    public array $options;

    public int $totalVotes;

    /**
     * Create a new event instance.
     */
    public function __construct(public Poll $poll)
    {
        // Recalcula as contagens direto do banco no momento do voto.
        // O front nao precisa somar nada: apenas substitui os numeros.
        $this->options = $poll->options()
            ->withCount('votes')
            ->get(['id'])
            ->map(fn ($option) => [
                'id' => $option->id,
                'votes_count' => $option->votes_count,
            ])
            ->all();

        $this->totalVotes = $poll->votes()->count();
    }

    /**
     * Canal público da enquete: poll.{id}
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new Channel('poll.'.$this->poll->id),
        ];
    }

    /**
     * Nome do evento que o front vai escutar.
     */
    public function broadcastAs(): string
    {
        return 'vote.registered';
    }

    /**
     * Payload enviado pelo WebSocket (enxuto de propósito).
     *
     * @return array<string, mixed>
     */
    public function broadcastWith(): array
    {
        return [
            'poll_id' => $this->poll->id,
            'options' => $this->options,
            'total_votes' => $this->totalVotes,
        ];
    }
}