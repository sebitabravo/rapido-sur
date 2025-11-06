import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";
import { Usuario } from "../src/modules/users/entities/usuario.entity";
import { Vehiculo } from "../src/modules/vehicles/entities/vehiculo.entity";
import { PlanPreventivo } from "../src/modules/preventive-plans/entities/plan-preventivo.entity";
import { Alerta } from "../src/modules/alerts/entities/alerta.entity";
import { AlertsService } from "../src/modules/alerts/alerts.service";
import {
  RolUsuario,
  EstadoVehiculo,
  TipoIntervalo,
} from "../src/common/enums";
import * as bcrypt from "bcrypt";

/**
 * End-to-End test for preventive alerts system
 * Tests the automated alert generation based on km and time thresholds
 */
describe("Preventive Alerts Flow (e2e)", () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let alertsService: AlertsService;

  let adminToken: string;
  let jefeToken: string;

  let adminUser: Usuario;
  let jefeUser: Usuario;

  let vehiculoKM: Vehiculo;
  let vehiculoTiempo: Vehiculo;
  let vehiculoAtrasado: Vehiculo;
  let planKM: PlanPreventivo;
  let planTiempo: PlanPreventivo;
  let planAtrasado: PlanPreventivo;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = app.get(DataSource);
    alertsService = app.get(AlertsService);

    // Create test users
    const userRepo = dataSource.getRepository(Usuario);
    const hashedPassword = await bcrypt.hash("password123", 12);

    adminUser = await userRepo.save({
      email: "admin.alerts@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Admin Alerts",
      rol: RolUsuario.Administrador,
      activo: true,
    });

    jefeUser = await userRepo.save({
      email: "jefe.alerts@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Jefe Alerts",
      rol: RolUsuario.JefeMantenimiento,
      activo: true,
    });

    // Login users
    const adminLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "admin.alerts@rapidosur.cl", password: "password123" });
    adminToken = adminLogin.body.access_token;

    const jefeLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "jefe.alerts@rapidosur.cl", password: "password123" });
    jefeToken = jefeLogin.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource) {
      const userRepo = dataSource.getRepository(Usuario);
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const alertaRepo = dataSource.getRepository(Alerta);

      // Delete all test alerts
      await alertaRepo.delete({});

      if (vehiculoKM) await vehiculoRepo.delete({ id: vehiculoKM.id });
      if (vehiculoTiempo) await vehiculoRepo.delete({ id: vehiculoTiempo.id });
      if (vehiculoAtrasado)
        await vehiculoRepo.delete({ id: vehiculoAtrasado.id });
      if (adminUser) await userRepo.delete({ id: adminUser.id });
      if (jefeUser) await userRepo.delete({ id: jefeUser.id });
    }

    await app.close();
  });

  describe("KM-Based Alerts", () => {
    it("Should create vehicle with KM-based preventive plan", async () => {
      // Create vehicle
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      vehiculoKM = await vehiculoRepo.save({
        patente: "ALERT-KM",
        marca: "Mercedes",
        modelo: "Sprinter",
        anno: 2020,
        kilometraje_actual: 19500, // 500 km before threshold (20000)
        estado: EstadoVehiculo.Activo,
        ultima_revision: new Date("2024-01-01"),
      });

      // Create preventive plan
      const planRepo = dataSource.getRepository(PlanPreventivo);
      planKM = await planRepo.save({
        vehiculo: vehiculoKM,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000, // Alert should trigger at 19000 km
        descripcion: "Mantenimiento cada 10.000 km",
        activo: true,
      });

      expect(vehiculoKM).toBeDefined();
      expect(planKM).toBeDefined();
    });

    it("Should generate alert for vehicle approaching maintenance", async () => {
      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      // Check alerts
      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoKM.id } },
      });

      expect(alertas.length).toBeGreaterThan(0);
      expect(alertas[0].mensaje).toContain("ALERT-KM");
      expect(alertas[0].mensaje).toContain("km");
    });

    it("Should retrieve pending alerts via API", async () => {
      const response = await request(app.getHttpServer())
        .get("/alerts/pendientes")
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      const kmAlert = response.body.find(
        (a: any) => a.vehiculo.patente === "ALERT-KM",
      );
      expect(kmAlert).toBeDefined();
    });

    it("Should NOT create duplicate alert", async () => {
      const alertaRepo = dataSource.getRepository(Alerta);

      const alertasAntes = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoKM.id } },
      });
      const countAntes = alertasAntes.length;

      // Run alert verification again
      await alertsService.verificarAlertasPreventivas();

      const alertasDespues = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoKM.id } },
      });

      // Should have same number of alerts (no duplicates)
      expect(alertasDespues.length).toBe(countAntes);
    });
  });

  describe("Time-Based Alerts", () => {
    it("Should create vehicle with time-based preventive plan", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 5); // 5 days from now

      // Create vehicle
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      vehiculoTiempo = await vehiculoRepo.save({
        patente: "ALERT-TIME",
        marca: "Ford",
        modelo: "Transit",
        anno: 2021,
        kilometraje_actual: 30000,
        estado: EstadoVehiculo.Activo,
        ultima_revision: new Date(),
      });

      // Create preventive plan
      const planRepo = dataSource.getRepository(PlanPreventivo);
      planTiempo = await planRepo.save({
        vehiculo: vehiculoTiempo,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180, // 6 months
        proxima_fecha: proximaFecha, // Alert should trigger (within 7 days)
        descripcion: "Mantenimiento cada 6 meses",
        activo: true,
      });

      expect(vehiculoTiempo).toBeDefined();
      expect(planTiempo).toBeDefined();
    });

    it("Should generate alert for time-based maintenance", async () => {
      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      // Check alerts
      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoTiempo.id } },
      });

      expect(alertas.length).toBeGreaterThan(0);
      expect(alertas[0].mensaje).toContain("ALERT-TIME");
      expect(alertas[0].mensaje).toContain("días");
    });
  });

  describe("Overdue Alerts", () => {
    it("Should create vehicle with overdue maintenance", async () => {
      const fechaPasada = new Date();
      fechaPasada.setDate(fechaPasada.getDate() - 15); // 15 days ago

      // Create vehicle
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      vehiculoAtrasado = await vehiculoRepo.save({
        patente: "OVERDUE-01",
        marca: "Toyota",
        modelo: "Hiace",
        anno: 2019,
        kilometraje_actual: 55000, // Past due maintenance
        estado: EstadoVehiculo.Activo,
        ultima_revision: new Date("2024-01-01"),
      });

      // Create preventive plan (overdue)
      const planRepo = dataSource.getRepository(PlanPreventivo);
      planAtrasado = await planRepo.save({
        vehiculo: vehiculoAtrasado,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 50000, // Should have been at 50000, now at 55000
        descripcion: "Mantenimiento atrasado",
        activo: true,
      });

      expect(vehiculoAtrasado).toBeDefined();
      expect(planAtrasado).toBeDefined();
    });

    it("Should generate OVERDUE alert", async () => {
      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      // Check alerts
      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoAtrasado.id } },
      });

      expect(alertas.length).toBeGreaterThan(0);
      expect(alertas[0].mensaje).toContain("ATRASADO");
      expect(alertas[0].mensaje).toContain("5000"); // 5000 km overdue
    });
  });

  describe("Alert Management", () => {
    it("Should mark alert as attended when work order is created", async () => {
      // Create work order for alerted vehicle
      const otResponse = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculoKM.id,
          tipo: "PREVENTIVO",
          descripcion: "Atendiendo alerta preventiva",
        })
        .expect(201);

      expect(otResponse.body).toBeDefined();

      // Mark alert as attended
      await alertsService.marcarAtendida(vehiculoKM.id);

      // Verify alert was deleted/attended
      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoKM.id } },
      });

      expect(alertas.length).toBe(0);
    });

    it("Should retrieve all alerts (including sent)", async () => {
      const response = await request(app.getHttpServer())
        .get("/alerts")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe("Alert Thresholds", () => {
    it("Should NOT generate alert when vehicle is far from maintenance", async () => {
      // Create vehicle far from maintenance
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoLejano = await vehiculoRepo.save({
        patente: "FAR-01",
        marca: "Nissan",
        modelo: "Urvan",
        anno: 2022,
        kilometraje_actual: 10000, // Far from next maintenance
        estado: EstadoVehiculo.Activo,
      });

      const planRepo = dataSource.getRepository(PlanPreventivo);
      await planRepo.save({
        vehiculo: vehiculoLejano,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000, // 10000 km away - no alert
        descripcion: "Plan lejano",
        activo: true,
      });

      const alertaRepo = dataSource.getRepository(Alerta);
      const alertasAntes = await alertaRepo.count();

      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      const alertasDespues = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoLejano.id } },
      });

      // Should NOT create alert for this vehicle
      expect(alertasDespues.length).toBe(0);

      // Cleanup
      await vehiculoRepo.delete({ id: vehiculoLejano.id });
    });

    it("Should generate alert exactly at 1000 km threshold", async () => {
      // Create vehicle exactly at threshold
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoExacto = await vehiculoRepo.save({
        patente: "EXACT-01",
        marca: "Chevrolet",
        modelo: "Van",
        anno: 2020,
        kilometraje_actual: 19000, // Exactly 1000 km before
        estado: EstadoVehiculo.Activo,
      });

      const planRepo = dataSource.getRepository(PlanPreventivo);
      await planRepo.save({
        vehiculo: vehiculoExacto,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        descripcion: "Plan exacto",
        activo: true,
      });

      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoExacto.id } },
      });

      // Should create alert
      expect(alertas.length).toBeGreaterThan(0);

      // Cleanup
      await vehiculoRepo.delete({ id: vehiculoExacto.id });
    });

    it("Should generate alert exactly at 7 days threshold", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 7); // Exactly 7 days

      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoExactoTiempo = await vehiculoRepo.save({
        patente: "EXACT-TIME",
        marca: "Mercedes",
        modelo: "Sprinter",
        anno: 2021,
        estado: EstadoVehiculo.Activo,
      });

      const planRepo = dataSource.getRepository(PlanPreventivo);
      await planRepo.save({
        vehiculo: vehiculoExactoTiempo,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: proximaFecha,
        descripcion: "Plan exacto tiempo",
        activo: true,
      });

      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoExactoTiempo.id } },
      });

      // Should create alert
      expect(alertas.length).toBeGreaterThan(0);

      // Cleanup
      await vehiculoRepo.delete({ id: vehiculoExactoTiempo.id });
    });
  });

  describe("Inactive Vehicles and Plans", () => {
    it("Should NOT generate alert for inactive vehicle", async () => {
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoInactivo = await vehiculoRepo.save({
        patente: "INACTIVE-V",
        marca: "Ford",
        modelo: "Transit",
        anno: 2020,
        kilometraje_actual: 19000,
        estado: EstadoVehiculo.Inactivo, // Inactive
      });

      const planRepo = dataSource.getRepository(PlanPreventivo);
      await planRepo.save({
        vehiculo: vehiculoInactivo,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        descripcion: "Plan de vehículo inactivo",
        activo: true,
      });

      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoInactivo.id } },
      });

      // Should NOT create alert
      expect(alertas.length).toBe(0);

      // Cleanup
      await vehiculoRepo.delete({ id: vehiculoInactivo.id });
    });

    it("Should NOT generate alert for inactive preventive plan", async () => {
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const vehiculoConPlanInactivo = await vehiculoRepo.save({
        patente: "PLAN-INACT",
        marca: "Toyota",
        modelo: "Hiace",
        anno: 2021,
        kilometraje_actual: 19000,
        estado: EstadoVehiculo.Activo,
      });

      const planRepo = dataSource.getRepository(PlanPreventivo);
      await planRepo.save({
        vehiculo: vehiculoConPlanInactivo,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        descripcion: "Plan inactivo",
        activo: false, // Inactive plan
      });

      // Run alert verification
      await alertsService.verificarAlertasPreventivas();

      const alertaRepo = dataSource.getRepository(Alerta);
      const alertas = await alertaRepo.find({
        where: { vehiculo: { id: vehiculoConPlanInactivo.id } },
      });

      // Should NOT create alert
      expect(alertas.length).toBe(0);

      // Cleanup
      await vehiculoRepo.delete({ id: vehiculoConPlanInactivo.id });
    });
  });
});
