import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";

/**
 * E2E Tests for Rápido Sur Backend
 * Tests critical business flows according to CLAUDE.md
 */
describe("Rápido Sur API (e2e)", () => {
  let app: INestApplication<App>;
  let adminToken: string;
  let jefeToken: string;
  let mecanicoToken: string;
  let vehiculoId: number;
  let ordenTrabajoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same pipes as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("Health Check", () => {
    it("/health (GET) - should return OK status", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("status", "OK");
          expect(res.body).toHaveProperty("timestamp");
        });
    });

    it("/health (GET) - should not require authentication", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(200);
    });
  });

  describe("Authentication Flow", () => {
    it("/auth/register (POST) - should register new admin user", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "admin.test@rapidosur.cl",
          password: "AdminPass123!",
          nombre_completo: "Admin Test",
          rol: "Administrador",
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty("id");
          expect(res.body).toHaveProperty("email", "admin.test@rapidosur.cl");
          expect(res.body).not.toHaveProperty("password_hash");
        });
    });

    it("/auth/register (POST) - should validate password strength", () => {
      return request(app.getHttpServer())
        .post("/auth/register")
        .send({
          email: "weak@rapidosur.cl",
          password: "weak",
          nombre_completo: "Weak User",
          rol: "Mecanico",
        })
        .expect(400);
    });

    it("/auth/login (POST) - should login and return JWT token", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin.test@rapidosur.cl",
          password: "AdminPass123!",
        })
        .expect(200);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("rol", "Administrador");

      adminToken = response.body.access_token;
    });

    it("/auth/login (POST) - should reject invalid credentials", () => {
      return request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin.test@rapidosur.cl",
          password: "WrongPassword",
        })
        .expect(401);
    });

    it("/auth/profile (GET) - should return user profile with valid token", () => {
      return request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("email", "admin.test@rapidosur.cl");
          expect(res.body).not.toHaveProperty("password_hash");
        });
    });

    it("/auth/profile (GET) - should reject without token", () => {
      return request(app.getHttpServer())
        .get("/auth/profile")
        .expect(401);
    });
  });

  describe("RBAC Authorization", () => {
    beforeAll(async () => {
      // Create Jefe de Mantenimiento
      await request(app.getHttpServer())
        .post("/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "jefe.test@rapidosur.cl",
          password: "JefePass123!",
          nombre_completo: "Jefe Test",
          rol: "JefeMantenimiento",
        });

      const jefeLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "jefe.test@rapidosur.cl",
          password: "JefePass123!",
        });

      jefeToken = jefeLogin.body.access_token;

      // Create Mecánico
      await request(app.getHttpServer())
        .post("/auth/register")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          email: "mecanico.test@rapidosur.cl",
          password: "MecanicoPass123!",
          nombre_completo: "Mecánico Test",
          rol: "Mecanico",
        });

      const mecanicoLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "mecanico.test@rapidosur.cl",
          password: "MecanicoPass123!",
        });

      mecanicoToken = mecanicoLogin.body.access_token;
    });

    it("Administrador should access all users", () => {
      return request(app.getHttpServer())
        .get("/usuarios")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);
    });

    it("JefeMantenimiento should access users", () => {
      return request(app.getHttpServer())
        .get("/usuarios")
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(200);
    });

    it("Mecanico should NOT access users list", () => {
      return request(app.getHttpServer())
        .get("/usuarios")
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(403);
    });
  });

  describe("Work Order Critical Flow (FR-01)", () => {
    it("Step 1: Admin creates vehicle", async () => {
      const response = await request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "ABCD12",
          marca: "Mercedes-Benz",
          modelo: "Sprinter 515",
          anno: 2022,
          kilometraje_actual: 50000,
          estado: "Activo",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("patente", "ABCD12");

      vehiculoId = response.body.id;
    });

    it("Step 2: Jefe creates work order", async () => {
      const response = await request(app.getHttpServer())
        .post("/ordenes-trabajo")
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          vehiculo_id: vehiculoId,
          tipo: "Correctivo",
          descripcion: "Cambio de aceite y filtros",
          prioridad: "Media",
        })
        .expect(201);

      expect(response.body).toHaveProperty("id");
      expect(response.body).toHaveProperty("numero_ot");
      expect(response.body.numero_ot).toMatch(/^OT-\d{4}-\d{5}$/);
      expect(response.body).toHaveProperty("estado", "Pendiente");

      ordenTrabajoId = response.body.id;
    });

    it("Step 3: Jefe assigns mechanic to work order", async () => {
      const mecanicoUser = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${mecanicoToken}`)
        .expect(200);

      const response = await request(app.getHttpServer())
        .patch(`/ordenes-trabajo/${ordenTrabajoId}/asignar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .send({
          mecanico_id: mecanicoUser.body.id,
        })
        .expect(200);

      expect(response.body).toHaveProperty("estado", "Asignada");
    });

    it("Step 4: Work order cannot be closed with incomplete validation", async () => {
      // Attempt to close without completing work should fail
      await request(app.getHttpServer())
        .patch(`/ordenes-trabajo/${ordenTrabajoId}/cerrar`)
        .set("Authorization", `Bearer ${jefeToken}`)
        .expect(400);
    });
  });

  describe("Swagger Documentation", () => {
    it("/api/docs (GET) - should return Swagger UI", () => {
      return request(app.getHttpServer())
        .get("/api/docs")
        .expect(200);
    });

    it("/api/docs-json (GET) - should return OpenAPI JSON", () => {
      return request(app.getHttpServer())
        .get("/api/docs-json")
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty("openapi");
          expect(res.body).toHaveProperty("info");
          expect(res.body).toHaveProperty("paths");
        });
    });
  });

  describe("Security Requirements", () => {
    it("Should enforce rate limiting", async () => {
      const requests = [];

      // Make multiple requests quickly
      for (let i = 0; i < 15; i++) {
        requests.push(
          request(app.getHttpServer())
            .get("/health")
        );
      }

      const responses = await Promise.all(requests);

      // Some requests should be rate limited (429)
      const rateLimited = responses.filter(r => r.status === 429);
      expect(rateLimited.length).toBeGreaterThan(0);
    });

    it("Should reject requests with invalid JWT", () => {
      return request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid.jwt.token")
        .expect(401);
    });

    it("Should never expose password_hash in any endpoint", async () => {
      const response = await request(app.getHttpServer())
        .get("/usuarios")
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(200);

      response.body.forEach((user: any) => {
        expect(user).not.toHaveProperty("password_hash");
      });
    });

    it("Should validate DTO with class-validator", () => {
      return request(app.getHttpServer())
        .post("/vehiculos")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          patente: "", // Invalid: empty
          marca: "Test",
          // Missing required fields
        })
        .expect(400);
    });
  });

  describe("CORS Configuration", () => {
    it("Should include CORS headers", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect((res) => {
          expect(res.headers).toHaveProperty("access-control-allow-origin");
        });
    });
  });
});
