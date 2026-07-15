<?php

namespace App\Http\Requests\Poll;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePollRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // qualquer usuário autenticado pode criar enquete
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'expires_at' => ['nullable', 'date', 'after:now'],
            'options' => ['required', 'array', 'min:2', 'max:8'], // exigência do edital
            'options.*' => ['required', 'string', 'max:255', 'distinct'],
        ];
    }

    /**
     * Mensagens customizadas para as regras mais importantes.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'options.min' => 'A enquete precisa de pelo menos 2 opções.',
            'options.max' => 'A enquete pode ter no máximo 8 opções.',
            'options.*.distinct' => 'As opções não podem se repetir.',
            'expires_at.after' => 'A data de expiração precisa ser no futuro.',
        ];
    }
}