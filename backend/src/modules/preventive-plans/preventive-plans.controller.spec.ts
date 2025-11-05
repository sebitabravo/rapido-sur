import { Test, TestingModule } from "@nestjs/testing";
import { NotFoundException } from "@nestjs/common";
import { PreventivePlansController } from "./preventive-plans.controller";
import { PreventivePlansService } from "./preventive-plans.service";
import { CreatePlanPreventivoDto } from "./dto/create-plan-preventivo.dto";
import { UpdatePlanPreventivoDto } from "./dto/update-plan-preventivo.dto";
import { TipoIntervalo } from "../../common/enums";

describe("PreventivePlansController", () => {
  let controller: PreventivePlansController;
  let service: PreventivePlansService;

  const mockPlan = {
    id: 1,
    vehiculo: { id: 1, patente: "ABCD-12" },
    tipo_mantenimiento: "Mantenimiento General",
    tipo_intervalo: TipoIntervalo.KM,
    intervalo: 10000,
    descripcion: "Cambio de aceite y filtros",
    proximo_kilometraje: 25000,
    activo: true,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByVehiculo: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreventivePlansController],
      providers: [
        {
          provide: PreventivePlansService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<PreventivePlansController>(
      PreventivePlansController,
    );
    service = module.get<PreventivePlansService>(PreventivePlansService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("findAll", () => {
    it("should return an array of preventive plans", async () => {
      const plans = [mockPlan];
      mockService.findAll.mockResolvedValue(plans);

      const result = await controller.findAll();

      expect(result).toEqual(plans);
      expect(service.findAll).toHaveBeenCalled();
    });

    it("should return empty array when no plans exist", async () => {
      mockService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a preventive plan by id", async () => {
      mockService.findOne.mockResolvedValue(mockPlan);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPlan);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when plan does not exist", async () => {
      mockService.findOne.mockResolvedValue(null);

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(controller.findOne(999)).rejects.toThrow(
        "Plan preventivo con ID 999 no encontrado",
      );
    });
  });

  describe("findByVehiculo", () => {
    it("should return preventive plan for a vehicle", async () => {
      mockService.findByVehiculo.mockResolvedValue(mockPlan);

      const result = await controller.findByVehiculo(1);

      expect(result).toEqual(mockPlan);
      expect(service.findByVehiculo).toHaveBeenCalledWith(1);
    });

    it("should throw NotFoundException when vehicle has no plan", async () => {
      mockService.findByVehiculo.mockResolvedValue(null);

      await expect(controller.findByVehiculo(999)).rejects.toThrow(
        NotFoundException,
      );
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

    it("should create a new preventive plan", async () => {
      mockService.create.mockResolvedValue(mockPlan);

      const result = await controller.create(createDto);

      expect(result).toEqual(mockPlan);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it("should create a plan with KM interval type", async () => {
      const kmPlan = {
        ...mockPlan,
        tipo_intervalo: TipoIntervalo.KM,
        proximo_kilometraje: 25000,
      };
      mockService.create.mockResolvedValue(kmPlan);

      const result = await controller.create(createDto);

      expect(result.tipo_intervalo).toBe(TipoIntervalo.KM);
      expect(result.proximo_kilometraje).toBeDefined();
    });

    it("should create a plan with Tiempo interval type", async () => {
      const tiempoDto: CreatePlanPreventivoDto = {
        ...createDto,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: new Date("2025-06-01"),
      };
      const tiempoPlan = {
        ...mockPlan,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: new Date("2025-06-01"),
        proximo_kilometraje: null,
      };
      mockService.create.mockResolvedValue(tiempoPlan);

      const result = await controller.create(tiempoDto);

      expect(result.tipo_intervalo).toBe(TipoIntervalo.Tiempo);
      expect(result.proxima_fecha).toBeDefined();
    });
  });

  describe("update", () => {
    const updateDto: UpdatePlanPreventivoDto = {
      descripcion: "Descripci�n actualizada",
      intervalo: 15000,
    };

    it("should update an existing preventive plan", async () => {
      const updatedPlan = { ...mockPlan, ...updateDto };
      mockService.update.mockResolvedValue(updatedPlan);

      const result = await controller.update(1, updateDto);

      expect(result).toEqual(updatedPlan);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });

    it("should update only specified fields", async () => {
      const partialUpdate: UpdatePlanPreventivoDto = {
        activo: false,
      };
      const deactivatedPlan = { ...mockPlan, activo: false };
      mockService.update.mockResolvedValue(deactivatedPlan);

      const result = await controller.update(1, partialUpdate);

      expect(result.activo).toBe(false);
      expect(service.update).toHaveBeenCalledWith(1, partialUpdate);
    });
  });

  describe("remove", () => {
    it("should deactivate a preventive plan", async () => {
      mockService.remove.mockResolvedValue(undefined);

      await controller.remove(1);

      expect(service.remove).toHaveBeenCalledWith(1);
    });

    it("should handle removal of non-existent plan", async () => {
      mockService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
