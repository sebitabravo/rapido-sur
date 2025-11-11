"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Truck, Wrench, AlertTriangle, TrendingUp, LogOut, Users, FileText, Package, Calendar } from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentWorkOrders } from "@/components/recent-work-orders"
import { ActiveAlerts } from "@/components/active-alerts"
import { MaintenanceTrends } from "@/components/maintenance-trends"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check authentication
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    // Load initial data
    setLoading(false)
  }, [router])

  const handleLogout = () => {
    authService.clearAuth()
    router.push("/login")
  }

  const handleNavigateToVehicles = () => {
    router.push("/vehicles")
  }

  const handleNavigateToWorkOrders = () => {
    router.push("/work-orders")
  }

  const handleNavigateToAlerts = () => {
    router.push("/alerts")
  }

  const handleNavigateToReports = () => {
    router.push("/reports")
  }

  const handleNavigateToUsers = () => {
    router.push("/users")
  }

  const handleNavigateToParts = () => {
    router.push("/parts")
  }

  const handleNavigateToPreventivePlans = () => {
    router.push("/preventive-plans")
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner message="Cargando dashboard..." />
      </div>
    )
  }

  const isAdmin = user?.role === "ADMIN"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Rápido Sur</h1>
              <p className="text-sm text-muted-foreground">Sistema de Gestión de Mantenimiento</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.nombre}</p>
              <Badge variant="outline" className="text-xs">
                {user?.role}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => router.push("/profile")} 
              title="Mi perfil"
              className="relative"
            >
              <User className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Cerrar sesión">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-1">Panel de Control</h2>
          <p className="text-muted-foreground">Resumen general del estado de la flota</p>
        </div>

        <div className={`grid grid-cols-2 ${isAdmin ? "md:grid-cols-7" : "md:grid-cols-6"} gap-4 mb-6`}>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToVehicles}>
            <Truck className="h-6 w-6" />
            <span className="text-sm">Vehículos</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToWorkOrders}>
            <Wrench className="h-6 w-6" />
            <span className="text-sm">Órdenes</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToAlerts}>
            <AlertTriangle className="h-6 w-6" />
            <span className="text-sm">Alertas</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToReports}>
            <FileText className="h-6 w-6" />
            <span className="text-sm">Reportes</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToParts}>
            <Package className="h-6 w-6" />
            <span className="text-sm">Repuestos</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToPreventivePlans}>
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Planes</span>
          </Button>
          {isAdmin && (
            <Button variant="outline" className="h-20 flex-col gap-2 bg-transparent" onClick={handleNavigateToUsers}>
              <Users className="h-6 w-6" />
              <span className="text-sm">Usuarios</span>
            </Button>
          )}
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">
              <TrendingUp className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="vehicles">
              <Truck className="h-4 w-4" />
              Vehículos
            </TabsTrigger>
            <TabsTrigger value="maintenance">
              <Wrench className="h-4 w-4" />
              Mantenimiento
            </TabsTrigger>
            <TabsTrigger value="alerts">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <DashboardStats />

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaintenanceTrends />
              <ActiveAlerts />
            </div>

            {/* Recent Work Orders */}
            <RecentWorkOrders />
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Vehículos</CardTitle>
                <CardDescription>Administre la flota de vehículos</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Acceda al módulo completo de gestión de vehículos
                  </p>
                  <Button onClick={handleNavigateToVehicles}>
                    <Truck className="h-4 w-4" />
                    Ir a Vehículos
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>Órdenes de Trabajo</CardTitle>
                <CardDescription>Gestione las órdenes de mantenimiento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">Acceda al módulo completo de órdenes de trabajo</p>
                  <Button onClick={handleNavigateToWorkOrders}>
                    <Wrench className="h-4 w-4" />
                    Ir a Órdenes de Trabajo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>Sistema de Alertas</CardTitle>
                <CardDescription>Monitoree alertas y notificaciones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-4">
                    Acceda al módulo completo de alertas y notificaciones
                  </p>
                  <Button onClick={handleNavigateToAlerts}>
                    <AlertTriangle className="h-4 w-4" />
                    Ir a Alertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
