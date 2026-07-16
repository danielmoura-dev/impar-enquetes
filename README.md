<h1 align="center">🗳️ Impar Enquetes</h1>

<p align="center">
  Sistema de enquetes (polls) full-stack com votação e resultados em <strong>tempo real</strong>.<br>
  Desafio técnico — Impar Tecnologias.
</p>

<p align="center">
  <a href="https://enquetes.fontepro.online"><strong>🔗 Aplicação ao vivo</strong></a> ·
  <a href="https://api-enquetes.fontepro.online/up"><strong>❤️ Health check da API</strong></a>
</p>

---

## 📖 Sobre o projeto

Aplicação web completa onde usuários autenticados criam enquetes, votam nas enquetes de outros e acompanham os resultados **atualizando ao vivo**, sem recarregar a página. Front-end e back-end são projetos separados, comunicando-se por uma API RESTful.

O foco foi organização de código, separação clara de responsabilidades, boas práticas de segurança e uma experiência de usuário fluida.

---

## 🛠️ Stack técnica

| Camada | Tecnologia | Motivo da escolha |
| --- | --- | --- |
| **Back-end** | Laravel 13 (PHP 8.4) | Framework maduro; autenticação, ORM, validação, filas e broadcasting nativos. Usa PDO por baixo. |
| **Front-end** | React 19 + Vite | Requisito do desafio. Vite pela velocidade (o Create React App foi descontinuado). |
| **Banco** | MySQL 8 | Requisito do desafio; integração transparente via Eloquent. |
| **Autenticação** | Laravel Sanctum (tokens) | Padrão oficial para SPAs: tokens revogáveis, armazenados com hash no banco. |
| **Real-time** | Laravel Reverb + Laravel Echo | Servidor WebSocket first-party do Laravel; Echo cuida de reconexão e canais. |
| **Estilização** | Tailwind CSS | Produtividade e consistência visual em prazo curto. |
| **Gráficos** | Recharts | Biblioteca declarativa, feita para React. |
| **E-mail** | Laravel Mail + filas | Envio assíncrono para não travar a resposta do voto. |

---

## ✨ Funcionalidades

### Obrigatórias
- ✅ Cadastro, login, logout e **recuperação de senha**
- ✅ Proteção de rotas (só autenticados criam enquetes e votam)
- ✅ CRUD de enquetes (título, descrição, 2–8 opções, data de expiração)
- ✅ Edição e exclusão restritas ao criador (via Policy)
- ✅ Um voto por usuário por enquete (validação + constraint no banco)
- ✅ **Resultados em tempo real** via WebSocket

### Opcionais implementados
- ✅ E-mail de confirmação ao votante e de aviso ao dono da enquete
- ✅ Barra de progresso e gráfico de barras nos resultados
- ✅ Enquetes em destaque (mais votadas) e busca por título/descrição
- ✅ Rate limiting nos votos (10/min por usuário)
- ✅ Proteção contra SQL Injection, XSS, CSRF e IDOR
- ✅ Validação forte de e-mail (formato + DNS)
- ✅ Compartilhamento de enquete via link
- ✅ Histórico de votos do usuário

---

## 🗂️ Estrutura do repositório

```
impar-enquetes/
├── backend/          # API Laravel 13
├── frontend/         # SPA React + Vite
├── docs/             # Configs de referência do deploy (Nginx, Supervisor)
├── scripts/deploy.sh # Script executado no deploy automático (VPS)
├── .github/workflows/deploy.yml  # CI/CD: deploy automático a cada push na main
└── README.md
```

---

## 🧩 Diagrama do banco de dados

