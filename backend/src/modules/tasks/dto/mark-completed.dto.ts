import { IsOptional, IsString } from "class-validator";

/**
 * DTO for marking a task as completed
 */
export class MarkCompletedDto {
  /**
   * Optional: Final observations when completing the task
   */
  @IsOptional()
  @IsString()
  observaciones_finales?: string;
}
