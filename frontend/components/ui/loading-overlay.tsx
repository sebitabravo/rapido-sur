/**
 * Loading Overlay Component
 * Shows a full-screen loading overlay with spinner and message
 * Useful for page-level loading states
 *
 * @example
 * <LoadingOverlay message="Cargando datos..." />
 */

import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  message?: string
  className?: string
  fullScreen?: boolean
}

export function LoadingOverlay({
  message = "Cargando...",
  className,
  fullScreen = false,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 bg-background/80 backdrop-blur-sm",
        fullScreen
          ? "fixed inset-0 z-50"
          : "absolute inset-0 z-10 rounded-lg",
        className
      )}
    >
      <Spinner className="h-12 w-12 text-primary" />
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  )
}
