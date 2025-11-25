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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SkeletonTable } from "@/components/ui/skeleton-table"
import { Pagination } from "@/components/pagination"
import { useDebounce } from "@/hooks/use-debounce"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Search, Wrench, ArrowLeft, Edit, Eye, ArrowUpDown } from "lucide-react"
import { WorkOrderDialog } from "@/components/work-order-dialog"
import { WorkOrderDetailDialog } from "@/components/work-order-detail-dialog"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"

interface WorkOrder {
  id: number
  vehiculo: {
    id: number
    patente: string
    marca: string
    modelo: string
  }
  tipo: string
  estado: string
  prioridad: string
  fechaCreacion: string
  fechaInicio?: string
  fechaFinalizacion?: string
  descripcion: string
  observaciones?: string
  costoEstimado?: number
  costoReal?: number
  mecanico?: {
    id: number
    nombre: string
  }
}

export default function WorkOrdersPage() {
  const router = useRouter()
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [prioridadFilter, setPrioridadFilter] = useState<string>("all")
  const [tipoFilter, setTipoFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [sortBy, setSortBy] = useState<string>("fechaCreacion")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadWorkOrders()
  }, [router, debouncedSearchTerm, statusFilter, prioridadFilter, tipoFilter, currentPage, pageSize, sortBy, sortOrder])

  const loadWorkOrders = async () => {
    try {
      setLoading(true)
      const params: any = {}

      if (statusFilter !== "all") {
        params.estado = statusFilter
      }

      if (tipoFilter !== "all") {
        params.tipo = tipoFilter
      }

      const response = await api.workOrders.getAll(params)
      // Ensure orders is always an array
      let orders = Array.isArray(response.data) ? response.data : (response.data?.items || [])

      // Client-side filtering for search term
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        orders = orders.filter((order: WorkOrder) =>
          order.vehiculo?.patente?.toLowerCase().includes(searchLower) ||
          order.descripcion?.toLowerCase().includes(searchLower)
        )
      }

      // Client-side filtering for priority
      if (prioridadFilter !== "all") {
        orders = orders.filter((order: WorkOrder) => order.prioridad === prioridadFilter)
      }

      // Client-side sorting
      orders.sort((a: WorkOrder, b: WorkOrder) => {
        let aVal: any = a[sortBy as keyof WorkOrder]
        let bVal: any = b[sortBy as keyof WorkOrder]

        if (sortOrder === "asc") {
          return aVal > bVal ? 1 : -1
        } else {
          return aVal < bVal ? 1 : -1
        }
      })

      // Client-side pagination
      const totalOrders = orders.length
      const startIndex = currentPage * pageSize
      const endIndex = startIndex + pageSize
      const paginatedOrders = orders.slice(startIndex, endIndex)

      setWorkOrders(paginatedOrders)
      setTotalPages(Math.ceil(totalOrders / pageSize))
      setTotalItems(totalOrders)
    } catch (error) {
      console.error("[v0] Error loading work orders:", error)
      toast.error("Error al cargar las órdenes de trabajo")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedWorkOrder(null)
    setDialogOpen(true)
  }

  const handleEdit = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setDialogOpen(true)
  }

  const handleViewDetail = (workOrder: WorkOrder) => {
    setSelectedWorkOrder(workOrder)
    setDetailDialogOpen(true)
  }

  const handleSave = async () => {
    await loadWorkOrders()
    setDialogOpen(false)
  }

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(column)
      setSortOrder("asc")
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const getStatusBadge = (estado: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Pendiente: "outline",
      Asignada: "default",
      EnProgreso: "default",
      Finalizada: "secondary",
    }
    const labels: Record<string, string> = {
      Pendiente: "Pendiente",
      Asignada: "Asignada",
      EnProgreso: "En Progreso",
      Finalizada: "Finalizada",
    }
    return <Badge variant={variants[estado] || "outline"}>{labels[estado] || estado}</Badge>
  }

  const getPriorityBadge = (prioridad: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      ALTA: "destructive",
      MEDIA: "default",
      BAJA: "secondary",
    }
    return <Badge variant={variants[prioridad] || "outline"}>{prioridad}</Badge>
  }

  const pendingOrders = workOrders.filter((wo) => wo.estado === "Pendiente")
  const inProgressOrders = workOrders.filter((wo) => wo.estado === "EnProgreso" || wo.estado === "Asignada")
  const completedOrders = workOrders.filter((wo) => wo.estado === "Finalizada")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Wrench className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Órdenes de Trabajo</h1>
              <p className="text-sm text-muted-foreground">Gestione las órdenes de mantenimiento</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">En Progreso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressOrders.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedOrders.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Órdenes</CardTitle>
                <CardDescription>Total: {totalItems} órdenes registradas</CardDescription>
              </div>
            </div>

            <div className="space-y-4">
              <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                <TabsList>
                  <TabsTrigger value="all">Todas</TabsTrigger>
                  <TabsTrigger value="Pendiente">Pendientes</TabsTrigger>
                  <TabsTrigger value="EnProgreso">En Progreso</TabsTrigger>
                  <TabsTrigger value="Finalizada">Completadas</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por patente o descripción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>

                <Select value={prioridadFilter} onValueChange={setPrioridadFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={tipoFilter} onValueChange={setTipoFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="Preventivo">Preventivo</SelectItem>
                    <SelectItem value="Correctivo">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={pageSize} columns={8} />
            ) : workOrders.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm || statusFilter !== "all" || prioridadFilter !== "all" || tipoFilter !== "all"
                    ? "No se encontraron órdenes con los filtros aplicados"
                    : "No hay órdenes de trabajo registradas"}
                </p>
                {!searchTerm && statusFilter === "all" && prioridadFilter === "all" && tipoFilter === "all" && (
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="h-4 w-4" />
                    Crear Primera Orden
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("id")}>
                          ID
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Vehículo</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Prioridad</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort("fechaCreacion")}
                        >
                          Fecha Creación
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Mecánico</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{order.vehiculo.patente}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.vehiculo.marca} {order.vehiculo.modelo}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>{order.tipo === "Preventivo" ? "Preventivo" : "Correctivo"}</TableCell>
                        <TableCell>{getStatusBadge(order.estado)}</TableCell>
                        <TableCell>{getPriorityBadge(order.prioridad)}</TableCell>
                        <TableCell className="text-sm">{formatDate(order.fechaCreacion)}</TableCell>
                        <TableCell className="text-sm">{order.mecanico ? order.mecanico.nombre : "-"}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleViewDetail(order)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(order)}>
                              <Edit className="h-4 w-4" />
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
      <WorkOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        workOrder={selectedWorkOrder}
        onSave={handleSave}
      />
      <WorkOrderDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        workOrder={selectedWorkOrder}
        onUpdate={loadWorkOrders}
      />
    </div>
  )
}
