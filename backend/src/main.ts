import { NestFactory } from "@nestjs/core";
import { ValidationPipe, Logger } from "@nestjs/common";
import type { NestExpressApplication } from "@nestjs/platform-express";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    // Use NestJS logger instead of console.log
    logger: ["error", "warn", "log", "debug", "verbose"],
  });

  // Security headers with Helmet
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Swagger UI
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
      hsts: {
        maxAge: 31536000, // 1 year in seconds
        includeSubDomains: true,
        preload: true,
      },
    }),
  );

  // Enable CORS for frontend communication
  app.enableCors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle("Rápido Sur - API de Gestión de Mantenimiento Vehicular")
    .setDescription(
      `API REST para el sistema de gestión de mantenimiento vehicular de Rápido Sur.

      ## Descripción

      Este sistema permite gestionar el mantenimiento preventivo y correctivo de una flota de 45 vehículos (buses y vans).
      El objetivo es reducir en un 40% los fallos por mantenimiento atrasado durante el primer año de operación.

      ## Características Principales

      - 🚗 **Gestión de Vehículos**: CRUD completo de vehículos con validación de patente chilena
      - 🔧 **Órdenes de Trabajo**: Creación y seguimiento de mantenimientos preventivos y correctivos
      - 👥 **Gestión de Usuarios**: Roles diferenciados (Administrador, Jefe de Mantenimiento, Mecánico)
      - 📊 **Reportes**: Costos de mantenimiento y tiempos de inactividad
      - 🔔 **Alertas Preventivas**: Sistema automático de alertas por kilometraje o tiempo
      - 📧 **Notificaciones Email**: Alertas enviadas al jefe de mantenimiento

      ## Autenticación

      La API utiliza **JWT (JSON Web Tokens)** para autenticación. Para acceder a endpoints protegidos:

      1. Obtén un token mediante \`POST /auth/login\`
      2. Incluye el token en el header: \`Authorization: Bearer {token}\`
      3. El token expira en 24 horas

      ## Roles y Permisos

      - **Administrador**: Acceso total al sistema, gestión de usuarios
      - **Jefe de Mantenimiento**: Crea y asigna órdenes de trabajo, ve reportes
      - **Mecánico**: Ejecuta trabajos, registra tareas y repuestos en sus OT asignadas

      ## Flujo Principal

      1. **Crear vehículo** → POST /vehiculos
      2. **Crear plan preventivo** → POST /preventive-plans
      3. **Sistema genera alertas** (automático, cron diario)
      4. **Crear orden de trabajo** → POST /work-orders
      5. **Asignar mecánico** → PATCH /work-orders/{id}/asignar
      6. **Registrar trabajo** → POST /work-orders/{id}/registrar-trabajo
      7. **Cerrar orden** → POST /work-orders/{id}/cerrar

      ## Estado del Proyecto

      - **Versión**: 1.0.0
      - **Equipo**: Rubilar, Bravo, Loyola, Aguayo
      - **Universidad**: Ingeniería Civil en Informática
      - **Cliente**: Rápido Sur (45 vehículos)
      `,
    )
    .setVersion("1.0.0")
    .setContact(
      "Equipo de Desarrollo",
      "https://github.com/rapidosur",
      "dev@rapidosur.cl",
    )
    .setLicense("Propietario", "https://rapidosur.cl/license")
    .addTag("Auth", "Autenticación y autorización con JWT")
    .addTag("Users", "Gestión de usuarios del sistema")
    .addTag("Vehicles", "Gestión de vehículos de la flota")
    .addTag("Work Orders", "Órdenes de trabajo (mantenimientos)")
    .addTag("Tasks", "Tareas dentro de órdenes de trabajo")
    .addTag("Parts", "Catálogo de repuestos")
    .addTag("Preventive Plans", "Planes de mantenimiento preventivo")
    .addTag("Alerts", "Sistema de alertas preventivas")
    .addTag("Reports", "Reportes de costos y disponibilidad")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Ingresa tu JWT token obtenido del login",
        in: "header",
      },
      "JWT-auth",
    )
    .addServer("http://localhost:3000", "Desarrollo Local")
    .addServer("https://api.rapidosur.com", "Producción")
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document, {
    customSiteTitle: "Rápido Sur API Docs",
    customfavIcon: "https://rapidosur.cl/favicon.ico",
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2c3e50; }
      .swagger-ui .info .description { font-size: 14px; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: "list",
      filter: true,
      showRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Use logger instead of console.log for structured logging
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
  logger.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.log(`🗄️  Database: ${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE}`);
}

bootstrap().catch((error) => {
  const logger = new Logger("Bootstrap");
  logger.error("❌ Error starting application:", error);
  process.exit(1);
});
