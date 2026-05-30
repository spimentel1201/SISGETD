import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useAreaStore } from "@/store/areaStore"
import { Building2, Users, LayoutGrid, Plus, Pencil, Filter, X } from "lucide-react"

const TIPO_OPTIONS = ["Todas las unidades", "Gerencia", "Subgerencia", "Oficina", "Unidad"]
const ESTADO_OPTIONS = ["Cualquier estado", "Activo", "Inactivo"]

function getTipo(area) {
  const g = area.gerencia?.toLowerCase() || ""
  if (g.includes("subgerencia")) return "Subgerencia"
  if (g.includes("oficina")) return "Oficina"
  if (g.includes("unidad")) return "Unidad"
  return "Gerencia"
}

function EstadoBadge({ activo }) {
  return activo
    ? <Badge variant="success" className="text-[10px] uppercase tracking-wide">Activo</Badge>
    : <Badge variant="warning" className="text-[10px] uppercase tracking-wide">Inactivo</Badge>
}

function AreaFormDialog({ open, onClose, areaEditar, onSaved }) {
  const { createArea, updateArea } = useAreaStore()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const isEdit = !!areaEditar

  useEffect(() => {
    if (open) reset(areaEditar || { codigo: "", nombre: "", gerencia: "" })
  }, [open, areaEditar])

  const onSubmit = async (data) => {
    try {
      if (isEdit) await updateArea(areaEditar.id, data)
      else await createArea(data)
      toast.success(isEdit ? "Área actualizada correctamente." : "Área registrada correctamente.")
      onSaved()
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error al guardar el área.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Área" : "Nueva Área"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos de la unidad orgánica." : "Complete los campos para registrar una nueva unidad orgánica."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Código <span className="text-destructive">*</span></Label>
            <Input placeholder="Ej. GDU" className="uppercase" {...register("codigo", { required: true })} />
            {errors.codigo && <p className="text-xs text-destructive">Campo obligatorio.</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Nombre de la unidad <span className="text-destructive">*</span></Label>
            <Input placeholder="Ej. Gerencia de Desarrollo Urbano" {...register("nombre", { required: true })} />
            {errors.nombre && <p className="text-xs text-destructive">Campo obligatorio.</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Gerencia / Tipo de unidad <span className="text-destructive">*</span></Label>
            <Input placeholder="Ej. Gerencia de Infraestructura" {...register("gerencia", { required: true })} />
            <p className="text-xs text-muted-foreground">Indique la gerencia a la que pertenece o el tipo de unidad.</p>
            {errors.gerencia && <p className="text-xs text-destructive">Campo obligatorio.</p>}
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Registrar Área"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function Areas() {
  const { areas, fetchAreas, deleteArea, loading } = useAreaStore()
  const [tipoFiltro, setTipoFiltro] = useState("Todas las unidades")
  const [estadoFiltro, setEstadoFiltro] = useState("Cualquier estado")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [areaEditar, setAreaEditar] = useState(null)
  const [confirm, setConfirm] = useState({ open: false, area: null, loading: false })
  const perPage = 10

  useEffect(() => { fetchAreas() }, [])

  const filtradas = useMemo(() => areas.filter((a) => {
    const matchTipo = tipoFiltro === "Todas las unidades" || getTipo(a) === tipoFiltro
    const matchEstado =
      estadoFiltro === "Cualquier estado" ||
      (estadoFiltro === "Activo" && a.es_activo) ||
      (estadoFiltro === "Inactivo" && !a.es_activo)
    const matchSearch = !search ||
      a.nombre.toLowerCase().includes(search.toLowerCase()) ||
      a.codigo.toLowerCase().includes(search.toLowerCase()) ||
      a.gerencia.toLowerCase().includes(search.toLowerCase())
    return matchTipo && matchEstado && matchSearch
  }), [areas, tipoFiltro, estadoFiltro, search])

  const totalPages = Math.max(1, Math.ceil(filtradas.length / perPage))
  const paginadas = filtradas.slice((page - 1) * perPage, page * perPage)

  const stats = useMemo(() => ({
    total: areas.length,
    gerencias: areas.filter((a) => getTipo(a) === "Gerencia" && a.es_activo).length,
    subgerencias: areas.filter((a) => getTipo(a) === "Subgerencia").length,
  }), [areas])

  const limpiarFiltros = () => { setTipoFiltro("Todas las unidades"); setEstadoFiltro("Cualquier estado"); setSearch(""); setPage(1) }
  const abrirEditar = (area) => { setAreaEditar(area); setDialogOpen(true) }
  const abrirNuevo = () => { setAreaEditar(null); setDialogOpen(true) }
  const pedirConfirm = (area) => setConfirm({ open: true, area, loading: false })

  const ejecutarDesactivar = async () => {
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      await deleteArea(confirm.area.id)
      toast.success("Área desactivada correctamente.")
    } catch {
      toast.error("Error al desactivar el área.")
    } finally {
      setConfirm({ open: false, area: null, loading: false })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Administración / Áreas y Gerencias</p>
          <h1 className="text-2xl font-semibold mt-1">Estructura Orgánica Municipal</h1>
          <p className="text-sm text-muted-foreground mt-1">Configuración y gestión centralizada de las unidades operativas institucionales.</p>
        </div>
        <Button className="gap-1.5" onClick={abrirNuevo}>
          <Plus className="h-4 w-4" />Nueva Área
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Áreas", value: stats.total, icon: LayoutGrid, sub: null },
          { label: "Gerencias Activas", value: stats.gerencias, icon: Building2, sub: null },
          { label: "Subgerencias", value: stats.subgerencias, icon: Building2, sub: "Distribución transversal" },
          { label: "Personal Asignado", value: "—", icon: Users, sub: "Promedio por área" },
        ].map(({ label, value, icon: Icon, sub }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{label}</p>
                  <p className="text-3xl font-bold mt-1">{value}</p>
                  {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
                </div>
                <Icon className="h-5 w-5 text-muted-foreground mt-1" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center gap-3 p-4 border-b flex-wrap">
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Tipo de Unidad</p>
            <Select value={tipoFiltro} onValueChange={(v) => { setTipoFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-44 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TIPO_OPTIONS.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Estado</p>
            <Select value={estadoFiltro} onValueChange={(v) => { setEstadoFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ESTADO_OPTIONS.map((o) => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1 max-w-xs">
            <Input
              placeholder="Buscar área..."
              className="h-8 text-xs"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={limpiarFiltros}>
            <Filter className="h-3.5 w-3.5" />Limpiar Filtros
          </Button>
        </div>

        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {["Unidad Orgánica", "Siglas", "Tipo", "Gerencia", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Cargando...</td></tr>
              ) : paginadas.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Sin resultados.</td></tr>
              ) : paginadas.map((area) => (
                <tr key={area.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm">{area.nombre}</p>
                    <p className="text-xs text-muted-foreground">ID: {area.codigo}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-sm font-semibold">{area.codigo}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="text-[10px]">{getTipo(area)}</Badge>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{area.gerencia}</td>
                  <td className="px-4 py-3"><EstadoBadge activo={area.es_activo} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => abrirEditar(area)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                        onClick={() => pedirConfirm(area)}
                        disabled={!area.es_activo}
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
            <span>Mostrando {filtradas.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtradas.length)} de {filtradas.length} unidades</span>
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

      <AreaFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} areaEditar={areaEditar} onSaved={() => fetchAreas()} />

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, area: null, loading: false })}
        onConfirm={ejecutarDesactivar}
        loading={confirm.loading}
        title="¿Desactivar área?"
        description={`El área "${confirm.area?.nombre}" quedará inactiva y no podrá recibir nuevos expedientes.`}
        confirmLabel="Desactivar"
        variant="destructive"
      />
    </div>
  )
}
