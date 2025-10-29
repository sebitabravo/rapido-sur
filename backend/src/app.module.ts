import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleModule } from "@nestjs/schedule";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { MailModule } from "./modules/mail/mail.module";
import { VehiclesModule } from "./modules/vehicles/vehicles.module";
import { UsersModule } from "./modules/users/users.module";
import { WorkOrdersModule } from "./modules/work-orders/work-orders.module";
import { TasksModule } from "./modules/tasks/tasks.module";
import { PreventivePlansModule } from "./modules/preventive-plans/preventive-plans.module";
import { PartsModule } from "./modules/parts/parts.module";
import { PartDetailsModule } from "./modules/part-details/part-details.module";
import { AlertsModule } from "./modules/alerts/alerts.module";
import { ReportsModule } from "./modules/reports/reports.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get("DB_HOST"),
        port: +configService.get("DB_PORT"),
        username: configService.get("DB_USERNAME"),
        password: configService.get("DB_PASSWORD"),
        database: configService.get("DB_DATABASE"),
        entities: [__dirname + "/**/*.entity{.ts,.js}"],
        synchronize: configService.get("NODE_ENV") === "development",
        logging: configService.get("NODE_ENV") === "development",
      }),
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(), // For cron jobs in alerts module
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get("THROTTLE_TTL", 60000), // 60 seconds default
          limit: configService.get("THROTTLE_LIMIT", 10), // 10 requests per ttl default
        },
      ],
      inject: [ConfigService],
    }),
    AuthModule,
    MailModule,
    VehiclesModule,
    UsersModule,
    WorkOrdersModule,
    TasksModule,
    PreventivePlansModule,
    PartsModule,
    PartDetailsModule,
    AlertsModule,
    ReportsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
