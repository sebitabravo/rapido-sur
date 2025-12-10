import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Repuesto } from "./entities/repuesto.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { PartsService } from "./parts.service";
import { PartsController } from "./parts.controller";
import { InventoryAlertsService } from "./inventory-alerts.service";
import { MailModule } from "../mail/mail.module";
import { WebsocketsModule } from "../websockets/websockets.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Repuesto, Usuario]),
    MailModule,
    WebsocketsModule,
  ],
  controllers: [PartsController],
  providers: [PartsService, InventoryAlertsService],
  exports: [PartsService, InventoryAlertsService],
})
export class PartsModule { }
