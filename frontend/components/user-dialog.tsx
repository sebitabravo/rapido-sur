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

// Password validation rules (shared)
const passwordValidation = z.string()
  .min(12, "La contraseña debe tener al menos 12 caracteres")
  .regex(/[a-z]/, "Debe contener al menos una letra minúscula")
  .regex(/[A-Z]/, "Debe contener al menos una letra mayúscula")
  .regex(/\d/, "Debe contener al menos un número")
  .regex(/[@$!%*?&#]/, "Debe contener al menos un carácter especial (@$!%*?&#)")

// Schema for creating new user (password required)
const createUserSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: passwordValidation,
  rol: z.enum(["Administrador", "JefeMantenimiento", "Mecanico"]),
})

// Schema for editing user (password optional - empty string means no change)
const editUserSchema = z.object({
  email: z.string().email("Email inválido"),
  nombre_completo: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string()
    .refine(
      (val) => val === "" || val.length >= 12,
      "La contraseña debe tener al menos 12 caracteres"
    )
    .refine(
      (val) => val === "" || /[a-z]/.test(val),
      "Debe contener al menos una letra minúscula"
    )
    .refine(
      (val) => val === "" || /[A-Z]/.test(val),
      "Debe contener al menos una letra mayúscula"
    )
    .refine(
      (val) => val === "" || /\d/.test(val),
      "Debe contener al menos un número"
    )
    .refine(
      (val) => val === "" || /[@$!%*?&#]/.test(val),
      "Debe contener al menos un carácter especial (@$!%*?&#)"
    )
    .optional(),
  rol: z.enum(["Administrador", "JefeMantenimiento", "Mecanico"]),
})

type UserFormData = z.infer<typeof createUserSchema>

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
    resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
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

      if (isEdit) {
        // When editing, separate password from other data
        const { password, ...userData } = data

        // Update user data (without password)
        await api.users.update(user.id, userData)

        // If password was provided, change it using the dedicated endpoint
        if (password && password.trim() !== "") {
          await api.users.changePassword(user.id, password)
        }

        toast.success("Usuario actualizado correctamente")
      } else {
        // When creating, include password in the creation request
        await api.users.create(data)
        toast.success("Usuario creado correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("Error saving user:", error)

      // Handle validation errors from backend
      if (error.response?.data) {
        const errorData = error.response.data

        // If it's an array of validation errors (from class-validator)
        if (Array.isArray(errorData)) {
          const messages = errorData
            .map((err: any) => {
              if (err.constraints) {
                return Object.values(err.constraints).join(", ")
              }
              return null
            })
            .filter(Boolean)

          if (messages.length > 0) {
            toast.error(messages.join(". "))
          } else {
            toast.error("Error de validación en los datos")
          }
        }
        // If it has a message property
        else if (errorData.message) {
          const message = Array.isArray(errorData.message)
            ? errorData.message.join(". ")
            : errorData.message
          toast.error(message)
        }
        // Generic error
        else {
          toast.error("Error al guardar el usuario")
        }
      } else {
        toast.error("Error al guardar el usuario")
      }
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
                maxLength={100}
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
                maxLength={100}
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
                placeholder={isEdit ? "••••••••" : "Mínimo 12 caracteres, mayúscula, minúscula, número y especial"}
                maxLength={128}
                {...register("password")}
                aria-invalid={!!errors.password}
                disabled={loading}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              {!isEdit && (
                <p className="text-xs text-muted-foreground">
                  Debe tener: 12+ caracteres, mayúscula, minúscula, número y carácter especial (@$!%*?&#)
                </p>
              )}
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
