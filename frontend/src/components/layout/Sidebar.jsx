import { NavLink, useNavigate } from "react-router-dom"
import {
  LayoutDashboard, FolderOpen, FileText, Building2, Users, LogOut, HelpCircle, ClipboardList,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/authStore"
import { Separator } from "@/components/ui/separator"

const navItems = [
  { to: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/app/expedientes", icon: FolderOpen, label: "Expedientes" },
  { to: "/app/tramites", icon: FileText, label: "Trámites" },
  { to: "/app/tupa", icon: ClipboardList, label: "TUPA" },
  { to: "/app/areas", icon: Building2, label: "Áreas" },
  { to: "/app/usuarios", icon: Users, label: "Usuarios" },
]

export default function Sidebar() {
  const { logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  return (
    <aside className="flex flex-col w-48 min-h-screen border-r bg-card">
      <div className="p-4">
        <p className="text-xs font-bold tracking-widest text-foreground uppercase">Operator</p>
        <p className="text-xs font-bold tracking-widest text-foreground uppercase">Workbench</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">v1.0.0-STABLE</p>
      </div>

      <Separator />

      <nav className="flex-1 p-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                isActive
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 space-y-0.5">
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors cursor-pointer">
          <HelpCircle className="h-4 w-4" />
          Ayuda
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  )
}
