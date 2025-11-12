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
import { Plus, Search, Users, ArrowLeft, Edit, Trash2, Shield, ArrowUpDown } from "lucide-react"
import { UserDialog } from "@/components/user-dialog"
import { DeleteConfirmDialog } from "@/components/delete-confirm-dialog"
import { toast } from "sonner"

interface User {
  id: number
  email: string
  nombre_completo: string
  rol: "Administrador" | "JefeMantenimiento" | "Mecanico"
  activo: boolean
}

interface PaginatedResponse {
  items: User[]
  total: number
  totalPages: number
  page: number
  size: number
}

export default function UsersPage() {
  const router = useRouter()
  const currentUser = authService.getUser()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [sortBy, setSortBy] = useState<string>("nombre")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [userToDelete, setUserToDelete] = useState<User | null>(null)

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    // Check if user is admin
    if (!authService.hasRole("Administrador")) {
      toast.error("No tiene permisos para acceder a esta página")
      router.push("/dashboard")
      return
    }

    loadUsers()
  }, [router, debouncedSearchTerm, roleFilter, currentPage, pageSize, sortBy, sortOrder])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const params: any = {}

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm
      }

      if (roleFilter !== "all") {
        params.role = roleFilter
      }

      const response = await api.users.getAll(params)
      
      // Backend returns array directly, not paginated response
      let allUsers: User[] = Array.isArray(response.data) ? response.data : response.data.items || []
      
      // Apply client-side filtering if needed
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase()
        allUsers = allUsers.filter(
          (u) =>
            u.nombre_completo?.toLowerCase().includes(searchLower) ||
            u.email?.toLowerCase().includes(searchLower)
        )
      }
      
      if (roleFilter !== "all") {
        allUsers = allUsers.filter((u) => u.rol === roleFilter)
      }
      
      // Apply client-side sorting
      allUsers.sort((a, b) => {
        const aVal = a[sortBy as keyof User] || ''
        const bVal = b[sortBy as keyof User] || ''
        const comparison = String(aVal).localeCompare(String(bVal))
        return sortOrder === 'asc' ? comparison : -comparison
      })
      
      // Calculate pagination
      const total = allUsers.length
      const pages = Math.ceil(total / pageSize)
      const startIndex = currentPage * pageSize
      const endIndex = startIndex + pageSize
      const paginatedUsers = allUsers.slice(startIndex, endIndex)

      setUsers(paginatedUsers)
      setTotalPages(pages)
      setTotalItems(total)
    } catch (error) {
      console.error("[v0] Error loading users:", error)
      toast.error("Error al cargar los usuarios")
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    setSelectedUser(null)
    setDialogOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setDialogOpen(true)
  }

  const handleDeleteClick = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error("No puede eliminar su propio usuario")
      return
    }
    setUserToDelete(user)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      await api.users.delete(userToDelete.id)
      toast.success("Usuario eliminado correctamente")
      loadUsers()
      setDeleteDialogOpen(false)
      setUserToDelete(null)
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast.error("Error al eliminar el usuario")
    }
  }

  const handleSave = async () => {
    await loadUsers()
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

  const getRoleBadge = (role: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      Administrador: "destructive",
      JefeMantenimiento: "default",
      Mecanico: "secondary",
    }
    
    const labels: Record<string, string> = {
      Administrador: "Administrador",
      JefeMantenimiento: "Jefe de Mantenimiento",
      Mecanico: "Mecánico",
    }
    
    return <Badge variant={variants[role] || "outline"}>{labels[role] || role}</Badge>
  }

  const adminCount = users.filter((u) => u.rol === "Administrador").length
  const jefeMantenimientoCount = users.filter((u) => u.rol === "JefeMantenimiento").length
  const mecanicoCount = users.filter((u) => u.rol === "Mecanico").length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Gestión de Usuarios</h1>
              <p className="text-sm text-muted-foreground">Administre los usuarios del sistema</p>
            </div>
          </div>
          <Button onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Agregar Usuario
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalItems}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Administradores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Jefes de Mantenimiento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jefeMantenimientoCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Mecánicos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mecanicoCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <div>
                <CardTitle>Lista de Usuarios</CardTitle>
                <CardDescription>Total: {totalItems} usuarios registrados</CardDescription>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, usuario o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="JefeMantenimiento">Jefe de Mantenimiento</SelectItem>
                  <SelectItem value="Mecanico">Mecánico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <SkeletonTable rows={pageSize} columns={5} />
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">
                  {searchTerm || roleFilter !== "all"
                    ? "No se encontraron usuarios con los filtros aplicados"
                    : "No hay usuarios registrados"}
                </p>
                {!searchTerm && roleFilter === "all" && (
                  <Button onClick={handleAdd} className="mt-4">
                    <Plus className="h-4 w-4" />
                    Agregar Primer Usuario
                  </Button>
                )}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("nombre")}>
                          Nombre
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("username")}>
                          Usuario
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => handleSort("email")}>
                          Email
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.nombre_completo}
                            {user.id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">
                                Tú
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.rol)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleDeleteClick(user)}
                              className="text-destructive hover:text-destructive"
                              disabled={user.id === currentUser?.id}
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

        {/* Roles Info */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Roles del Sistema</CardTitle>
            <CardDescription>Información sobre los diferentes roles y sus permisos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Administrador</p>
                  <p className="text-xs text-muted-foreground">
                    Acceso completo al sistema, gestión de usuarios y configuración
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Jefe de Mantenimiento</p>
                  <p className="text-xs text-muted-foreground">Gestión de vehículos, órdenes de trabajo y reportes</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Mecánico</p>
                  <p className="text-xs text-muted-foreground">
                    Visualización y actualización de órdenes de trabajo asignadas
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Dialogs */}
      <UserDialog open={dialogOpen} onOpenChange={setDialogOpen} user={selectedUser} onSave={handleSave} />
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Usuario"
        description={`¿Está seguro que desea eliminar al usuario ${userToDelete?.nombre}? Esta acción no se puede deshacer.`}
      />
    </div>
  )
}
