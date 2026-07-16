<?php

namespace App\Mail;

use App\Models\Poll;
use App\Models\PollOption;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\Middleware\RateLimited;
use Illuminate\Queue\SerializesModels;

class VoteConfirmationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    /**
     * Numero de tentativas antes de marcar o job como falho.
     */
    public int $tries = 3;

    /**
     * Segundos de espera entre as tentativas (backoff progressivo).
     *
     * @var array<int, int>
     */
    public array $backoff = [3, 10];

    /**
     * Get the middleware the job should pass through.
     *
     * @return array<int, object>
     */
    public function middleware(): array
    {
        return [new RateLimited('mail')];
    }

    /**
     * Create a new message instance.
     */
    public function __construct(
        public Poll $poll,
        public PollOption $option,
    ) {}

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Seu voto foi registrado — '.$this->poll->title,
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            markdown: 'emails.votes.confirmation',
        );
    }
}