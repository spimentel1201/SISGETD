import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import api from "@/lib/api"
import {
  FileUp, CheckCircle, ShieldCheck, Zap, Globe,
  Search, Clock, Building2, FileText, BookOpen, HelpCircle, Phone,
} from "lucide-react"

// ─── Formulario de nuevo trámite ────────────────────────────────────────────
function FormNuevoTramite() {
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [tupas, setTupas] = useState([])
  const [tupaId, setTupaId] = useState("")
  const [submitted, setSubmitted] = useState(null)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

  useEffect(() => {
    api.get("/tupa", { params: { activos: "true" } })
      .then(({ data }) => setTupas(data))
      .catch(() => {})
  }, [])

  const validateFile = (f) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(f.type)) return alert("Solo PDF, JPEG o PNG.")
    if (f.size > 20 * 1024 * 1024) return alert("Máximo 20 MB.")
    setFile(f)
  }

  const onSubmit = async (data) => {
    if (!file) return alert("Adjunte el documento principal.")
    if (!tupaId) return alert("Seleccione el tipo de trámite.")
    const fd = new FormData()
    fd.append("tupa_id", tupaId)
    fd.append("asunto", data.asunto)
    fd.append("nombre", data.nombre)
    fd.append("dni", data.dni)
    fd.append("email", data.email)
    fd.append("archivo", file)
    try {
      const { data: res } = await api.post("/expedientes/publico", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      setSubmitted(res)
    } catch (e) {
      alert(e?.response?.data?.message || "Error al enviar. Intente nuevamente.")
    }
  }

  if (submitted) {
    return (
      <div className="text-center space-y-5 py-6">
        <CheckCircle className="h-14 w-14 text-emerald-600 mx-auto" />
        <div>
          <h3 className="text-xl font-semibold">Trámite recibido</h3>
          <p className="text-sm text-muted-foreground mt-1">Su expediente ha sido registrado exitosamente.</p>
        </div>
        <div className="border rounded-xl p-5 bg-muted/30 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Número de expediente</p>
          <p className="text-3xl font-bold">{submitted.numero_expediente}</p>
          <p className="text-xs text-muted-foreground mt-2">Guarde este número para hacer seguimiento de su trámite.</p>
        </div>
        <Button variant="outline" className="w-full" onClick={() => setSubmitted(null)}>
          Registrar otro trámite
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Datos del solicitante */}
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-3">Datos del Solicitante</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Nombre completo <span className="text-destructive">*</span></Label>
            <Input placeholder="Juan Pérez" {...register("nombre", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">DNI / RUC <span className="text-destructive">*</span></Label>
            <Input placeholder="00000000" maxLength={11} {...register("dni", { required: true, minLength: 8 })} />
            {errors.dni && <p className="text-xs text-destructive">Mínimo 8 dígitos.</p>}
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-xs">Correo electrónico <span className="text-destructive">*</span></Label>
            <Input type="email" placeholder="usuario@ejemplo.com" {...register("email", { required: true })} />
          </div>
        </div>
      </div>

      <Separator />

      {/* Tipo de trámite */}
      <div className="space-y-1.5">
        <Label className="text-xs">Tipo de trámite (TUPA) <span className="text-destructive">*</span></Label>
        <Select onValueChange={setTupaId}>
          <SelectTrigger>
            <SelectValue placeholder="Seleccione el procedimiento..." />
          </SelectTrigger>
          <SelectContent>
            {tupas.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.codigo_tupa} — {t.nombre_tramite}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Asunto */}
      <div className="space-y-1.5">
        <Label className="text-xs">Asunto / Sumilla <span className="text-destructive">*</span></Label>
        <Textarea
          placeholder="Describa brevemente el motivo de su trámite (mínimo 20 caracteres)..."
          className="min-h-[80px]"
          {...register("asunto", { required: true, minLength: 20 })}
        />
        {errors.asunto && <p className="text-xs text-destructive">Mínimo 20 caracteres.</p>}
      </div>

      {/* Archivo */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); validateFile(e.dataTransfer.files[0]) }}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}
      >
        <FileUp className="h-7 w-7 mx-auto text-muted-foreground mb-2" />
        {file
          ? <p className="text-sm font-medium">{file.name}</p>
          : <><p className="text-sm text-muted-foreground">Arrastre el archivo o haga clic</p><p className="text-xs text-muted-foreground mt-1">PDF, JPEG o PNG · Máx. 20 MB</p></>
        }
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => validateFile(e.target.files[0])} />
      </div>

      {/* Declaración */}
      <div className="flex items-start gap-2">
        <input type="checkbox" id="decl" required className="mt-0.5 cursor-pointer" />
        <label htmlFor="decl" className="text-xs text-muted-foreground cursor-pointer">
          Declaro bajo juramento que los datos consignados son verídicos y acepto los <a href="#" className="underline">términos de uso</a>.
        </label>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Enviando..." : "PRESENTAR SOLICITUD FORMAL →"}
      </Button>
    </form>
  )
}

