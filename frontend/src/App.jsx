import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuthStore } from "@/store/authStore"
import AppLayout from "@/components/layout/AppLayout"
import Portal from "@/pages/Portal"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import MesaPartes from "@/pages/MesaPartes"
import Seguimiento from "@/pages/Seguimiento"
import Notificaciones from "@/pages/Notificaciones"
import BandejaRecepcion from "@/pages/BandejaRecepcion"
import DetalleExpediente from "@/pages/DetalleExpediente"
import BandejaFuncionario from "@/pages/BandejaFuncionario"
import EvaluacionExpediente from "@/pages/EvaluacionExpediente"
import Areas from "@/pages/Areas"
import TupaListado from "@/pages/TupaListado"
import TupaForm from "@/pages/TupaForm"
import Usuarios from "@/pages/Usuarios"

function PrivateRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Portal />} />
        <Route path="/login" element={<Login />} />
        <Route path="/seguimiento" element={<Seguimiento />} />

        {/* Rutas privadas con layout */}
        <Route path="/app" element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="mesa-partes" element={<MesaPartes />} />
          <Route path="notificaciones" element={<Notificaciones />} />
          <Route path="expedientes" element={<BandejaRecepcion />} />
          <Route path="tramites" element={<BandejaRecepcion />} />
          <Route path="expedientes/:id" element={<DetalleExpediente />} />
          <Route path="bandeja" element={<BandejaFuncionario />} />
          <Route path="evaluacion/:id" element={<EvaluacionExpediente />} />
          <Route path="areas" element={<Areas />} />
          <Route path="tupa" element={<TupaListado />} />
          <Route path="tupa/nuevo" element={<TupaForm />} />
          <Route path="tupa/editar/:id" element={<TupaForm />} />
          <Route path="usuarios" element={<Usuarios />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
