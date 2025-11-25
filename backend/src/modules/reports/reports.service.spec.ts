import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import { Repository } from "typeorm";
import { ReportsService } from "./reports.service";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import { FilterReportDto } from "./dto/filter-report.dto";
import { EstadoOrdenTrabajo, TipoOrdenTrabajo } from "../../common/enums";

describe("ReportsService", () => {
  let service: ReportsService;

  const mockOtRepo = {
    createQueryBuilder: jest.fn(),
    find: jest.fn(),
  };

  const mockDetalleRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTareaRepo = {
    find: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReportsService,
        {
          provide: getRepositoryToken(OrdenTrabajo),
          useValue: mockOtRepo,
        },
        {
          provide: getRepositoryToken(DetalleRepuesto),
          useValue: mockDetalleRepo,
        },
        {
          provide: getRepositoryToken(Tarea),
          useValue: mockTareaRepo,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ReportsService>(ReportsService);

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getReporteIndisponibilidad", () => {
    it("should return downtime report for all vehicles", async () => {
      const mockData = [
        {
          vehiculo_id: 1,
          patente: "ABCD-12",
          marca: "Mercedes",
          modelo: "Sprinter",
          total_ordenes: 5,
          dias_inactividad: 15,
          promedio_dias: 3,
        },
        {
          vehiculo_id: 2,
          patente: "EFGH-34",
          marca: "Ford",
          modelo: "Transit",
          total_ordenes: 3,
          dias_inactividad: 10,
          promedio_dias: 3.33,
        },
      ];

      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockData),
      };

      mockOtRepo.createQueryBuilder.mockReturnValue(mockQB);

      const filters: FilterReportDto = {};
      const result = await service.getReporteIndisponibilidad(filters);

      expect(result).toEqual(mockData);
      expect(mockQB.where).toHaveBeenCalledWith("ot.estado = :estado", {
        estado: EstadoOrdenTrabajo.Finalizada,
      });
    });

    it("should filter by date range", async () => {
      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockOtRepo.createQueryBuilder.mockReturnValue(mockQB);

      const filters: FilterReportDto = {
        fecha_inicio: new Date("2025-01-01"),
        fecha_fin: new Date("2025-01-31"),
      };

      await service.getReporteIndisponibilidad(filters);

      expect(mockQB.andWhere).toHaveBeenCalledWith(
        "ot.fecha_creacion >= :fecha_inicio",
        { fecha_inicio: filters.fecha_inicio },
      );
      expect(mockQB.andWhere).toHaveBeenCalledWith(
        "ot.fecha_creacion <= :fecha_fin",
        { fecha_fin: filters.fecha_fin },
      );
    });

    it("should filter by specific vehicle", async () => {
      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockOtRepo.createQueryBuilder.mockReturnValue(mockQB);

      const filters: FilterReportDto = {
        vehiculo_id: 1,
      };

      await service.getReporteIndisponibilidad(filters);

      expect(mockQB.andWhere).toHaveBeenCalledWith("v.id = :vehiculo_id", {
        vehiculo_id: 1,
      });
    });
  });

  describe("getReporteCostos", () => {
    it("should return cost report", async () => {
      const mockQBVehiculos = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { vehiculo_id: 1, costo_total: 100000 },
        ]),
      };

      const mockQBTipo = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { tipo: "Preventivo", total: 50000 },
        ]),
      };

      const mockQBDesglose = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ costo_repuestos: 60000 }),
      };

      const mockQBManoObra = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total_horas: 10 }),
      };

      mockConfigService.get.mockReturnValue(15000); // LABOR_COST_PER_HOUR

      mockOtRepo.createQueryBuilder
        .mockReturnValueOnce(mockQBVehiculos)
        .mockReturnValueOnce(mockQBTipo);
      
      mockDetalleRepo.createQueryBuilder.mockReturnValue(mockQBDesglose);
      mockTareaRepo.createQueryBuilder.mockReturnValue(mockQBManoObra);

      const filters: FilterReportDto = {};
      const result = await service.getReporteCostos(filters);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("costo_total");
      expect(result).toHaveProperty("costo_repuestos");
      expect(result).toHaveProperty("costo_mano_obra");
      expect(result.costo_repuestos).toBe(60000);
      expect(result.total_horas_trabajadas).toBe(10);
      expect(result.costo_mano_obra).toBe(150000); // 10 hours * 15000
    });
  });

  describe("getReporteMantenimientos", () => {
    it("should call query builder and return result", async () => {
      const mockQB = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockOtRepo.createQueryBuilder.mockReturnValue(mockQB);

      const result = await service.getReporteMantenimientos({});

      expect(result).toBeDefined();
      expect(mockOtRepo.createQueryBuilder).toHaveBeenCalled();
    });
  });

  describe("exportToCSV", () => {
    it("should export report to CSV format", async () => {
      const mockQB = {
        leftJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { id: 1, patente: "ABCD-12", total: 100 },
        ]),
      };

      mockOtRepo.createQueryBuilder.mockReturnValue(mockQB);

      const filters: FilterReportDto = {};
      const result = await service.exportToCSV("indisponibilidad", filters);

      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });
  });
});
