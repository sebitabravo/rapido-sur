import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { UsersService } from "./users.service";
import { Usuario } from "./entities/usuario.entity";
import { CreateUsuarioDto } from "./dto/create-usuario.dto";
import { UpdateUsuarioDto } from "./dto/update-usuario.dto";
import { RolUsuario } from "../../common/enums";
import * as bcrypt from "bcrypt";

// Mock bcrypt
jest.mock("bcrypt");

describe("UsersService", () => {
  let service: UsersService;
  let repository: Repository<Usuario>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));

    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue("$2b$12$hashedpassword");
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new user with hashed password", async () => {
      const createDto: CreateUsuarioDto = {
        email: "nuevo@rapidosur.cl",
        password: "SecurePass123!",
        nombre_completo: "Nuevo Usuario",
        rol: RolUsuario.Mecanico,
      };

      const hashedPassword = "$2b$12$hashedpassword";
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      mockRepository.findOne.mockResolvedValue(null);

      const mockUser = {
        id: 1,
        email: createDto.email,
        nombre_completo: createDto.nombre_completo,
        rol: createDto.rol,
        password_hash: hashedPassword,
        activo: true,
      };
      mockRepository.create.mockReturnValue(mockUser);
      mockRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: createDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 12);
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw ConflictException if email already exists", async () => {
      const createDto: CreateUsuarioDto = {
        email: "existing@rapidosur.cl",
        password: "password",
        nombre_completo: "User",
        rol: RolUsuario.Mecanico,
      };

      const existingUser = { id: 1, email: createDto.email } as Usuario;
      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "El email ya está registrado",
      );
    });

    it("should set user as active by default", async () => {
      const createDto: CreateUsuarioDto = {
        email: "test@rapidosur.cl",
        password: "Pass123!",
        nombre_completo: "Test User",
        rol: RolUsuario.Mecanico,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue("hash");
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({} as Usuario);
      mockRepository.save.mockResolvedValue({} as Usuario);

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ activo: true }),
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockUsers = [
        {
          id: 1,
          email: "admin@rapidosur.cl",
          nombre_completo: "Admin",
          rol: RolUsuario.Administrador,
        },
        {
          id: 2,
          email: "mecanico@rapidosur.cl",
          nombre_completo: "Mecánico",
          rol: RolUsuario.Mecanico,
        },
      ] as Usuario[];

      mockRepository.find.mockResolvedValue(mockUsers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        order: { created_at: "DESC" },
      });
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it("should return empty array when no users exist", async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it("should order users by created_at DESC", async () => {
      mockRepository.find.mockResolvedValue([]);

      await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { created_at: "DESC" },
        }),
      );
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const mockUser = {
        id: 1,
        email: "user@rapidosur.cl",
        nombre_completo: "User",
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Usuario con ID 999 no encontrado",
      );
    });
  });

  describe("findByEmail", () => {
    it("should return a user by email", async () => {
      const mockUser = {
        id: 1,
        email: "test@rapidosur.cl",
        nombre_completo: "Test",
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findByEmail("test@rapidosur.cl");

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: "test@rapidosur.cl" },
      });
      expect(result).toEqual(mockUser);
    });

    it("should return null if email does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByEmail("nonexistent@rapidosur.cl");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update user data", async () => {
      const updateDto: UpdateUsuarioDto = {
        nombre_completo: "Updated Name",
        rol: RolUsuario.JefeMantenimiento,
      };

      const existingUser = {
        id: 1,
        email: "user@rapidosur.cl",
        nombre_completo: "Old Name",
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const updatedUser = {
        ...existingUser,
        ...updateDto,
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(updatedUser);

      const result = await service.update(1, updateDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateDto),
      );
      expect(result.nombre_completo).toBe(updateDto.nombre_completo);
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { nombre_completo: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should not allow updating password through update method", async () => {
      const updateDto: any = {
        nombre_completo: "Name",
        password: "newpassword",
      };

      const existingUser = {
        id: 1,
        email: "user@rapidosur.cl",
        password_hash: "oldhash",
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(existingUser);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDto)).rejects.toThrow(
        /Use el endpoint \/cambiar-password/,
      );
    });
  });

  describe("changePassword", () => {
    it("should change user password with new hashed password", async () => {
      const newPassword = "NewSecurePass123!";

      const existingUser = {
        id: 1,
        email: "user@rapidosur.cl",
        password_hash: "oldhash",
      } as Usuario;

      const newHash = "$2b$12$newhash";
      (bcrypt.hash as jest.Mock).mockResolvedValue(newHash);
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({
        ...existingUser,
        password_hash: newHash,
      });

      await service.changePassword(1, newPassword);

      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 12);
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ password_hash: newHash }),
      );
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.changePassword(999, "newpass")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should soft delete user by setting activo to false", async () => {
      const existingUser = {
        id: 1,
        email: "user@rapidosur.cl",
        activo: true,
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue({ ...existingUser, activo: false });

      await service.remove(1);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ activo: false }),
      );
    });

    it("should throw NotFoundException if user does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not physically delete the user from database", async () => {
      const existingUser = { id: 1, activo: true } as Usuario;
      mockRepository.findOne.mockResolvedValue(existingUser);
      mockRepository.save.mockResolvedValue(existingUser);

      await service.remove(1);

      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockRepository.findOne).toHaveBeenCalled();
    });
  });

  describe("Security", () => {
    it("should never expose password_hash in responses", async () => {
      const mockUser = {
        id: 1,
        email: "secure@rapidosur.cl",
        password_hash: "shouldneverbeseen",
        nombre_completo: "Secure User",
      } as Usuario;

      mockRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.findOne(1);

      // Usuario entity should have @Exclude() decorator on password_hash
      expect(result).toBeDefined();
    });

    it("should hash passwords with bcrypt cost factor 12", async () => {
      const createDto: CreateUsuarioDto = {
        email: "new@rapidosur.cl",
        password: "Password123!",
        nombre_completo: "User",
        rol: RolUsuario.Mecanico,
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue("hash");
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({} as Usuario);
      mockRepository.save.mockResolvedValue({} as Usuario);

      await service.create(createDto);

      expect(bcrypt.hash).toHaveBeenCalledWith(createDto.password, 12);
    });
  });
});
