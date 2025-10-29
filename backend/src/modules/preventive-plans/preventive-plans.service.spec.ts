import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { PreventivePlansService } from "./preventive-plans.service";
import { PlanPreventivo } from "./entities/plan-preventivo.entity";
import { TipoIntervalo } from "../../common/enums";

describe("PreventivePlansService", () => {
  let service: PreventivePlansService;
  let planRepo: Repository<PlanPreventivo>;

  const mockPlanRepo = {
    find: jest.fn(),
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
      ],
    }).compile();

    service = module.get<PreventivePlansService>(PreventivePlansService);
    planRepo = module.get<Repository<PlanPreventivo>>(
      getRepositoryToken(PlanPreventivo),
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
});
