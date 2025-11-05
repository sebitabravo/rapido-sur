import { PartialType } from '@nestjs/swagger';
import { CreatePlanPreventivoDto } from './create-plan-preventivo.dto';

export class UpdatePlanPreventivoDto extends PartialType(
  CreatePlanPreventivoDto,
) {}
