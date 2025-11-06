import { Controller, Get } from "@nestjs/common";
import { PartDetailsService } from "./part-details.service";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";

/**
 * Controller for part detail endpoints
 */
@Controller("detalles-repuestos")
export class PartDetailsController {
  constructor(private readonly partDetailsService: PartDetailsService) {}

  @Get()
  async findAll(): Promise<DetalleRepuesto[]> {
    return this.partDetailsService.findAll();
  }
}
