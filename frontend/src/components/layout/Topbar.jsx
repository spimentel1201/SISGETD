import { Bell, Settings, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"

export default function Topbar({ title }) {
  const { user } = useAuthStore()
  const initials = user?.nombre?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "U"

  return (
    <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
      <h1 className="text-sm font-semibold tracking-wide uppercase text-foreground">{title || "Gestión Corporativa"}</h1>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Buscar expediente..." className="pl-8 h-8 w-56 text-xs" />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Settings className="h-4 w-4" />
        </Button>
        <Avatar className="h-8 w-8 cursor-pointer">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
