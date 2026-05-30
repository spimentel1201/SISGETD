import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, FileText, ExternalLink } from "lucide-react"
import api from "@/lib/api"
import { useNavigate } from "react-router-dom"

export default function Notificaciones() {
  const [notifs, setNotifs] = useState([])
  const [filtro, setFiltro] = useState("todos")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get("/notificaciones")
      .then(({ data }) => setNotifs(data))
      .catch(() => setNotifs([]))
      .finally(() => setLoading(false))
  }, [])

  const marcarLeida = async (id) => {
    // El endpoint del backend es PATCH /:id/leido (no /leida)
    await api.patch(`/notificaciones/${id}/leido`).catch(() => {})
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, leido: true } : n))
  }

  const filtradas = filtro === "todos" ? notifs : notifs.filter((n) => n.canal === filtro)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Centro de Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">Historial de alertas y comunicaciones.</p>
        </div>
        <Select onValueChange={setFiltro} defaultValue="todos">
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="email">Email</SelectItem>
            <SelectItem value="sms">SMS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : filtradas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No hay notificaciones.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtradas.map((n) => (
            <Card key={n.id} className={n.leido ? "opacity-60" : ""}>
              <CardContent className="py-4 flex items-start gap-4">
                <div className={`h-2 w-2 rounded-full mt-2 shrink-0 ${n.leido ? "bg-muted" : "bg-primary"}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={n.canal === "email" ? "info" : "secondary"} className="text-[10px]">
                      {n.canal?.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {n.fecha_envio ? new Date(n.fecha_envio).toLocaleString("es-PE") : "—"}
                    </span>
                  </div>
                  <p className="text-sm">{n.mensaje}</p>
                  {/* El backend incluye el expediente como Expediente (Sequelize) */}
                  {(n.expediente_id || n.Expediente) && (
                    <button
                      onClick={() => navigate(`/expedientes/${n.expediente_id}`)}
                      className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {n.Expediente?.numero_expediente || "Ver expediente"}
                    </button>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  {!n.leido && (
                    <Button size="sm" variant="ghost" className="text-xs h-7" onClick={() => marcarLeida(n.id)}>
                      Marcar leída
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" className="text-xs h-7 gap-1">
                    <FileText className="h-3 w-3" />Descargar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