```mermaid
erDiagram
    users ||--o{ polls : "cria"
    users ||--o{ votes : "vota"
    polls ||--o{ poll_options : "possui"
    polls ||--o{ votes : "recebe"
    poll_options ||--o{ votes : "escolhida em"

    users {
        bigint id PK
        string name
        string email UK
        string password
    }
    polls {
        bigint id PK
        bigint user_id FK
        string title
        text description
        timestamp expires_at
    }
    poll_options {
        bigint id PK
        bigint poll_id FK
        string text
    }
    votes {
        bigint id PK
        bigint user_id FK
        bigint poll_id FK
        bigint poll_option_id FK
    }
```

> **Decisão-chave:** a tabela `votes` guarda `poll_id` mesmo sendo derivável de `poll_option_id`. Essa redundância proposital permite a constraint **`UNIQUE(user_id, poll_id)`**, que garante "um voto por usuário por enquete" no nível do banco — resistente a condições de corrida.

---

## 🚀 Rodando localmente

### Pré-requisitos
- **PHP 8.3+** · **Composer** · **Node 20.19+ ou 22.12+** (exigido pelo Vite 8 — Node 18 não funciona) · **MySQL 8** rodando

### 1. Banco de dados

Crie o banco antes de migrar (o nome deve bater com `DB_DATABASE` no `.env`, veja o passo 2):

```sql
CREATE DATABASE impar_enquetes;
```

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Abra o `.env` e ajuste pelo menos:
- `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` — credenciais do seu MySQL
- `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET` — qualquer valor (são segredos **locais**, entre o seu próprio servidor Reverb e o seu próprio front — não vêm de nenhum serviço externo). Ex.: `REVERB_APP_ID=100001`, e para as outras duas rode `php artisan tinker --execute="echo Str::random(20);"` duas vezes.
- `MAIL_USERNAME` / `MAIL_PASSWORD` — opcional; sem isso os e-mails (confirmação de voto, reset de senha) falham silenciosamente na fila, mas o resto do sistema funciona normalmente

> Sanctum e Reverb **já vêm instalados e versionados** neste repositório (`config/sanctum.php`, `config/reverb.php`, migrations, `routes/channels.php`). Não é necessário rodar `install:api` ou `install:broadcasting` — isso já foi feito uma vez pelo autor do projeto.

```bash
php artisan migrate

# Opcional, mas recomendado: popula o banco com 10 usuários e 10 enquetes
# de demonstração (senha de todos: senha12345, ex: neymar.jr@demo.com)
php artisan db:seed --class=DemoSeeder
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

No `.env` do frontend, `VITE_REVERB_APP_KEY` precisa ser **idêntica** à `REVERB_APP_KEY` que você definiu no `.env` do backend. O resto (`localhost`/`8080`/`http`) já vem certo para desenvolvimento.

### 4. Subir os 4 processos (cada um em um terminal)

```bash
# 1) API
cd backend && php artisan serve

# 2) Servidor WebSocket (sem isso, os resultados não atualizam em tempo real)
cd backend && php artisan reverb:start

# 3) Worker da fila (e-mails)
cd backend && php artisan queue:work

# 4) Front-end
cd frontend && npm run dev
```

Acesse `http://localhost:5173`. Se você rodou o `DemoSeeder`, já dá pra logar com qualquer um dos e-mails `@demo.com` (senha `senha12345`) e ver enquetes, votos e resultados populados.

> ⚠️ Os 4 processos são independentes — não existe um único comando que suba tudo. Se mudar algo no `.env` do backend, **reinicie o `php artisan serve`**: ele é um processo único de longa duração e não relê o `.env` sozinho.

---

## 🔌 Rotas da API

Todas sob o prefixo `/api`. As protegidas exigem header `Authorization: Bearer {token}`.

