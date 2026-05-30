import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useTupaStore } from "@/store/tupaStore"
import { useAreaStore } from "@/store/areaStore"
import { LayoutGrid, Network, Search, CheckCircle, Plus, X } from "lucide-react"
import toast from "react-hot-toast"
import api from "@/lib/api"

export default function TupaForm() {
  const { id } = useParams()          // si existe → modo edición
  const isEdit = !!id
  const navigate = useNavigate()

  const { createTupa, updateTupa } = useTupaStore()
  const { areas, fetchAreas } = useAreaStore()

  const { register, handleSubmit, setValue, watch, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { codigo_tupa: "", nombre_tramite: "", descripcion: "", dias_plazo_legal: "", tipo_silencio: "" },
  })

  const [areaSeleccionada, setAreaSeleccionada] = useState(null)
  const [areaSearch, setAreaSearch] = useState("")
  const [requisitos, setRequisitos] = useState(["Formulario de solicitud con carácter de declaración jurada", "Comprobante de pago por derecho de trámite"])
  const [nuevoReq, setNuevoReq] = useState("")
  const [tipoSilencio, setTipoSilencio] = useState("")

  useEffect(() => {
    fetchAreas(true)   // solo activas
    if (isEdit) {
      api.get(`/tupa/${id}`).then(({ data }) => {
        reset({
          codigo_tupa: data.codigo_tupa,
          nombre_tramite: data.nombre_tramite,
          descripcion: data.descripcion || "",
          dias_plazo_legal: data.dias_plazo_legal,
        })
        setTipoSilencio(data.tipo_silencio)
        setAreaSeleccionada(data.Area || null)
      })
    }
  }, [id])

  const areasFiltradas = areas.filter((a) =>
    !areaSearch || a.nombre.toLowerCase().includes(areaSearch.toLowerCase())
  )

  const agregarRequisito = () => {
    if (nuevoReq.trim()) { setRequisitos([...requisitos, nuevoReq.trim()]); setNuevoReq("") }
  }

  const quitarRequisito = (i) => setRequisitos(requisitos.filter((_, idx) => idx !== i))

  const onSubmit = async (data) => {
    if (!areaSeleccionada) return alert("Seleccione un área responsable.")
    if (!tipoSilencio) return alert("Seleccione el tipo de silencio administrativo.")

    const payload = {
      codigo_tupa: data.codigo_tupa,
      nombre_tramite: data.nombre_tramite,
      dias_plazo_legal: Number(data.dias_plazo_legal),
      tipo_silencio: tipoSilencio,
      area_responsable_id: areaSeleccionada.id,
    }

    try {
      if (isEdit) await updateTupa(id, payload)
      else await createTupa(payload)
      toast.success(isEdit ? "Procedimiento actualizado correctamente." : "Procedimiento registrado correctamente.")
      navigate("/app/tupa")
    } catch (e) {
      toast.error(e?.response?.data?.message || "Error al guardar el procedimiento.")
    }
  }

  return (
    <div className="space-y-4">
      {/* Breadcrumb */}
      <div>
        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Admin / <span className="font-semibold text-foreground">Configuración TUPA</span>
        </p>
        <h1 className="text-xl font-semibold mt-1">{isEdit ? "Editar Procedimiento TUPA" : "Registro de Nuevo Procedimiento TUPA"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Complete los campos técnicos y normativos para {isEdit ? "actualizar" : "la creación de"} un nuevo trámite administrativo en el Texto Único de Procedimientos Administrativos.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-3 gap-4">
          {/* Columna principal */}
          <div className="col-span-2 space-y-4">
            {/* Identificación */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <LayoutGrid className="h-3.5 w-3.5" />Identificación y Contenido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Código TUPA</Label>
                    <Input
                      placeholder="ej. 001-A"
                      {...register("codigo_tupa", { required: true })}
                    />
                    {errors.codigo_tupa && <p className="text-xs text-destructive">Obligatorio.</p>}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      Nombre del Trámite <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      placeholder="Ingrese el nombre oficial del procedimiento"
                      {...register("nombre_tramite", { required: true })}
                    />
                    {errors.nombre_tramite && <p className="text-xs text-destructive">Obligatorio.</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                    Descripción del Trámite (Detalle Normativo)
                  </Label>
                  <Textarea
                    placeholder="Especifique la base legal y el alcance del procedimiento administrativo..."
                    className="min-h-[90px]"
                    {...register("descripcion")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      Plazo Legal (días hábiles) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      placeholder="Ej. 30"
                      {...register("dias_plazo_legal", { required: true, min: 1 })}
                    />
                    {errors.dias_plazo_legal && <p className="text-xs text-destructive">Mínimo 1 día.</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                      Tipo de Silencio Administrativo <span className="text-destructive">*</span>
                    </Label>
                    <Select value={tipoSilencio} onValueChange={setTipoSilencio}>
                      <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="positivo">Positivo</SelectItem>
                        <SelectItem value="negativo">Negativo</SelectItem>
                        <SelectItem value="automatico">Automático</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Requisitos */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <LayoutGrid className="h-3.5 w-3.5" />Requisitos Necesarios
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs gap-1 h-7"
                    onClick={agregarRequisito}
                  >
                    <Plus className="h-3.5 w-3.5" />Añadir Requisito
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {requisitos.map((req, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                    <Input
                      value={req}
                      onChange={(e) => setRequisitos(requisitos.map((r, idx) => idx === i ? e.target.value : r))}
                      className="text-sm h-8"
                    />
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive" onClick={() => quitarRequisito(i)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground w-5 shrink-0">+</span>
                  <Input
                    placeholder="Escriba un nuevo requisito aquí..."
                    className="text-sm h-8 border-dashed"
                    value={nuevoReq}
                    onChange={(e) => setNuevoReq(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), agregarRequisito())}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Columna lateral */}
          <div className="space-y-4">
            {/* Área responsable */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Network className="h-3.5 w-3.5" />Área Responsable
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Buscar Gerencia/Subgerencia</p>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="ej. Obras públicas"
                      className="pl-8 text-xs h-8"
                      value={areaSearch}
                      onChange={(e) => setAreaSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {areasFiltradas.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => setAreaSeleccionada(a)}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer flex items-center justify-between ${
                        areaSeleccionada?.id === a.id
                          ? "bg-foreground text-background font-semibold"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      {a.nombre}
                      {areaSeleccionada?.id === a.id && <CheckCircle className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  ))}
                  {areasFiltradas.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-3">Sin resultados.</p>
                  )}
                </div>

                <Separator />

                <div className="border-l-4 border-muted-foreground/30 pl-3 py-1">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Nota Operativa</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    El área seleccionada será notificada automáticamente al registrarse el primer expediente bajo este código TUPA.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Fecha */}
            <Card>
              <CardContent className="py-4">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Fecha Registro</p>
                <p className="text-sm font-bold mt-1">
                  {new Date().toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase()}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer acciones */}
        <div className="flex justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={() => navigate("/tupa")}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : isEdit ? "Actualizar Procedimiento" : "Guardar Procedimiento"}
          </Button>
        </div>
      </form>
    </div>
  )
}
