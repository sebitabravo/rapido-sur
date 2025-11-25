"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { Pagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { Plus, Search, Calendar, ArrowLeft, Edit, Trash2 } from "lucide-react"
import { PreventivePlanDialog } from "@/components/preventive-plan-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { toast } from "sonner"

interface PreventivePlan {
  id: number
  vehiculo: {
    id: number
    patente: string
    marca: string
    modelo: string
  }
  tipo_intervalo: "KM" | "Tiempo"
  intervalo: number
  descripcion: string
  activo: boolean
  ultima_ejecucion?: string
  proxima_ejecucion?: string
}

export default function PreventivePlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState<PreventivePlan[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PreventivePlan | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadPlans()
  }, [router, debouncedSearchTerm, currentPage, pageSize])

  const loadPlans = async () => {
    try {
      setLoading(true)
      const response = await api.preventivePlans.getAll()
      let plansData = response.data || []

      // Client-side search
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        plansData = plansData.filter((plan: PreventivePlan) =>
          plan.vehiculo.patente.toLowerCase().includes(searchLower) ||
          plan.vehiculo.marca.toLowerCase().includes(searchLower) ||
          plan.vehiculo.modelo.toLowerCase().includes(searchLower) ||
          plan.descripcion.toLowerCase().includes(searchLower)
        )
      }

      // Client-side pagination
      const totalPlans = plansData.length
      const startIndex = currentPage * pageSize
      const endIndex = startIndex + pageSize
      const paginatedPlans = plansData.slice(startIndex, endIndex)

      setPlans(paginatedPlans)
      setTotalPages(Math.ceil(totalPlans / pageSize))
      setTotalItems(totalPlans)
    } catch (error) {
      console.error("Error loading preventive plans:", error)
      toast.error("Error al cargar los planes preventivos")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedPlan(null)
    setDialogOpen(true)
  }

  const handleEdit = (plan: PreventivePlan) => {
    setSelectedPlan(plan)
    setDialogOpen(true)
  }

  const handleDelete = (plan: PreventivePlan) => {
    setSelectedPlan(plan)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPlan) return

    try {
      await api.preventivePlans.delete(selectedPlan.id)
      toast.success("Plan preventivo eliminado exitosamente")
      await loadPlans()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting plan:", error)
      toast.error("Error al eliminar el plan preventivo")
    }
  }

  const handleSave = async () => {
    await loadPlans()
    setDialogOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const getStatusBadge = (activo: boolean) => {
    return activo ? (
      <Badge variant="secondary">Activo</Badge>
    ) : (
      <Badge variant="outline">Inactivo</Badge>
    )
  }

  const activePlans = plans.filter(p => p.activo).length
  const inactivePlans = plans.filter(p => !p.activo).length
  const kmPlans = plans.filter(p => p.tipo_intervalo === "KM").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Planes Preventivos</h1>
              <p className="text-sm text-muted-foreground">Configure el mantenimiento preventivo de los vehículos</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Plan
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Planes Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activePlans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Por Kilometraje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kmPlans}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Por Tiempo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems - kmPlans}</div>
            </CardContent>
          </Card>
        </div>

        {/* Plans Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Planes</CardTitle>
                <CardDescription>Total: {totalItems} planes configurados</CardDescription>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por vehículo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={pageSize} columns={6} />
            ) : plans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "No se encontraron planes con los filtros aplicados" : "No hay planes preventivos configurados"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Plan
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Tipo Intervalo</TableHead>
                      <TableHead>Intervalo</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow key={plan.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{plan.vehiculo.patente}</p>
                            <p className="text-xs text-muted-foreground">
                              {plan.vehiculo.marca} {plan.vehiculo.modelo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {plan.tipo_intervalo === "KM" ? "Kilometraje" : "Tiempo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {plan.tipo_intervalo === "KM" 
                            ? `${plan.intervalo.toLocaleString()} km` 
                            : `${plan.intervalo} días`}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{plan.descripcion}</TableCell>
                        <TableCell>{getStatusBadge(plan.activo)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(plan)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(plan)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  pageSize={pageSize}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              </>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <PreventivePlanDialog open={dialogOpen} onOpenChange={setDialogOpen} plan={selectedPlan} onSave={handleSave} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Eliminar Plan Preventivo"
        description={`¿Está seguro que desea eliminar el plan preventivo del vehículo "${selectedPlan?.vehiculo.patente}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
