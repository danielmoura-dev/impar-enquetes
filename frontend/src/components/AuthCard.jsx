import logoFull from '../assets/logo-full.png'

// Layout compartilhado pelas telas de autenticacao (login, registro,
// recuperacao de senha). A logo tem fundo branco solido, entao só
// funciona sobre superficies claras — por isso o fundo aqui é um
// gradiente sutil, nunca uma cor solida escura.
export default function AuthCard({ children }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-brand-50 via-white to-white px-4 py-10">
      <div className="w-full max-w-md">
        <img
          src={logoFull}
          alt="Impar Enquetes"
          className="mx-auto mb-6 h-36 w-36 sm:h-40 sm:w-40"
        />

        <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/70 ring-1 ring-slate-100 sm:p-8">
          {children}
        </div>
      </div>
    </div>
  )
}
