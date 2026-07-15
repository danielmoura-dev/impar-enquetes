<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Rate limit de votos: no maximo 10 tentativas por minuto por usuario.
        // Protege contra scripts automatizados martelando o endpoint.
        RateLimiter::for('votes', function (Request $request) {
            return Limit::perMinute(10)
                ->by($request->user()?->id ?: $request->ip())
                ->response(function () {
                    return response()->json([
                        'message' => 'Muitas tentativas de voto. Aguarde um minuto.',
                    ], 429);
                });
        });

        // Rate limit dos jobs de email: o plano gratuito do Mailtrap rejeita
        // rajadas de envio ("Too many emails per second"). Em vez de falhar,
        // o job (via RateLimited middleware nas Mailables) espera e tenta de novo.
        RateLimiter::for('mailtrap', function () {
            return Limit::perSecond(2);
        });

        // O link de reset de senha do email deve abrir a tela do FRONT (React),
        // que entao envia o token para a API.
        ResetPassword::createUrlUsing(function ($user, string $token) {
            return config('app.frontend_url')
                .'/reset-password?token='.$token
                .'&email='.urlencode($user->email);
        });
    }
}