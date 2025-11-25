"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface MonthlyData {
  mes: string
  preventivo: number
  correctivo: number
}

export function MaintenanceTrends() {
  const [data, setData] = useState<MonthlyData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMaintenanceTrends()
  }, [])

  const loadMaintenanceTrends = async () => {
    try {
      const response = await api.reports.maintenance()
      const trends = response.data?.tendenciasMensuales || []
      
      // If no data, show empty state
      setData(trends)
    } catch (error) {
      console.error("[v0] Error loading maintenance trends:", error)
      // Set empty data on error
      setData([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendencias de Mantenimiento</CardTitle>
        <CardDescription>Comparación de mantenimiento preventivo vs correctivo (últimos 6 meses)</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-sm">No hay datos de mantenimiento disponibles</p>
            <p className="text-xs mt-1">Complete algunas órdenes de trabajo para ver las tendencias</p>
          </div>
        ) : (
          <ChartContainer
            config={{
              preventivo: {
                label: "Preventivo",
                color: "hsl(var(--primary))",
              },
              correctivo: {
                label: "Correctivo",
                color: "hsl(var(--destructive))",
              },
            }}
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" className="text-xs" />
                <YAxis className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="preventivo" fill="var(--color-preventivo)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="correctivo" fill="var(--color-correctivo)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
