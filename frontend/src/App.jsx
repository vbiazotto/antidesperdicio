import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import AppLayout from './components/layout/AppLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import { Produtos } from './pages/Produtos'
import Ofertas from './pages/Ofertas'
import { Parcerias, Notificacoes, Relatorios } from './pages/OutrasPages'
import Chatbot from './pages/Chatbot'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/produtos"     element={<Produtos />} />
            <Route path="/ofertas"      element={<Ofertas />} />
            <Route path="/parcerias"    element={<Parcerias />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/relatorios"   element={<Relatorios />} />
            <Route path="/chatbot"      element={<Chatbot />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
