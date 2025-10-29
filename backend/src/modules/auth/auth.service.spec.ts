import { Test, TestingModule } from "@nestjs/testing";
import { JwtService } from "@nestjs/jwt";
import { UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UsersService } from "../users/users.service";
import { Usuario } from "../users/entities/usuario.entity";
import { RolUsuario } from "../../common/enums";
import * as bcrypt from "bcrypt";

// Mock bcrypt
jest.mock("bcrypt");

describe("AuthService", () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    findOne: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("validateUser", () => {
    it("should return user without password when credentials are valid", async () => {
      const mockUser = {
        id: 1,
        email: "mecanico@rapidosur.cl",
        password_hash: "hashedPassword123",
        nombre_completo: "Juan Pérez",
        rol: RolUsuario.Mecanico,
        activo: true,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        "mecanico@rapidosur.cl",
        "password123",
      );

      expect(usersService.findByEmail).toHaveBeenCalledWith(
        "mecanico@rapidosur.cl",
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashedPassword123",
      );
      expect(result).toBeDefined();
      expect(result?.email).toBe("mecanico@rapidosur.cl");
      expect(result).not.toHaveProperty("password_hash");
    });

    it("should return null if user does not exist", async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(
        "nonexistent@rapidosur.cl",
        "password",
      );

      expect(result).toBeNull();
    });

    it("should return null if user is not active", async () => {
      const mockUser = {
        id: 1,
        email: "inactive@rapidosur.cl",
        password_hash: "hashedPassword",
        activo: false,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      const result = await service.validateUser(
        "inactive@rapidosur.cl",
        "password",
      );

      expect(result).toBeNull();
    });

    it("should return null if password is invalid", async () => {
      const mockUser = {
        id: 1,
        email: "mecanico@rapidosur.cl",
        password_hash: "hashedPassword123",
        activo: true,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validateUser(
        "mecanico@rapidosur.cl",
        "wrongpassword",
      );

      expect(result).toBeNull();
    });

    it("should use bcrypt.compare for password validation", async () => {
      const mockUser = {
        id: 1,
        email: "test@rapidosur.cl",
        password_hash: "$2b$12$hashstring",
        activo: true,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser("test@rapidosur.cl", "plainPassword");

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "plainPassword",
        "$2b$12$hashstring",
      );
    });
  });

  describe("login", () => {
    it("should generate JWT token with correct payload", () => {
      const mockUser = {
        id: 1,
        email: "admin@rapidosur.cl",
        nombre_completo: "Admin User",
        rol: RolUsuario.Administrador,
        activo: true,
      } as Usuario;

      mockJwtService.sign.mockReturnValue("mock.jwt.token");

      const result = service.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        rol: mockUser.rol,
      });
      expect(result).toEqual({
        access_token: "mock.jwt.token",
        user: mockUser,
      });
    });

    it("should include user role in JWT payload", () => {
      const mockUser = {
        id: 2,
        email: "jefe@rapidosur.cl",
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      mockJwtService.sign.mockReturnValue("token");

      service.login(mockUser);

      const payload = mockJwtService.sign.mock.calls[0][0];
      expect(payload.rol).toBe(RolUsuario.JefeMantenimiento);
    });

    it("should use sub field for user ID in JWT payload", () => {
      const mockUser = {
        id: 42,
        email: "user@rapidosur.cl",
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockJwtService.sign.mockReturnValue("token");

      service.login(mockUser);

      const payload = mockJwtService.sign.mock.calls[0][0];
      expect(payload.sub).toBe(42);
    });
  });

  describe("hashPassword", () => {
    it("should hash password with bcrypt cost factor 12", async () => {
      const plainPassword = "mySecurePassword123";
      const hashedPassword = "$2b$12$hashedvalue";

      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(plainPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(plainPassword, 12);
      expect(result).toBe(hashedPassword);
    });

    it("should use exact cost factor of 12 as specified in CLAUDE.md", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hash");

      await service.hashPassword("password");

      const costFactor = (bcrypt.hash as jest.Mock).mock.calls[0][1];
      expect(costFactor).toBe(12);
    });

    it("should handle different password lengths", async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue("hash");

      await service.hashPassword("short");
      await service.hashPassword("verylongpasswordwithmanychars123456789");

      expect(bcrypt.hash).toHaveBeenCalledTimes(2);
      expect(bcrypt.hash).toHaveBeenNthCalledWith(1, "short", 12);
      expect(bcrypt.hash).toHaveBeenNthCalledWith(
        2,
        "verylongpasswordwithmanychars123456789",
        12,
      );
    });
  });

  describe("validateToken", () => {
    it("should return user when token payload is valid", async () => {
      const payload = {
        sub: 1,
        email: "user@rapidosur.cl",
        rol: RolUsuario.Mecanico,
      };

      const mockUser = {
        id: 1,
        email: "user@rapidosur.cl",
        rol: RolUsuario.Mecanico,
        activo: true,
      } as Usuario;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await service.validateToken(payload);

      expect(usersService.findOne).toHaveBeenCalledWith(1);
      expect(result).toBe(mockUser);
    });

    it("should throw UnauthorizedException if user does not exist", async () => {
      const payload = {
        sub: 999,
        email: "nonexistent@rapidosur.cl",
        rol: RolUsuario.Mecanico,
      };

      mockUsersService.findOne.mockResolvedValue(null);

      await expect(service.validateToken(payload)).rejects.toThrow(
        UnauthorizedException,
      );
      await expect(service.validateToken(payload)).rejects.toThrow(
        "Usuario no válido o inactivo",
      );
    });

    it("should throw UnauthorizedException if user is not active", async () => {
      const payload = {
        sub: 1,
        email: "inactive@rapidosur.cl",
        rol: RolUsuario.Mecanico,
      };

      const mockUser = {
        id: 1,
        email: "inactive@rapidosur.cl",
        activo: false,
      } as Usuario;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      await expect(service.validateToken(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should validate using sub field from JWT payload", async () => {
      const payload = {
        sub: 5,
        email: "test@rapidosur.cl",
        rol: RolUsuario.Administrador,
      };

      const mockUser = {
        id: 5,
        activo: true,
      } as Usuario;

      mockUsersService.findOne.mockResolvedValue(mockUser);

      await service.validateToken(payload);

      expect(usersService.findOne).toHaveBeenCalledWith(5);
    });
  });

  describe("Security requirements", () => {
    it("should never return password_hash in validateUser", async () => {
      const mockUser = {
        id: 1,
        email: "secure@rapidosur.cl",
        password_hash: "secrethash",
        nombre_completo: "Secure User",
        rol: RolUsuario.Mecanico,
        activo: true,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser(
        "secure@rapidosur.cl",
        "password",
      );

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty("password_hash");
      expect(Object.keys(result || {})).not.toContain("password_hash");
    });

    it("should log failed login attempts", async () => {
      const loggerSpy = jest.spyOn((service as any).logger, "warn");

      mockUsersService.findByEmail.mockResolvedValue(null);

      await service.validateUser("attacker@example.com", "wrongpass");

      expect(loggerSpy).toHaveBeenCalled();
    });

    it("should log successful login attempts", async () => {
      const loggerSpy = jest.spyOn((service as any).logger, "log");

      const mockUser = {
        id: 1,
        email: "user@rapidosur.cl",
        password_hash: "hash",
        rol: RolUsuario.Mecanico,
        activo: true,
      } as Usuario;

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      await service.validateUser("user@rapidosur.cl", "password");

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining("Successful login"),
      );
    });
  });
});
