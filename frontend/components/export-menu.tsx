"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileJson, FileSpreadsheet, Printer } from "lucide-react"
import { exportToCSV, exportToJSON, printReport } from "@/lib/export-utils"

interface ExportMenuProps {
  data: any[]
  filename: string
  printElementId?: string
}

export function ExportMenu({ data, filename, printElementId }: ExportMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4" />
          Exportar
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato de Exportación</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => exportToCSV(data, filename)}>
          <FileSpreadsheet className="h-4 w-4" />
          Exportar a CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportToJSON(data, filename)}>
          <FileJson className="h-4 w-4" />
          Exportar a JSON
        </DropdownMenuItem>
        {printElementId && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => printReport(printElementId)}>
              <Printer className="h-4 w-4" />
              Imprimir Reporte
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
