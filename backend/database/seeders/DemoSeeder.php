<?php

namespace Database\Seeders;

use App\Models\Poll;
use App\Models\User;
use App\Models\Vote;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class DemoSeeder extends Seeder
{
    /**
     * Popula o ambiente de demonstração com usuários, enquetes
     * bem-humoradas e votos distribuídos.
     *
     * Execução: php artisan db:seed --class=DemoSeeder
     */
    public function run(): void
    {
        // ---------- 10 usuários ----------
        $names = [
            'Neymar Jr',
            'Ronaldinho Gaúcho',
            'Michael Jackson',
            'Renan Almeida',
            'Luva de Pedreiro',
            'Casimiro Miguel',
            'Faustão',
            'Silvio Santos',
            'Gretchen',
            'Ratinho',
        ];

        $users = collect($names)->map(function (string $name) {
            $email = str_replace(' ', '.', strtolower(
                iconv('UTF-8', 'ASCII//TRANSLIT', $name)
            )) . '@demo.com';

            return User::firstOrCreate(
                ['email' => $email],
                ['name' => $name, 'password' => 'senha12345'] // cast 'hashed' aplica bcrypt
            );
        });

        // ---------- 10 enquetes ----------
        $polls = [
            [
                'title' => 'Tabs ou espaços?',
                'description' => 'A guerra que já acabou casamentos e dividiu equipes inteiras.',
                'options' => ['Tabs, obviamente', 'Espaços (2)', 'Espaços (4)', 'Aperto Tab e o editor decide'],
            ],
            [
                'title' => 'O código não funciona. Qual sua primeira reação?',
                'description' => 'Seja honesto. Ninguém está julgando (estamos).',
                'options' => ['Culpar o cache', 'Culpar o estagiário', '"Na minha máquina funciona"', 'git blame em silêncio', 'Reiniciar e rezar'],
            ],
            [
                'title' => 'Qual o melhor horário para deploy em produção?',
                'description' => 'Pergunta com apenas uma resposta errada.',
                'options' => ['Segunda de manhã', 'Sexta 17h58', 'Terça, com calma e rollback pronto', 'Deploy é sempre agora'],
            ],
            [
                'title' => 'Dark mode ou light mode?',
                'description' => 'Sabemos que você tem opinião forte sobre isso.',
                'options' => ['Dark, sempre', 'Light (aceito julgamentos)', 'Automático com o sistema', 'Terminal verde estilo Matrix'],
            ],
            [
                'title' => 'Quantas abas do navegador você tem abertas agora?',
                'description' => 'A memória RAM que lute.',
                'options' => ['Menos de 10 (mentira)', '10 a 30', '30 a 100', 'O contador virou um :D'],
            ],
            [
                'title' => 'Melhor nome de variável já visto em produção',
                'description' => 'Casos reais. Os nomes foram mantidos para constranger os culpados.',
                'options' => ['$coisa', '$data2_final_AGORA_VAI', '$x', '$gambiarra (ao menos é honesto)'],
            ],
            [
                'title' => 'CSS: como você centraliza uma div?',
                'description' => 'A pergunta técnica mais difícil da história da computação.',
                'options' => ['Flexbox', 'Grid', 'margin: 0 auto e fé', 'Pergunto pra IA', 'position: absolute e vou ajustando'],
            ],
            [
                'title' => 'O que significa "TODO" no código?',
                'description' => 'Um estudo arqueológico sobre promessas.',
                'options' => ['Vou fazer amanhã', 'Vou fazer um dia', 'Nunca mais será tocado', 'Monumento histórico protegido'],
            ],
            [
                'title' => 'Café ou energético para codar de madrugada?',
                'description' => 'Combustíveis oficiais do desenvolvedor brasileiro.',
                'options' => ['Café coado, respeite', 'Espresso triplo', 'Energético', 'Água (impostor detectado)', 'Dormir (revolucionário)'],
            ],
            [
                'title' => 'Qual a parte mais difícil da programação?',
                'description' => 'Décadas de ciência da computação e ainda não resolvemos isso.',
                'options' => ['Nomear variáveis', 'Invalidar cache', 'Off-by-one errors', 'Entender meu código de 6 meses atrás'],
            ],
        ];

        foreach ($polls as $index => $data) {
            // Distribui a autoria entre os usuários
            $owner = $users[$index % $users->count()];

            $poll = Poll::firstOrCreate(
                ['title' => $data['title']],
                [
                    'user_id' => $owner->id,
                    'description' => $data['description'],
                ]
            );

            // Cria as opções apenas se a enquete for nova (idempotência)
            if ($poll->options()->count() === 0) {
                foreach ($data['options'] as $text) {
                    $poll->options()->create(['text' => $text]);
                }
            }

            // ---------- Votos ----------
            // Entre 4 e 8 eleitores por enquete, nunca o dono,
            // cada um vota uma única vez (respeitando a constraint).
            $optionIds = $poll->options()->pluck('id')->all();

            $voters = $users
                ->reject(fn($u) => $u->id === $owner->id)
                ->shuffle()
                ->take(rand(4, 8));

            foreach ($voters as $voter) {
                Vote::firstOrCreate(
                    ['user_id' => $voter->id, 'poll_id' => $poll->id],
                    ['poll_option_id' => Arr::random($optionIds)]
                );
            }
        }

        $this->command->info('Demo populada: ' . User::count() . ' usuários, ' . Poll::count() . ' enquetes, ' . Vote::count() . ' votos.');
    }
}