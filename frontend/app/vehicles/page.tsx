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
import { Plus, Search, Truck, ArrowLeft, Edit, Trash2, ArrowUpDown } from "lucide-react"
import { VehicleDialog } from "@/components/vehicle-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { toast } from "sonner"

interface Vehicle {
  id: number
  patente: string
  marca: string
  modelo: string
  anio: number
  tipo: string
  estado: string
  kilometraje: number
  ultimoMantenimiento?: string
}

interface PaginatedResponse {
  items: Vehicle[]
  total: number
  totalPages: number
  page: number
  size: number
}

export default function VehiclesPage() {
  const router = useRouter()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [estadoFilter, setEstadoFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [sortBy, setSortBy] = useState<string>("patente")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadVehicles()
  }, [router, debouncedSearchTerm, estadoFilter, currentPage, pageSize, sortBy, sortOrder])

  const loadVehicles = async () => {
    try {
      setLoading(true)
      const params: any = {
        page: currentPage + 1,
        limit: pageSize,
      }

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm
      }

      if (estadoFilter !== "all") {
        params.estado = estadoFilter
      }

      const response = await api.vehicles.getAll(params)
      const data = response.data

      setVehicles(data.items || [])
      setTotalPages(data.totalPages || 0)
      setTotalItems(data.total || 0)
    } catch (error) {
      console.error("[v0] Error loading vehicles:", error)
      toast.error("Error al cargar los vehículos")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedVehicle(null)
    setDialogOpen(true)
  }

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setDialogOpen(true)
  }

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!vehicleToDelete) return

    try {
      await api.vehicles.delete(vehicleToDelete.id)
      toast.success("Vehículo eliminado correctamente")
      loadVehicles()
      setDeleteDialogOpen(false)
      setVehicleToDelete(null)
    } catch (error) {
      console.error("[v0] Error deleting vehicle:", error)
      toast.error("Error al eliminar el vehículo")
    }
  }

  const handleSave = async () => {
    await loadVehicles()
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
      OPERATIVO: "default",
      EN_MANTENIMIENTO: "outline",
      FUERA_DE_SERVICIO: "destructive",
    }
    return <Badge variant={variants[estado] || "outline"}>{estado.replace("_", " ")}</Badge>
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Truck className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Gestión de Vehículos</h1>
              <p className="text-sm text-muted-foreground">Administre la flota de vehículos</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Agregar Vehículo
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Vehículos</CardTitle>
                <CardDescription>Total: {totalItems} vehículos registrados</CardDescription>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por patente, marca o modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="OPERATIVO">Operativo</SelectItem>
                  <SelectItem value="EN_MANTENIMIENTO">En Mantenimiento</SelectItem>
                  <SelectItem value="FUERA_DE_SERVICIO">Fuera de Servicio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={pageSize} columns={8} />
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm || estadoFilter !== "all"
                    ? "No se encontraron vehículos con los filtros aplicados"
                    : "No hay vehículos registrados"}
                </p>
                {!searchTerm && estadoFilter === "all" && (
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="h-4 w-4" />
                    Agregar Primer Vehículo
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("patente")}>
                          Patente
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("marca")}>
                          Marca
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Modelo</TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("anno")}>
                          Año
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="-ml-3 h-8"
                          onClick={() => handleSort("kilometraje_actual")}
                        >
                          Kilometraje
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.patente}</TableCell>
                        <TableCell>{vehicle.marca}</TableCell>
                        <TableCell>{vehicle.modelo}</TableCell>
                        <TableCell>{vehicle.anno}</TableCell>
                        <TableCell>{getStatusBadge(vehicle.estado)}</TableCell>
                        <TableCell>{vehicle.kilometraje_actual?.toLocaleString() || 0} km</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(vehicle)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteClick(vehicle)}
                              className="text-destructive hover:text-destructive"
                            >
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
      <VehicleDialog open={dialogOpen} onOpenChange={setDialogOpen} vehicle={selectedVehicle} onSave={handleSave} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Vehículo"
        description={`¿Está seguro que desea eliminar el vehículo ${vehicleToDelete?.patente}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
