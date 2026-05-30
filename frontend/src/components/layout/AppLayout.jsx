import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Topbar from "./Topbar"

export default function AppLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
        <footer className="border-t px-6 py-3 text-xs text-muted-foreground flex justify-between shrink-0">
          <span>© 2025 Municipalidad Provincial de Yau. Todos los derechos reservados.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:underline cursor-pointer">Privacidad</a>
            <a href="#" className="hover:underline cursor-pointer">Términos</a>
            <a href="#" className="hover:underline cursor-pointer">Verificación Pública</a>
          </div>
        </footer>
      </div>
    </div>
  )
}
