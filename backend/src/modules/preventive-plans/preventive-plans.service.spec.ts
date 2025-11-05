import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import {
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PreventivePlansService } from "./preventive-plans.service";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { CreatePlanPreventivoDto } from "./dto/create-plan-preventivo.dto";
import { UpdatePlanPreventivoDto } from "./dto/update-plan-preventivo.dto";
import { TipoIntervalo } from "../../common/enums";

describe("PreventivePlansService", () => {
  let service: PreventivePlansService;
  let planRepo: Repository<PlanPreventivo>;
  let vehiculoRepo: Repository<Vehiculo>;

  const mockVehiculo: Vehiculo = {
    id: 1,
    patente: "ABCD-12",
    marca: "Mercedes-Benz",
    modelo: "Sprinter",
    anio: 2020,
    tipo: "BUS",
    estado: "OPERATIVO",
    kilometraje_actual: 15000,
    ultima_revision: new Date("2025-01-01"),
    created_at: new Date(),
    updated_at: new Date(),
  } as any;

  const mockPlanPreventivo: PlanPreventivo = {
    id: 1,
    vehiculo: mockVehiculo,
    tipo_mantenimiento: "Mantenimiento General",
    tipo_intervalo: TipoIntervalo.KM,
    intervalo: 10000,
    descripcion: "Cambio de aceite y filtros",
    proximo_kilometraje: 25000,
    proxima_fecha: null,
    activo: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPlanRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockVehiculoRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PreventivePlansService,
        {
          provide: getRepositoryToken(PlanPreventivo),
          useValue: mockPlanRepo,
        },
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: mockVehiculoRepo,
        },
      ],
    }).compile();

    service = module.get<PreventivePlansService>(PreventivePlansService);
    planRepo = module.get<Repository<PlanPreventivo>>(
      getRepositoryToken(PlanPreventivo),
    );
    vehiculoRepo = module.get<Repository<Vehiculo>>(
      getRepositoryToken(Vehiculo),
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("findAll", () => {
    it("should return all preventive plans with vehicle relations", async () => {
      const mockPlans = [
        {
          id: 1,
          tipo_intervalo: TipoIntervalo.KM,
          intervalo: 10000,
          vehiculo: { id: 1, patente: "ABCD-12" },
        },
        {
          id: 2,
          tipo_intervalo: TipoIntervalo.Tiempo,
          intervalo: 180,
          vehiculo: { id: 2, patente: "EFGH-34" },
        },
      ] as PlanPreventivo[];

      mockPlanRepo.find.mockResolvedValue(mockPlans);

      const result = await service.findAll();

      expect(planRepo.find).toHaveBeenCalledWith({
        relations: ["vehiculo"],
      });
      expect(result).toEqual(mockPlans);
      expect(result).toHaveLength(2);
    });

    it("should return empty array if no plans exist", async () => {
      mockPlanRepo.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });

    it("should include vehicle information in results", async () => {
      const mockPlans = [
        {
          id: 1,
          vehiculo: { id: 1, patente: "TEST-12", marca: "Mercedes" },
        },
      ] as PlanPreventivo[];

      mockPlanRepo.find.mockResolvedValue(mockPlans);

      const result = await service.findAll();

      expect(result[0].vehiculo).toBeDefined();
      expect(result[0].vehiculo.patente).toBe("TEST-12");
    });
  });

  describe("findOne", () => {
    it("should return preventive plan by ID with vehicle relation", async () => {
      const mockPlan = {
        id: 1,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        vehiculo: { id: 1, patente: "ABCD-12" },
        activo: true,
      } as PlanPreventivo;

      mockPlanRepo.findOne.mockResolvedValue(mockPlan);

      const result = await service.findOne(1);

      expect(planRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ["vehiculo"],
      });
      expect(result).toBe(mockPlan);
    });

    it("should return null if plan does not exist", async () => {
      mockPlanRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });

    it("should find plan with KM-based interval", async () => {
      const mockPlan = {
        id: 1,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 5000,
        proximo_kilometraje: 15000,
        vehiculo: { id: 1 },
      } as PlanPreventivo;

      mockPlanRepo.findOne.mockResolvedValue(mockPlan);

      const result = await service.findOne(1);

      expect(result?.tipo_intervalo).toBe(TipoIntervalo.KM);
      expect(result?.proximo_kilometraje).toBeDefined();
    });

    it("should find plan with time-based interval", async () => {
      const mockPlan = {
        id: 2,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: new Date("2025-06-01"),
        vehiculo: { id: 2 },
      } as PlanPreventivo;

      mockPlanRepo.findOne.mockResolvedValue(mockPlan);

      const result = await service.findOne(2);

      expect(result?.tipo_intervalo).toBe(TipoIntervalo.Tiempo);
      expect(result?.proxima_fecha).toBeDefined();
    });
  });

  describe("create", () => {
    const createDto: CreatePlanPreventivoDto = {
      vehiculo_id: 1,
      tipo_mantenimiento: "Mantenimiento General",
      tipo_intervalo: TipoIntervalo.KM,
      intervalo: 10000,
      descripcion: "Cambio de aceite y filtros",
      activo: true,
    };

    it("should create a plan with auto-calculated next mileage", async () => {
      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockPlanRepo.findOne.mockResolvedValue(null);
      mockPlanRepo.create.mockReturnValue(mockPlanPreventivo);
      mockPlanRepo.save.mockResolvedValue(mockPlanPreventivo);

      const result = await service.create(createDto);

      expect(result).toEqual(mockPlanPreventivo);
      expect(mockVehiculoRepo.findOne).toHaveBeenCalled();
      expect(mockPlanRepo.save).toHaveBeenCalled();
    });

    it("should throw NotFoundException when vehicle does not exist", async () => {
      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when vehicle already has a plan", async () => {
      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockPlanRepo.findOne.mockResolvedValue(mockPlanPreventivo);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe("update", () => {
    const updateDto: UpdatePlanPreventivoDto = {
      descripcion: "Descripción actualizada",
    };

    it("should update a plan successfully", async () => {
      const updatedPlan = { ...mockPlanPreventivo, ...updateDto };
      mockPlanRepo.findOne
        .mockResolvedValueOnce(mockPlanPreventivo)
        .mockResolvedValueOnce(updatedPlan);
      mockPlanRepo.save.mockResolvedValue(updatedPlan);

      const result = await service.update(1, updateDto);

      expect(mockPlanRepo.save).toHaveBeenCalled();
      expect(result).toBeDefined();
    });

    it("should throw NotFoundException when plan does not exist", async () => {
      mockPlanRepo.findOne.mockResolvedValue(null);

      await expect(service.update(999, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should deactivate a plan (soft delete)", async () => {
      mockPlanRepo.findOne.mockResolvedValue(mockPlanPreventivo);
      mockPlanRepo.save.mockResolvedValue({
        ...mockPlanPreventivo,
        activo: false,
      });

      await service.remove(1);

      expect(mockPlanRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ activo: false }),
      );
    });

    it("should throw NotFoundException when plan does not exist", async () => {
      mockPlanRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("findByVehiculo", () => {
    it("should return active plan for a vehicle", async () => {
      mockPlanRepo.findOne.mockResolvedValue(mockPlanPreventivo);

      const result = await service.findByVehiculo(1);

      expect(result).toEqual(mockPlanPreventivo);
      expect(mockPlanRepo.findOne).toHaveBeenCalledWith({
        where: { vehiculo: { id: 1 }, activo: true },
        relations: ["vehiculo"],
      });
    });

    it("should return null when vehicle has no active plan", async () => {
      mockPlanRepo.findOne.mockResolvedValue(null);

      const result = await service.findByVehiculo(999);

      expect(result).toBeNull();
    });
  });
});
