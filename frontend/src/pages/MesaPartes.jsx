import { useState, useRef, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useExpedienteStore } from "@/store/expedienteStore"
import { useAuthStore } from "@/store/authStore"
import { useTupaStore } from "@/store/tupaStore"
import { FileUp, Info, CheckCircle } from "lucide-react"

export default function MesaPartes() {
  const { user } = useAuthStore()
  const { createExpediente } = useExpedienteStore()
  const { tupas, fetchTupas } = useTupaStore()
  const navigate = useNavigate()
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [submitted, setSubmitted] = useState(null)
  const [tupaId, setTupaId] = useState("")

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      nombre: user?.nombre || "",
      email: user?.email || "",
    },
  })

  useEffect(() => {
    fetchTupas(true) // solo activos
  }, [])

  const validateAndSetFile = (f) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"]
    if (!allowed.includes(f.type)) return toast.error("Solo se aceptan PDF, JPEG y PNG.")
    if (f.size > 20 * 1024 * 1024) return toast.error("El archivo no puede superar 20 MB.")
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) validateAndSetFile(f)
  }

  const onSubmit = async (data) => {
    if (!file) return alert("Adjunte el documento principal.")
    if (!tupaId) return alert("Seleccione el tipo de trámite.")
    if (!data.asunto || data.asunto.length < 20) return alert("El asunto debe tener mínimo 20 caracteres.")

    const fd = new FormData()
    fd.append("tupa_id", tupaId)
    fd.append("asunto", data.asunto)
    fd.append("archivo", file)

    try {
      const res = await createExpediente(fd)
      setSubmitted(res)
    } catch (e) {
      alert(e?.response?.data?.message || "Error al enviar. Intente nuevamente.")
    }
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center space-y-4">
        <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto" />
        <h2 className="text-xl font-semibold">Trámite recibido</h2>
        <p className="text-muted-foreground text-sm">Su expediente ha sido registrado exitosamente.</p>
        <div className="border rounded-lg p-4 bg-card">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Número de expediente</p>
          <p className="text-2xl font-bold mt-1">{submitted.numero_expediente}</p>
        </div>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={() => navigate("/seguimiento")}>Ver seguimiento</Button>
          <Button onClick={() => { setSubmitted(null); setFile(null); setTupaId("") }}>Nuevo trámite</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Registro de Nuevo Trámite</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete el formulario para la presentación formal de documentos ante la mesa de partes virtual.
        </p>
      </div>

      <div className="flex items-start gap-2 border rounded-md p-3 bg-blue-50 text-blue-800 text-xs">
        <Info className="h-4 w-4 shrink-0 mt-0.5" />
        <span>Para garantizar un registro preciso, asegúrese de que la información sea verídica y los archivos sean legibles.</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tipo de trámite */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Tipo de Trámite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label>Procedimiento TUPA <span className="text-destructive">*</span></Label>
              <Select onValueChange={setTupaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione el tipo de trámite..." />
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
          </CardContent>
        </Card>

        {/* Documento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Documento Principal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Dropzone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${dragOver ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}
            >
              <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              {file ? (
                <p className="text-sm font-medium">{file.name}</p>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Arrastre el archivo aquí o haga clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground mt-1">PDF, JPEG o PNG · Máx. 20MB</p>
                </>
              )}
              <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => validateAndSetFile(e.target.files[0])} />
            </div>

            <div className="space-y-1.5">
              <Label>Asunto / Sumilla <span className="text-destructive">*</span></Label>
              <Textarea
                placeholder="Describa brevemente el motivo de su trámite (mínimo 20 caracteres)..."
                {...register("asunto", { required: true, minLength: 20 })}
              />
              {errors.asunto && <p className="text-xs text-destructive">Mínimo 20 caracteres.</p>}
            </div>
          </CardContent>
        </Card>

        {/* Declaración */}
        <Card>
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-start gap-2">
              <input type="checkbox" id="declaracion" required className="mt-0.5 cursor-pointer" />
              <label htmlFor="declaracion" className="text-sm cursor-pointer">
                Declaro bajo juramento que los datos consignados y documentos adjuntos responden a la verdad.
              </label>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terminos" required className="mt-0.5 cursor-pointer" />
              <label htmlFor="terminos" className="text-sm cursor-pointer">
                Acepto los <a href="#" className="underline">términos y condiciones</a> de uso de la plataforma virtual.
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : "PRESENTAR SOLICITUD FORMAL →"}
          </Button>
        </div>
      </form>
    </div>
  )
}
