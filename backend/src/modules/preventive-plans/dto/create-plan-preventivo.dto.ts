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
  MaxLength,
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
  @MaxLength(100)
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
    description:
      'Próximo kilometraje para mantenimiento (solo si tipo_intervalo = KM)',
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  proximo_kilometraje?: number;

  @ApiProperty({
    description:
      'Próxima fecha para mantenimiento (solo si tipo_intervalo = Tiempo)',
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
