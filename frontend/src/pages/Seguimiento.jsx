import { useState } from "react"
import { useForm } from "react-hook-form"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useExpedienteStore } from "@/store/expedienteStore"
import { ShieldCheck, Zap, Globe, Phone, FileText, BookOpen, HelpCircle } from "lucide-react"

const ESTADO_COLORS = {
  ingresado: "info",
  en_validacion: "warning",
  derivado: "info",
  en_evaluacion: "warning",
  resuelto: "success",
  archivado: "secondary",
}

function Timeline({ historial }) {
  return (
    <div className="space-y-0">
      {historial.map((item, i) => (
        <div key={item.id || i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`h-3 w-3 rounded-full border-2 mt-1 shrink-0 ${item.estado_nuevo === historial[0]?.estado_nuevo ? "border-primary bg-primary" : "border-muted-foreground bg-background"}`} />
            {i < historial.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
          </div>
          <div className="pb-6 flex-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold capitalize">{item.estado_nuevo?.replace(/_/g, " ")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Área responsable: {item.area || "—"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{item.fecha ? new Date(item.fecha).toLocaleDateString("es-PE") : "—"}</p>
                <Badge variant={item.estado_nuevo === historial[0]?.estado_nuevo ? "info" : "secondary"} className="mt-1 text-[10px]">
                  {item.estado_nuevo === historial[0]?.estado_nuevo ? "ACTIVO" : "COMPLETADO"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function Seguimiento() {
  const { trackExpediente } = useExpedienteStore()
  const { register, handleSubmit } = useForm()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async ({ numero, dni }) => {
    setLoading(true)
    setError("")
    try {
      const data = await trackExpediente(numero, dni)
      setResult(data)
    } catch {
      setError("No se encontró el expediente. Verifique los datos ingresados.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Navbar público */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <span className="font-semibold text-sm">Gestoría Ciudadana</span>
        <nav className="flex gap-6 text-sm text-muted-foreground">
          <a href="#" className="hover:text-foreground cursor-pointer">Inicio</a>
          <a href="#" className="font-medium text-foreground border-b-2 border-foreground pb-0.5 cursor-pointer">Trámites</a>
          <a href="#" className="hover:text-foreground cursor-pointer">Consulta</a>
          <a href="#" className="hover:text-foreground cursor-pointer">Sedes</a>
        </nav>
        <Button size="sm">Acceso</Button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <h1 className="text-4xl font-bold">Seguimiento de Trámites</h1>
        <p className="text-muted-foreground">Consulte el estado de su trámite de forma inmediata ingresando sus datos.</p>

        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="flex gap-0">
              <div className="flex-1 border-r">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-1">Número de Expediente</p>
                <Input
                  placeholder="EXP-2025-0000"
                  className="border-0 shadow-none focus-visible:ring-0 rounded-none"
                  {...register("numero", { required: true })}
                />
              </div>
              <div className="flex-1 border-r">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground px-3 pt-1">Documento (DNI/RUC)</p>
                <Input
                  placeholder="00000000"
                  className="border-0 shadow-none focus-visible:ring-0 rounded-none"
                  {...register("dni", { required: true })}
                />
              </div>
              <Button type="submit" className="rounded-l-none h-auto px-6" disabled={loading}>
                {loading ? "..." : "CONSULTAR →"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex gap-3 justify-center">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <HelpCircle className="h-3.5 w-3.5" />¿Cómo encuentro mi número?
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <Phone className="h-3.5 w-3.5" />Asistencia Virtual
          </Button>
        </div>
      </div>

      {/* Resultado */}
      {result && (
        <div className="max-w-3xl mx-auto px-4 pb-16">
          <div className="border rounded-lg bg-card overflow-hidden">
            <div className="p-6 flex justify-between items-start border-b">
              <div>
                <h2 className="text-xl font-semibold">Detalle de Seguimiento</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Expediente: <span className="font-medium text-foreground">{result.numero_expediente}</span></p>
              </div>
              <div className="flex gap-2">
                <Badge variant={ESTADO_COLORS[result.estado] || "secondary"} className="uppercase text-xs">
                  {result.estado?.replace(/_/g, " ")}
                </Badge>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                  <FileText className="h-3.5 w-3.5" />Descargar Cargo Digital
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-0">
              <div className="col-span-2 p-6 border-r">
                <h3 className="text-sm font-semibold mb-4">Línea de Tiempo del Trámite</h3>
                {result.historial?.length > 0 ? (
                  <Timeline historial={result.historial} />
                ) : (
                  <p className="text-sm text-muted-foreground">Sin historial disponible.</p>
                )}
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Información del Estado Actual</p>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Ubicación actual</p>
                      <p className="font-medium mt-0.5">{result.area_asignada?.nombre || "—"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-[10px] uppercase text-muted-foreground">Fecha estimada de resolución</p>
                      <p className="font-medium mt-0.5">
                        {result.fecha_limite ? new Date(result.fecha_limite).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-1.5">
                      <p className="text-[10px] uppercase text-muted-foreground">Enlaces de interés</p>
                      <a href="#" className="flex items-center gap-1.5 text-xs hover:underline cursor-pointer"><FileText className="h-3 w-3" />Ver Anexos Públicos</a>
                      <a href="#" className="flex items-center gap-1.5 text-xs hover:underline cursor-pointer"><BookOpen className="h-3 w-3" />Términos de Referencia</a>
                      <a href="#" className="flex items-center gap-1.5 text-xs hover:underline cursor-pointer"><HelpCircle className="h-3 w-3" />Solicitar Orientación</a>
                    </div>
                  </div>
                </div>

                <div className="bg-foreground text-background rounded-lg p-4 space-y-2">
                  <p className="text-sm font-semibold">¿Necesita ayuda?</p>
                  <p className="text-xs opacity-80">Si tiene dudas sobre el proceso técnico, puede contactar con nuestra central de atención ciudadana.</p>
                  <Button variant="outline" size="sm" className="w-full bg-transparent border-background/30 text-background hover:bg-background/10 text-xs">
                    Llamar al 0-800-1234
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {!result && (
        <div className="max-w-3xl mx-auto px-4 pb-16 grid grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, title: "Seguridad Jurídica", desc: "Toda la información consultada posee validez institucional y se encuentra protegida por protocolos de cifrado de grado gubernamental." },
            { icon: Zap, title: "Acceso Inmediato", desc: "Actualización en tiempo real sobre el estado de sus trámites en todas las áreas de la administración corporativa centralizada." },
            { icon: Globe, title: "Transparencia", desc: "Acceso público a la trazabilidad de procesos administrativos, garantizando el derecho a la información de los ciudadanos." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="space-y-2">
              <Icon className="h-6 w-6" />
              <h3 className="font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      )}

      <footer className="border-t bg-card px-6 py-4 text-xs text-muted-foreground flex justify-between">
        <div>
          <p className="font-semibold text-foreground">Gestoría Ciudadana</p>
          <p>© 2025 Plataforma de Gestión Pública. Institución Nacional de Transparencia.</p>
        </div>
        <div className="flex gap-4 items-center">
          <a href="#" className="hover:underline">Aviso Legal</a>
          <a href="#" className="hover:underline">Privacidad</a>
          <a href="#" className="hover:underline">Soporte Técnico</a>
          <a href="#" className="hover:underline">Mapa del Sitio</a>
        </div>
      </footer>
    </div>
  )
}