// ─── Formulario de seguimiento ───────────────────────────────────────────────
function FormSeguimiento() {
  const { register, handleSubmit } = useForm()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const onSubmit = async ({ numero, dni }) => {
    setLoading(true); setError(""); setResult(null)
    try {
      const { data } = await api.get(`/expedientes/${numero}/estado`, { params: { dni } })
      setResult(data)
    } catch {
      setError("No se encontró el expediente. Verifique los datos ingresados.")
    } finally {
      setLoading(false)
    }
  }

  const ESTADO_LABEL = {
    ingresado: "Ingresado", en_validacion: "En Validación", derivado: "Derivado",
    en_evaluacion: "En Evaluación", resuelto: "Resuelto", archivado: "Archivado",
  }
  const ESTADO_COLOR = {
    ingresado: "info", en_validacion: "warning", derivado: "secondary",
    en_evaluacion: "info", resuelto: "success", archivado: "secondary",
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Número de expediente <span className="text-destructive">*</span></Label>
          <Input placeholder="EXP-2025-0001" {...register("numero", { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">DNI del titular <span className="text-destructive">*</span></Label>
          <Input placeholder="00000000" maxLength={11} {...register("dni", { required: true })} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Consultando..." : <><Search className="h-4 w-4 mr-2" />CONSULTAR ESTADO</>}
        </Button>
      </form>

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      {result && (
        <div className="border rounded-xl overflow-hidden">
          <div className="p-4 bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Expediente</p>
              <p className="font-bold">{result.numero_expediente}</p>
            </div>
            <Badge variant={ESTADO_COLOR[result.estado] || "secondary"} className="uppercase text-xs">
              {ESTADO_LABEL[result.estado] || result.estado}
            </Badge>
          </div>

          <div className="p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Área:</span>
              <span className="font-medium">{result.area_asignada?.nombre || "En proceso de asignación"}</span>
            </div>
            {result.fecha_limite && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-muted-foreground">Fecha límite:</span>
                <span className="font-medium">{new Date(result.fecha_limite).toLocaleDateString("es-PE", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
            )}

            {result.historial?.length > 0 && (
              <div className="mt-3">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-2">Línea de tiempo</p>
                <div className="space-y-0">
                  {result.historial.map((h, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`h-2.5 w-2.5 rounded-full mt-1 shrink-0 ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />
                        {i < result.historial.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                      </div>
                      <div className="pb-3">
                        <p className="text-sm font-medium capitalize">{h.estado_nuevo?.replace(/_/g, " ")}</p>
                        <p className="text-xs text-muted-foreground">
                          {h.fecha ? new Date(h.fecha).toLocaleString("es-PE") : "—"}
                        </p>
                        {h.observacion && <p className="text-xs text-muted-foreground italic mt-0.5">{h.observacion}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Portal principal ────────────────────────────────────────────────────────
export default function Portal() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      {/* Navbar */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div>
            <span className="font-bold text-sm tracking-wide">SGDML</span>
            <span className="text-xs text-muted-foreground ml-2">Municipalidad Provincial de Yau</span>
          </div>
          <Button size="sm" onClick={() => navigate("/login")}>
            Acceso Institucional →
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <Badge variant="secondary" className="text-xs">Portal Ciudadano Digital</Badge>
            <h1 className="text-4xl font-bold leading-tight">
              Gestión Documental<br />Municipal en línea
            </h1>
            <p className="text-muted-foreground">
              Presente sus trámites y consulte el estado de sus expedientes sin necesidad de acudir presencialmente a la municipalidad.
            </p>
            <div className="flex gap-3 pt-2">
              {[
                { icon: ShieldCheck, text: "Seguridad jurídica" },
                { icon: Zap, text: "Respuesta inmediata" },
                { icon: Globe, text: "Transparencia total" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon className="h-3.5 w-3.5" />{text}
                </div>
              ))}
            </div>
          </div>

          {/* Panel de acción */}
          <Card className="shadow-lg">
            <CardContent className="pt-6">
              <Tabs defaultValue="nuevo">
                <TabsList className="w-full mb-5">
                  <TabsTrigger value="nuevo" className="flex-1 text-xs gap-1.5">
                    <FileUp className="h-3.5 w-3.5" />Nuevo Trámite
                  </TabsTrigger>
                  <TabsTrigger value="seguimiento" className="flex-1 text-xs gap-1.5">
                    <Search className="h-3.5 w-3.5" />Seguimiento
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="nuevo">
                  <FormNuevoTramite />
                </TabsContent>
                <TabsContent value="seguimiento">
                  <FormSeguimiento />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-3 gap-8">
        {[
          {
            icon: FileText,
            title: "Trámites en línea",
            desc: "Presente sus documentos digitalmente. El sistema los procesa automáticamente con inteligencia artificial.",
          },
          {
            icon: Clock,
            title: "Seguimiento en tiempo real",
            desc: "Consulte el estado de su expediente en cualquier momento usando su número de trámite y DNI.",
          },
          {
            icon: ShieldCheck,
            title: "Cumplimiento normativo",
            desc: "Todos los procesos cumplen con la Ley N° 27444 y el DS N° 115-2025-PCM sobre gestión documental.",
          },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="space-y-3">
            <div className="h-10 w-10 rounded-lg bg-foreground flex items-center justify-center">
              <Icon className="h-5 w-5 text-background" />
            </div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </section>

      {/* Info adicional */}
      <section className="border-t bg-card">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-8 text-sm">
          <div className="space-y-2">
            <p className="font-semibold">¿Necesita ayuda?</p>
            <div className="space-y-1 text-muted-foreground">
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground cursor-pointer"><HelpCircle className="h-3.5 w-3.5" />Guía de usuario</a>
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground cursor-pointer"><BookOpen className="h-3.5 w-3.5" />Preguntas frecuentes</a>
              <a href="#" className="flex items-center gap-1.5 hover:text-foreground cursor-pointer"><Phone className="h-3.5 w-3.5" />Llamar al 0-800-1234</a>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Horario de atención</p>
            <p className="text-muted-foreground">Lunes a Viernes<br />8:00 am — 4:30 pm</p>
            <p className="text-xs text-muted-foreground">El portal digital está disponible las 24 horas.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Marco normativo</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Ley N° 27444 — Procedimiento Administrativo</p>
              <p>Ley N° 29733 — Protección de Datos</p>
              <p>DS N° 115-2025-PCM — Gestión Documental</p>
              <p>DS N° 098-2025-PCM — Firma Digital</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t px-6 py-4 text-xs text-muted-foreground flex justify-between items-center">
        <span>© 2025 Municipalidad Provincial de Yau. Todos los derechos reservados.</span>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Aviso Legal</a>
          <a href="#" className="hover:underline">Privacidad</a>
          <a href="#" className="hover:underline">Accesibilidad</a>
        </div>
      </footer>
    </div>
  )
}
