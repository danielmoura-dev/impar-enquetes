<x-mail::message>
# Voto registrado! ✅

Olá!

Seu voto na enquete **{{ $poll->title }}** foi registrado com sucesso.

**Sua escolha:** {{ $option->text }}

<x-mail::button :url="config('app.frontend_url').'/polls/'.$poll->id">
Ver resultados em tempo real
</x-mail::button>

Obrigado por participar!<br>
{{ config('app.name') }}
</x-mail::message>