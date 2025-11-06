import { toast } from "sonner"

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
  ) {
    super(message)
    this.name = "AppError"
  }
}

export const handleError = (error: unknown, customMessage?: string) => {
  console.error("[v0] Error:", error)

  if (error instanceof AppError) {
    toast.error(customMessage || error.message)
    return
  }

  if (error instanceof Error) {
    toast.error(customMessage || error.message)
    return
  }

  toast.error(customMessage || "Ha ocurrido un error inesperado")
}

export const withErrorHandling = async <T>(\
  fn: () => Promise<T>,\
  errorMessage?: string,\
)
: Promise<T | null> =>
{
  try {
    return await fn()
  } catch (error) {
    handleError(error, errorMessage)
    return null
  }
}
