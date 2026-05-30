import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useExpedienteStore } from "@/store/expedienteStore"
import PdfViewer from "@/components/PdfViewer"
import { ArrowLeft, Calendar, User, ShieldCheck } from "lucide-react"

const CONCLUSIONES = [
  { value: "resuelto", label: "PROCEDENTE — Cumple con todos los requisitos técnicos", color: "text-emerald-700" },
  { value: "observado", label: "OBSERVADO — Requiere subsanación por parte del administrado", color: "text-amber-700" },
  { value: "denegado", label: "IMPROCEDENTE — No cumple con el marco normativo", color: "text-destructive" },
]

export default function EvaluacionExpediente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchExpediente, updateExpedienteEstado, loading } = useExpedienteStore()
  const [exp, setExp] = useState(null)
  const [conclusion, setConclusion] = useState("")
  const { register, handleSubmit, formState: { isSubmitting } } = useForm()

  useEffect(() => {
    fetchExpediente(id).then(setExp)
  }, [id])

  const guardarBorrador = handleSubmit(async (data) => {
    await updateExpedienteEstado(id, { observacion: `[BORRADOR] ${data.informe}` })
    alert("Borrador guardado.")
  })

  const emitirResolucion = handleSubmit(async (data) => {
    if (!conclusion) return alert("Seleccione una conclusión.")
    await updateExpedienteEstado(id, {
      nuevo_estado: conclusion === "resuelto" ? "resuelto" : "en_evaluacion",
      observacion: data.informe,
    })
    navigate("/expedientes")
  })

  if (loading || !exp) return <div className="text-sm text-muted-foreground p-8">Cargando...</div>

  const confianza = Math.round((exp.ia_confianza || 0) * 100)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Detalle de Trámite</p>
          <h1 className="text-xl font-bold">Expediente N° {exp.numero_expediente}</h1>
        </div>
        <Badge variant="outline" className="gap-1.5 text-xs">
          <Calendar className="h-3 w-3" />
          {exp.fecha_ingreso ? new Date(exp.fecha_ingreso).toLocaleDateString("es-PE") : "—"}
        </Badge>
        <Badge variant="outline" className="gap-1.5 text-xs">
          <User className="h-3 w-3" />
          {exp.ciudadano?.nombre || "—"}
        </Badge>
      </div>

      <div className="grid grid-cols-5 gap-4" style={{ height: "calc(100vh - 200px)" }}>
        {/* Visor PDF */}
        <Card className="col-span-3 overflow-hidden flex flex-col">
          <PdfViewer archivoUrl={exp.archivo_url} />
        </Card>

        {/* Panel evaluación */}
        <div className="col-span-2 space-y-3 overflow-y-auto">
          <Card>
            <CardContent className="py-3 flex items-center gap-3">
              <span className="text-2xl font-bold">{confianza}%</span>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Sugerencia de Clasificación</p>
                <p className="text-sm font-medium">{exp.TupaProcedimiento?.nombre_tramite || "Sin clasificar"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Análisis del Gerente o Encargado</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ingrese el análisis técnico detallado del expediente..."
                className="min-h-[100px] text-sm"
                {...register("informe")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Conclusión del Informe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {CONCLUSIONES.map((c) => (
                <label key={c.value} className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="radio"
                    name="conclusion"
                    value={c.value}
                    checked={conclusion === c.value}
                    onChange={() => setConclusion(c.value)}
                    className="cursor-pointer"
                  />
                  <span className={`text-xs font-medium ${c.color}`}>{c.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">Validaciones Externas</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-3">
              <div className="flex-1 border rounded-md p-2 text-center">
                <p className="text-xs text-muted-foreground">Consulta RENIEC</p>
                <Badge variant="success" className="mt-1 text-[10px]">VERIFICADO</Badge>
              </div>
              <div className="flex-1 border rounded-md p-2 text-center">
                <p className="text-xs text-muted-foreground">Antecedentes Penales</p>
                <Badge variant="secondary" className="mt-1 text-[10px]">SIN REGISTRO</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-foreground text-background">
            <CardContent className="py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Firma Digital Requerida</p>
                  <p className="text-xs opacity-70">DS N° 098-2025-PCM · Certificado vigente</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="bg-transparent border-background/30 text-background hover:bg-background/10 text-xs shrink-0">
                VALIDAR IDENTIDAD
              </Button>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button className="flex-1" onClick={emitirResolucion} disabled={isSubmitting}>
              EMITIR RESOLUCIÓN FINAL
            </Button>
            <Button variant="secondary" className="flex-1" onClick={guardarBorrador} disabled={isSubmitting}>
              GUARDAR BORRADOR
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
