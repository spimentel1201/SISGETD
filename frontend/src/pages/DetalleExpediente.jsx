import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { useExpedienteStore } from "@/store/expedienteStore"
import PdfViewer from "@/components/PdfViewer"
import { ArrowLeft, Calendar, User, CheckCircle, Building2, Bot } from "lucide-react"

const ESTADO_VARIANT = {
  ingresado: "info", en_validacion: "warning", derivado: "secondary",
  en_evaluacion: "info", resuelto: "success", archivado: "secondary",
}

export default function DetalleExpediente() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { fetchExpediente, updateExpedienteEstado, loading } = useExpedienteStore()
  const [exp, setExp] = useState(null)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    fetchExpediente(id).then(setExp)
  }, [id])

  const confirmarClasificacion = async () => {
    setConfirmando(true)
    try {
      const updated = await updateExpedienteEstado(id, {
        nuevo_estado: "derivado",
        observacion: "Clasificación IA confirmada por operador.",
      })
      setExp(updated)
      toast.success("Clasificación confirmada. Expediente derivado.")
    } catch {
      toast.error("Error al confirmar la clasificación.")
    } finally {
      setConfirmando(false)
    }
  }

  if (loading || !exp) return <div className="text-sm text-muted-foreground p-8">Cargando expediente...</div>

  const confianza = Math.round((exp.ia_confianza || 0) * 100)

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Detalle de Trámite</p>
          <h1 className="text-xl font-bold">Expediente N° {exp.numero_expediente}</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {exp.fecha_ingreso ? new Date(exp.fecha_ingreso).toLocaleDateString("es-PE") : "—"}
          <User className="h-4 w-4 ml-2" />
          {exp.ciudadano?.nombre || "—"}
        </div>
        <Badge variant={ESTADO_VARIANT[exp.estado] || "secondary"} className="uppercase text-xs">
          {exp.estado?.replace(/_/g, " ")}
        </Badge>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={confirmarClasificacion}
          disabled={confirmando || exp.estado === "resuelto" || exp.estado === "archivado"}
        >
          <CheckCircle className="h-3.5 w-3.5" />
          {confirmando ? "Confirmando..." : "Confirmar Clasificación"}
        </Button>
      </div>

      <div className="grid grid-cols-5 gap-4" style={{ height: "calc(100vh - 220px)" }}>
        {/* Panel IA */}
        <div className="col-span-2 space-y-4 overflow-y-auto">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Bot className="h-4 w-4" />Clasificación Sugerida
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground">Confianza de IA</p>
                <p className="text-4xl font-bold mt-1">{confianza}%</p>
                <Progress value={confianza} className="mt-2 h-1.5" />
              </div>

              <Separator />

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Tipo TUPA Sugerido</p>
                <div className="border rounded-md px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-medium">{exp.TupaProcedimiento?.nombre_tramite || "Sin clasificar"}</span>
                  <Bot className="h-4 w-4 text-muted-foreground" />
                </div>
                {exp.TupaProcedimiento && (
                  <p className="text-xs text-muted-foreground mt-1">Código: {exp.TupaProcedimiento.codigo_tupa}</p>
                )}
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Área Destino Recomendada</p>
                <div className="border rounded-md px-3 py-2 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm">{exp.area_asignada?.nombre || "Sin asignar"}</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-1.5">Score de Prioridad</p>
                <div className="flex items-center gap-2">
                  <Progress value={exp.score_prioridad || 0} className="flex-1 h-2" />
                  <span className="text-sm font-semibold">{Math.round(exp.score_prioridad || 0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historial */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Historial de Estados</CardTitle>
            </CardHeader>
            <CardContent>
              {exp.historial?.length > 0 ? (
                <div className="space-y-3">
                  {exp.historial.map((h, i) => (
                    <div key={h.id || i} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className="h-2 w-2 rounded-full bg-primary mt-0.5 shrink-0" />
                        {i < exp.historial.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3">
                        <p className="font-medium capitalize">{h.estado_nuevo?.replace(/_/g, " ")}</p>
                        <p className="text-muted-foreground">
                          {h.fecha ? new Date(h.fecha).toLocaleString("es-PE") : "—"}
                          {h.actor && ` · ${h.actor.nombre}`}
                        </p>
                        {h.observacion && <p className="text-muted-foreground mt-0.5 italic">{h.observacion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Sin historial.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Visor PDF */}
        <Card className="col-span-3 overflow-hidden flex flex-col">
          <PdfViewer archivoUrl={exp.archivo_url} />
        </Card>
      </div>
    </div>
  )
}
