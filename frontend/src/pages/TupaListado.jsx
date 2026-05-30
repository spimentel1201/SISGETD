import { useEffect, useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useTupaStore } from "@/store/tupaStore"
import { useAreaStore } from "@/store/areaStore"
import { Plus, Search, Pencil, X, Filter, Clock, FileText } from "lucide-react"

const SILENCIO_VARIANT = { positivo: "success", negativo: "destructive", automatico: "info" }
const SILENCIO_LABEL = { positivo: "Positivo", negativo: "Negativo", automatico: "Automático" }

export default function TupaListado() {
  const { tupas, fetchTupas, deleteTupa, loading } = useTupaStore()
  const { areas, fetchAreas } = useAreaStore()
  const navigate = useNavigate()

  const [search, setSearch] = useState("")
  const [areaFiltro, setAreaFiltro] = useState("todas")
  const [silencioFiltro, setSilencioFiltro] = useState("todos")
  const [estadoFiltro, setEstadoFiltro] = useState("activos")
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState({ open: false, tupa: null, loading: false })
  const perPage = 10

  useEffect(() => {
    fetchTupas(false)
    fetchAreas(false)
  }, [])

  const filtrados = useMemo(() => tupas.filter((t) => {
    const matchSearch = !search ||
      t.nombre_tramite.toLowerCase().includes(search.toLowerCase()) ||
      t.codigo_tupa.toLowerCase().includes(search.toLowerCase())
    const matchArea = areaFiltro === "todas" || t.area_responsable_id === areaFiltro
    const matchSilencio = silencioFiltro === "todos" || t.tipo_silencio === silencioFiltro
    const matchEstado =
      estadoFiltro === "todos" ||
      (estadoFiltro === "activos" && t.es_activo) ||
      (estadoFiltro === "inactivos" && !t.es_activo)
    return matchSearch && matchArea && matchSilencio && matchEstado
  }), [tupas, search, areaFiltro, silencioFiltro, estadoFiltro])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / perPage))
  const paginados = filtrados.slice((page - 1) * perPage, page * perPage)

  const limpiar = () => { setSearch(""); setAreaFiltro("todas"); setSilencioFiltro("todos"); setEstadoFiltro("activos"); setPage(1) }

  const ejecutarDesactivar = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await deleteTupa(confirm.tupa.id)
      toast.success("Procedimiento desactivado correctamente.")
    } catch {
      toast.error("Error al desactivar el procedimiento.")
    } finally {
      setConfirm({ open: false, tupa: null, loading: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Admin / Configuración TUPA</p>
          <h1 className="text-2xl font-semibold mt-1">Procedimientos TUPA</h1>
          <p className="text-sm text-muted-foreground mt-1">Texto Único de Procedimientos Administrativos — Municipalidad Provincial de Yau.</p>
        </div>
        <Button className="gap-1.5" onClick={() => navigate("/app/tupa/nuevo")}>
          <Plus className="h-4 w-4" />Nuevo Procedimiento
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total procedimientos", value: tupas.length, icon: FileText },
          { label: "Activos", value: tupas.filter((t) => t.es_activo).length, icon: FileText },
          { label: "Plazo promedio (días)", value: tupas.length ? Math.round(tupas.reduce((s, t) => s + (t.dias_plazo_legal || 0), 0) / tupas.length) : "—", icon: Clock },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
                <p className="text-3xl font-bold mt-1">{value}</p>
              </div>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-end gap-3 p-4 border-b flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Buscar por nombre o código..." className="pl-8 h-8 text-xs" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Área responsable</p>
            <Select value={areaFiltro} onValueChange={(v) => { setAreaFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-52 h-8 text-xs"><SelectValue placeholder="Todas las áreas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas" className="text-xs">Todas las áreas</SelectItem>
                {areas.map((a) => <SelectItem key={a.id} value={a.id} className="text-xs">{a.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Silencio adm.</p>
            <Select value={silencioFiltro} onValueChange={(v) => { setSilencioFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos" className="text-xs">Todos</SelectItem>
                <SelectItem value="positivo" className="text-xs">Positivo</SelectItem>
                <SelectItem value="negativo" className="text-xs">Negativo</SelectItem>
                <SelectItem value="automatico" className="text-xs">Automático</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Estado</p>
            <Select value={estadoFiltro} onValueChange={(v) => { setEstadoFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="activos" className="text-xs">Activos</SelectItem>
                <SelectItem value="inactivos" className="text-xs">Inactivos</SelectItem>
                <SelectItem value="todos" className="text-xs">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={limpiar}>
            <Filter className="h-3.5 w-3.5" />Limpiar
          </Button>
        </div>

        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {["Código TUPA", "Nombre del Trámite", "Área Responsable", "Plazo (días)", "Silencio Adm.", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Cargando...</td></tr>
              ) : paginados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sin resultados.</td></tr>
              ) : paginados.map((t) => (
                <tr key={t.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-xs">{t.codigo_tupa}</td>
                  <td className="px-4 py-3 font-medium max-w-[220px]"><p className="truncate">{t.nombre_tramite}</p></td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{t.Area?.nombre || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{t.dias_plazo_legal}d</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={SILENCIO_VARIANT[t.tipo_silencio] || "secondary"} className="text-[10px]">
                      {SILENCIO_LABEL[t.tipo_silencio] || t.tipo_silencio}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    {t.es_activo
                      ? <Badge variant="success" className="text-[10px]">Activo</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => navigate(`/app/tupa/editar/${t.id}`)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                        disabled={!t.es_activo}
                        onClick={() => setConfirm({ open: true, tupa: t, loading: false })}
                        title="Desactivar"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>Mostrando {filtrados.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtrados.length)} de {filtrados.length} procedimientos</span>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" className="h-7 w-7 text-xs" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-7 w-7 text-xs" onClick={() => setPage(p)}>{p}</Button>
              ))}
              {totalPages > 5 && <Button variant="outline" size="icon" className="h-7 w-7 text-xs" disabled>...</Button>}
              <Button variant="outline" size="icon" className="h-7 w-7 text-xs" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, tupa: null, loading: false })}
        onConfirm={ejecutarDesactivar}
        loading={confirm.loading}
        title="¿Desactivar procedimiento?"
        description={`"${confirm.tupa?.nombre_tramite}" quedará inactivo y no podrá usarse en nuevos expedientes.`}
        confirmLabel="Desactivar"
        variant="destructive"
      />
    </div>
  )
}
