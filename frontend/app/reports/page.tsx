"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { FileText, ArrowLeft, DollarSign, TrendingDown, Download, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { format, subMonths } from "date-fns"
import { exportToCSV } from "@/lib/export-utils"

interface UnavailabilityReport {
  vehiculoId: number
  patente: string
  marca: string
  modelo: string
  totalOrdenes: number
  diasInactividad: number
  promedioDias: number
}

interface CostReport {
  vehiculoId?: number
  patente: string
  totalOrdenes: number
  costoTotal: number
}

interface ReportHistory {
  id: number
  tipo: string
  fechaInicio: string
  fechaFin: string
  fechaGeneracion: string
  usuario?: string
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unavailabilityData, setUnavailabilityData] = useState<UnavailabilityReport[]>([])
  const [costData, setCostData] = useState<CostReport[]>([])
  const [historyData, setHistoryData] = useState<ReportHistory[]>([])
  const [activeTab, setActiveTab] = useState("unavailability")

  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadHistory()
  }, [router])

  const loadHistory = async () => {
    try {
      const response = await api.reports.history()
      setHistoryData(response.data)
    } catch (error) {
      console.error("Error loading history:", error)
    }
  }

  const loadUnavailabilityReport = async (customStartDate?: string, customEndDate?: string) => {
    try {
      setLoading(true)
      const response = await api.reports.unavailability({
        fecha_inicio: customStartDate || startDate,
        fecha_fin: customEndDate || endDate,
      })

      // Map backend snake_case to frontend camelCase
      const mappedData = (response.data || []).map((item: any) => ({
        vehiculoId: item.vehiculo_id,
        patente: item.patente,
        marca: item.marca,
        modelo: item.modelo,
        totalOrdenes: parseInt(item.total_ordenes),
        diasInactividad: parseFloat(item.dias_inactividad || 0),
        promedioDias: parseFloat(item.promedio_dias || 0)
      }))

      setUnavailabilityData(mappedData)
    } catch (error) {
      console.error("[v0] Error loading unavailability report:", error)
      toast.error("Error al cargar el reporte de indisponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const loadCostReport = async (customStartDate?: string, customEndDate?: string) => {
    try {
      setLoading(true)
      const response = await api.reports.costs({
        fecha_inicio: customStartDate || startDate,
        fecha_fin: customEndDate || endDate,
      })

      // The backend returns an object with 'costos_por_vehiculo' array
      const rawData = response.data?.costos_por_vehiculo || []

      // Map backend snake_case to frontend camelCase
      const mappedData = rawData.map((item: any) => ({
        vehiculoId: item.vehiculo_id,
        patente: item.patente,
        totalOrdenes: parseInt(item.total_ordenes),
        costoTotal: parseFloat(item.costo_total || 0)
      }))

      setCostData(mappedData)
    } catch (error) {
      console.error("[v0] Error loading cost report:", error)
      toast.error("Error al cargar el reporte de costos")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateUnavailabilityReport = async () => {
    await loadUnavailabilityReport()
    // Save to history after successful generation
    try {
      await api.reports.saveHistory({
        tipo: 'Indisponibilidad',
        fecha_inicio: startDate,
        fecha_fin: endDate
      })
      await loadHistory() // Refresh history list
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  }

  const handleGenerateCostReport = async () => {
    await loadCostReport()
    // Save to history after successful generation
    try {
      await api.reports.saveHistory({
        tipo: 'Costos',
        fecha_inicio: startDate,
        fecha_fin: endDate
      })
      await loadHistory() // Refresh history list
    } catch (error) {
      console.error("Error saving to history:", error)
    }
  }

  const handleViewHistory = async (item: ReportHistory) => {
    setStartDate(item.fechaInicio)
    setEndDate(item.fechaFin)

    if (item.tipo === 'Indisponibilidad') {
      setActiveTab('unavailability')
      // Load report immediately with history dates
      await loadUnavailabilityReport(item.fechaInicio, item.fechaFin)
      toast.success("Reporte cargado desde el historial")
    } else if (item.tipo === 'Costos') {
      setActiveTab('costs')
      // Load report immediately with history dates
      await loadCostReport(item.fechaInicio, item.fechaFin)
      toast.success("Reporte cargado desde el historial")
    }
  }

  const handleDeleteHistory = async (id: number) => {
    if (!confirm("¿Está seguro que desea eliminar este reporte del historial?")) {
      return
    }

    try {
      await api.reports.deleteHistory(id)
      toast.success("Reporte eliminado del historial")
      await loadHistory() // Refresh history list
    } catch (error) {
      console.error("Error deleting history:", error)
      toast.error("Error al eliminar el reporte del historial")
    }
  }

  const handleExportUnavailability = () => {
    if (unavailabilityData.length === 0) {
      toast.error("No hay datos para exportar")
      return
    }

    const exportData = unavailabilityData.map(item => ({
      Patente: item.patente,
      Marca: item.marca,
      Modelo: item.modelo,
      "Total Órdenes": item.totalOrdenes,
      "Días Inactividad": item.diasInactividad || 0,
      "Promedio Días": item.promedioDias ? parseFloat(item.promedioDias.toString()).toFixed(1) : "0.0"
    }))

    exportToCSV(exportData, `reporte-indisponibilidad-${format(new Date(), "yyyy-MM-dd")}`)
    toast.success("Reporte exportado exitosamente")
  }

  const handleExportCosts = () => {
    if (costData.length === 0) {
      toast.error("No hay datos para exportar")
      return
    }

    const exportData = costData.map(item => ({
      Patente: item.patente,
      "Total Órdenes": item.totalOrdenes,
      "Costo Total": item.costoTotal || 0
    }))

    exportToCSV(exportData, `reporte-costos-${format(new Date(), "yyyy-MM-dd")}`)
    toast.success("Reporte exportado exitosamente")
  }

  const totalCost = costData.reduce((sum, item) => sum + (parseFloat(item.costoTotal?.toString() || "0")), 0)
  const totalOrders = costData.reduce((sum, item) => sum + parseInt(item.totalOrdenes?.toString() || "0"), 0)
  const avgCost = totalOrders > 0 ? totalCost / totalOrders : 0

  const COLORS = [
    "hsl(var(--primary))",
    "hsl(var(--destructive))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <FileText className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Reportes</h1>
              <p className="text-sm text-muted-foreground">Genere reportes de indisponibilidad y costos</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Date Range Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Rango de Fechas</CardTitle>
            <CardDescription>Seleccione el período para generar los reportes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setStartDate(format(subMonths(new Date(), 1), "yyyy-MM-dd"))
                    setEndDate(format(new Date(), "yyyy-MM-dd"))
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Últimos 30 días
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="unavailability">
              <TrendingDown className="h-4 w-4 mr-2" />
              Indisponibilidad
            </TabsTrigger>
            <TabsTrigger value="costs">
              <DollarSign className="h-4 w-4 mr-2" />
              Costos
            </TabsTrigger>
            <TabsTrigger value="history">
              <FileText className="h-4 w-4 mr-2" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* Unavailability Report */}
          <TabsContent value="unavailability" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reporte de Indisponibilidad</CardTitle>
                    <CardDescription>Días que cada vehículo estuvo fuera de servicio</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {unavailabilityData.length > 0 && (
                      <Button onClick={handleExportUnavailability} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    )}
                    <Button onClick={handleGenerateUnavailabilityReport} disabled={loading}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : unavailabilityData.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No hay datos disponibles. Genere un reporte para ver los resultados.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Chart */}
                    <div className="mb-6">
                      <ChartContainer
                        config={{
                          dias: {
                            label: "Días Inactividad",
                            color: "hsl(var(--destructive))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={unavailabilityData.slice(0, 10)}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="patente" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="diasInactividad" fill="var(--color-dias)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patente</TableHead>
                          <TableHead>Marca/Modelo</TableHead>
                          <TableHead className="text-right">Total Órdenes</TableHead>
                          <TableHead className="text-right">Días Inactividad</TableHead>
                          <TableHead className="text-right">Promedio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unavailabilityData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.patente}</TableCell>
                            <TableCell>
                              {item.marca} {item.modelo}
                            </TableCell>
                            <TableCell className="text-right">{item.totalOrdenes}</TableCell>
                            <TableCell className="text-right">{item.diasInactividad || 0} días</TableCell>
                            <TableCell className="text-right">
                              {item.promedioDias ? parseFloat(item.promedioDias.toString()).toFixed(1) : "0.0"} días
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cost Report */}
          <TabsContent value="costs" className="space-y-6">
            {/* Summary Cards */}
            {costData.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Total Órdenes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalOrders}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Reporte de Costos</CardTitle>
                    <CardDescription>Costos de mantenimiento por vehículo</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {costData.length > 0 && (
                      <Button onClick={handleExportCosts} variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                    )}
                    <Button onClick={handleGenerateCostReport} disabled={loading}>
                      <FileText className="h-4 w-4 mr-2" />
                      Generar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : costData.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">
                      No hay datos disponibles. Genere un reporte para ver los resultados.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                      {/* Bar Chart */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Costo por Vehículo</h3>
                        <ChartContainer
                          config={{
                            costo: {
                              label: "Costo Total",
                              color: "hsl(var(--primary))",
                            },
                          }}
                        >
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={costData.slice(0, 10)}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="patente" className="text-xs" />
                              <YAxis className="text-xs" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Bar dataKey="costoTotal" fill="var(--color-costo)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>

                      {/* Pie Chart */}
                      <div>
                        <h3 className="text-sm font-medium mb-4">Distribución de Costos</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={costData.slice(0, 5)}
                              dataKey="costoTotal"
                              nameKey="patente"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {costData.slice(0, 5).map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                            <ChartTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patente</TableHead>
                          <TableHead className="text-right">Total Órdenes</TableHead>
                          <TableHead className="text-right">Costo Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.patente}</TableCell>
                            <TableCell className="text-right">{item.totalOrdenes}</TableCell>
                            <TableCell className="text-right">
                              ${parseFloat(item.costoTotal?.toString() || "0").toLocaleString("es-CL")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Historial de Reportes</CardTitle>
                <CardDescription>Registro de reportes generados anteriormente</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha Generación</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Periodo</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No hay historial disponible
                        </TableCell>
                      </TableRow>
                    ) : (
                      historyData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{format(new Date(item.fechaGeneracion), "dd/MM/yyyy HH:mm")}</TableCell>
                          <TableCell>{item.tipo}</TableCell>
                          <TableCell>
                            {format(new Date(item.fechaInicio), "dd/MM/yyyy")} - {format(new Date(item.fechaFin), "dd/MM/yyyy")}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleViewHistory(item)}>
                                Ver
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteHistory(item.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
