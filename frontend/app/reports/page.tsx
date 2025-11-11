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
import { FileText, ArrowLeft, DollarSign, TrendingDown, Download } from "lucide-react"
import { toast } from "sonner"
import { format, subMonths } from "date-fns"
import { exportToCSV } from "@/lib/export-utils"

interface UnavailabilityReport {
  vehiculo: {
    patente: string
    marca: string
    modelo: string
  }
  diasIndisponible: number
  porcentajeIndisponibilidad: number
}

interface CostReport {
  vehiculo: {
    patente: string
    marca: string
    modelo: string
  }
  costoTotal: number
  cantidadOrdenes: number
  costoPromedio: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [unavailabilityData, setUnavailabilityData] = useState<UnavailabilityReport[]>([])
  const [costData, setCostData] = useState<CostReport[]>([])

  // Default to last 30 days
  const [startDate, setStartDate] = useState(format(subMonths(new Date(), 1), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"))

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
  }, [router])

  const loadUnavailabilityReport = async () => {
    try {
      setLoading(true)
      const response = await api.reports.unavailability({
        fecha_inicio: startDate,
        fecha_fin: endDate,
      })
      setUnavailabilityData(response.data || [])
    } catch (error) {
      console.error("[v0] Error loading unavailability report:", error)
      toast.error("Error al cargar el reporte de indisponibilidad")
    } finally {
      setLoading(false)
    }
  }

  const loadCostReport = async () => {
    try {
      setLoading(true)
      const response = await api.reports.costs({
        fecha_inicio: startDate,
        fecha_fin: endDate,
      })
      setCostData(response.data || [])
    } catch (error) {
      console.error("[v0] Error loading cost report:", error)
      toast.error("Error al cargar el reporte de costos")
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateUnavailabilityReport = () => {
    loadUnavailabilityReport()
  }

  const handleGenerateCostReport = () => {
    loadCostReport()
  }

  const handleExportUnavailability = () => {
    if (unavailabilityData.length === 0) {
      toast.error("No hay datos para exportar")
      return
    }
    
    const exportData = unavailabilityData.map(item => ({
      Patente: item.vehiculo.patente,
      Marca: item.vehiculo.marca,
      Modelo: item.vehiculo.modelo,
      "Días Indisponible": item.diasIndisponible,
      "Porcentaje (%)": item.porcentajeIndisponibilidad.toFixed(1)
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
      Patente: item.vehiculo.patente,
      Marca: item.vehiculo.marca,
      Modelo: item.vehiculo.modelo,
      "Costo Total": item.costoTotal,
      "Cantidad Órdenes": item.cantidadOrdenes,
      "Costo Promedio": item.costoPromedio.toFixed(2)
    }))
    
    exportToCSV(exportData, `reporte-costos-${format(new Date(), "yyyy-MM-dd")}`)
    toast.success("Reporte exportado exitosamente")
  }

  const totalCost = costData.reduce((sum, item) => sum + item.costoTotal, 0)
  const totalOrders = costData.reduce((sum, item) => sum + item.cantidadOrdenes, 0)
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

        <Tabs defaultValue="unavailability" className="space-y-6">
          <TabsList>
            <TabsTrigger value="unavailability">
              <TrendingDown className="h-4 w-4" />
              Indisponibilidad
            </TabsTrigger>
            <TabsTrigger value="costs">
              <DollarSign className="h-4 w-4" />
              Costos
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
                            label: "Días Indisponible",
                            color: "hsl(var(--destructive))",
                          },
                        }}
                      >
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={unavailabilityData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                            <XAxis dataKey="vehiculo.patente" className="text-xs" />
                            <YAxis className="text-xs" />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="diasIndisponible" fill="var(--color-dias)" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </div>

                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehículo</TableHead>
                          <TableHead>Marca/Modelo</TableHead>
                          <TableHead className="text-right">Días Indisponible</TableHead>
                          <TableHead className="text-right">Porcentaje</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {unavailabilityData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.vehiculo.patente}</TableCell>
                            <TableCell>
                              {item.vehiculo.marca} {item.vehiculo.modelo}
                            </TableCell>
                            <TableCell className="text-right">{item.diasIndisponible} días</TableCell>
                            <TableCell className="text-right">{item.porcentajeIndisponibilidad.toFixed(1)}%</TableCell>
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
                            <BarChart data={costData}>
                              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                              <XAxis dataKey="vehiculo.patente" className="text-xs" />
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
                              data={costData}
                              dataKey="costoTotal"
                              nameKey="vehiculo.patente"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {costData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Table */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Vehículo</TableHead>
                          <TableHead>Marca/Modelo</TableHead>
                          <TableHead className="text-right">Cantidad Órdenes</TableHead>
                          <TableHead className="text-right">Costo Total</TableHead>
                          <TableHead className="text-right">Costo Promedio</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {costData.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.vehiculo.patente}</TableCell>
                            <TableCell>
                              {item.vehiculo.marca} {item.vehiculo.modelo}
                            </TableCell>
                            <TableCell className="text-right">{item.cantidadOrdenes}</TableCell>
                            <TableCell className="text-right font-medium">
                              ${item.costoTotal.toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right">
                              ${item.costoPromedio.toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
        </Tabs>
      </main>
    </div>
  )
}
