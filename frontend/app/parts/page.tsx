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
import { Plus, Search, Package, ArrowLeft, Edit, Trash2 } from "lucide-react"
import { PartDialog } from "@/components/part-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { toast } from "sonner"

interface Part {
  id: number
  codigo: string
  nombre: string
  descripcion?: string
  categoria: string
  precio_unitario: number
  cantidad_stock: number
  stock_minimo: number
  proveedor?: string
  ubicacion_almacen?: string
}

export default function PartsPage() {
  const router = useRouter()
  const [parts, setParts] = useState<Part[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<Part | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }
    loadParts()
  }, [router, debouncedSearchTerm, currentPage, pageSize])

  const loadParts = async () => {
    try {
      setLoading(true)
      const params: any = {}
      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm
      }

      const response = await api.parts.getAll(params)
      let partsData = response.data || []

      // Client-side pagination
      const totalParts = partsData.length
      const startIndex = currentPage * pageSize
      const endIndex = startIndex + pageSize
      const paginatedParts = partsData.slice(startIndex, endIndex)

      setParts(paginatedParts)
      setTotalPages(Math.ceil(totalParts / pageSize))
      setTotalItems(totalParts)
    } catch (error) {
      console.error("Error loading parts:", error)
      toast.error("Error al cargar los repuestos")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedPart(null)
    setDialogOpen(true)
  }

  const handleEdit = (part: Part) => {
    setSelectedPart(part)
    setDialogOpen(true)
  }

  const handleDelete = (part: Part) => {
    setSelectedPart(part)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!selectedPart) return

    try {
      await api.parts.delete(selectedPart.id)
      toast.success("Repuesto eliminado exitosamente")
      await loadParts()
      setDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting part:", error)
      toast.error("Error al eliminar el repuesto")
    }
  }

  const handleSave = async () => {
    await loadParts()
    setDialogOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handlePageSizeChange = (size: number) => {
    setPageSize(size)
    setCurrentPage(0)
  }

  const getStockBadge = (stock: number, minStock: number) => {
    if (stock === 0) {
      return <Badge variant="destructive">Sin stock</Badge>
    } else if (stock <= minStock) {
      return <Badge variant="outline" className="border-orange-500 text-orange-500">Stock bajo</Badge>
    } else {
      return <Badge variant="secondary">En stock</Badge>
    }
  }

  const lowStockCount = parts.filter(p => p.cantidad_stock <= p.stock_minimo && p.cantidad_stock > 0).length
  const outOfStockCount = parts.filter(p => p.cantidad_stock === 0).length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Package className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Catálogo de Repuestos</h1>
              <p className="text-sm text-muted-foreground">Gestione el inventario de repuestos</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Repuesto
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Repuestos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Stock Bajo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sin Stock</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Parts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Repuestos</CardTitle>
                <CardDescription>Total: {totalItems} repuestos registrados</CardDescription>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, nombre o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={pageSize} columns={7} />
            ) : parts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "No se encontraron repuestos con los filtros aplicados" : "No hay repuestos registrados"}
                </p>
                {!searchTerm && (
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Repuesto
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parts.map((part) => (
                      <TableRow key={part.id}>
                        <TableCell className="font-medium">{part.codigo}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{part.nombre}</p>
                            {part.descripcion && (
                              <p className="text-xs text-muted-foreground truncate max-w-xs">
                                {part.descripcion}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{part.categoria}</TableCell>
                        <TableCell className="text-right">${part.precio_unitario.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          {part.cantidad_stock} / {part.stock_minimo}
                        </TableCell>
                        <TableCell>{getStockBadge(part.cantidad_stock, part.stock_minimo)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(part)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(part)}>
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
      <PartDialog open={dialogOpen} onOpenChange={setDialogOpen} part={selectedPart} onSave={handleSave} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Eliminar Repuesto"
        description={`¿Está seguro que desea eliminar el repuesto "${selectedPart?.nombre}"? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
