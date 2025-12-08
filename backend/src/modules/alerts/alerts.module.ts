import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Alerta } from "./entities/alerta.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { AlertsService } from "./alerts.service";
import { AlertsController } from "./alerts.controller";
import { MailModule } from "../mail/mail.module";
import { WebsocketsModule } from "../websockets/websockets.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Alerta, PlanPreventivo, Vehiculo, OrdenTrabajo]),
    MailModule,
    WebsocketsModule,
  ],
  controllers: [AlertsController],
  providers: [AlertsService],
  exports: [AlertsService],
})
export class AlertsModule {}
