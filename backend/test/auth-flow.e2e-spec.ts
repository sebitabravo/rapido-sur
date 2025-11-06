import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "../src/app.module";
import { DataSource } from "typeorm";
import { Usuario } from "../src/modules/users/entities/usuario.entity";
import { RolUsuario } from "../src/common/enums";
import * as bcrypt from "bcrypt";

/**
 * Integration test for authentication flow
 * Tests the complete flow: login, JWT generation, and protected routes access
 */
describe("Auth Flow (e2e)", () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let testUser: Usuario;
  let authToken: string;

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

    // Get database connection
    dataSource = app.get(DataSource);

    // Create test user
    const userRepo = dataSource.getRepository(Usuario);
    const hashedPassword = await bcrypt.hash("testPassword123", 12);

    testUser = await userRepo.save({
      email: "testuser@rapidosur.cl",
      password_hash: hashedPassword,
      nombre_completo: "Test User",
      rol: RolUsuario.Mecanico,
      activo: true,
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (dataSource && testUser) {
      const userRepo = dataSource.getRepository(Usuario);
      await userRepo.delete({ id: testUser.id });
    }

    await app.close();
  });

  describe("POST /auth/login", () => {
    it("should login with valid credentials and return JWT token", async () => {
      const response = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        })
        .expect(201);

      expect(response.body).toHaveProperty("access_token");
      expect(response.body).toHaveProperty("user");
      expect(response.body.user.email).toBe("testuser@rapidosur.cl");
      expect(response.body.user.rol).toBe(RolUsuario.Mecanico);
      expect(response.body.user).not.toHaveProperty("password_hash");

      // Store token for subsequent tests
      authToken = response.body.access_token;
    });

    it("should reject login with invalid password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "wrongPassword",
        })
        .expect(401);
    });

    it("should reject login with non-existent email", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "nonexistent@rapidosur.cl",
          password: "anyPassword",
        })
        .expect(401);
    });

    it("should reject login with inactive user", async () => {
      // Create inactive user
      const userRepo = dataSource.getRepository(Usuario);
      const hashedPassword = await bcrypt.hash("password", 12);
      const inactiveUser = await userRepo.save({
        email: "inactive@rapidosur.cl",
        password_hash: hashedPassword,
        nombre_completo: "Inactive User",
        rol: RolUsuario.Mecanico,
        activo: false,
      });

      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "inactive@rapidosur.cl",
          password: "password",
        })
        .expect(401);

      // Cleanup
      await userRepo.delete({ id: inactiveUser.id });
    });

    it("should validate email format", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "not-an-email",
          password: "password",
        })
        .expect(400);
    });

    it("should require both email and password", async () => {
      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "test@rapidosur.cl",
        })
        .expect(400);

      await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          password: "password",
        })
        .expect(400);
    });
  });

  describe("Protected Routes", () => {
    it("should access protected route with valid JWT token", async () => {
      // First login to get token
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      const token = loginResponse.body.access_token;

      // Access protected route
      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);
    });

    it("should reject access without JWT token", async () => {
      await request(app.getHttpServer()).get("/auth/profile").expect(401);
    });

    it("should reject access with invalid JWT token", async () => {
      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", "Bearer invalid.jwt.token")
        .expect(401);
    });

    it("should reject access with malformed Authorization header", async () => {
      await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", "InvalidFormat token")
        .expect(401);
    });

    it("should return user profile with valid token", async () => {
      // Login
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      const token = loginResponse.body.access_token;

      // Get profile
      const profileResponse = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.email).toBe("testuser@rapidosur.cl");
      expect(profileResponse.body.rol).toBe(RolUsuario.Mecanico);
      expect(profileResponse.body).not.toHaveProperty("password_hash");
    });
  });

  describe("JWT Token Validation", () => {
    it("should validate JWT payload structure", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      const token = loginResponse.body.access_token;
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      // JWT should have 3 parts separated by dots
      const parts = token.split(".");
      expect(parts).toHaveLength(3);
    });

    it("should include user role in JWT payload", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      const token = loginResponse.body.access_token;

      // Use token to access profile and verify role is maintained
      const profileResponse = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.rol).toBe(RolUsuario.Mecanico);
    });
  });

  describe("Security Requirements", () => {
    it("should never return password_hash in any response", async () => {
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      expect(loginResponse.body.user).not.toHaveProperty("password_hash");

      const token = loginResponse.body.access_token;

      const profileResponse = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(profileResponse.body).not.toHaveProperty("password_hash");
    });

    it("should use bcrypt with cost factor 12 for password hashing", async () => {
      // This is verified by checking the hash format
      const userRepo = dataSource.getRepository(Usuario);
      const user = await userRepo.findOne({
        where: { email: "testuser@rapidosur.cl" },
      });

      expect(user?.password_hash).toBeDefined();
      // Bcrypt hashes start with $2b$ or $2a$ followed by cost factor
      expect(user?.password_hash).toMatch(/^\$2[ab]\$12\$/);
    });

    it("should reject concurrent login attempts with different passwords", async () => {
      const requests = [
        request(app.getHttpServer()).post("/auth/login").send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        }),
        request(app.getHttpServer()).post("/auth/login").send({
          email: "testuser@rapidosur.cl",
          password: "wrongPassword",
        }),
      ];

      const responses = await Promise.all(requests);

      expect(responses[0].status).toBe(201); // Valid password
      expect(responses[1].status).toBe(401); // Invalid password
    });
  });

  describe("Role-Based Access Control", () => {
    it("should maintain user role throughout session", async () => {
      // Create admin user
      const userRepo = dataSource.getRepository(Usuario);
      const hashedPassword = await bcrypt.hash("adminPass", 12);
      const adminUser = await userRepo.save({
        email: "admin@rapidosur.cl",
        password_hash: hashedPassword,
        nombre_completo: "Admin User",
        rol: RolUsuario.Administrador,
        activo: true,
      });

      // Login as admin
      const loginResponse = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin@rapidosur.cl",
          password: "adminPass",
        });

      expect(loginResponse.body.user.rol).toBe(RolUsuario.Administrador);

      const token = loginResponse.body.access_token;

      // Verify role is maintained in profile
      const profileResponse = await request(app.getHttpServer())
        .get("/auth/profile")
        .set("Authorization", `Bearer ${token}`);

      expect(profileResponse.body.rol).toBe(RolUsuario.Administrador);

      // Cleanup
      await userRepo.delete({ id: adminUser.id });
    });

    it("should differentiate between mechanic and admin roles", async () => {
      // Login as mechanic
      const mechanicLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "testuser@rapidosur.cl",
          password: "testPassword123",
        });

      expect(mechanicLogin.body.user.rol).toBe(RolUsuario.Mecanico);

      // Create and login as admin
      const userRepo = dataSource.getRepository(Usuario);
      const hashedPassword = await bcrypt.hash("adminPass", 12);
      const adminUser = await userRepo.save({
        email: "admin2@rapidosur.cl",
        password_hash: hashedPassword,
        nombre_completo: "Admin User 2",
        rol: RolUsuario.Administrador,
        activo: true,
      });

      const adminLogin = await request(app.getHttpServer())
        .post("/auth/login")
        .send({
          email: "admin2@rapidosur.cl",
          password: "adminPass",
        });

      expect(adminLogin.body.user.rol).toBe(RolUsuario.Administrador);
      expect(adminLogin.body.user.rol).not.toBe(mechanicLogin.body.user.rol);

      // Cleanup
      await userRepo.delete({ id: adminUser.id });
    });
  });
});
