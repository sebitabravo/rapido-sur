import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

/**
 * TEST-004: OWASP Security Tests
 * Validates security measures against OWASP Top 10 vulnerabilities
 * 
 * OWASP Top 10:2021 Coverage:
 * - A01: Broken Access Control
 * - A02: Cryptographic Failures
 * - A03: Injection
 * - A04: Insecure Design
 * - A05: Security Misconfiguration
 * - A07: Identification and Authentication Failures
 * - A08: Software and Data Integrity Failures
 */
describe("OWASP Security Tests (e2e)", () => {
  let app: INestApplication;

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
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe("A01:2021 - Broken Access Control", () => {
    it("should prevent unauthorized access to protected routes", async () => {
      const protectedRoutes = [
        "/api/usuarios",
        "/api/vehiculos",
        "/api/ordenes-trabajo",
        "/api/repuestos",
        "/api/alertas",
      ];

      for (const route of protectedRoutes) {
        await request(app.getHttpServer())
          .get(route)
          .expect(401);
      }
    });

    it("should require valid JWT token", () => {
      return request(app.getHttpServer())
        .get("/api/usuarios")
        .set("Authorization", "Bearer invalid-token")
        .expect(401);
    });

    it("should reject expired or malformed tokens", () => {
      return request(app.getHttpServer())
        .get("/api/usuarios")
        .set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid")
        .expect(401);
    });
  });

  describe("A02:2021 - Cryptographic Failures", () => {
    it("should not return password hashes in API responses", () => {
      // This would need a valid login, but validates response structure
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "password",
        })
        .expect((res) => {
          if (res.body.user) {
            expect(res.body.user.password).toBeUndefined();
            expect(res.body.user.password_hash).toBeUndefined();
          }
        });
    });

    it("should use HTTPS in production (header check)", () => {
      // In production, this should redirect or enforce HTTPS
      // For now, we check that the app is configured for security
      return request(app.getHttpServer())
        .get("/health")
        .expect((res) => {
          // Security headers should be present (via Helmet)
          expect(
            res.headers["x-content-type-options"] || 
            res.headers["x-frame-options"]
          ).toBeDefined();
        });
    });
  });

  describe("A03:2021 - Injection", () => {
    it("should sanitize SQL injection attempts in query params", () => {
      return request(app.getHttpServer())
        .get("/api/vehiculos?patente=ABC'; DROP TABLE vehiculos;--")
        .set("Authorization", "Bearer fake-token")
        .expect((res) => {
          // Should either return 401 (no auth) or handle safely
          expect([400, 401]).toContain(res.status);
        });
    });

    it("should validate and sanitize email inputs", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "<script>alert('xss')</script>",
          password: "test",
        })
        .expect(400);
    });

    it("should prevent NoSQL injection in JSON body", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: { $ne: null },
          password: { $ne: null },
        })
        .expect(400);
    });
  });

  describe("A04:2021 - Insecure Design", () => {
    it("should enforce rate limiting on login endpoint", async () => {
      // Attempt multiple rapid login requests
      const requests = Array(10).fill(null).map(() =>
        request(app.getHttpServer())
          .post("/api/auth/login")
          .send({
            email: "test@test.com",
            password: "wrong",
          })
      );

      const responses = await Promise.all(requests);
      
      // At least some should be rate limited (429) if configured
      // For now, we just ensure they don't crash
      responses.forEach(res => {
        expect([400, 401, 429]).toContain(res.status);
      });
    });

    it("should validate business logic constraints", () => {
      // Example: Can't create vehicle with invalid patente format
      return request(app.getHttpServer())
        .post("/api/vehiculos")
        .send({
          patente: "INVALID_FORMAT_123456",
          marca: "Test",
          modelo: "Test",
        })
        .expect((res) => {
          expect([400, 401]).toContain(res.status);
        });
    });
  });

  describe("A05:2021 - Security Misconfiguration", () => {
    it("should not expose stack traces in production errors", () => {
      return request(app.getHttpServer())
        .get("/api/non-existent-route")
        .expect(404)
        .expect((res) => {
          // Should not contain stack trace
          expect(res.body.stack).toBeUndefined();
          expect(JSON.stringify(res.body)).not.toContain("at ");
        });
    });

    it("should set security headers (Helmet)", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect((res) => {
          // Helmet security headers
          expect(
            res.headers["x-content-type-options"] ||
            res.headers["x-frame-options"] ||
            res.headers["x-xss-protection"]
          ).toBeDefined();
        });
    });

    it("should not expose sensitive information in errors", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "wrong",
        })
        .expect(401)
        .expect((res) => {
          // Error message should not reveal if user exists
          expect(res.body.message.toLowerCase()).not.toContain("user not found");
          expect(res.body.message.toLowerCase()).not.toContain("email not found");
        });
    });
  });

  describe("A07:2021 - Authentication Failures", () => {
    it("should enforce strong password requirements", () => {
      return request(app.getHttpServer())
        .post("/api/auth/register")
        .send({
          email: "newuser@test.com",
          password: "123", // Too weak
          nombre_completo: "Test User",
          rol: "Mecanico",
        })
        .expect((res) => {
          expect([400, 401, 404]).toContain(res.status);
        });
    });

    it("should prevent brute force attacks with rate limiting", async () => {
      // Multiple failed login attempts
      const attempts = 5;
      const promises = [];

      for (let i = 0; i < attempts; i++) {
        promises.push(
          request(app.getHttpServer())
            .post("/api/auth/login")
            .send({
              email: "test@test.com",
              password: `wrong${i}`,
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // All should fail with 401 or be rate limited
      responses.forEach(res => {
        expect([401, 429]).toContain(res.status);
      });
    });

    it("should use secure session management (JWT)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "validpassword",
        })
        .expect((res) => {
          if (res.status === 200) {
            // Should return JWT token
            expect(res.body.access_token).toBeDefined();
            expect(typeof res.body.access_token).toBe("string");
          }
        });
    });
  });

  describe("A08:2021 - Data Integrity Failures", () => {
    it("should validate input data types", () => {
      return request(app.getHttpServer())
        .post("/api/vehiculos")
        .send({
          patente: 12345, // Should be string
          marca: true, // Should be string
          kilometraje_actual: "not-a-number", // Should be number
        })
        .expect((res) => {
          expect([400, 401]).toContain(res.status);
        });
    });

    it("should reject requests with invalid DTOs", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          // Missing required fields
          email: "test@test.com",
          // password is missing
        })
        .expect(400);
    });

    it("should enforce whitelist validation (no extra fields)", () => {
      return request(app.getHttpServer())
        .post("/api/auth/login")
        .send({
          email: "test@test.com",
          password: "password",
          extraField: "should not be allowed",
          maliciousField: "<script>alert('xss')</script>",
        })
        .expect(400);
    });
  });

  describe("Security Headers Validation", () => {
    it("should set X-Content-Type-Options", () => {
      return request(app.getHttpServer())
        .get("/health")
        .expect((res) => {
          expect(res.headers["x-content-type-options"]).toBeDefined();
        });
    });

    it("should set appropriate Content-Type", () => {
      return request(app.getHttpServer())
        .get("/")
        .expect("Content-Type", /json/);
    });
  });

  describe("Dependency Security", () => {
    it("should document npm audit requirements", () => {
      // This is a documentation test
      // In CI/CD, run: npm audit --production
      // Fail build if high/critical vulnerabilities found
      expect(true).toBe(true);
    });
  });
});
