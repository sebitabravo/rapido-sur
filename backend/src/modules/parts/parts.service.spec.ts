import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { Repository, LessThanOrEqual } from "typeorm";
import { PartsService } from "./parts.service";
import { Repuesto } from "./entities/repuesto.entity";
import { CreateRepuestoDto } from "./dto/create-repuesto.dto";
import { UpdateRepuestoDto } from "./dto/update-repuesto.dto";

describe("PartsService", () => {
  let service: PartsService;
  let repository: Repository<Repuesto>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartsService,
        {
          provide: getRepositoryToken(Repuesto),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<PartsService>(PartsService);
    repository = module.get<Repository<Repuesto>>(
      getRepositoryToken(Repuesto),
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new part", async () => {
      const createDto: CreateRepuestoDto = {
        nombre: "Filtro de aceite",
        codigo: "FLT-001",
        precio_unitario: 5000,
        cantidad_stock: 20,
        descripcion: "Filtro de aceite genérico",
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        ...createDto,
        id: 1,
      });
      mockRepository.save.mockResolvedValue({
        id: 1,
        ...createDto,
      });

      const result = await service.create(createDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { codigo: createDto.codigo },
      });
      expect(mockRepository.create).toHaveBeenCalled();
      expect(result.codigo).toBe(createDto.codigo);
      expect(result.nombre).toBe(createDto.nombre);
    });

    it("should throw ConflictException if codigo already exists", async () => {
      const createDto: CreateRepuestoDto = {
        nombre: "Filtro de aceite",
        codigo: "FLT-001",
        precio_unitario: 5000,
      };

      mockRepository.findOne.mockResolvedValue({
        id: 1,
        codigo: "FLT-001",
      });

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        /Ya existe un repuesto con el código/,
      );
    });

    it("should set cantidad_stock to 0 if not provided", async () => {
      const createDto: CreateRepuestoDto = {
        nombre: "Bujía",
        codigo: "BUJ-001",
        precio_unitario: 3000,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockImplementation((data) => data);
      mockRepository.save.mockImplementation((data) => Promise.resolve(data));

      await service.create(createDto);

      expect(mockRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ cantidad_stock: 0 }),
      );
    });
  });

  describe("update", () => {
    it("should update part successfully", async () => {
      const existingPart = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro viejo",
        precio_unitario: 5000,
        cantidad_stock: 10,
      } as Repuesto;

      const updateDto: UpdateRepuestoDto = {
        nombre: "Filtro nuevo",
        precio_unitario: 6000,
      };

      mockRepository.findOne.mockResolvedValue(existingPart);
      mockRepository.save.mockResolvedValue({
        ...existingPart,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.nombre).toBe(updateDto.nombre);
      expect(result.precio_unitario).toBe(updateDto.precio_unitario);
    });

    it("should throw NotFoundException if part does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, { nombre: "Test" }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if new codigo already exists", async () => {
      const existingPart = {
        id: 1,
        codigo: "FLT-001",
      } as Repuesto;

      const anotherPart = {
        id: 2,
        codigo: "FLT-002",
      } as Repuesto;

      mockRepository.findOne
        .mockResolvedValueOnce(existingPart) // First call for finding the part to update
        .mockResolvedValueOnce(anotherPart); // Second call for checking codigo uniqueness

      await expect(
        service.update(1, { codigo: "FLT-002" }),
      ).rejects.toThrow(ConflictException);
    });

    it("should allow updating codigo to same value", async () => {
      const existingPart = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro",
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(existingPart);
      mockRepository.save.mockResolvedValue(existingPart);

      await expect(
        service.update(1, { codigo: "FLT-001" }),
      ).resolves.not.toThrow();
    });
  });

  describe("deductStock", () => {
    it("should deduct stock successfully", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro",
        cantidad_stock: 50,
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);
      mockRepository.save.mockImplementation((p) =>
        Promise.resolve({ ...p }),
      );

      const result = await service.deductStock(1, 10);

      expect(result.cantidad_stock).toBe(40);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException if part does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.deductStock(999, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if insufficient stock", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro",
        cantidad_stock: 5,
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);

      await expect(service.deductStock(1, 10)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.deductStock(1, 10)).rejects.toThrow(
        /Stock insuficiente/,
      );
    });

    it("should allow deducting exact available stock", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro",
        cantidad_stock: 10,
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);
      mockRepository.save.mockImplementation((p) =>
        Promise.resolve({ ...p }),
      );

      const result = await service.deductStock(1, 10);

      expect(result.cantidad_stock).toBe(0);
    });
  });

  describe("addStock", () => {
    it("should add stock successfully", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
        nombre: "Filtro",
        cantidad_stock: 10,
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);
      mockRepository.save.mockImplementation((p) =>
        Promise.resolve({ ...p }),
      );

      const result = await service.addStock(1, 20);

      expect(result.cantidad_stock).toBe(30);
    });

    it("should throw NotFoundException if part does not exist", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.addStock(999, 10)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException if cantidad is zero or negative", async () => {
      const part = {
        id: 1,
        cantidad_stock: 10,
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);

      await expect(service.addStock(1, 0)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.addStock(1, -5)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("findAll", () => {
    it("should return all parts", async () => {
      const parts = [
        { id: 1, codigo: "FLT-001", nombre: "Filtro" },
        { id: 2, codigo: "BUJ-001", nombre: "Bujía" },
      ] as Repuesto[];

      mockRepository.find.mockResolvedValue(parts);

      const result = await service.findAll();

      expect(result).toEqual(parts);
      expect(result).toHaveLength(2);
    });
  });

  describe("findOne", () => {
    it("should return part by id", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);

      const result = await service.findOne(1);

      expect(result).toEqual(part);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should return null if part not found", async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });

  describe("findByCode", () => {
    it("should return part by codigo", async () => {
      const part = {
        id: 1,
        codigo: "FLT-001",
      } as Repuesto;

      mockRepository.findOne.mockResolvedValue(part);

      const result = await service.findByCode("FLT-001");

      expect(result).toEqual(part);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { codigo: "FLT-001" },
      });
    });
  });

  describe("findLowStock", () => {
    it("should return parts with stock below threshold", async () => {
      const lowStockParts = [
        { id: 1, codigo: "FLT-001", cantidad_stock: 5 },
        { id: 2, codigo: "BUJ-001", cantidad_stock: 3 },
      ] as Repuesto[];

      const mockQB = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(lowStockParts),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findLowStock(10);

      expect(result).toEqual(lowStockParts);
      expect(mockQB.where).toHaveBeenCalledWith(
        "repuesto.cantidad_stock <= :threshold",
        { threshold: 10 },
      );
      expect(mockQB.orderBy).toHaveBeenCalledWith(
        "repuesto.cantidad_stock",
        "ASC",
      );
    });

    it("should use default threshold of 10", async () => {
      const mockQB = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(mockQB);

      await service.findLowStock();

      expect(mockQB.where).toHaveBeenCalledWith(
        "repuesto.cantidad_stock <= :threshold",
        { threshold: 10 },
      );
    });
  });
});