| Método | Rota | Protegida | Descrição |
| --- | --- | :---: | --- |
| POST | `/register` | ➖ | Cadastro |
| POST | `/login` | ➖ | Login |
| POST | `/forgot-password` | ➖ | Solicita link de reset |
| POST | `/reset-password` | ➖ | Redefine a senha |
| POST | `/logout` | 🔒 | Revoga o token atual |
| GET | `/me` | 🔒 | Dados do usuário logado |
| GET | `/polls` | ➖ | Lista enquetes públicas (`?search=`, `?sort=popular`) |
| POST | `/polls` | 🔒 | Cria enquete |
| GET | `/polls/{id}` | ➖ | Detalhes da enquete (personaliza a resposta se autenticado) |
| PUT | `/polls/{id}` | 🔒 | Edita (só o dono) |
| DELETE | `/polls/{id}` | 🔒 | Exclui (só o dono) |
| POST | `/polls/{id}/votes` | 🔒 | Vota (rate limit 10/min) |
| GET | `/my-votes` | 🔒 | Histórico de votos |

> A collection do Insomnia (`impar-enquetes-insomnia.yaml`) na raiz do repositório contém todas essas rotas prontas para importar.

---

## 🧠 Principais decisões técnicas

- **Sanctum em vez de JWT puro:** tokens revogáveis no logout (JWT stateless exigiria uma blacklist para o mesmo efeito).
- **Reverb (WebSocket) em vez de SSE:** ecossistema first-party; o mesmo código roda com Pusher só trocando variáveis de ambiente.
- **Broadcast imediato (`ShouldBroadcastNow`) para votos, fila para e-mails:** latência importa no tempo real; no e-mail, não — então ele vai para a fila e não atrasa a resposta do voto.
- **Form Requests + Policies:** validação e autorização isoladas do controller, que fica magro e legível.
- **Opções não editáveis após criação:** preserva a integridade dos votos já registrados.
- **Enquetes anônimas (opcional) — decisão de não implementar:** votação sem login conflita
  com o requisito obrigatório de voto único por usuário. Alternativas como controle por IP
  ou cookie são burláveis e punem redes compartilhadas. Priorizei a integridade do requisito
  obrigatório; em contrapartida, a **visualização** de enquetes é pública, viabilizando o
  compartilhamento via link sem cadastro.

---

## 🌐 Deploy

Deploy em **VPS Ubuntu 24.04** com:
- **Nginx** servindo a API (root em `/public`) e o build estático do front (SPA fallback para `index.html`)
- **PHP 8.4-FPM** dedicado (convivendo com outra versão na mesma máquina)
- **Certbot / Let's Encrypt** para HTTPS com renovação automática
- **Reverb** exposto via proxy WebSocket do Nginx (`/app` → `127.0.0.1:8080`)
- **Supervisor** mantendo o Reverb e o worker da fila rodando e reiniciando no boot

Configs de referência (Nginx e Supervisor) em [`docs/`](docs/).

### Deploy automático (CI/CD)

Todo push (ou merge) na branch `main` dispara o workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), que:

1. Conecta na VPS via SSH (`appleboy/ssh-action`), usando os secrets do repositório:
   `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`.
2. Roda `git pull origin main` em `/var/www/impar-enquetes`.
3. Executa [`scripts/deploy.sh`](scripts/deploy.sh), que:
   - instala as dependências do backend (`composer install --no-dev`);
   - roda as migrations (`migrate --force`);
   - recria os caches de config/rotas/views;
   - builda o front (`npm ci && npm run build`);
   - ajusta permissões (`chown www-data`);
   - reinicia os workers via `supervisorctl restart impar-queue:* impar-reverb`.

Não há passo manual no dia a dia: mergear na `main` já publica em produção. O único cuidado é que o `.env` de produção na VPS **não é gerenciado pelo Git** (fica só no servidor) — mudanças nele são manuais.

---

## 🔭 Próximos passos

- Code-splitting no build do front (reduzir o bundle inicial)
- Testes automatizados (PHPUnit + Vitest)
- Canais privados no Reverb para dados sensíveis
- Migração da fila para Redis em cenário de alta escala

---

<p align="center">Desenvolvido por <strong>Daniel Moura</strong> · 2026</p>
