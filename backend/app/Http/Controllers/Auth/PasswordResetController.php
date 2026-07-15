<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class PasswordResetController extends Controller
{
    /**
     * Envia o email com o link de recuperação de senha.
     */
    public function sendResetLink(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        Password::sendResetLink($request->only('email'));

        // Resposta SEMPRE igual, exista o email ou nao:
        // nao confirmamos a um atacante quais emails estao cadastrados.
        return response()->json([
            'message' => 'Se este email estiver cadastrado, você receberá um link de recuperação.',
        ]);
    }

    /**
     * Redefine a senha usando o token recebido por email.
     */
    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();

                // Seguranca: revoga TODOS os tokens de acesso antigos.
                // Se a senha foi trocada porque a conta foi comprometida,
                // o invasor perde o acesso imediatamente.
                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Este link de recuperação é inválido ou expirou.',
            ], 422);
        }

        return response()->json([
            'message' => 'Senha redefinida com sucesso! Faça login com a nova senha.',
        ]);
    }
}