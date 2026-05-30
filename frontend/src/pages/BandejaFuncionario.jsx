import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpedienteStore } from "@/store/expedienteStore"
import { ArrowUpDown, Clock, AlertTriangle } from "lucide-react"

function SemaforoVencimiento({ fechaLimite }) {
  if (!fechaLimite) return <Badge variant="secondary" className="text-[10px]">—</Badge>
  const dias = Math.ceil((new Date(fechaLimite) - new Date()) / (1000 * 60 * 60 * 24))
  if (dias < 0) return <Badge variant="destructive" className="gap-1 text-[10px]"><AlertTriangle className="h-3 w-3" />Vencido</Badge>
  if (dias <= 3) return <Badge variant="destructive" className="gap-1 text-[10px]"><Clock className="h-3 w-3" />{dias}d</Badge>
  if (dias <= 7) return <Badge variant="warning" className="gap-1 text-[10px]"><Clock className="h-3 w-3" />{dias}d</Badge>
  return <Badge variant="success" className="gap-1 text-[10px]"><Clock className="h-3 w-3" />{dias}d</Badge>
}

export default function BandejaFuncionario() {
  const { expedientes, fetchExpedientes, loading } = useExpedienteStore()
  const navigate = useNavigate()
  const [tipoFiltro, setTipoFiltro] = useState("todos")
  const [ordenPrioridad, setOrdenPrioridad] = useState(true)

  useEffect(() => {
    fetchExpedientes({ estado: "en_evaluacion" })
      .catch(() => toast.error("Error al cargar expedientes."))
  }, [])

  // Tipos únicos de trámite disponibles
  const tipos = [...new Set(expedientes.map((e) => e.TupaProcedimiento?.nombre_tramite).filter(Boolean))]

  const filtrados = expedientes
    .filter((e) => tipoFiltro === "todos" || e.TupaProcedimiento?.nombre_tramite === tipoFiltro)
    .sort((a, b) => ordenPrioridad ? (b.score_prioridad || 0) - (a.score_prioridad || 0) : 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Bandeja de Trabajo</h1>
        <p className="text-sm text-muted-foreground mt-1">Expedientes asignados a su área, priorizados por IA.</p>
      </div>

      <div className="flex gap-3 items-center">
        <Select onValueChange={setTipoFiltro} defaultValue="todos">
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Tipo de trámite" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los tipos</SelectItem>
            {tipos.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>

        <Button
          variant={ordenPrioridad ? "secondary" : "outline"}
          size="sm"
          className="gap-1.5"
          onClick={() => setOrdenPrioridad(!ordenPrioridad)}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {ordenPrioridad ? "Ordenado por prioridad" : "Ordenar por prioridad"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["Expediente", "Tipo de Trámite", "Solicitante", "Score IA", "Vencimiento", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Cargando...</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Sin expedientes asignados.</td></tr>
              ) : filtrados.map((exp) => (
                <tr key={exp.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-semibold">{exp.numero_expediente}</td>
                  <td className="px-4 py-3 text-muted-foreground">{exp.TupaProcedimiento?.nombre_tramite || "—"}</td>
                  <td className="px-4 py-3">{exp.ciudadano?.nombre || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-16 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${exp.score_prioridad || 0}%` }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{Math.round(exp.score_prioridad || 0)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <SemaforoVencimiento fechaLimite={exp.fecha_limite} />
                  </td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="ghost" className="text-xs h-7 cursor-pointer" onClick={() => navigate(`/app/evaluacion/${exp.id}`)}>
                      Evaluar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
