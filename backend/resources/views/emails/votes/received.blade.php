<x-mail::message>
# Novo voto na sua enquete! 🗳️

Olá, {{ $poll->user->name }}!

Sua enquete **{{ $poll->title }}** acabou de receber um novo voto de **{{ $voter->name }}**.

<x-mail::button :url="config('app.frontend_url').'/polls/'.$poll->id">
Acompanhar resultados
</x-mail::button>

{{ config('app.name') }}
</x-mail::message>