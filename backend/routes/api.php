<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\PollController;
use App\Http\Controllers\VoteController;
use Illuminate\Support\Facades\Route;

// ---------- Rotas públicas ----------
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// ---------- Rotas protegidas (exigem token Sanctum) ----------
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);

    // Enquetes (CRUD RESTful)
    Route::apiResource('polls', PollController::class);

    // Votação
    Route::post('/polls/{poll}/votes', [VoteController::class, 'store']);
});