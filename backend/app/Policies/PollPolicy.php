<?php

namespace App\Policies;

use App\Models\Poll;
use App\Models\User;

class PollPolicy
{
    /**
     * Apenas o criador pode editar a enquete.
     */
    public function update(User $user, Poll $poll): bool
    {
        return $poll->user_id === $user->id;
    }

    /**
     * Apenas o criador pode excluir a enquete.
     */
    public function delete(User $user, Poll $poll): bool
    {
        return $poll->user_id === $user->id;
    }
}