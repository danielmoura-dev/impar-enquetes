import Echo from 'laravel-echo'
import Pusher from 'pusher-js'

// O Echo exige o Pusher no escopo global: o Reverb fala o protocolo Pusher,
// entao a mesma lib cliente serve para os dois (Reverb local, Pusher no deploy).
window.Pusher = Pusher

// Instancia unica (singleton): uma conexao WebSocket para o app inteiro.
const echo = new Echo({
  broadcaster: 'reverb',
  key: import.meta.env.VITE_REVERB_APP_KEY,
  wsHost: import.meta.env.VITE_REVERB_HOST,
  wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
  wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
  forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
  enabledTransports: ['ws', 'wss'],
})

export default echo