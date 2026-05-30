import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useDashboardStore } from "@/store/dashboardStore"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from "recharts"
import { Download, Calendar, BellOff, Clock } from "lucide-react"

const SLA_COLOR = {
  "ON TRACK": "text-emerald-600",
  "WARNING": "text-amber-600",
  "COMPLETED": "text-emerald-600",
  "OVERDUE": "text-destructive",
}

export default function Dashboard() {
  const { kpis, criticos, loading, fetchKpis } = useDashboardStore()
  const navigate = useNavigate()

  useEffect(() => { fetchKpis() }, [])

  // Datos de carga por área desde el backend
  const cargaData = kpis?.cargaPorArea?.map((c) => ({
    nombre: c.area_asignada?.nombre?.split(" ").slice(0, 2).join(" ") || "Sin área",
    total: parseInt(c.dataValues?.total || c.total || 0),
  })) || []

  // Datos de tendencia (mock hasta que el backend los provea)
  const trendData = [
    { semana: "WK 01", dias: 8 }, { semana: "WK 02", dias: 7 },
    { semana: "WK 03", dias: 9 }, { semana: "WK 04", dias: 6 },
    { semana: "WK 05", dias: 7 }, { semana: "WK 06", dias: 5 },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Corporate Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Métricas de rendimiento en tiempo real y distribución de carga institucional.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Calendar className="h-3.5 w-3.5" />Últimos 30 días
          </Button>
          <Button size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />Exportar Reporte
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Gráfico tendencia resolución */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">Tiempos Promedio de Resolución</CardTitle>
                <CardDescription>Tendencia de eficiencia en todos los expedientes activos.</CardDescription>
              </div>
              <span className="text-xs text-emerald-600 font-medium">
                {kpis ? `${kpis.tiempoPromedioResolucionDias} días prom.` : "—"}
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="semana" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6 }} />
                <Line type="monotone" dataKey="dias" stroke="hsl(var(--foreground))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Carga por área */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Carga por Área</CardTitle>
            <CardDescription>Expedientes abiertos por unidad.</CardDescription>
          </CardHeader>
          <CardContent>
            {cargaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={cargaData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={80} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} />
                  <Bar dataKey="total" fill="hsl(var(--foreground))" radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[180px] flex items-center justify-center text-xs text-muted-foreground">
                {loading ? "Cargando..." : "Sin datos de carga"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="py-5">
            <div className="flex items-start justify-between">
              <div>
                <BellOff className="h-5 w-5 text-muted-foreground mb-3" />
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Total Expedientes</p>
                <p className="text-4xl font-bold mt-1">{kpis?.totalExpedientes ?? "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <Clock className="h-5 w-5 text-muted-foreground mb-3" />
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Tiempo Promedio Resolución</p>
            <p className="text-4xl font-bold mt-1">
              {kpis?.tiempoPromedioResolucionDias != null ? `${kpis.tiempoPromedioResolucionDias}d` : "—"}
            </p>
            <p className="text-xs text-muted-foreground mt-2">Días hábiles promedio</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-5">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Expedientes Críticos</p>
            <p className="text-4xl font-bold mt-1 text-destructive">{criticos.length}</p>
            <p className="text-xs text-muted-foreground mt-2">Vencen en ≤ 3 días hábiles</p>
          </CardContent>
        </Card>
      </div>

      {/* Expedientes críticos */}
      <Card>
        <CardHeader className="pb-2 flex-row items-center justify-between">
          <CardTitle className="text-base">Expedientes Críticos — Próximos a Vencer</CardTitle>
          <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={() => navigate("/app/expedientes")}>
            Ver todos
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                {["N° Expediente", "Área", "Estado", "Fecha Límite", "Días Restantes"].map((h) => (
                  <th key={h} className="text-left px-4 py-2.5 text-xs uppercase tracking-wide text-muted-foreground font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-sm">Cargando...</td></tr>
              ) : criticos.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground text-sm">Sin expedientes críticos.</td></tr>
              ) : criticos.map((exp) => {
                const dias = exp.fecha_limite
                  ? Math.ceil((new Date(exp.fecha_limite) - new Date()) / (1000 * 60 * 60 * 24))
                  : null
                return (
                  <tr
                    key={exp.id}
                    className="border-b hover:bg-muted/30 transition-colors cursor-pointer"
                    onClick={() => navigate(`/app/expedientes/${exp.id}`)}
                  >
                    <td className="px-4 py-3 font-semibold">{exp.numero_expediente}</td>
                    <td className="px-4 py-3 text-muted-foreground">{exp.area_asignada?.nombre || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-[10px]">{exp.estado?.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {exp.fecha_limite ? new Date(exp.fecha_limite).toLocaleDateString("es-PE") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold ${dias != null && dias <= 0 ? "text-destructive" : dias != null && dias <= 3 ? "text-amber-600" : "text-emerald-600"}`}>
                        {dias != null ? (dias <= 0 ? "VENCIDO" : `${dias}d`) : "—"}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
