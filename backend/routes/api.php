<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;

// ---------- Rotas públicas ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Recuperação de senha (públicas por natureza: o usuário esqueceu a senha!)
// throttle:5,1 = no maximo 5 requisicoes por minuto (protege contra abuso)
Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])
    ->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware('throttle:5,1');

// ---------- Rotas protegidas (exigem token Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Enquetes (CRUD RESTful)
    Route::apiResource('polls', PollController::class);

    // Votação (com rate limiting: 10/min por usuário)
    Route::post('/polls/{poll}/votes', [VoteController::class, 'store'])
        ->middleware('throttle:votes');
});