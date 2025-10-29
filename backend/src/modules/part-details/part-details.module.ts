import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { DetalleRepuesto } from "./entities/detalle-repuesto.entity";
import { PartDetailsService } from "./part-details.service";
import { PartDetailsController } from "./part-details.controller";

@Module({
  imports: [TypeOrmModule.forFeature([DetalleRepuesto])],
  controllers: [PartDetailsController],
  providers: [PartDetailsService],
  exports: [PartDetailsService],
})
export class PartDetailsModule {}
