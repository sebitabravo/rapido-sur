import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

/**
 * TEST-003: Integration tests for critical API endpoints
 * These tests validate the HTTP layer and endpoint integration
 */
describe("API Integration Tests (e2e)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply same validation pipes as in main.ts
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
    if (app) {
      await app.close();
    }
  });

  describe("Health Check & API Info", () => {
    it("/health (GET) - should return OK status", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe("OK");
          expect(res.body.timestamp).toBeDefined();
        });
    });

    it("/ (GET) - should return API information", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect(200)
        .expect((res) => {
          expect(res.body.name).toContain("Rápido Sur");
          expect(res.body.version).toBeDefined();
          expect(res.body.status).toBe("operational");
          expect(res.body.endpoints).toBeDefined();
        });
    });
  });

  describe("Auth Endpoints", () => {
    it("/api/auth/login (POST) - should reject invalid credentials", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "invalid@test.com",
          password: "wrongpassword",
        })
        .expect(401);
    });

    it("/api/auth/login (POST) - should validate input format", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "not-an-email",
          password: "123",
        })
        .expect(400);
    });

    it("/api/auth/profile (GET) - should reject requests without token", () => {
      return request(app.getHttpServer())
        .get("/api/auth/profile")
        .expect(401);
    });
  });

  describe("Protected Endpoints - Authorization", () => {
    it("/api/usuarios (GET) - should require authentication", () => {
      return request(app.getHttpServer())
        .get("/api/usuarios")
        .expect(401);
    });

    it("/api/vehiculos (GET) - should require authentication", () => {
      return request(app.getHttpServer())
        .get("/api/vehiculos")
        .expect(401);
    });

    it("/api/ordenes-trabajo (GET) - should require authentication", () => {
      return request(app.getHttpServer())
        .get("/api/ordenes-trabajo")
        .expect(401);
    });
  });

  describe("Input Validation", () => {
    it("should reject malformed JSON", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send("this is not json")
        .set("Content-Type", "application/json")
        .expect(400);
    });

    it("should reject requests with extra fields (whitelist)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "password123",
          extraField: "should be rejected",
        })
        .expect(400);
    });
  });

  describe("CORS Configuration", () => {
    it("should include CORS headers", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect(200)
        .expect((res) => {
          // CORS headers should be present
          expect(res.headers["access-control-allow-origin"]).toBeDefined();
        });
    });
  });

  describe("Error Handling", () => {
    it("should return 404 for non-existent routes", () => {
      return request(app.getHttpServer())
        .get("/api/non-existent-route")
        .expect(404);
    });

    it("should return proper error structure", () => {
      return request(app.getHttpServer())
        .get("/api/non-existent")
        .expect(404)
        .expect((res) => {
          expect(res.body.statusCode).toBe(404);
          expect(res.body.message).toBeDefined();
        });
    });
  });

  describe("API Documentation", () => {
    it("/api/docs (GET) - should serve Swagger documentation", () => {
      return request(app.getHttpServer())
        .get("/api/docs")
        .expect((res) => {
          // Swagger redirects or returns HTML
          expect([200, 301, 302]).toContain(res.status);
        });
    });
  });
});
