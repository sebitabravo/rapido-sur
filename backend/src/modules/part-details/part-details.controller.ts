import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
} from "@nestjs/swagger";
import { PartDetailsService } from "./part-details.service";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";
import { RegisterUsageDto } from "./dto/register-usage.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

/**
 * Controller for part detail endpoints
 */
@ApiTags("Part Details")
@ApiBearerAuth("JWT-auth")
@Controller("detalle-repuestos")
@UseGuards(JwtAuthGuard)
export class PartDetailsController {
  constructor(private readonly partDetailsService: PartDetailsService) {}

  @Get()
  @ApiOperation({ summary: "Listar todos los detalles de repuestos" })
  @ApiResponse({ status: 200, description: "Lista de detalles" })
  async findAll(): Promise<DetalleRepuesto[]> {
    return this.partDetailsService.findAll();
  }

  @Get("tarea/:tareaId")
  @ApiOperation({ summary: "Obtener detalles de repuestos por tarea" })
  @ApiParam({ name: "tareaId", type: Number })
  @ApiResponse({ status: 200, description: "Detalles encontrados" })
  async findByTask(
    @Param("tareaId", ParseIntPipe) tareaId: number,
  ): Promise<DetalleRepuesto[]> {
    return this.partDetailsService.findByTask(tareaId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Obtener detalle por ID" })
  @ApiParam({ name: "id", type: Number })
  @ApiResponse({ status: 200, description: "Detalle encontrado" })
  @ApiResponse({ status: 404, description: "Detalle no encontrado" })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
  ): Promise<DetalleRepuesto> {
    const detail = await this.partDetailsService.findOne(id);
    if (!detail) {
      throw new NotFoundException(`Detalle con ID ${id} no encontrado`);
    }
    return detail;
  }

  @Post()
  @ApiOperation({ summary: "Registrar uso de repuesto en tarea" })
  @ApiBody({ type: RegisterUsageDto })
  @ApiResponse({ status: 201, description: "Uso registrado exitosamente" })
  @ApiResponse({ status: 400, description: "Datos inválidos" })
  @ApiResponse({ status: 404, description: "Tarea o repuesto no encontrado" })
  async create(@Body() dto: RegisterUsageDto): Promise<DetalleRepuesto> {
    console.log('📦 Received DTO:', JSON.stringify(dto, null, 2));
    console.log('📦 DTO types:', {
      tarea_id: typeof dto.tarea_id,
      repuesto_id: typeof dto.repuesto_id,
      cantidad_usada: typeof dto.cantidad_usada,
    });
    return this.partDetailsService.registerUsage(dto);
  }
}
