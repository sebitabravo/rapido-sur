"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

interface MultiStepWorkOrderFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  vehicles: Array<{ id: number; patente: string; marca: string; modelo: string }>
}

export function MultiStepWorkOrderForm({ onSubmit, onCancel, vehicles }: MultiStepWorkOrderFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    vehiculoId: "",
    tipo: "",
    prioridad: "",
    descripcion: "",
    observaciones: "",
    costoEstimado: "",
    fechaInicio: "",
  })

  const totalSteps = 3
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.vehiculoId && formData.tipo && formData.prioridad
      case 2:
        return formData.descripcion
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">
            Paso {currentStep} de {totalSteps}
          </span>
          <span className="text-muted-foreground">{Math.round(progress)}% completado</span>
        </div>
        <Progress value={progress} />
      </div>

      {/* Step Indicators */}
      <div className="flex items-center justify-between">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                step < currentStep
                  ? "bg-primary border-primary text-primary-foreground"
                  : step === currentStep
                    ? "border-primary text-primary"
                    : "border-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? <Check className="h-5 w-5" /> : step}
            </div>
            {step < 3 && (
              <div
                className={`w-full h-0.5 mx-2 ${step < currentStep ? "bg-primary" : "bg-muted"}`}
                style={{ minWidth: "60px" }}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && "Información Básica"}
            {currentStep === 2 && "Descripción del Trabajo"}
            {currentStep === 3 && "Detalles Adicionales"}
          </CardTitle>
          <CardDescription>
            {currentStep === 1 && "Seleccione el vehículo y tipo de mantenimiento"}
            {currentStep === 2 && "Describa el trabajo a realizar"}
            {currentStep === 3 && "Información adicional y costos estimados"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStep === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="vehiculoId">Vehículo</Label>
                <Select value={formData.vehiculoId} onValueChange={(v) => updateFormData("vehiculoId", v)}>
                  <SelectTrigger id="vehiculoId">
                    <SelectValue placeholder="Seleccione un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                        {vehicle.patente} - {vehicle.marca} {vehicle.modelo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Mantenimiento</Label>
                <Select value={formData.tipo} onValueChange={(v) => updateFormData("tipo", v)}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Seleccione el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PREVENTIVO">Preventivo</SelectItem>
                    <SelectItem value="CORRECTIVO">Correctivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="prioridad">Prioridad</Label>
                <Select value={formData.prioridad} onValueChange={(v) => updateFormData("prioridad", v)}>
                  <SelectTrigger id="prioridad">
                    <SelectValue placeholder="Seleccione la prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALTA">Alta</SelectItem>
                    <SelectItem value="MEDIA">Media</SelectItem>
                    <SelectItem value="BAJA">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción del Trabajo</Label>
                <Textarea
                  id="descripcion"
                  placeholder="Describa detalladamente el trabajo a realizar..."
                  value={formData.descripcion}
                  onChange={(e) => updateFormData("descripcion", e.target.value)}
                  rows={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones Adicionales</Label>
                <Textarea
                  id="observaciones"
                  placeholder="Observaciones, notas o comentarios adicionales..."
                  value={formData.observaciones}
                  onChange={(e) => updateFormData("observaciones", e.target.value)}
                  rows={4}
                />
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="costoEstimado">Costo Estimado</Label>
                <Input
                  id="costoEstimado"
                  type="number"
                  placeholder="0.00"
                  value={formData.costoEstimado}
                  onChange={(e) => updateFormData("costoEstimado", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaInicio">Fecha de Inicio Programada</Label>
                <Input
                  id="fechaInicio"
                  type="date"
                  value={formData.fechaInicio}
                  onChange={(e) => updateFormData("fechaInicio", e.target.value)}
                />
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-3">Resumen de la Orden</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Vehículo:</span>
                    <span className="font-medium">
                      {vehicles.find((v) => v.id.toString() === formData.vehiculoId)?.patente || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tipo:</span>
                    <span className="font-medium">{formData.tipo || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Prioridad:</span>
                    <span className="font-medium">{formData.prioridad || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Costo Estimado:</span>
                    <span className="font-medium">${formData.costoEstimado || "0"}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={currentStep === 1 ? onCancel : handleBack}>
          <ChevronLeft className="h-4 w-4" />
          {currentStep === 1 ? "Cancelar" : "Anterior"}
        </Button>

        {currentStep < totalSteps ? (
          <Button onClick={handleNext} disabled={!isStepValid()}>
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={!isStepValid()}>
            <Check className="h-4 w-4" />
            Crear Orden
          </Button>
        )}
      </div>
    </div>
  )
}
