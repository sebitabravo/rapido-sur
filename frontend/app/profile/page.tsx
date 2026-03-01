"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { api } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { User, Lock, Bell, ArrowLeft, Check } from "lucide-react"
import { toast } from "sonner"
import { AvatarSelector } from "@/components/avatar-selector"

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState(authService.getUser())
  const [loading, setLoading] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})

  const [profileForm, setProfileForm] = useState({
    nombre_completo: "",
    email: ""
  })

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    maintenanceAlerts: true,
    weeklyReports: false
  })

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      router.push("/login")
      return
    }

    if (user) {
      setProfileForm({
        nombre_completo: user.nombre_completo || "",
        email: user.email || ""
      })
      // Cargar preferencias del usuario desde el backend
      setPreferences({
        emailNotifications: user.notif_email ?? true,
        maintenanceAlerts: user.notif_mantenimiento ?? true,
        weeklyReports: user.notif_reportes_semanales ?? false
      })
    }
  }, [router, user])

  const validatePasswordForm = () => {
    const errors: Record<string, string> = {}

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "La contraseña actual es requerida"
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "La nueva contraseña es requerida"
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "La contraseña debe tener al menos 8 caracteres"
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = "Debe contener mayúsculas, minúsculas y números"
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden"
    }

    setPasswordErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validatePasswordForm()) {
      toast.error("Por favor corrija los errores en el formulario")
      return
    }

    setLoading(true)

    try {
      // Note: This endpoint needs to be implemented in the backend
      toast.info("Funcionalidad de cambio de contraseña próximamente en el backend")
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      })
      setPasswordErrors({})
    } catch (error: unknown) {
      console.error("Error changing password:", error)
      toast.error("Error al cambiar la contraseña")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!profileForm.nombre_completo || !profileForm.email) {
      toast.error("Todos los campos son requeridos")
      return
    }

    setLoading(true)

    try {
      await api.users.update(user?.id || 0, {
        nombre_completo: profileForm.nombre_completo,
        email: profileForm.email
      })

      const updatedUser = { ...user, nombre: profileForm.nombre_completo, email: profileForm.email }
      authService.saveAuth(authService.getToken() || "", updatedUser)
      setUser(updatedUser)

      toast.success("Perfil actualizado exitosamente")
    } catch (error: unknown) {
      console.error("Error updating profile:", error)
      toast.error("Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  const handleSavePreferences = async () => {
    setLoading(true)
    try {
      await api.users.update(user?.id || 0, {
        notif_email: preferences.emailNotifications,
        notif_mantenimiento: preferences.maintenanceAlerts,
        notif_reportes_semanales: preferences.weeklyReports
      })
      
      // Actualizar usuario en localStorage
      const updatedUser = {
        ...user,
        notif_email: preferences.emailNotifications,
        notif_mantenimiento: preferences.maintenanceAlerts,
        notif_reportes_semanales: preferences.weeklyReports
      }
      authService.saveAuth(authService.getToken() || "", updatedUser)
      setUser(updatedUser)
      
      toast.success("Preferencias guardadas exitosamente")
    } catch (error: unknown) {
      console.error("Error saving preferences:", error)
      toast.error("Error al guardar las preferencias")
    } finally {
      setLoading(false)
    }
  }

  const handleAvatarChange = async (avatarId: string) => {
    setLoading(true)
    try {
      await api.users.update(user?.id || 0, { avatar: avatarId })
      const updatedUser = { ...user, avatar: avatarId }
      authService.saveAuth(authService.getToken() || "", updatedUser)
      setUser(updatedUser)
      toast.success("Avatar actualizado exitosamente")
    } catch (error: unknown) {
      console.error("Error updating avatar:", error)
      toast.error("Error al actualizar el avatar")
    } finally {
      setLoading(false)
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "Administrador":
        return "destructive" as const
      case "JefeMantenimiento":
        return "default" as const
      case "Mecanico":
        return "secondary" as const
      default:
        return "outline" as const
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <User className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Mi Perfil</h1>
              <p className="text-sm text-muted-foreground">Gestiona tu información personal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <AvatarSelector
                currentAvatar={user?.avatar || "default"}
                onSelect={handleAvatarChange}
                disabled={loading}
                userName={user?.nombre_completo}
              />

              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">{user?.nombre_completo}</h2>
                <p className="text-muted-foreground mb-3">{user?.email}</p>
                <Badge variant={getRoleBadgeVariant(user?.rol || "")}>
                  {user?.rol === "Administrador" && "Administrador"}
                  {user?.rol === "JefeMantenimiento" && "Jefe de Mantenimiento"}
                  {user?.rol === "Mecanico" && "Mecánico"}
                  {!user?.rol && "Usuario"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Seguridad</span>
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Bell className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Preferencias</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información de perfil</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      value={profileForm.nombre_completo}
                      onChange={(e) => setProfileForm({ ...profileForm, nombre_completo: e.target.value })}
                      placeholder="Juan Pérez"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      placeholder="juan@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rol</Label>
                    <Input value={user?.rol || "Usuario"} disabled />
                    <p className="text-xs text-muted-foreground">
                      Asignado por administrador
                    </p>
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      <Check className="h-4 w-4 mr-2" />
                      Guardar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Mantén tu cuenta segura</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Contraseña Actual</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className={passwordErrors.currentPassword ? "border-destructive" : ""}
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nueva Contraseña</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className={passwordErrors.newPassword ? "border-destructive" : ""}
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Min. 8 caracteres, mayúsculas, minúsculas y números
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      className={passwordErrors.confirmPassword ? "border-destructive" : ""}
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={loading}>
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>Notificaciones</CardTitle>
                <CardDescription>Configura tus preferencias de email</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                      Email
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">Siempre activo</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones importantes (asignación de OT, cambios críticos)
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={true}
                    disabled={true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="maintenanceAlerts">Alertas de Mantenimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Cuando un vehículo requiere mantenimiento preventivo
                    </p>
                  </div>
                  <Switch
                    id="maintenanceAlerts"
                    checked={preferences.maintenanceAlerts}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, maintenanceAlerts: checked })}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <Label htmlFor="weeklyReports">Reportes Semanales</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumen del estado de la flota
                    </p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, weeklyReports: checked })}
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSavePreferences}>
                    <Check className="h-4 w-4 mr-2" />
                    Guardar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
