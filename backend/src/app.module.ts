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
import { SeedingService } from "./database/seeding.service";
import { Usuario } from "./modules/users/entities/usuario.entity";
import { Vehiculo } from "./modules/vehicles/entities/vehiculo.entity";
import { PlanPreventivo } from "./modules/preventive-plans/entities/plan-preventivo.entity";
import { OrdenTrabajo } from "./modules/work-orders/entities/orden-trabajo.entity";
import { Tarea } from "./modules/tasks/entities/tarea.entity";
import { Repuesto } from "./modules/parts/entities/repuesto.entity";
import { DetalleRepuesto } from "./modules/part-details/entities/detalle-repuesto.entity";
import { Alerta } from "./modules/alerts/entities/alerta.entity";

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

        // IMPORTANT: Use migrations in production, not synchronize
        // synchronize: true drops tables and recreates them, losing data
        synchronize: configService.get("NODE_ENV") === "development",

        // Enable logging in development for debugging
        logging: configService.get("NODE_ENV") === "development",

        // Auto-run migrations on application start (production)
        // Only enable if you want automatic migrations
        migrationsRun: configService.get("NODE_ENV") === "production",

        // Connection retry logic - critical for Docker/Dokploy
        // Postgres container might not be ready immediately
        retryAttempts: 10,
        retryDelay: 3000, // 3 seconds between retries

        // Connection pool settings for better performance
        extra: {
          max: 20, // Maximum number of connections
          min: 2, // Minimum number of connections
          connectionTimeoutMillis: 10000, // 10 seconds
          idleTimeoutMillis: 30000, // 30 seconds
        },
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
    // Import entities for seeding service
    TypeOrmModule.forFeature([
      Usuario,
      Vehiculo,
      PlanPreventivo,
      OrdenTrabajo,
      Tarea,
      Repuesto,
      DetalleRepuesto,
      Alerta,
    ]),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedingService, // Automatic database seeding on startup
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
