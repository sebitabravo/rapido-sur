"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { api } from "@/lib/api"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

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

interface PartDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  part: Part | null
  onSave: () => void
}

const CATEGORIAS = [
  "Motor",
  "Transmisión",
  "Suspensión",
  "Frenos",
  "Eléctrico",
  "Carrocería",
  "Neumáticos",
  "Lubricantes",
  "Filtros",
  "Otros"
]

export function PartDialog({ open, onOpenChange, part, onSave }: PartDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    codigo: "",
    nombre: "",
    descripcion: "",
    categoria: "",
    precio_unitario: "",
    cantidad_stock: "",
    stock_minimo: "",
    proveedor: "",
    ubicacion_almacen: ""
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (part) {
      setFormData({
        codigo: part.codigo || "",
        nombre: part.nombre || "",
        descripcion: part.descripcion || "",
        categoria: part.categoria || "",
        precio_unitario: part.precio_unitario?.toString() || "",
        cantidad_stock: part.cantidad_stock?.toString() || "",
        stock_minimo: part.stock_minimo?.toString() || "",
        proveedor: part.proveedor || "",
        ubicacion_almacen: part.ubicacion_almacen || ""
      })
    } else {
      setFormData({
        codigo: "",
        nombre: "",
        descripcion: "",
        categoria: "",
        precio_unitario: "",
        cantidad_stock: "0",
        stock_minimo: "5",
        proveedor: "",
        ubicacion_almacen: ""
      })
    }
    setErrors({})
  }, [part, open])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.codigo.trim()) {
      newErrors.codigo = "El código es requerido"
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.categoria) {
      newErrors.categoria = "La categoría es requerida"
    }

    if (!formData.precio_unitario || parseFloat(formData.precio_unitario) <= 0) {
      newErrors.precio_unitario = "El precio debe ser mayor a 0"
    }

    if (formData.cantidad_stock === "" || parseInt(formData.cantidad_stock) < 0) {
      newErrors.cantidad_stock = "La cantidad debe ser mayor o igual a 0"
    }

    if (!formData.stock_minimo || parseInt(formData.stock_minimo) < 0) {
      newErrors.stock_minimo = "El stock mínimo debe ser mayor o igual a 0"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    setLoading(true)

    try {
      const data = {
        codigo: formData.codigo.trim(),
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim() || undefined,
        categoria: formData.categoria,
        precio_unitario: parseFloat(formData.precio_unitario),
        cantidad_stock: parseInt(formData.cantidad_stock),
        stock_minimo: parseInt(formData.stock_minimo),
        proveedor: formData.proveedor.trim() || undefined,
        ubicacion_almacen: formData.ubicacion_almacen.trim() || undefined
      }

      if (part) {
        await api.parts.update(part.id, data)
        toast.success("Repuesto actualizado exitosamente")
      } else {
        await api.parts.create(data)
        toast.success("Repuesto creado exitosamente")
      }

      onSave()
    } catch (error: any) {
      console.error("Error saving part:", error)
      const message = error.response?.data?.message || "Error al guardar el repuesto"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{part ? "Editar Repuesto" : "Nuevo Repuesto"}</DialogTitle>
          <DialogDescription>
            {part ? "Modifique los datos del repuesto" : "Complete el formulario para agregar un nuevo repuesto"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  placeholder="Ej: FLT-001"
                  className={errors.codigo ? "border-destructive" : ""}
                />
                {errors.codigo && <p className="text-xs text-destructive">{errors.codigo}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">
                  Categoría <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.categoria} onValueChange={(value) => setFormData({ ...formData, categoria: value })}>
                  <SelectTrigger className={errors.categoria ? "border-destructive" : ""}>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoria && <p className="text-xs text-destructive">{errors.categoria}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Filtro de aceite motor diesel"
                className={errors.nombre ? "border-destructive" : ""}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descripcion">Descripción</Label>
              <Textarea
                id="descripcion"
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                placeholder="Descripción detallada del repuesto"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="precio_unitario">
                  Precio Unitario <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="precio_unitario"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_unitario}
                  onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })}
                  placeholder="0.00"
                  className={errors.precio_unitario ? "border-destructive" : ""}
                />
                {errors.precio_unitario && <p className="text-xs text-destructive">{errors.precio_unitario}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cantidad_stock">
                  Stock Actual <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cantidad_stock"
                  type="number"
                  min="0"
                  value={formData.cantidad_stock}
                  onChange={(e) => setFormData({ ...formData, cantidad_stock: e.target.value })}
                  className={errors.cantidad_stock ? "border-destructive" : ""}
                />
                {errors.cantidad_stock && <p className="text-xs text-destructive">{errors.cantidad_stock}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stock_minimo">
                  Stock Mínimo <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="stock_minimo"
                  type="number"
                  min="0"
                  value={formData.stock_minimo}
                  onChange={(e) => setFormData({ ...formData, stock_minimo: e.target.value })}
                  className={errors.stock_minimo ? "border-destructive" : ""}
                />
                {errors.stock_minimo && <p className="text-xs text-destructive">{errors.stock_minimo}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="proveedor">Proveedor</Label>
                <Input
                  id="proveedor"
                  value={formData.proveedor}
                  onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                  placeholder="Nombre del proveedor"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ubicacion_almacen">Ubicación en Almacén</Label>
                <Input
                  id="ubicacion_almacen"
                  value={formData.ubicacion_almacen}
                  onChange={(e) => setFormData({ ...formData, ubicacion_almacen: e.target.value })}
                  placeholder="Ej: Estantería A - Nivel 3"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {part ? "Actualizar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
