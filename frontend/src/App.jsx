import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'

// Home provisoria (sera substituida no Modulo 7 pela lista de enquetes)
function Home() {
  const { user, logout } = useAuth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100">
      <h1 className="text-2xl font-bold text-gray-800">
        Bem-vindo, {user.name}! 🎉
      </h1>
      <p className="text-gray-600">Autenticação funcionando de ponta a ponta.</p>
      <button
        onClick={logout}
        className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
      >
        Sair
      </button>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}