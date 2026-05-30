import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuthStore } from "@/store/authStore"
import { ShieldCheck } from "lucide-react"

function LoginForm({ onSuccess }) {
  const { login } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState("")

  const onSubmit = async ({ email, password }) => {
    try {
      setError("")
      const user = await login(email, password)
      onSuccess(user)
    } catch {
      setError("Correo o contraseña incorrectos.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          {...register("email", { required: true, pattern: /^\S+@\S+\.\S+$/ })}
        />
        {errors.email && <p className="text-xs text-destructive">Correo inválido.</p>}
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Contraseña</Label>
          <a href="#" className="text-xs text-muted-foreground hover:underline cursor-pointer">¿Olvidó su contraseña?</a>
        </div>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          {...register("password", { required: true, minLength: 8 })}
        />
        {errors.password && <p className="text-xs text-destructive">Mínimo 8 caracteres.</p>}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Iniciando..." : "INICIAR SESIÓN"}
      </Button>

      <div className="relative">
        <Separator />
        <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-card px-2 text-xs text-muted-foreground">
          O CONECTAR CON
        </span>
      </div>

      <Button type="button" variant="outline" className="w-full gap-2">
        <ShieldCheck className="h-4 w-4" />
        IDENTIDAD DIGITAL GOB
      </Button>
    </form>
  )
}

function RegisterForm({ onSuccess }) {
  const { register: registerUser } = useAuthStore()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()
  const [error, setError] = useState("")

  const onSubmit = async (data) => {
    try {
      setError("")
      const user = await registerUser(data)
      onSuccess(user)
    } catch {
      setError("Error al registrar. Intente nuevamente.")
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Nombre completo</Label>
          <Input placeholder="Juan Pérez" {...register("nombre", { required: true })} />
        </div>
        <div className="space-y-1.5">
          <Label>DNI</Label>
          <Input placeholder="00000000" maxLength={8} {...register("dni", { required: true, minLength: 8 })} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Correo electrónico</Label>
        <Input type="email" placeholder="usuario@ejemplo.com" {...register("email", { required: true })} />
      </div>
      <div className="space-y-1.5">
        <Label>Teléfono</Label>
        <Input type="tel" placeholder="+51 900 000 000" {...register("telefono")} />
      </div>
      <div className="space-y-1.5">
        <Label>Contraseña</Label>
        <Input type="password" placeholder="Mínimo 8 caracteres" {...register("password", { required: true, minLength: 8 })} />
        {errors.password && <p className="text-xs text-destructive">Mínimo 8 caracteres.</p>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Registrando..." : "CREAR CUENTA"}
      </Button>
    </form>
  )
}

export default function Login() {
  const navigate = useNavigate()

  const handleSuccess = (user) => {
    // Ciudadanos van al portal, funcionarios/admin al dashboard interno
    if (user?.rol === "ciudadano") navigate("/")
    else navigate("/app/dashboard")
  }

  return (
    <div className="min-h-screen bg-secondary flex flex-col items-center justify-center p-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-widest uppercase">SGDML</h1>
        <p className="text-sm text-muted-foreground mt-1">Municipalidad Provincial de Yau</p>
      </div>

      <Card className="w-full max-w-sm">
        <CardContent className="pt-6">
          <Tabs defaultValue="login">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="login" className="flex-1 text-xs tracking-widest uppercase">Ingresar</TabsTrigger>
              <TabsTrigger value="register" className="flex-1 text-xs tracking-widest uppercase">Registrarse</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm onSuccess={handleSuccess} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm onSuccess={handleSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-xs text-muted-foreground space-x-4">
        <span>© 2025 Municipalidad Provincial de Yau. Todos los derechos reservados.</span>
        <br />
        <a href="#" className="hover:underline">TÉRMINOS</a>
        <a href="#" className="hover:underline">PRIVACIDAD</a>
        <a href="#" className="hover:underline">ACCESIBILIDAD</a>
      </footer>
    </div>
  )
}
