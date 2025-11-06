"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

// Mock data for demonstration
const mockData = [
  { month: "Ene", preventivo: 12, correctivo: 8 },
  { month: "Feb", preventivo: 15, correctivo: 6 },
  { month: "Mar", preventivo: 10, correctivo: 10 },
  { month: "Abr", preventivo: 18, correctivo: 5 },
  { month: "May", preventivo: 14, correctivo: 7 },
  { month: "Jun", preventivo: 16, correctivo: 4 },
]

export function MaintenanceTrends() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500)
  }, [])

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
        <CardDescription>Comparación de mantenimiento preventivo vs correctivo</CardDescription>
      </CardHeader>
      <CardContent>
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
            <BarChart data={mockData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs" />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="preventivo" fill="var(--color-preventivo)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="correctivo" fill="var(--color-correctivo)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
