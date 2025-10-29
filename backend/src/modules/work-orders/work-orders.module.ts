import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdenTrabajo } from "./entities/orden-trabajo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Repuesto } from "../parts/entities/repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { WorkOrdersService } from "./work-orders.service";
import { WorkOrdersController } from "./work-orders.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrdenTrabajo,
      Vehiculo,
      Usuario,
      PlanPreventivo,
      DetalleRepuesto,
      Repuesto,
      Tarea,
    ]),
  ],
  controllers: [WorkOrdersController],
  providers: [WorkOrdersService],
  exports: [WorkOrdersService],
})
export class WorkOrdersModule {}
