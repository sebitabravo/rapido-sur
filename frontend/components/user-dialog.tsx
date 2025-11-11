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
  username: z.string().min(3, "El usuario debe tener al menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  nombre: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  role: z.enum(["ADMIN", "SUPERVISOR", "MECANICO"]),
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
      username: "",
      email: "",
      nombre: "",
      password: "",
      role: "MECANICO",
    },
  })

  const role = watch("role")

  useEffect(() => {
    if (user) {
      reset({
        username: user.username,
        email: user.email,
        nombre: user.nombre,
        password: "",
        role: user.role,
      })
    } else {
      reset({
        username: "",
        email: "",
        nombre: "",
        password: "",
        role: "MECANICO",
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
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                placeholder="Juan Pérez"
                {...register("nombre")}
                aria-invalid={!!errors.nombre}
                disabled={loading}
              />
              {errors.nombre && <p className="text-xs text-destructive">{errors.nombre.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Usuario *</Label>
              <Input
                id="username"
                placeholder="jperez"
                {...register("username")}
                aria-invalid={!!errors.username}
                disabled={loading || isEdit}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
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
              <Label htmlFor="role">Rol *</Label>
              <Select value={role} onValueChange={(value) => setValue("role", value as any)} disabled={loading}>
                <SelectTrigger id="role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                  <SelectItem value="SUPERVISOR">Supervisor</SelectItem>
                  <SelectItem value="MECANICO">Mecánico</SelectItem>
                </SelectContent>
              </Select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
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
