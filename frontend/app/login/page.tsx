import { LoginForm } from "@/components/login-form"
import { Wrench } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 rounded-lg bg-primary">
            <Wrench className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Rápido Sur</h1>
          <p className="text-muted-foreground text-center">Sistema de Gestión de Mantenimiento de Vehículos</p>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          Sistema de gestión para el mantenimiento preventivo y correctivo de flotas vehiculares
        </p>
      </div>
    </div>
  )
}
