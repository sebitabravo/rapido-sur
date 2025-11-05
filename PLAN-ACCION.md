# 🚀 Plan de Acción - Sistema Rápido Sur

**Fecha de creación**: 5 de noviembre de 2025
**Estado del sistema**: Pre-MVP (40% funcional)
**Objetivo**: Completar flujo completo de mantenimiento vehicular
**Tiempo estimado total**: 52-80 horas

---

## 📋 ÍNDICE

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Fase 1: Crítico (Desbloquear flujo básico)](#fase-1-crítico-desbloquear-flujo-básico)
3. [Fase 2: Alto Impacto (Completar gestión de OT)](#fase-2-alto-impacto-completar-gestión-de-ot)
4. [Fase 3: Calidad (Validaciones y costos)](#fase-3-calidad-validaciones-y-costos)
5. [Fase 4: Mejoras (Features adicionales)](#fase-4-mejoras-features-adicionales)
6. [Checklist de Verificación](#checklist-de-verificación)

---

## 🎯 RESUMEN EJECUTIVO

### Situación Actual:
- ✅ Backend: 85% funcional
- ❌ Frontend: 40% funcional
- ❌ Flujo completo: NO ejecutable

### Bloqueadores Principales:
1. Planes preventivos sin CRUD
2. Frontend no puede gestionar ciclo de vida de OT
3. Incompatibilidad de DTOs entre frontend y backend

### Meta:
Lograr que el flujo completo documentado en `FLUJO-COMPLETO-EJEMPLO.md` sea ejecutable end-to-end.

---

## 🔥 FASE 1: CRÍTICO (Desbloquear flujo básico)

**Duración estimada**: 12-16 horas
**Prioridad**: MÁXIMA
**Objetivo**: Permitir crear OT y planes preventivos

### Tarea 1.1: Arreglar Incompatibilidad de DTOs en Órdenes de Trabajo

**Problema**: Frontend envía campos que backend no acepta.

**Archivo**: `frontend/components/work-order-dialog.tsx`

**Cambios requeridos** (líneas 24-31):

```typescript
// ❌ ANTES (INCORRECTO):
const workOrderSchema = z.object({
  vehiculoId: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo: z.enum(["PREVENTIVO", "CORRECTIVO", "INSPECCION"]),
  prioridad: z.enum(["ALTA", "MEDIA", "BAJA"]),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  observaciones: z.string().optional(),
  costoEstimado: z.number().min(0, "El costo debe ser positivo").optional(),
})

// ✅ DESPUÉS (CORRECTO):
const workOrderSchema = z.object({
  vehiculo_id: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo: z.enum(["Preventivo", "Correctivo"]),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
})
```

**Cambios en el formulario** (líneas 107-116):

```typescript
// ❌ ANTES:
const onSubmit = async (data: WorkOrderFormData) => {
  try {
    setLoading(true)
    if (isEdit) {
      await api.workOrders.update(workOrder.id, data)
      toast.success("Orden de trabajo actualizada correctamente")
    } else {
      await api.workOrders.create(data)  // ❌ data tiene campos incorrectos
      toast.success("Orden de trabajo creada correctamente")
    }

// ✅ DESPUÉS:
const onSubmit = async (data: WorkOrderFormData) => {
  try {
    setLoading(true)
    // Transformar datos al formato del backend
    const payload = {
      vehiculo_id: data.vehiculo_id,
      tipo: data.tipo,
      descripcion: data.descripcion,
    }

    if (isEdit) {
      await api.workOrders.update(workOrder.id, payload)
      toast.success("Orden de trabajo actualizada correctamente")
    } else {
      await api.workOrders.create(payload)
      toast.success("Orden de trabajo creada correctamente")
    }
```

**Eliminar del formulario** (líneas 174-228):
- Campo "Prioridad" (eliminar líneas 174-191)
- Campo "Costo Estimado" (eliminar líneas 217-228)
- Campo "Observaciones" (opcional mantener si backend lo soporta en update)

**Actualizar useForm defaultValues** (líneas 56-63):

```typescript
// ✅ CORRECTO:
defaultValues: {
  vehiculo_id: 0,
  tipo: "Preventivo",
  descripcion: "",
}
```

**Actualizar watch y setValue**:

```typescript
// Cambiar:
const vehiculoId = watch("vehiculoId")
// Por:
const vehiculo_id = watch("vehiculo_id")

// Cambiar:
setValue("vehiculoId", Number.parseInt(value))
// Por:
setValue("vehiculo_id", Number.parseInt(value))
```

---

### Tarea 1.2: Implementar CRUD Completo de Planes Preventivos

#### 1.2.1 Backend - Crear DTOs

**Archivo nuevo**: `backend/src/modules/preventive-plans/dto/create-plan-preventivo.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsInt,
  Min,
  IsOptional,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TipoIntervalo } from '../../../common/enums';

export class CreatePlanPreventivoDto {
  @ApiProperty({
    description: 'ID del vehículo al que pertenece el plan',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  vehiculo_id: number;

  @ApiProperty({
    description: 'Tipo de mantenimiento',
    example: 'Mantenimiento preventivo general',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  tipo_mantenimiento: string;

  @ApiProperty({
    description: 'Tipo de intervalo: por kilometraje o por tiempo',
    enum: TipoIntervalo,
    example: TipoIntervalo.KM,
  })
  @IsEnum(TipoIntervalo, {
    message: 'El tipo de intervalo debe ser KM o Tiempo',
  })
  @IsNotEmpty()
  tipo_intervalo: TipoIntervalo;

  @ApiProperty({
    description: 'Intervalo en kilómetros o días según tipo_intervalo',
    example: 10000,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'El intervalo debe ser mayor a 0' })
  @IsNotEmpty()
  intervalo: number;

  @ApiProperty({
    description: 'Descripción detallada del plan de mantenimiento',
    example:
      'Cambio de aceite, filtros, revisión de frenos y suspensión cada 10,000 km',
  })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({
    description: 'Próximo kilometraje para mantenimiento (solo si tipo_intervalo = KM)',
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  proximo_kilometraje?: number;

  @ApiProperty({
    description: 'Próxima fecha para mantenimiento (solo si tipo_intervalo = Tiempo)',
    example: '2025-06-01',
    required: false,
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  proxima_fecha?: Date;

  @ApiProperty({
    description: 'Indica si el plan está activo',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
```

**Archivo nuevo**: `backend/src/modules/preventive-plans/dto/update-plan-preventivo.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { CreatePlanPreventivoDto } from './create-plan-preventivo.dto';

export class UpdatePlanPreventivoDto extends PartialType(
  CreatePlanPreventivoDto,
) {}
```

#### 1.2.2 Backend - Actualizar Servicio

**Archivo**: `backend/src/modules/preventive-plans/preventive-plans.service.ts`

**Agregar después de la línea 34:**

```typescript
/**
 * Create a new preventive maintenance plan
 */
async create(
  createDto: CreatePlanPreventivoDto,
): Promise<PlanPreventivo> {
  // Validate vehicle exists
  const vehiculo = await this.vehiculosRepository.findOne({
    where: { id: createDto.vehiculo_id },
  });

  if (!vehiculo) {
    throw new NotFoundException(
      `Vehículo con ID ${createDto.vehiculo_id} no encontrado`,
    );
  }

  // Check if vehicle already has a preventive plan
  const existingPlan = await this.planesPreventivosRepository.findOne({
    where: { vehiculo: { id: createDto.vehiculo_id } },
  });

  if (existingPlan) {
    throw new BadRequestException(
      `El vehículo ${vehiculo.patente} ya tiene un plan preventivo asociado`,
    );
  }

  // Validate that proximo_kilometraje or proxima_fecha is set based on tipo_intervalo
  if (createDto.tipo_intervalo === TipoIntervalo.KM) {
    if (!createDto.proximo_kilometraje) {
      // Auto-calculate based on current mileage
      createDto.proximo_kilometraje =
        vehiculo.kilometraje_actual + createDto.intervalo;
    }
  } else if (createDto.tipo_intervalo === TipoIntervalo.Tiempo) {
    if (!createDto.proxima_fecha) {
      // Auto-calculate based on current date
      const fechaProxima = new Date();
      fechaProxima.setDate(fechaProxima.getDate() + createDto.intervalo);
      createDto.proxima_fecha = fechaProxima;
    }
  }

  const plan = this.planesPreventivosRepository.create({
    ...createDto,
    vehiculo,
    activo: createDto.activo ?? true,
  });

  await this.planesPreventivosRepository.save(plan);

  this.logger.log(
    `Plan preventivo creado para vehículo ${vehiculo.patente}: cada ${createDto.intervalo} ${createDto.tipo_intervalo}`,
  );

  return plan;
}

/**
 * Update an existing preventive plan
 */
async update(
  id: number,
  updateDto: UpdatePlanPreventivoDto,
): Promise<PlanPreventivo> {
  const plan = await this.findOne(id);

  if (!plan) {
    throw new NotFoundException(
      `Plan preventivo con ID ${id} no encontrado`,
    );
  }

  // If vehiculo_id is being changed, validate new vehicle exists
  if (updateDto.vehiculo_id && updateDto.vehiculo_id !== plan.vehiculo.id) {
    const vehiculo = await this.vehiculosRepository.findOne({
      where: { id: updateDto.vehiculo_id },
    });

    if (!vehiculo) {
      throw new NotFoundException(
        `Vehículo con ID ${updateDto.vehiculo_id} no encontrado`,
      );
    }

    // Check if new vehicle already has a plan
    const existingPlan = await this.planesPreventivosRepository.findOne({
      where: { vehiculo: { id: updateDto.vehiculo_id } },
    });

    if (existingPlan && existingPlan.id !== id) {
      throw new BadRequestException(
        `El vehículo ${vehiculo.patente} ya tiene un plan preventivo asociado`,
      );
    }

    plan.vehiculo = vehiculo;
  }

  // Update fields
  if (updateDto.tipo_mantenimiento !== undefined) {
    plan.tipo_mantenimiento = updateDto.tipo_mantenimiento;
  }
  if (updateDto.tipo_intervalo !== undefined) {
    plan.tipo_intervalo = updateDto.tipo_intervalo;
  }
  if (updateDto.intervalo !== undefined) {
    plan.intervalo = updateDto.intervalo;
  }
  if (updateDto.descripcion !== undefined) {
    plan.descripcion = updateDto.descripcion;
  }
  if (updateDto.proximo_kilometraje !== undefined) {
    plan.proximo_kilometraje = updateDto.proximo_kilometraje;
  }
  if (updateDto.proxima_fecha !== undefined) {
    plan.proxima_fecha = updateDto.proxima_fecha;
  }
  if (updateDto.activo !== undefined) {
    plan.activo = updateDto.activo;
  }

  await this.planesPreventivosRepository.save(plan);

  this.logger.log(`Plan preventivo ${id} actualizado`);

  return this.findOne(id);
}

/**
 * Deactivate a preventive plan (soft delete)
 */
async remove(id: number): Promise<void> {
  const plan = await this.findOne(id);

  if (!plan) {
    throw new NotFoundException(
      `Plan preventivo con ID ${id} no encontrado`,
    );
  }

  // Deactivate instead of hard delete
  plan.activo = false;
  await this.planesPreventivosRepository.save(plan);

  this.logger.log(
    `Plan preventivo ${id} desactivado para vehículo ${plan.vehiculo.patente}`,
  );
}

/**
 * Get preventive plan by vehicle ID
 */
async findByVehiculo(vehiculoId: number): Promise<PlanPreventivo | null> {
  return this.planesPreventivosRepository.findOne({
    where: { vehiculo: { id: vehiculoId }, activo: true },
    relations: ['vehiculo'],
  });
}
```

**Agregar imports necesarios:**

```typescript
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TipoIntervalo } from '../../common/enums';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';
```

#### 1.2.3 Backend - Actualizar Controlador

**Archivo**: `backend/src/modules/preventive-plans/preventive-plans.controller.ts`

**Agregar después de la línea 92:**

```typescript
/**
 * POST /planes-preventivos
 * Create new preventive plan
 */
@ApiOperation({
  summary: 'Crear nuevo plan preventivo',
  description:
    'Crea un plan de mantenimiento preventivo para un vehículo. Solo un plan activo por vehículo.',
})
@ApiBody({
  type: CreatePlanPreventivoDto,
  examples: {
    porKilometraje: {
      summary: 'Plan por Kilometraje',
      value: {
        vehiculo_id: 1,
        tipo_mantenimiento: 'Mantenimiento general',
        tipo_intervalo: 'KM',
        intervalo: 10000,
        descripcion: 'Cambio de aceite, filtros, revisión de frenos cada 10,000 km',
        proximo_kilometraje: 25000,
        activo: true,
      },
    },
    porTiempo: {
      summary: 'Plan por Tiempo',
      value: {
        vehiculo_id: 2,
        tipo_mantenimiento: 'Revisión técnica',
        tipo_intervalo: 'Tiempo',
        intervalo: 180,
        descripcion: 'Revisión técnica obligatoria cada 6 meses',
        proxima_fecha: '2025-06-01',
        activo: true,
      },
    },
  },
})
@ApiResponse({
  status: 201,
  description: 'Plan preventivo creado exitosamente',
})
@ApiForbiddenResponse({
  description: 'Solo Admin y Jefe pueden crear planes',
})
@Post()
@UseGuards(RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
async create(
  @Body() createDto: CreatePlanPreventivoDto,
): Promise<PlanPreventivo> {
  return this.preventivePlansService.create(createDto);
}

/**
 * PATCH /planes-preventivos/:id
 * Update existing preventive plan
 */
@ApiOperation({
  summary: 'Actualizar plan preventivo',
  description: 'Actualiza un plan de mantenimiento preventivo existente.',
})
@ApiParam({ name: 'id', type: Number, description: 'ID del plan preventivo' })
@ApiBody({ type: UpdatePlanPreventivoDto })
@ApiResponse({
  status: 200,
  description: 'Plan preventivo actualizado exitosamente',
})
@ApiForbiddenResponse({
  description: 'Solo Admin y Jefe pueden actualizar planes',
})
@Patch(':id')
@UseGuards(RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateDto: UpdatePlanPreventivoDto,
): Promise<PlanPreventivo> {
  return this.preventivePlansService.update(id, updateDto);
}

/**
 * DELETE /planes-preventivos/:id
 * Deactivate preventive plan
 */
@ApiOperation({
  summary: 'Desactivar plan preventivo',
  description: 'Desactiva un plan de mantenimiento preventivo (soft delete).',
})
@ApiParam({ name: 'id', type: Number, description: 'ID del plan preventivo' })
@ApiResponse({
  status: 200,
  description: 'Plan preventivo desactivado exitosamente',
})
@ApiForbiddenResponse({
  description: 'Solo Admin y Jefe pueden desactivar planes',
})
@Delete(':id')
@UseGuards(RolesGuard)
@Roles(RolUsuario.Administrador, RolUsuario.JefeMantenimiento)
async remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
  return this.preventivePlansService.remove(id);
}

/**
 * GET /planes-preventivos/vehiculo/:vehiculoId
 * Get preventive plan by vehicle
 */
@ApiOperation({
  summary: 'Obtener plan preventivo por vehículo',
  description: 'Obtiene el plan de mantenimiento de un vehículo específico.',
})
@ApiParam({
  name: 'vehiculoId',
  type: Number,
  description: 'ID del vehículo',
})
@ApiResponse({
  status: 200,
  description: 'Plan preventivo encontrado',
})
@ApiResponse({
  status: 404,
  description: 'Plan no encontrado',
})
@Get('vehiculo/:vehiculoId')
async findByVehiculo(
  @Param('vehiculoId', ParseIntPipe) vehiculoId: number,
): Promise<PlanPreventivo> {
  const plan = await this.preventivePlansService.findByVehiculo(vehiculoId);
  if (!plan) {
    throw new NotFoundException(
      `No se encontró plan preventivo para el vehículo con ID ${vehiculoId}`,
    );
  }
  return plan;
}
```

**Agregar imports necesarios:**

```typescript
import { Post, Patch, Delete, Body, ParseIntPipe } from '@nestjs/common';
import { ApiBody, ApiParam } from '@nestjs/swagger';
import { CreatePlanPreventivoDto } from './dto/create-plan-preventivo.dto';
import { UpdatePlanPreventivoDto } from './dto/update-plan-preventivo.dto';
```

#### 1.2.4 Frontend - Crear Componente PreventivePlanDialog

**Archivo nuevo**: `frontend/components/preventive-plan-dialog.tsx`

```typescript
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

const preventivePlanSchema = z.object({
  vehiculo_id: z.number().min(1, "Debe seleccionar un vehículo"),
  tipo_mantenimiento: z.string().min(3, "Mínimo 3 caracteres"),
  tipo_intervalo: z.enum(["KM", "Tiempo"]),
  intervalo: z.number().min(1, "El intervalo debe ser mayor a 0"),
  descripcion: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  proximo_kilometraje: z.number().min(0).optional(),
  proxima_fecha: z.string().optional(),
  activo: z.boolean().default(true),
})

type PreventivePlanFormData = z.infer<typeof preventivePlanSchema>

interface PreventivePlanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  plan?: any
  vehicleId?: number
  onSave: () => void
}

export function PreventivePlanDialog({
  open,
  onOpenChange,
  plan,
  vehicleId,
  onSave,
}: PreventivePlanDialogProps) {
  const [loading, setLoading] = useState(false)
  const [vehicles, setVehicles] = useState<any[]>([])
  const isEdit = !!plan

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PreventivePlanFormData>({
    resolver: zodResolver(preventivePlanSchema),
    defaultValues: {
      vehiculo_id: vehicleId || 0,
      tipo_mantenimiento: "",
      tipo_intervalo: "KM",
      intervalo: 10000,
      descripcion: "",
      activo: true,
    },
  })

  const vehiculo_id_value = watch("vehiculo_id")
  const tipo_intervalo = watch("tipo_intervalo")

  useEffect(() => {
    if (open && !vehicleId) {
      loadVehicles()
    }
  }, [open, vehicleId])

  useEffect(() => {
    if (plan) {
      reset({
        vehiculo_id: plan.vehiculo.id,
        tipo_mantenimiento: plan.tipo_mantenimiento,
        tipo_intervalo: plan.tipo_intervalo,
        intervalo: plan.intervalo,
        descripcion: plan.descripcion,
        proximo_kilometraje: plan.proximo_kilometraje || undefined,
        proxima_fecha: plan.proxima_fecha || undefined,
        activo: plan.activo,
      })
    } else {
      reset({
        vehiculo_id: vehicleId || 0,
        tipo_mantenimiento: "",
        tipo_intervalo: "KM",
        intervalo: 10000,
        descripcion: "",
        activo: true,
      })
    }
  }, [plan, vehicleId, reset])

  const loadVehicles = async () => {
    try {
      const response = await api.vehicles.getAll({ page: 1, limit: 1000 })
      setVehicles(response.data.items || [])
    } catch (error) {
      console.error("Error loading vehicles:", error)
    }
  }

  const onSubmit = async (data: PreventivePlanFormData) => {
    try {
      setLoading(true)

      // Preparar payload según tipo_intervalo
      const payload: any = {
        vehiculo_id: data.vehiculo_id,
        tipo_mantenimiento: data.tipo_mantenimiento,
        tipo_intervalo: data.tipo_intervalo,
        intervalo: data.intervalo,
        descripcion: data.descripcion,
        activo: data.activo,
      }

      if (data.tipo_intervalo === "KM" && data.proximo_kilometraje) {
        payload.proximo_kilometraje = data.proximo_kilometraje
      } else if (data.tipo_intervalo === "Tiempo" && data.proxima_fecha) {
        payload.proxima_fecha = data.proxima_fecha
      }

      if (isEdit) {
        await api.preventivePlans.update(plan.id, payload)
        toast.success("Plan preventivo actualizado correctamente")
      } else {
        await api.preventivePlans.create(payload)
        toast.success("Plan preventivo creado correctamente")
      }
      onSave()
    } catch (error: any) {
      console.error("Error saving preventive plan:", error)
      toast.error(error.response?.data?.message || "Error al guardar el plan preventivo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Plan Preventivo" : "Nuevo Plan Preventivo"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Modifique los datos del plan" : "Complete los datos del nuevo plan de mantenimiento"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="vehiculo_id">Vehículo *</Label>
              <Select
                value={vehiculo_id_value.toString()}
                onValueChange={(value) => setValue("vehiculo_id", Number.parseInt(value))}
                disabled={loading || isEdit || !!vehicleId}
              >
                <SelectTrigger id="vehiculo_id" className="w-full">
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
              {errors.vehiculo_id && <p className="text-xs text-destructive">{errors.vehiculo_id.message}</p>}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="tipo_mantenimiento">Tipo de Mantenimiento *</Label>
              <Input
                id="tipo_mantenimiento"
                placeholder="Ej: Mantenimiento general"
                {...register("tipo_mantenimiento")}
                aria-invalid={!!errors.tipo_mantenimiento}
                disabled={loading}
              />
              {errors.tipo_mantenimiento && (
                <p className="text-xs text-destructive">{errors.tipo_mantenimiento.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipo_intervalo">Tipo de Intervalo *</Label>
              <Select
                value={tipo_intervalo}
                onValueChange={(value) => setValue("tipo_intervalo", value as "KM" | "Tiempo")}
                disabled={loading}
              >
                <SelectTrigger id="tipo_intervalo" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KM">Por Kilometraje</SelectItem>
                  <SelectItem value="Tiempo">Por Tiempo (días)</SelectItem>
                </SelectContent>
              </Select>
              {errors.tipo_intervalo && <p className="text-xs text-destructive">{errors.tipo_intervalo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="intervalo">
                Intervalo * {tipo_intervalo === "KM" ? "(kilómetros)" : "(días)"}
              </Label>
              <Input
                id="intervalo"
                type="number"
                placeholder={tipo_intervalo === "KM" ? "10000" : "180"}
                {...register("intervalo", { valueAsNumber: true })}
                aria-invalid={!!errors.intervalo}
                disabled={loading}
              />
              {errors.intervalo && <p className="text-xs text-destructive">{errors.intervalo.message}</p>}
            </div>

            {tipo_intervalo === "KM" && (
              <div className="space-y-2">
                <Label htmlFor="proximo_kilometraje">Próximo Kilometraje</Label>
                <Input
                  id="proximo_kilometraje"
                  type="number"
                  placeholder="25000"
                  {...register("proximo_kilometraje", { valueAsNumber: true })}
                  disabled={loading}
                />
              </div>
            )}

            {tipo_intervalo === "Tiempo" && (
              <div className="space-y-2">
                <Label htmlFor="proxima_fecha">Próxima Fecha</Label>
                <Input
                  id="proxima_fecha"
                  type="date"
                  {...register("proxima_fecha")}
                  disabled={loading}
                />
              </div>
            )}

            <div className="space-y-2 col-span-2">
              <Label htmlFor="descripcion">Descripción *</Label>
              <Textarea
                id="descripcion"
                placeholder="Detalle las tareas a realizar en este mantenimiento..."
                {...register("descripcion")}
                aria-invalid={!!errors.descripcion}
                disabled={loading}
                rows={3}
              />
              {errors.descripcion && <p className="text-xs text-destructive">{errors.descripcion.message}</p>}
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
```

#### 1.2.5 Frontend - Actualizar API Client

**Archivo**: `frontend/lib/api.ts`

**Agregar después de la sección de vehicles:**

```typescript
// Preventive Plans
preventivePlans: {
  getAll: () => apiClient.get("/planes-preventivos"),
  getById: (id: number) => apiClient.get(`/planes-preventivos/${id}`),
  getByVehicle: (vehiculoId: number) => apiClient.get(`/planes-preventivos/vehiculo/${vehiculoId}`),
  create: (data: any) => apiClient.post("/planes-preventivos", data),
  update: (id: number, data: any) => apiClient.patch(`/planes-preventivos/${id}`, data),
  delete: (id: number) => apiClient.delete(`/planes-preventivos/${id}`),
},
```

#### 1.2.6 Frontend - Integrar en Página de Vehículos

**Archivo**: `frontend/app/vehicles/[id]/page.tsx`

**Agregar botón "Agregar Plan Preventivo" y diálogo:**

```typescript
import { PreventivePlanDialog } from "@/components/preventive-plan-dialog"

// Agregar states
const [planDialogOpen, setPlanDialogOpen] = useState(false)
const [preventivePlan, setPreventivePlan] = useState<any>(null)

// Agregar función para cargar plan
const loadPreventivePlan = async () => {
  try {
    const response = await api.preventivePlans.getByVehicle(vehicleId)
    setPreventivePlan(response.data)
  } catch (error) {
    // No plan found is OK
    setPreventivePlan(null)
  }
}

// Llamar en useEffect
useEffect(() => {
  loadVehicleDetails()
  loadWorkOrders()
  loadPreventivePlan()
}, [vehicleId])

// Agregar en JSX donde corresponda
{!preventivePlan ? (
  <Button onClick={() => setPlanDialogOpen(true)}>
    <Plus className="h-4 w-4" />
    Crear Plan Preventivo
  </Button>
) : (
  <div>
    <h3>Plan Preventivo Activo</h3>
    <p>Cada {preventivePlan.intervalo} {preventivePlan.tipo_intervalo}</p>
    <Button variant="outline" onClick={() => setPlanDialogOpen(true)}>
      Editar Plan
    </Button>
  </div>
)}

// Agregar diálogo al final
<PreventivePlanDialog
  open={planDialogOpen}
  onOpenChange={setPlanDialogOpen}
  plan={preventivePlan}
  vehicleId={vehicleId}
  onSave={() => {
    loadPreventivePlan()
    setPlanDialogOpen(false)
  }}
/>
```

---

### Tarea 1.3: Agregar UI para Asignar Mecánico

**Archivo nuevo**: `frontend/components/assign-mechanic-dialog.tsx`

```typescript
"use client"

import { useEffect, useState } from "react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

interface AssignMechanicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workOrderId: number
  currentMechanic?: { id: number; nombre: string }
  onSave: () => void
}

export function AssignMechanicDialog({
  open,
  onOpenChange,
  workOrderId,
  currentMechanic,
  onSave,
}: AssignMechanicDialogProps) {
  const [loading, setLoading] = useState(false)
  const [mechanics, setMechanics] = useState<any[]>([])
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>(
    currentMechanic?.id.toString() || ""
  )

  useEffect(() => {
    if (open) {
      loadMechanics()
    }
  }, [open])

  const loadMechanics = async () => {
    try {
      // Asumiendo que el backend tiene endpoint para listar mecánicos
      const response = await api.users.getByRole("Mecanico")
      setMechanics(response.data || [])
    } catch (error) {
      console.error("Error loading mechanics:", error)
      toast.error("Error al cargar la lista de mecánicos")
    }
  }

  const handleAssign = async () => {
    if (!selectedMechanicId) {
      toast.error("Debe seleccionar un mecánico")
      return
    }

    try {
      setLoading(true)
      await api.workOrders.assignMechanic(workOrderId, {
        mecanico_id: Number.parseInt(selectedMechanicId),
      })
      toast.success("Mecánico asignado correctamente")
      onSave()
      onOpenChange(false)
    } catch (error: any) {
      console.error("Error assigning mechanic:", error)
      toast.error(error.response?.data?.message || "Error al asignar mecánico")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Asignar Mecánico</DialogTitle>
          <DialogDescription>
            Seleccione el mecánico responsable de esta orden de trabajo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mechanic">Mecánico *</Label>
            <Select
              value={selectedMechanicId}
              onValueChange={setSelectedMechanicId}
              disabled={loading}
            >
              <SelectTrigger id="mechanic" className="w-full">
                <SelectValue placeholder="Seleccione un mecánico" />
              </SelectTrigger>
              <SelectContent>
                {mechanics.map((mechanic) => (
                  <SelectItem key={mechanic.id} value={mechanic.id.toString()}>
                    {mechanic.nombre_completo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedMechanicId}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Asignando...
              </>
            ) : (
              "Asignar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Actualizar API client** para agregar:

```typescript
// Users
users: {
  getByRole: (role: string) => apiClient.get("/usuarios/rol/" + role),
  // ... otros métodos
},

// Work Orders
workOrders: {
  assignMechanic: (id: number, data: { mecanico_id: number }) =>
    apiClient.patch(`/ordenes-trabajo/${id}/asignar`, data),
  // ... otros métodos
},
```

---

### ✅ Checklist Fase 1:

- [ ] Tarea 1.1: DTO de work-order-dialog.tsx corregido
- [ ] Tarea 1.2.1: DTOs de plan preventivo creados
- [ ] Tarea 1.2.2: Servicio de plan preventivo actualizado
- [ ] Tarea 1.2.3: Controlador de plan preventivo actualizado
- [ ] Tarea 1.2.4: Componente PreventivePlanDialog creado
- [ ] Tarea 1.2.5: API client actualizado con preventivePlans
- [ ] Tarea 1.2.6: Integración en página de vehículos
- [ ] Tarea 1.3: Componente AssignMechanicDialog creado
- [ ] Rebuild backend Docker container
- [ ] Prueba crear OT desde frontend (debe funcionar)
- [ ] Prueba crear plan preventivo (debe funcionar)
- [ ] Prueba asignar mecánico (debe funcionar)

---

## 🎯 FASE 2: ALTO IMPACTO (Completar gestión de OT)

**Duración estimada**: 16-24 horas
**Prioridad**: ALTA
**Objetivo**: Permitir registrar trabajo y cerrar OT

### Tarea 2.1: Implementar UI para Listar y Gestionar Tareas

**Archivo nuevo**: `frontend/components/task-list.tsx`

```typescript
"use client"

import { useState } from "react"
import { api } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Check, Plus, X } from "lucide-react"
import { toast } from "sonner"

interface Task {
  id: number
  descripcion: string
  completada: boolean
  horas_trabajadas?: number
  mecanico_asignado?: {
    id: number
    nombre_completo: string
  }
}

interface TaskListProps {
  workOrderId: number
  tasks: Task[]
  isReadOnly: boolean
  onUpdate: () => void
}

export function TaskList({ workOrderId, tasks, isReadOnly, onUpdate }: TaskListProps) {
  const [newTask, setNewTask] = useState({
    descripcion: "",
    horas_trabajadas: 0,
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddTask = async () => {
    if (!newTask.descripcion.trim()) {
      toast.error("La descripción de la tarea es requerida")
      return
    }

    try {
      await api.tasks.create({
        orden_trabajo_id: workOrderId,
        descripcion: newTask.descripcion,
        horas_trabajadas: newTask.horas_trabajadas,
        completada: false,
      })
      toast.success("Tarea agregada")
      setNewTask({ descripcion: "", horas_trabajadas: 0 })
      setIsAdding(false)
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al agregar tarea")
    }
  }

  const handleToggleComplete = async (taskId: number, currentStatus: boolean) => {
    try {
      if (!currentStatus) {
        await api.tasks.markCompleted(taskId, {})
        toast.success("Tarea marcada como completada")
      }
      onUpdate()
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Error al actualizar tarea")
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Tareas ({tasks.length})</CardTitle>
          {!isReadOnly && (
            <Button size="sm" onClick={() => setIsAdding(true)} disabled={isAdding}>
              <Plus className="h-4 w-4" />
              Agregar Tarea
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isAdding && (
          <div className="p-4 border rounded-lg space-y-3">
            <div className="space-y-2">
              <Label>Descripción *</Label>
              <Textarea
                placeholder="Descripción de la tarea..."
                value={newTask.descripcion}
                onChange={(e) => setNewTask({ ...newTask, descripcion: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Horas Trabajadas</Label>
              <Input
                type="number"
                step="0.5"
                min="0"
                value={newTask.horas_trabajadas}
                onChange={(e) => setNewTask({ ...newTask, horas_trabajadas: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAddTask}>
                Guardar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsAdding(false)
                  setNewTask({ descripcion: "", horas_trabajadas: 0 })
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {tasks.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay tareas registradas
          </p>
        )}

        {tasks.map((task) => (
          <div key={task.id} className="flex items-start gap-3 p-3 border rounded-lg">
            <div className="mt-1">
              {task.completada ? (
                <Check className="h-5 w-5 text-green-600" />
              ) : (
                <Button
                  size="icon-sm"
                  variant="outline"
                  onClick={() => handleToggleComplete(task.id, task.completada)}
                  disabled={isReadOnly}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${task.completada ? "line-through text-muted-foreground" : ""}`}>
                {task.descripcion}
              </p>
              <div className="flex gap-2 mt-1">
                {task.horas_trabajadas && (
                  <Badge variant="outline">{task.horas_trabajadas}h</Badge>
                )}
                {task.completada && <Badge variant="secondary">Completada</Badge>}
                {task.mecanico_asignado && (
                  <span className="text-xs text-muted-foreground">
                    {task.mecanico_asignado.nombre_completo}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Actualizar API client:**

```typescript
// Tasks
tasks: {
  create: (data: any) => apiClient.post("/tareas", data),
  markCompleted: (id: number, data: any) => apiClient.patch(`/tareas/${id}/completar`, data),
  getByWorkOrder: (ordenTrabajoId: number) => apiClient.get(`/tareas/orden/${ordenTrabajoId}`),
},
```

### Tarea 2.2: Implementar UI para Registrar Repuestos Usados

(Continuar con más detalles de Fase 2...)

### Tarea 2.3: Implementar Botón para Cerrar OT

**Modificar**: `frontend/components/work-order-detail-dialog.tsx`

Agregar botón "Cerrar Orden" que:
1. Valide que todas las tareas estén completadas
2. Muestre resumen de costos
3. Confirme con usuario
4. Llame a `api.workOrders.close(id)`

### Tarea 2.4: Sincronizar Enums

Crear archivo compartido con enums correctos.

---

## 🎨 FASE 3: CALIDAD (Validaciones y costos)

**Duración estimada**: 8-16 horas
**Prioridad**: MEDIA

### Tarea 3.1: Implementar Cálculo de Costo de Mano de Obra

**Backend**: Modificar `work-orders.service.ts` línea 220

### Tarea 3.2: Agregar Validaciones Faltantes

- Vehículo activo
- @MaxLength en DTOs
- Password regex correcto

---

## ⭐ FASE 4: MEJORAS (Features adicionales)

**Duración estimada**: 16-24 horas
**Prioridad**: BAJA

### Tarea 4.1: Gestión Completa de Repuestos

### Tarea 4.2: Auditoría Completa

---

## ✅ CHECKLIST DE VERIFICACIÓN

### Test de Flujo Completo:

1. [ ] Login como Jefe de Mantenimiento
2. [ ] Crear vehículo ABCD-12
3. [ ] Crear plan preventivo cada 10,000 km
4. [ ] Crear OT preventiva (debe funcionar sin errores 400)
5. [ ] Asignar mecánico a la OT
6. [ ] Login como Mecánico asignado
7. [ ] Ver OT asignada en dashboard
8. [ ] Agregar tarea "Cambio de aceite" 2h
9. [ ] Agregar repuesto Aceite 8L
10. [ ] Marcar tarea como completada
11. [ ] Login como Jefe
12. [ ] Cerrar OT
13. [ ] Verificar `ultima_revision` actualizada
14. [ ] Generar reporte de costos
15. [ ] Verificar plan preventivo recalculado

### Test de Validaciones:

```bash
# Password sin carácter especial (debe fallar después de Fase 3)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Password123","nombre_completo":"Test","rol":"Mecanico"}'

# OT con vehículo inactivo (debe fallar después de Fase 3)
curl -X POST http://localhost:3000/api/ordenes-trabajo \
  -H "Authorization: Bearer TOKEN" \
  -d '{"vehiculo_id":99,"tipo":"Preventivo","descripcion":"Test"}'

# Cerrar OT con tareas incompletas (debe fallar)
curl -X PATCH http://localhost:3000/api/ordenes-trabajo/1/cerrar \
  -H "Authorization: Bearer TOKEN"
```

---

## 📊 MÉTRICAS DE PROGRESO

**Estado inicial**: 40% funcional

| Fase | Horas | Funcionalidad |
|------|-------|---------------|
| **FASE 1** | 12-16h | → 70% funcional |
| **FASE 2** | 16-24h | → 90% funcional |
| **FASE 3** | 8-16h | → 95% funcional |
| **FASE 4** | 16-24h | → 100% funcional |

---

## 🎓 RECOMENDACIONES FINALES

1. **Ejecutar Fase 1 COMPLETA antes de deployment**
2. **Crear tests E2E** para cada fase completada
3. **Rebuild Docker containers** después de cambios en backend
4. **Verificar con checklist** después de cada fase
5. **Documentar cambios** en CHANGELOG.md

---

**Próximos pasos**: Comenzar con Tarea 1.1 (arreglar DTOs)

**¿Necesitas ayuda para implementar?** Puedo generar los archivos completos uno por uno.
