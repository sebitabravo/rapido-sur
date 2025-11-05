"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, Home } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[v0] Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <CardTitle>Error del Servidor</CardTitle>
          </div>
          <CardDescription>Ha ocurrido un error en el servidor. Por favor, intente nuevamente.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-mono text-muted-foreground break-all">{error.message}</p>
            </div>
          )}
          {error.digest && (
            <div className="text-xs text-muted-foreground">
              Error ID: <code className="font-mono">{error.digest}</code>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={reset} className="flex-1">
              <RefreshCw className="h-4 w-4" />
              Intentar Nuevamente
            </Button>
            <Button onClick={() => (window.location.href = "/dashboard")} variant="outline" className="flex-1">
              <Home className="h-4 w-4" />
              Ir al Inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
