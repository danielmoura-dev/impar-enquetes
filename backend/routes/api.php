<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\PasswordResetController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;

// ---------- Rotas públicas ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink'])
    ->middleware('throttle:5,1');
Route::post('/reset-password', [PasswordResetController::class, 'reset'])
    ->middleware('throttle:5,1');

// Visualização de enquetes é PÚBLICA (edital: "listar todas as enquetes públicas").
// Criar, editar, excluir e votar continuam protegidos.
Route::get('/polls', [PollController::class, 'index']);
Route::get('/polls/{poll}', [PollController::class, 'show']);

// ---------- Rotas protegidas (exigem token Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Histórico de votos do usuário logado
    Route::get('/my-votes', [PollController::class, 'myVotes']);

    // Enquetes: apenas as acoes de escrita
    Route::apiResource('polls', PollController::class)->only(['store', 'update', 'destroy']);

    // Votação (com rate limiting)
    Route::post('/polls/{poll}/votes', [VoteController::class, 'store'])
        ->middleware('throttle:votes');
});