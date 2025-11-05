import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileQuestion, Home, ArrowLeft } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
            <CardTitle>Página no encontrada</CardTitle>
          </div>
          <CardDescription>La página que está buscando no existe o ha sido movida.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-6">
            <p className="text-6xl font-bold text-muted-foreground">404</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="h-4 w-4" />
                Ir al Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href="javascript:history.back()">
                <ArrowLeft className="h-4 w-4" />
                Volver Atrás
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
