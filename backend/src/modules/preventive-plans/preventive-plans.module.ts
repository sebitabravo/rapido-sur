import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { PreventivePlansService } from "./preventive-plans.service";
import { PreventivePlansController } from "./preventive-plans.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PlanPreventivo, Vehiculo])],
  controllers: [PreventivePlansController],
  providers: [PreventivePlansService],
  exports: [PreventivePlansService],
})
export class PreventivePlansModule {}
