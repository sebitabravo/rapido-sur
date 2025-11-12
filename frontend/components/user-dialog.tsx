"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { api } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { ConfirmDialog } from "@/components/confirm-dialog"

const userSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  rol: z.enum(["Administrador", "JefeMantenimiento", "Mecanico"]),
})

type UserFormData = z.infer<typeof userSchema>

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: any
  onSave: () => void
}

export function UserDialog({ open, onOpenChange, user, onSave }: UserDialogProps) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      email: "",
      nombre_completo: "",
      password: "",
      rol: "Mecanico",
    },
  })

  const rol = watch("rol")

  useEffect(() => {
    if (user) {
      reset({
        email: user.email,
        nombre_completo: user.nombre_completo,
        password: "",
        rol: user.rol,
      })
    } else {
      reset({
        email: "",
        nombre_completo: "",
        password: "",
        rol: "Mecanico",
      })
    }
  }, [user, reset])

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true)

      // Remove password if empty on edit
      const submitData = { ...data }
      if (isEdit && !submitData.password) {
        delete submitData.password
      }

      if (isEdit) {
        await api.users.update(user.id, submitData)
        toast.success("Usuario actualizado correctamente")
      } else {
        await api.users.create(submitData)
        toast.success("Usuario creado correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("[v0] Error saving user:", error)
      toast.error(error.response?.data?.message || "Error al guardar el usuario")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Usuario" : "Agregar Usuario"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos del usuario" : "Complete los datos del nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="nombre_completo">Nombre Completo *</Label>
              <Input
                id="nombre_completo"
                placeholder="Juan Pérez"
                {...register("nombre_completo")}
                aria-invalid={!!errors.nombre_completo}
                disabled={loading}
              />
              {errors.nombre_completo && <p className="text-xs text-destructive">{errors.nombre_completo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="juan@example.com"
                {...register("email")}
                aria-invalid={!!errors.email}
                disabled={loading}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select value={rol} onValueChange={(value) => setValue("rol", value as any)} disabled={loading}>
                <SelectTrigger id="rol" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="JefeMantenimiento">Jefe de Mantenimiento</SelectItem>
                  <SelectItem value="Mecanico">Mecánico</SelectItem>
                </SelectContent>
              </Select>
              {errors.rol && <p className="text-xs text-destructive">{errors.rol.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="password">Contraseña {isEdit ? "(dejar en blanco para no cambiar)" : "*"}</Label>
              <Input
                id="password"
                type="password"
                placeholder={isEdit ? "••••••••" : "Mínimo 6 caracteres"}
                {...register("password")}
                aria-invalid={!!errors.password}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : isEdit ? (
                "Actualizar"
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
