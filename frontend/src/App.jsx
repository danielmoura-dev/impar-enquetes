import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Home from './pages/Home'
import CreatePoll from './pages/CreatePoll'
import PollDetail from './pages/PollDetail'
import EditPoll from './pages/EditPoll'
import MyVotes from './pages/MyVotes'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ---------- Públicas ---------- */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Visualizar enquetes é público (compartilhamento via link!) */}
          <Route path="/" element={<Home />} />
          <Route path="/polls/:id" element={<PollDetail />} />

          {/* ---------- Protegidas ---------- */}
          <Route
            path="/polls/create"
            element={
              <ProtectedRoute>
                <CreatePoll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/polls/:id/edit"
            element={
              <ProtectedRoute>
                <EditPoll />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-votes"
            element={
              <ProtectedRoute>
                <MyVotes />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}