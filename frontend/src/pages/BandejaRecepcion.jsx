import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpedienteStore } from "@/store/expedienteStore"
import { Search, LayoutGrid, Table2, Plus } from "lucide-react"

const ESTADO_VARIANT = {
  ingresado: "info", en_validacion: "warning", requiere_triaje: "warning",
  derivado: "secondary", en_evaluacion: "info", resuelto: "success", archivado: "secondary",
}
const ESTADO_LABEL = {
  ingresado: "Ingresado", en_validacion: "En Validación", requiere_triaje: "Requiere Triaje",
  derivado: "Derivado", en_evaluacion: "En Evaluación", resuelto: "Resuelto", archivado: "Archivado",
}

export default function BandejaRecepcion() {
  const { expedientes, fetchExpedientes, loading } = useExpedienteStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [estado, setEstado] = useState("todos")
  const [page, setPage] = useState(1)
  const [view, setView] = useState("tabla")
  const perPage = 10

  useEffect(() => {
    fetchExpedientes({ estado: estado !== "todos" ? estado : undefined })
      .catch(() => toast.error("Error al cargar expedientes."))
  }, [estado])

  const filtrados = expedientes.filter((e) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      e.numero_expediente?.toLowerCase().includes(q) ||
      e.ciudadano?.nombre?.toLowerCase().includes(q) ||
      e.ciudadano?.dni?.includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(filtrados.length / perPage))
  const paginados = filtrados.slice((page - 1) * perPage, page * perPage)

  // Rutas bajo /app/*
  const goDetalle = (id) => navigate(`/app/expedientes/${id}`)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Listado Maestro de Trámites</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestión administrativa y seguimiento de flujos de trabajo institucionales.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={view === "tabla" ? "secondary" : "outline"} size="sm" className="gap-1.5" onClick={() => setView("tabla")}>
            <Table2 className="h-4 w-4" />Tabla
          </Button>
          <Button variant={view === "tarjetas" ? "secondary" : "outline"} size="sm" className="gap-1.5" onClick={() => setView("tarjetas")}>
            <LayoutGrid className="h-4 w-4" />Tarjetas
          </Button>
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap">
        <Select onValueChange={(v) => { setEstado(v); setPage(1) }} defaultValue="todos">
          <SelectTrigger className="w-44"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los estados</SelectItem>
            {Object.entries(ESTADO_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar por N° o solicitante..."
            className="pl-8"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <Button className="ml-auto gap-1.5" onClick={() => navigate("/app/mesa-partes")}>
          <Plus className="h-4 w-4" />Nuevo Trámite
        </Button>
      </div>

      {view === "tabla" ? (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  {["ID Trámite", "Tipo", "Remitente", "Fecha Registro", "Estado", "Acciones"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs uppercase tracking-wide text-muted-foreground font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Cargando...</td></tr>
                ) : paginados.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground text-sm">Sin resultados.</td></tr>
                ) : paginados.map((exp) => (
                  <tr key={exp.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-semibold">{exp.numero_expediente}</td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.TupaProcedimiento?.nombre_tramite || "—"}</td>
                    <td className="px-4 py-3">{exp.ciudadano?.nombre || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {exp.fecha_ingreso ? new Date(exp.fecha_ingreso).toLocaleDateString("es-PE") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={ESTADO_VARIANT[exp.estado] || "secondary"} className="uppercase text-[10px]">
                        {ESTADO_LABEL[exp.estado] || exp.estado}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Button size="sm" variant="ghost" className="text-xs h-7 cursor-pointer" onClick={() => goDetalle(exp.id)}>
                        Ver Detalle
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {paginados.map((exp) => (
            <Card key={exp.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => goDetalle(exp.id)}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm">{exp.numero_expediente}</CardTitle>
                  <Badge variant={ESTADO_VARIANT[exp.estado] || "secondary"} className="text-[10px]">
                    {ESTADO_LABEL[exp.estado] || exp.estado}
                  </Badge>
                </div>
                <CardDescription>{exp.TupaProcedimiento?.nombre_tramite || "—"}</CardDescription>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                {exp.ciudadano?.nombre} · {exp.fecha_ingreso ? new Date(exp.fecha_ingreso).toLocaleDateString("es-PE") : "—"}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mostrando {filtrados.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtrados.length)} de {filtrados.length} registros</span>
        <div className="flex gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? "default" : "outline"} size="icon" className="h-8 w-8 text-xs" onClick={() => setPage(p)}>{p}</Button>
          ))}
          {totalPages > 5 && <Button variant="outline" size="icon" className="h-8 w-8 text-xs" disabled>...</Button>}
          <Button variant="outline" size="icon" className="h-8 w-8" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>›</Button>
        </div>
      </div>
    </div>
  )
}
