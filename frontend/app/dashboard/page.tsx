"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Truck, Wrench, AlertTriangle, TrendingUp, LogOut, Users, FileText, Package, Calendar, User } from "lucide-react"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentWorkOrders } from "@/components/recent-work-orders"
import { ActiveAlerts } from "@/components/active-alerts"
import { MaintenanceTrends } from "@/components/maintenance-trends"
import { MechanicDashboard } from "@/components/mechanic-dashboard"

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

  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

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

  const isAdmin = user?.rol === "Administrador"
  const isMechanic = user?.rol === "Mecanico"

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
              <p className="text-sm font-medium">{user?.nombre_completo}</p>
              <Badge variant="outline" className="text-xs">
                {user?.rol}
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

        {/* Mechanic Dashboard - Specialized view for mechanics */}
        {isMechanic ? (
          <MechanicDashboard />
        ) : (
          /* Admin/Manager Dashboard - Full view */
          <div className="space-y-6">
            {/* Key Metrics */}
            <DashboardStats refreshTrigger={refreshTrigger} />

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MaintenanceTrends />
              <ActiveAlerts onRefresh={handleRefresh} />
            </div>

            {/* Recent Work Orders */}
            <RecentWorkOrders />
          </div>
        )}
      </main>
    </div>
  )
}
