import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repuesto } from "./entities/repuesto.entity";
import { PartsService } from "./parts.service";
import { PartsController } from "./parts.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Repuesto])],
  controllers: [PartsController],
  providers: [PartsService],
  exports: [PartsService],
})
export class PartsModule {}
