import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { Repository, SelectQueryBuilder } from "typeorm";
import { VehiclesService } from "./vehicles.service";
import { Vehiculo } from "./entities/vehiculo.entity";
import { EstadoVehiculo, EstadoOrdenTrabajo } from "../../common/enums";

describe("VehiclesService", () => {
  let service: VehiclesService;
  let vehiculoRepo: Repository<Vehiculo>;

  const mockVehiculoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
    softRemove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: mockVehiculoRepo,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    vehiculoRepo = module.get<Repository<Vehiculo>>(
      getRepositoryToken(Vehiculo),
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create vehicle with valid Chilean patente (old format)", async () => {
      const createDto = {
        patente: "AB-CD-12",
        marca: "Mercedes",
        modelo: "Sprinter",
        anno: 2020,
        kilometraje_actual: 50000,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null); // No duplicate
      mockVehiculoRepo.create.mockReturnValue({
        ...createDto,
        patente: "AB-CD-12",
      });
      mockVehiculoRepo.save.mockResolvedValue({
        id: 1,
        ...createDto,
        patente: "AB-CD-12",
      });

      const result = await service.create(createDto);

      expect(result.patente).toBe("AB-CD-12");
      expect(vehiculoRepo.findOne).toHaveBeenCalledWith({
        where: { patente: "AB-CD-12" },
      });
    });

    it("should create vehicle with valid Chilean patente (new format)", async () => {
      const createDto = {
        patente: "ABCD-12",
        marca: "Ford",
        modelo: "Transit",
        anno: 2023,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);
      mockVehiculoRepo.create.mockReturnValue({
        ...createDto,
        patente: "ABCD-12",
        kilometraje_actual: 0,
      });
      mockVehiculoRepo.save.mockResolvedValue({
        id: 1,
        ...createDto,
        patente: "ABCD-12",
      });

      const result = await service.create(createDto);

      expect(result.patente).toBe("ABCD-12");
    });

    it("should convert patente to uppercase", async () => {
      const createDto = {
        patente: "abcd-12",
        marca: "Toyota",
        modelo: "Hiace",
        anno: 2021,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);
      mockVehiculoRepo.create.mockReturnValue({
        ...createDto,
        patente: "ABCD-12",
      });
      mockVehiculoRepo.save.mockResolvedValue({
        id: 1,
        ...createDto,
        patente: "ABCD-12",
      });

      const result = await service.create(createDto);

      expect(result.patente).toBe("ABCD-12");
    });

    it("should throw ConflictException if patente already exists", async () => {
      const createDto = {
        patente: "ABCD-12",
        marca: "Mercedes",
        modelo: "Sprinter",
        anno: 2020,
      };

      const existingVehiculo = {
        id: 1,
        patente: "ABCD-12",
      } as Vehiculo;

      mockVehiculoRepo.findOne.mockResolvedValue(existingVehiculo);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Ya existe un vehículo con esa patente",
      );
    });

    it("should throw BadRequestException for invalid patente format", async () => {
      const createDto = {
        patente: "INVALID",
        marca: "Ford",
        modelo: "Transit",
        anno: 2021,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        /Formato de patente inválido/,
      );
    });

    it("should reject patente with invalid old format", async () => {
      const createDto = {
        patente: "A-BC-12", // Wrong format
        marca: "Ford",
        modelo: "Transit",
        anno: 2021,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should reject patente with invalid new format", async () => {
      const createDto = {
        patente: "ABC-12", // Too short
        marca: "Ford",
        modelo: "Transit",
        anno: 2021,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should set kilometraje_actual to 0 if not provided", async () => {
      const createDto = {
        patente: "ABCD-12",
        marca: "Toyota",
        modelo: "Hiace",
        anno: 2022,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);
      mockVehiculoRepo.create.mockImplementation((data) => data);
      mockVehiculoRepo.save.mockImplementation((data) =>
        Promise.resolve({ id: 1, ...data }),
      );

      await service.create(createDto);

      const createdData = mockVehiculoRepo.create.mock.calls[0][0];
      expect(createdData.kilometraje_actual).toBe(0);
    });
  });

  describe("findAll", () => {
    it("should return paginated results with filters", async () => {
      const mockQB = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest
          .fn()
          .mockResolvedValue([
            [{ id: 1 }, { id: 2 }],
            2,
          ]),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.findAll({ page: 1, limit: 10 });

      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.lastPage).toBe(1);
    });

    it("should apply estado filter", async () => {
      const mockQB = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll({
        page: 1,
        limit: 10,
        estado: EstadoVehiculo.Activo,
      });

      expect(mockQB.andWhere).toHaveBeenCalledWith("v.estado = :estado", {
        estado: EstadoVehiculo.Activo,
      });
    });

    it("should apply patente filter with ILIKE", async () => {
      const mockQB = {
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      await service.findAll({ page: 1, limit: 10, patente: "ABC" });

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        "v.patente ILIKE :patente",
        { patente: "%ABC%" },
      );
    });
  });

  describe("findOne", () => {
    it("should return vehicle with relations", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        ordenes_trabajo: [],
        plan_preventivo: null,
      } as Vehiculo;

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);

      const result = await service.findOne(1);

      expect(result).toBe(mockVehiculo);
      expect(vehiculoRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["ordenes_trabajo", "plan_preventivo"],
      });
    });

    it("should throw NotFoundException if vehicle does not exist", async () => {
      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Vehículo con ID 999 no encontrado",
      );
    });
  });

  describe("getHistorial", () => {
    it("should return vehicle history with cost and downtime calculations", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        ordenes_trabajo: [
          { id: 1, costo_total: 50000, dias_inactividad: 3 },
          { id: 2, costo_total: 75000, dias_inactividad: 5 },
          { id: 3, costo_total: 30000, dias_inactividad: null },
        ],
      } as any;

      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockVehiculo),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getHistorial(1);

      expect(result.vehiculo).toBe(mockVehiculo);
      expect(result.ordenes).toBe(mockVehiculo.ordenes_trabajo);
      expect(result.costoTotal).toBe(155000); // 50000 + 75000 + 30000
      expect(result.tiempoInactividadTotal).toBe(8); // 3 + 5
    });

    it("should handle vehicle with no work orders", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        ordenes_trabajo: [],
      } as any;

      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockVehiculo),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getHistorial(1);

      expect(result.costoTotal).toBe(0);
      expect(result.tiempoInactividadTotal).toBe(0);
    });

    it("should throw NotFoundException if vehicle does not exist", async () => {
      const mockQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      await expect(service.getHistorial(999)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("update", () => {
    it("should update vehicle successfully", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        marca: "Mercedes",
        kilometraje_actual: 50000,
      } as Vehiculo;

      const updateDto = {
        marca: "Ford",
        kilometraje_actual: 55000,
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockVehiculoRepo.save.mockResolvedValue({
        ...mockVehiculo,
        ...updateDto,
      });

      const result = await service.update(1, updateDto);

      expect(result.marca).toBe("Ford");
      expect(result.kilometraje_actual).toBe(55000);
    });

    it("should throw BadRequestException if new mileage is less than current", async () => {
      const mockVehiculo = {
        id: 1,
        kilometraje_actual: 50000,
      } as Vehiculo;

      const updateDto = {
        kilometraje_actual: 45000, // Less than current
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);

      await expect(service.update(1, updateDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.update(1, updateDto)).rejects.toThrow(
        "El nuevo kilometraje no puede ser menor al actual",
      );
    });

    it("should convert updated patente to uppercase", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
      } as Vehiculo;

      const updateDto = {
        patente: "efgh-34",
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockVehiculoRepo.save.mockImplementation((data) =>
        Promise.resolve(data),
      );

      await service.update(1, updateDto);

      const savedData = mockVehiculoRepo.save.mock.calls[0][0];
      expect(savedData.patente).toBe("EFGH-34");
    });

    it("should allow same mileage (no change)", async () => {
      const mockVehiculo = {
        id: 1,
        kilometraje_actual: 50000,
      } as Vehiculo;

      const updateDto = {
        kilometraje_actual: 50000, // Same
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockVehiculoRepo.save.mockResolvedValue(mockVehiculo);

      await expect(service.update(1, updateDto)).resolves.not.toThrow();
    });
  });

  describe("remove", () => {
    it("should soft delete vehicle by setting estado to Inactivo", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        estado: EstadoVehiculo.Activo,
      } as Vehiculo;

      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0), // No active orders
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);
      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockVehiculoRepo.save.mockResolvedValue({
        ...mockVehiculo,
        estado: EstadoVehiculo.Inactivo,
      });
      mockVehiculoRepo.softRemove.mockResolvedValue(mockVehiculo);

      await service.remove(1);

      expect(vehiculoRepo.save).toHaveBeenCalled();
      const savedVehiculo = mockVehiculoRepo.save.mock.calls[0][0];
      expect(savedVehiculo.estado).toBe(EstadoVehiculo.Inactivo);
      expect(vehiculoRepo.softRemove).toHaveBeenCalled();
    });

    it("should throw BadRequestException if vehicle has active work orders", async () => {
      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2), // Has active orders
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);

      await expect(service.remove(1)).rejects.toThrow(BadRequestException);
      await expect(service.remove(1)).rejects.toThrow(
        "No se puede eliminar un vehículo con órdenes de trabajo activas",
      );
    });

    it("should check for both ASIGNADA and EN_PROGRESO work orders", async () => {
      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(0),
      } as unknown as SelectQueryBuilder<Vehiculo>;

      mockVehiculoRepo.createQueryBuilder.mockReturnValue(mockQB);
      mockVehiculoRepo.findOne.mockResolvedValue({
        id: 1,
        estado: EstadoVehiculo.Activo,
      } as Vehiculo);
      mockVehiculoRepo.save.mockResolvedValue({} as Vehiculo);
      mockVehiculoRepo.softRemove.mockResolvedValue({} as Vehiculo);

      await service.remove(1);

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        "ot.estado IN (:...estados)",
        {
          estados: [
            EstadoOrdenTrabajo.EnProgreso,
            EstadoOrdenTrabajo.Asignada,
          ],
        },
      );
    });
  });
});
