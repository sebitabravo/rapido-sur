import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { Repuesto } from "../parts/entities/repuesto.entity";
import { PartDetailsService } from "./part-details.service";
import { PartDetailsController } from "./part-details.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DetalleRepuesto, Tarea, Repuesto])],
  controllers: [PartDetailsController],
  providers: [PartDetailsService],
  exports: [PartDetailsService],
})
export class PartDetailsModule {}
