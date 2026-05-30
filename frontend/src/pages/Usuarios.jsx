import { useEffect, useState, useMemo } from "react"
import { useForm } from "react-hook-form"
import toast from "react-hot-toast"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useAreaStore } from "@/store/areaStore"
import {
  Search, Pencil, UserX, UserCheck, Users, Plus,
  Mail, Building2, Shield, Calendar, ArrowLeft,
} from "lucide-react"
import api from "@/lib/api"

const ROL_VARIANT = { admin: "destructive", funcionario: "info", ciudadano: "secondary" }
const ROL_LABEL = { admin: "Admin", funcionario: "Funcionario", ciudadano: "Ciudadano" }

function initials(nombre) {
  return (nombre || "?").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
}

// ─── Dialog crear/editar ─────────────────────────────────────────────────────
function UsuarioDialog({ open, onClose, usuario, areas, onSaved }) {
  const isEdit = !!usuario
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm()
  const [rol, setRol] = useState("ciudadano")
  const [areaId, setAreaId] = useState("")

  useEffect(() => {
    if (!open) return
    if (usuario) {
      reset({ nombre: usuario.nombre, email: usuario.email, dni: usuario.dni })
      setRol(usuario.rol || "ciudadano")
      setAreaId(usuario.Area?.id || usuario.area_id || "")
    } else {
      reset({ nombre: "", email: "", dni: "", password: "" })
      setRol("ciudadano")
      setAreaId("")
    }
  }, [open, usuario])

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await api.put(`/usuarios/${usuario.id}`, {
          nombre: data.nombre,
          email: data.email,
          rol,
          area_id: rol !== "ciudadano" ? (areaId || null) : null,
        })
        toast.success("Usuario actualizado correctamente.")
      } else {
        await api.post("/auth/register", {
          ...data,
          rol,
          area_id: rol !== "ciudadano" ? (areaId || null) : null,
        })
        toast.success("Usuario creado correctamente.")
      }
      onSaved()
      onClose()
    } catch (e) {
      toast.error(e?.response?.data?.message || e?.response?.data?.error || "Error al guardar.")
    }
  }

  // Área solo para funcionario y admin
  const showArea = rol === "funcionario" || rol === "admin"

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuario" : "Nuevo Usuario"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos del usuario." : "Complete los campos para registrar un nuevo usuario."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label>Nombre completo <span className="text-destructive">*</span></Label>
            <Input placeholder="Ej. Juan Pérez" {...register("nombre", { required: true })} />
            {errors.nombre && <p className="text-xs text-destructive">Campo obligatorio.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>DNI / RUC <span className="text-destructive">*</span></Label>
              <Input
                placeholder="00000000"
                maxLength={11}
                disabled={isEdit}
                {...register("dni", { required: true, minLength: 8 })}
              />
              {errors.dni && <p className="text-xs text-destructive">Mínimo 8 dígitos.</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Rol <span className="text-destructive">*</span></Label>
              <Select value={rol} onValueChange={setRol}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ciudadano">Ciudadano</SelectItem>
                  <SelectItem value="funcionario">Funcionario</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Correo electrónico <span className="text-destructive">*</span></Label>
            <Input type="email" placeholder="usuario@muni.gob.pe" {...register("email", { required: true })} />
            {errors.email && <p className="text-xs text-destructive">Email inválido.</p>}
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <Label>Contraseña <span className="text-destructive">*</span></Label>
              <Input type="password" placeholder="Mínimo 8 caracteres" {...register("password", { required: !isEdit, minLength: 8 })} />
              {errors.password && <p className="text-xs text-destructive">Mínimo 8 caracteres.</p>}
            </div>
          )}

          {/* Área solo para funcionario/admin */}
          {showArea && (
            <div className="space-y-1.5">
              <Label>Área asignada</Label>
              <Select value={areaId} onValueChange={setAreaId}>
                <SelectTrigger><SelectValue placeholder="Sin área" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin área</SelectItem>
                  {areas.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {rol === "funcionario"
                  ? "El funcionario solo verá expedientes de esta área."
                  : "Área de referencia para el administrador."}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : isEdit ? "Guardar Cambios" : "Crear Usuario"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ─── Panel de detalle ────────────────────────────────────────────────────────
function UsuarioDetalle({ usuario, onBack, onEdit, onToggle }) {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Perfil de Usuario</h2>
          <p className="text-xs text-muted-foreground">Información detallada de la cuenta.</p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-5">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-xl font-bold">{initials(usuario.nombre)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{usuario.nombre}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={ROL_VARIANT[usuario.rol] || "secondary"} className="text-xs">
                      {ROL_LABEL[usuario.rol] || usuario.rol}
                    </Badge>
                    {usuario.es_activo
                      ? <Badge variant="success" className="text-xs">Activo</Badge>
                      : <Badge variant="secondary" className="text-xs">Inactivo</Badge>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={onEdit}>
                    <Pencil className="h-3.5 w-3.5" />Editar
                  </Button>
                  <Button
                    size="sm"
                    variant={usuario.es_activo ? "destructive" : "outline"}
                    className="gap-1.5"
                    onClick={onToggle}
                  >
                    {usuario.es_activo
                      ? <><UserX className="h-3.5 w-3.5" />Desactivar</>
                      : <><UserCheck className="h-3.5 w-3.5" />Reactivar</>}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-5" />

          <div className="grid grid-cols-2 gap-5 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Correo electrónico</p>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{usuario.email}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">DNI / RUC</p>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono">{usuario.dni}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Área asignada</p>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{usuario.Area?.nombre || "Sin área asignada"}</span>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Fecha de registro</p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{usuario.created_at ? new Date(usuario.created_at).toLocaleDateString("es-PE") : "—"}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [rolFiltro, setRolFiltro] = useState("todos")
  const [estadoFiltro, setEstadoFiltro] = useState("activos")
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [usuarioEditar, setUsuarioEditar] = useState(null)
  const [usuarioDetalle, setUsuarioDetalle] = useState(null)
  // Confirm dialog state
  const [confirm, setConfirm] = useState({ open: false, usuario: null, loading: false })
  const { areas, fetchAreas } = useAreaStore()
  const perPage = 10

  const cargar = () => {
    setLoading(true)
    api.get("/usuarios")
      .then(({ data }) => setUsuarios(data))
      .catch(() => toast.error("Error al cargar usuarios."))
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar(); fetchAreas(true) }, [])

  const filtrados = useMemo(() => {
    return usuarios.filter((u) => {
      const matchRol = rolFiltro === "todos" || u.rol === rolFiltro
      const matchEstado =
        estadoFiltro === "todos" ||
        (estadoFiltro === "activos" && u.es_activo) ||
        (estadoFiltro === "inactivos" && !u.es_activo)
      const matchSearch = !search ||
        u.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()) ||
        u.dni?.includes(search)
      return matchRol && matchEstado && matchSearch
    })
  }, [usuarios, rolFiltro, estadoFiltro, search])

  const totalPages = Math.max(1, Math.ceil(filtrados.length / perPage))
  const paginados = filtrados.slice((page - 1) * perPage, page * perPage)

  // Abrir confirm para toggle estado
  const pedirConfirmToggle = (u) => setConfirm({ open: true, usuario: u, loading: false })

  const ejecutarToggle = async () => {
    const u = confirm.usuario
    setConfirm((c) => ({ ...c, loading: true }))
    try {
      const accion = u.es_activo ? "desactivar" : "reactivar"
      await api.patch(`/usuarios/${u.id}/${accion}`)
      toast.success(`Usuario ${u.es_activo ? "desactivado" : "reactivado"} correctamente.`)
      cargar()
      if (usuarioDetalle?.id === u.id) setUsuarioDetalle(null)
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error al cambiar estado.")
    } finally {
      setConfirm({ open: false, usuario: null, loading: false })
    }
  }

  const abrirEditar = (u) => { setUsuarioEditar(u); setDialogOpen(true) }
  const abrirNuevo = () => { setUsuarioEditar(null); setDialogOpen(true) }

  // Vista detalle
  if (usuarioDetalle) {
    return (
      <>
        <UsuarioDetalle
          usuario={usuarioDetalle}
          onBack={() => setUsuarioDetalle(null)}
          onEdit={() => abrirEditar(usuarioDetalle)}
          onToggle={() => pedirConfirmToggle(usuarioDetalle)}
        />
        <UsuarioDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          usuario={usuarioEditar}
          areas={areas}
          onSaved={() => { cargar(); setUsuarioDetalle(null) }}
        />
        <ConfirmDialog
          open={confirm.open}
          onClose={() => setConfirm({ open: false, usuario: null, loading: false })}
          onConfirm={ejecutarToggle}
          loading={confirm.loading}
          title={confirm.usuario?.es_activo ? "¿Desactivar usuario?" : "¿Reactivar usuario?"}
          description={`Esta acción ${confirm.usuario?.es_activo ? "impedirá el acceso de" : "restaurará el acceso de"} "${confirm.usuario?.nombre}".`}
          confirmLabel={confirm.usuario?.es_activo ? "Desactivar" : "Reactivar"}
          variant={confirm.usuario?.es_activo ? "destructive" : "default"}
        />
      </>
    )
  }

  const totalActivos = usuarios.filter((u) => u.es_activo).length
  const totalFuncionarios = usuarios.filter((u) => u.rol === "funcionario").length
  const totalAdmin = usuarios.filter((u) => u.rol === "admin").length

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-1">Administración de cuentas, roles y asignaciones del sistema.</p>
        </div>
        <Button className="gap-1.5" onClick={abrirNuevo}>
          <Plus className="h-4 w-4" />Nuevo Usuario
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total usuarios", value: usuarios.length, icon: Users },
          { label: "Activos", value: totalActivos, icon: UserCheck },
          { label: "Funcionarios", value: totalFuncionarios, icon: Building2 },
          { label: "Administradores", value: totalAdmin, icon: Shield },
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
        {/* Filtros */}
        <div className="flex items-end gap-3 p-4 border-b flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, email o DNI..."
              className="pl-8 h-8 text-xs"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <div className="space-y-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Rol</p>
            <Select value={rolFiltro} onValueChange={(v) => { setRolFiltro(v); setPage(1) }}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos" className="text-xs">Todos los roles</SelectItem>
                <SelectItem value="admin" className="text-xs">Admin</SelectItem>
                <SelectItem value="funcionario" className="text-xs">Funcionario</SelectItem>
                <SelectItem value="ciudadano" className="text-xs">Ciudadano</SelectItem>
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
        </div>

        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                {["Usuario", "Email", "DNI", "Rol", "Área", "Estado", "Acciones"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Cargando...</td></tr>
              ) : paginados.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sin resultados.</td></tr>
              ) : paginados.map((u) => (
                <tr key={u.id} className="border-b hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setUsuarioDetalle(u)}>
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className="text-xs">{initials(u.nombre)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium hover:underline">{u.nombre}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{u.email}</td>
                  <td className="px-4 py-3 font-mono text-xs">{u.dni}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ROL_VARIANT[u.rol] || "secondary"} className="text-[10px]">
                      {ROL_LABEL[u.rol] || u.rol}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{u.Area?.nombre || "—"}</td>
                  <td className="px-4 py-3">
                    {u.es_activo
                      ? <Badge variant="success" className="text-[10px]">Activo</Badge>
                      : <Badge variant="secondary" className="text-[10px]">Inactivo</Badge>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 cursor-pointer" onClick={() => abrirEditar(u)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-7 w-7 cursor-pointer ${u.es_activo ? "hover:text-destructive" : "hover:text-emerald-600"}`}
                        onClick={() => pedirConfirmToggle(u)}
                        title={u.es_activo ? "Desactivar" : "Reactivar"}
                      >
                        {u.es_activo ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-between px-4 py-3 border-t text-xs text-muted-foreground">
            <span>
              Mostrando {filtrados.length === 0 ? 0 : (page - 1) * perPage + 1}–{Math.min(page * perPage, filtrados.length)} de {filtrados.length} usuarios
            </span>
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

      <UsuarioDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        usuario={usuarioEditar}
        areas={areas}
        onSaved={cargar}
      />

      <ConfirmDialog
        open={confirm.open}
        onClose={() => setConfirm({ open: false, usuario: null, loading: false })}
        onConfirm={ejecutarToggle}
        loading={confirm.loading}
        title={confirm.usuario?.es_activo ? "¿Desactivar usuario?" : "¿Reactivar usuario?"}
        description={`Esta acción ${confirm.usuario?.es_activo ? "impedirá el acceso de" : "restaurará el acceso de"} "${confirm.usuario?.nombre}".`}
        confirmLabel={confirm.usuario?.es_activo ? "Desactivar" : "Reactivar"}
        variant={confirm.usuario?.es_activo ? "destructive" : "default"}
      />
    </div>
  )
}
