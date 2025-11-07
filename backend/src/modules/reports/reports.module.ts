import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { ReportsService } from "./reports.service";
import { ReportsController } from "./reports.controller";

@Module({
  imports: [TypeOrmModule.forFeature([OrdenTrabajo, DetalleRepuesto, Tarea])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
