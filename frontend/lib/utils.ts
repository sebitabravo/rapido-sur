import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe date formatter that prevents "Invalid time value" errors
 * Returns "-" for null/undefined/invalid dates
 *
 * @param dateString - The date string to format
 * @param formatStr - The format string (default: "dd/MM/yyyy")
 * @returns Formatted date string or "-" if invalid
 */
export function formatDate(
  dateString: string | undefined | null,
  formatStr: string = "dd/MM/yyyy"
): string {
  if (!dateString) return "-"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      console.warn("Invalid date value:", dateString)
      return "-"
    }
    return format(date, formatStr, { locale: es })
  } catch (error) {
    console.error("Error formatting date:", dateString, error)
    return "-"
  }
}
