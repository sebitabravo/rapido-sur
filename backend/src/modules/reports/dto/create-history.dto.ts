import { IsString, IsNotEmpty } from 'class-validator';

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  tipo: string;

  @IsString()
  @IsNotEmpty()
  fecha_inicio: string;

  @IsString()
  @IsNotEmpty()
  fecha_fin: string;

  @IsString()
  usuario?: string;
}
