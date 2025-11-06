import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";
import { Usuario } from "../src/modules/users/entities/usuario.entity";
import { Vehiculo } from "../src/modules/vehicles/entities/vehiculo.entity";
import { OrdenTrabajo } from "../src/modules/work-orders/entities/orden-trabajo.entity";
import { Repuesto } from "../src/modules/parts/entities/repuesto.entity";
import { Tarea } from "../src/modules/tasks/entities/tarea.entity";
import { PlanPreventivo } from "../src/modules/preventive-plans/entities/plan-preventivo.entity";
import {
  RolUsuario,
  EstadoOrdenTrabajo,
  TipoOrdenTrabajo,
  EstadoVehiculo,
  TipoIntervalo,
} from "../src/common/enums";
import * as bcrypt from "bcrypt";

/**
 * End-to-End test for complete work order lifecycle
 * Tests the main business flow: create OT, assign mechanic, register work, close OT
 */
describe("Work Order Lifecycle (e2e)", () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;

  let adminToken: string;
  let jefeToken: string;
  let mecanicoToken: string;

  let adminUser: Usuario;
  let jefeUser: Usuario;
  let mecanicoUser: Usuario;

  let vehiculo: Vehiculo;
  let repuesto1: Repuesto;
  let repuesto2: Repuesto;
  let ordenTrabajo: OrdenTrabajo;
  let planPreventivo: PlanPreventivo;

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

    // Create test users
    const userRepo = dataSource.getRepository(Usuario);
    const hashedPassword = await bcrypt.hash("password123", 12);

    adminUser = await userRepo.save({
      email: "admin.test@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Admin Test",
      rol: RolUsuario.Administrador,
      activo: true,
    });

    jefeUser = await userRepo.save({
      email: "jefe.test@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Jefe Test",
      rol: RolUsuario.JefeMantenimiento,
      activo: true,
    });

    mecanicoUser = await userRepo.save({
      email: "mecanico.test@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Mecanico Test",
      rol: RolUsuario.Mecanico,
      activo: true,
    });

    // Login users to get tokens
    const adminLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "admin.test@rapidosur.cl", password: "password123" });
    adminToken = adminLogin.body.access_token;

    const jefeLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "jefe.test@rapidosur.cl", password: "password123" });
    jefeToken = jefeLogin.body.access_token;

    const mecanicoLogin = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email: "mecanico.test@rapidosur.cl", password: "password123" });
    mecanicoToken = mecanicoLogin.body.access_token;

    // Create test parts
    const repuestoRepo = dataSource.getRepository(Repuesto);
    repuesto1 = await repuestoRepo.save({
      nombre: "Filtro de aceite",
      codigo: "FO-001",
      precio_unitario: 5000,
      cantidad_stock: 10,
    });

    repuesto2 = await repuestoRepo.save({
      nombre: "Aceite motor 5W30",
      codigo: "AM-530",
      precio_unitario: 15000,
      cantidad_stock: 20,
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource) {
      const userRepo = dataSource.getRepository(Usuario);
      const vehiculoRepo = dataSource.getRepository(Vehiculo);
      const repuestoRepo = dataSource.getRepository(Repuesto);

      if (vehiculo) await vehiculoRepo.delete({ id: vehiculo.id });
      if (repuesto1) await repuestoRepo.delete({ id: repuesto1.id });
      if (repuesto2) await repuestoRepo.delete({ id: repuesto2.id });
      if (adminUser) await userRepo.delete({ id: adminUser.id });
      if (jefeUser) await userRepo.delete({ id: jefeUser.id });
      if (mecanicoUser) await userRepo.delete({ id: mecanicoUser.id });
    }

    await app.close();
  });

  describe("Complete Work Order Flow", () => {
    it("Step 1: Should create a vehicle", async () => {
      const response = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "TEST-99",
          marca: "Mercedes",
          modelo: "Sprinter",
          anno: 2020,
          kilometraje_actual: 50000,
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body.patente).toBe("TEST-99");
      expect(response.body.kilometraje_actual).toBe(50000);

      vehiculo = response.body;
    });

    it("Step 2: Should create a preventive plan for the vehicle", async () => {
      const response = await request(app.getHttpServer())
        .post("/preventive-plans")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          vehiculo_id: vehiculo.id,
          tipo_intervalo: TipoIntervalo.KM,
          intervalo: 10000,
          descripcion: "Mantenimiento cada 10.000 km",
          proximo_kilometraje: 60000,
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      planPreventivo = response.body;
    });

    it("Step 3: Should create a work order for the vehicle", async () => {
      const response = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculo.id,
          tipo: TipoOrdenTrabajo.Preventivo,
          descripcion: "Mantenimiento preventivo 60.000 km",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("numero_ot");
      expect(response.body.numero_ot).toMatch(/^OT-\d{4}-\d{5}$/);
      expect(response.body.estado).toBe(EstadoOrdenTrabajo.Pendiente);
      expect(response.body.tipo).toBe(TipoOrdenTrabajo.Preventivo);

      ordenTrabajo = response.body;
    });

    it("Step 4: Should assign mechanic to the work order", async () => {
      const response = await request(app.getHttpServer())
        .patch(`/work-orders/${ordenTrabajo.id}/asignar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          mecanico_id: mecanicoUser.id,
        })
        .expect(200);

      expect(response.body.estado).toBe(EstadoOrdenTrabajo.Asignada);
      expect(response.body.mecanico).toBeDefined();
      expect(response.body.mecanico.id).toBe(mecanicoUser.id);
    });

    it("Step 5: Should create tasks for the work order", async () => {
      const tarea1Response = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          orden_trabajo_id: ordenTrabajo.id,
          descripcion: "Cambiar filtro de aceite",
          mecanico_asignado_id: mecanicoUser.id,
        })
        .expect(201);

      const tarea2Response = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          orden_trabajo_id: ordenTrabajo.id,
          descripcion: "Cambiar aceite motor",
          mecanico_asignado_id: mecanicoUser.id,
        })
        .expect(201);

      expect(tarea1Response.body).toHaveProperty("id");
      expect(tarea2Response.body).toHaveProperty("id");
    });

    it("Step 6: Mechanic should register work with parts", async () => {
      // Get tasks
      const tasksResponse = await request(app.getHttpServer())
        .get(`/tasks?orden_trabajo_id=${ordenTrabajo.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      const tareas = tasksResponse.body;
      expect(tareas).toHaveLength(2);

      const response = await request(app.getHttpServer())
        .post(`/work-orders/${ordenTrabajo.id}/registrar-trabajo`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .send({
          kilometraje_actual: 60000,
          observaciones: "Trabajo realizado según protocolo",
          repuestos: [
            {
              repuesto_id: repuesto1.id,
              cantidad: 1,
              tarea_id: tareas[0].id,
            },
            {
              repuesto_id: repuesto2.id,
              cantidad: 4,
              tarea_id: tareas[1].id,
            },
          ],
        })
        .expect(200);

      expect(response.body.estado).toBe(EstadoOrdenTrabajo.EnProgreso);
    });

    it("Step 7: Should verify parts stock was deducted", async () => {
      const repuesto1Response = await request(app.getHttpServer())
        .get(`/parts/${repuesto1.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      const repuesto2Response = await request(app.getHttpServer())
        .get(`/parts/${repuesto2.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      expect(repuesto1Response.body.cantidad_stock).toBe(9); // 10 - 1
      expect(repuesto2Response.body.cantidad_stock).toBe(16); // 20 - 4
    });

    it("Step 8: Should mark tasks as completed", async () => {
      const tasksResponse = await request(app.getHttpServer())
        .get(`/tasks?orden_trabajo_id=${ordenTrabajo.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      for (const tarea of tasksResponse.body) {
        await request(app.getHttpServer())
          .patch(`/tasks/${tarea.id}`)
          .set("Authorization", `Bearer ${mecanicoToken}`)
          .send({
            completada: true,
          })
          .expect(200);
      }
    });

    it("Step 9: Should NOT close work order with incomplete tasks", async () => {
      // Create incomplete task
      const incompleteTaskResponse = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          orden_trabajo_id: ordenTrabajo.id,
          descripcion: "Tarea pendiente",
          mecanico_asignado_id: mecanicoUser.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .post(`/work-orders/${ordenTrabajo.id}/cerrar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(400);

      // Mark task as complete
      await request(app.getHttpServer())
        .patch(`/tasks/${incompleteTaskResponse.body.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .send({ completada: true })
        .expect(200);
    });

    it("Step 10: Should close work order successfully", async () => {
      const response = await request(app.getHttpServer())
        .post(`/work-orders/${ordenTrabajo.id}/cerrar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(200);

      expect(response.body.estado).toBe(EstadoOrdenTrabajo.Finalizada);
      expect(response.body.fecha_cierre).toBeDefined();
      expect(response.body.costo_total).toBeGreaterThan(0);

      // Expected cost: (1 * 5000) + (4 * 15000) = 65000
      expect(response.body.costo_total).toBe(65000);
    });

    it("Step 11: Should verify vehicle was updated", async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehiculos/${vehiculo.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      expect(response.body.ultima_revision).toBeDefined();
      expect(response.body.estado).toBe(EstadoVehiculo.Activo);
      expect(response.body.kilometraje_actual).toBe(60000);
    });

    it("Step 12: Should verify preventive plan was recalculated", async () => {
      const response = await request(app.getHttpServer())
        .get(`/preventive-plans/${planPreventivo.id}`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(200);

      // Next maintenance should be: 60000 + 10000 = 70000 km
      expect(response.body.proximo_kilometraje).toBe(70000);
    });

    it("Step 13: Should retrieve work order history for vehicle", async () => {
      const response = await request(app.getHttpServer())
        .get(`/vehiculos/${vehiculo.id}/historial`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.ordenes).toHaveLength(1);
      expect(response.body.costoTotal).toBe(65000);
      expect(response.body.ordenes[0].numero_ot).toBe(ordenTrabajo.numero_ot);
    });
  });

  describe("Work Order State Transitions", () => {
    it("should follow correct state flow: PENDIENTE → ASIGNADA → EN_PROGRESO → FINALIZADA", async () => {
      // Create vehicle
      const vehiculoResponse = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "FLOW-01",
          marca: "Ford",
          modelo: "Transit",
          anno: 2021,
          kilometraje_actual: 30000,
        })
        .expect(201);

      const testVehiculo = vehiculoResponse.body;

      // Create OT - Estado PENDIENTE
      const otResponse = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: testVehiculo.id,
          tipo: TipoOrdenTrabajo.Correctivo,
          descripcion: "Reparación motor",
        })
        .expect(201);

      expect(otResponse.body.estado).toBe(EstadoOrdenTrabajo.Pendiente);

      // Assign mechanic - Estado ASIGNADA
      const asignarResponse = await request(app.getHttpServer())
        .patch(`/work-orders/${otResponse.body.id}/asignar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({ mecanico_id: mecanicoUser.id })
        .expect(200);

      expect(asignarResponse.body.estado).toBe(EstadoOrdenTrabajo.Asignada);

      // Register work - Estado EN_PROGRESO
      const trabajoResponse = await request(app.getHttpServer())
        .post(`/work-orders/${otResponse.body.id}/registrar-trabajo`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .send({ observaciones: "Iniciando trabajo" })
        .expect(200);

      expect(trabajoResponse.body.estado).toBe(EstadoOrdenTrabajo.EnProgreso);

      // Create and complete task
      const tareaResponse = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          orden_trabajo_id: otResponse.body.id,
          descripcion: "Reparar motor",
          mecanico_asignado_id: mecanicoUser.id,
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/tasks/${tareaResponse.body.id}`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .send({ completada: true })
        .expect(200);

      // Close OT - Estado FINALIZADA
      const cerrarResponse = await request(app.getHttpServer())
        .post(`/work-orders/${otResponse.body.id}/cerrar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(200);

      expect(cerrarResponse.body.estado).toBe(EstadoOrdenTrabajo.Finalizada);

      // Cleanup
      await dataSource
        .getRepository(Vehiculo)
        .delete({ id: testVehiculo.id });
    });
  });

  describe("Authorization Rules", () => {
    it("should NOT allow mechanic to modify work order not assigned to them", async () => {
      // Create another mechanic
      const userRepo = dataSource.getRepository(Usuario);
      const hashedPassword = await bcrypt.hash("password123", 12);
      const otroMecanico = await userRepo.save({
        email: "otro.mecanico@rapidosur.cl",
        password_hash: hashedPassword,
        nombre_completo: "Otro Mecanico",
        rol: RolUsuario.Mecanico,
        activo: true,
      });

      const otroMecanicoLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({ email: "otro.mecanico@rapidosur.cl", password: "password123" });

      const otroToken = otroMecanicoLogin.body.access_token;

      // Try to register work on OT not assigned to them
      await request(app.getHttpServer())
        .post(`/work-orders/${ordenTrabajo.id}/registrar-trabajo`)
        .set("Authorization", `Bearer ${otroToken}`)
        .send({ observaciones: "Intentando modificar" })
        .expect(403);

      // Cleanup
      await userRepo.delete({ id: otroMecanico.id });
    });

    it("should allow JefeMantenimiento to register work on any OT", async () => {
      const vehiculoResponse = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "AUTH-01",
          marca: "Toyota",
          modelo: "Hiace",
          anno: 2022,
        })
        .expect(201);

      const otResponse = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculoResponse.body.id,
          tipo: TipoOrdenTrabajo.Correctivo,
          descripcion: "Test authorization",
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/work-orders/${otResponse.body.id}/asignar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({ mecanico_id: mecanicoUser.id })
        .expect(200);

      // Jefe can register work even though not assigned
      await request(app.getHttpServer())
        .post(`/work-orders/${otResponse.body.id}/registrar-trabajo`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({ observaciones: "Jefe registrando trabajo" })
        .expect(200);

      // Cleanup
      await dataSource
        .getRepository(Vehiculo)
        .delete({ id: vehiculoResponse.body.id });
    });
  });

  describe("Business Logic Validations", () => {
    it("should NOT allow closing OT if not in EN_PROGRESO state", async () => {
      const vehiculoResponse = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "VALID-01",
          marca: "Nissan",
          modelo: "Urvan",
          anno: 2019,
        })
        .expect(201);

      const otResponse = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculoResponse.body.id,
          tipo: TipoOrdenTrabajo.Preventivo,
          descripcion: "Test validation",
        })
        .expect(201);

      // Try to close OT in PENDIENTE state
      await request(app.getHttpServer())
        .post(`/work-orders/${otResponse.body.id}/cerrar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(400);

      // Cleanup
      await dataSource
        .getRepository(Vehiculo)
        .delete({ id: vehiculoResponse.body.id });
    });

    it("should NOT allow registering more parts than available in stock", async () => {
      // Create part with limited stock
      const repuestoRepo = dataSource.getRepository(Repuesto);
      const parteLimitada = await repuestoRepo.save({
        nombre: "Parte Limitada",
        codigo: "PL-001",
        precio_unitario: 10000,
        cantidad_stock: 2,
      });

      const vehiculoResponse = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "STOCK-01",
          marca: "Chevrolet",
          modelo: "Van",
          anno: 2020,
        })
        .expect(201);

      const otResponse = await request(app.getHttpServer())
        .post("/work-orders")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculoResponse.body.id,
          tipo: TipoOrdenTrabajo.Correctivo,
          descripcion: "Test stock",
        })
        .expect(201);

      await request(app.getHttpServer())
        .patch(`/work-orders/${otResponse.body.id}/asignar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({ mecanico_id: mecanicoUser.id })
        .expect(200);

      const tareaResponse = await request(app.getHttpServer())
        .post("/tasks")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          orden_trabajo_id: otResponse.body.id,
          descripcion: "Usar parte limitada",
          mecanico_asignado_id: mecanicoUser.id,
        })
        .expect(201);

      // Try to use more than available
      await request(app.getHttpServer())
        .post(`/work-orders/${otResponse.body.id}/registrar-trabajo`)
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .send({
          repuestos: [
            {
              repuesto_id: parteLimitada.id,
              cantidad: 5, // More than stock (2)
              tarea_id: tareaResponse.body.id,
            },
          ],
        })
        .expect(400);

      // Cleanup
      await dataSource
        .getRepository(Vehiculo)
        .delete({ id: vehiculoResponse.body.id });
      await repuestoRepo.delete({ id: parteLimitada.id });
    });
  });
});
