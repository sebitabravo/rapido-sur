import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AlertsService } from "./alerts.service";
import { Alerta } from "./entities/alerta.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { MailService } from "../mail/mail.service";
import { EstadoVehiculo, TipoAlerta, TipoIntervalo } from "../../common/enums";

describe("AlertsService", () => {
  let service: AlertsService;
  let alertaRepo: Repository<Alerta>;
  let planRepo: Repository<PlanPreventivo>;
  let vehiculoRepo: Repository<Vehiculo>;
  let mailService: MailService;

  const mockAlertaRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPlanRepo = {
    find: jest.fn(),
  };

  const mockVehiculoRepo = {
    find: jest.fn(),
  };

  const mockMailService = {
    enviarAlertasPreventivas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AlertsService,
        {
          provide: getRepositoryToken(Alerta),
          useValue: mockAlertaRepo,
        },
        {
          provide: getRepositoryToken(PlanPreventivo),
          useValue: mockPlanRepo,
        },
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: mockVehiculoRepo,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<AlertsService>(AlertsService);
    alertaRepo = module.get<Repository<Alerta>>(getRepositoryToken(Alerta));
    planRepo = module.get<Repository<PlanPreventivo>>(
      getRepositoryToken(PlanPreventivo),
    );
    vehiculoRepo = module.get<Repository<Vehiculo>>(
      getRepositoryToken(Vehiculo),
    );
    mailService = module.get<MailService>(MailService);

    jest.clearAllMocks();
    
    // Setup default mock for createQueryBuilder
    const mockQB = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([]),
    };
    mockAlertaRepo.createQueryBuilder.mockReturnValue(mockQB);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("verificarAlertasPreventivas - KM Based", () => {
    it("should generate alert when vehicle is 1000 km before maintenance", async () => {
      const mockPlan = {
        id: 1,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        marca: "Mercedes",
        modelo: "Sprinter",
        kilometraje_actual: 19000, // 1000 km before threshold
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null); // No existing alert
      mockAlertaRepo.create.mockReturnValue({
        vehiculo: mockVehiculo,
        tipo_alerta: TipoAlerta.Kilometraje,
        mensaje: expect.any(String),
        fecha_generacion: expect.any(Date),
        email_enviado: false,
      });
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).toHaveBeenCalled();
      expect(alertaRepo.save).toHaveBeenCalled();
      expect(mailService.enviarAlertasPreventivas).toHaveBeenCalled();
    });

    it("should generate alert when vehicle is exactly at maintenance threshold", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "EFGH-34",
        marca: "Ford",
        modelo: "Transit",
        kilometraje_actual: 19000, // Exactly at alert threshold
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockReturnValue({});
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).toHaveBeenCalled();
    });

    it("should generate OVERDUE alert when vehicle passed maintenance threshold", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "OVER-12",
        marca: "Chevrolet",
        modelo: "Van",
        kilometraje_actual: 21500, // 1500 km overdue
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockImplementation((data) => data);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      const createdAlert = mockAlertaRepo.create.mock.calls[0][0];
      expect(createdAlert.mensaje).toContain("ATRASADO");
      expect(createdAlert.mensaje).toContain("1500");
    });

    it("should NOT generate alert when vehicle is more than 1000 km before threshold", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "SAFE-12",
        kilometraje_actual: 17000, // 3000 km before threshold - too early
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).not.toHaveBeenCalled();
      expect(mailService.enviarAlertasPreventivas).not.toHaveBeenCalled();
    });
  });

  describe("verificarAlertasPreventivas - Time Based", () => {
    it("should generate alert when 7 days before maintenance date", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 7); // Exactly 7 days from now

      const mockPlan = {
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: proximaFecha,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "TIME-12",
        marca: "Nissan",
        modelo: "Urvan",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockImplementation((data) => data);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).toHaveBeenCalled();
      const createdAlert = mockAlertaRepo.create.mock.calls[0][0];
      expect(createdAlert.tipo_alerta).toBe(TipoAlerta.Fecha);
      expect(createdAlert.mensaje).toContain("7 días");
    });

    it("should generate alert when 5 days before maintenance date", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 5); // 5 days from now

      const mockPlan = {
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: proximaFecha,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "SOON-12",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockImplementation((data) => data);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).toHaveBeenCalled();
    });

    it("should generate OVERDUE alert when maintenance date has passed", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() - 10); // 10 days ago

      const mockPlan = {
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: proximaFecha,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "LATE-12",
        marca: "Toyota",
        modelo: "Hiace",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockImplementation((data) => data);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: 1, ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      const createdAlert = mockAlertaRepo.create.mock.calls[0][0];
      expect(createdAlert.mensaje).toContain("ATRASADO");
      expect(createdAlert.mensaje).toContain("10 días");
    });

    it("should NOT generate alert when more than 7 days before maintenance", async () => {
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 30); // 30 days from now - too early

      const mockPlan = {
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180,
        proxima_fecha: proximaFecha,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "EARLY-12",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).not.toHaveBeenCalled();
    });
  });

  describe("verificarAlertasPreventivas - Edge Cases", () => {
    it("should skip vehicles without active preventive plan", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "NOPLAN-12",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: null,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).not.toHaveBeenCalled();
    });

    it("should skip vehicles with inactive preventive plan", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: false, // Inactive plan
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "INACTIVE-12",
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).not.toHaveBeenCalled();
    });

    it("should NOT create duplicate alert if one already exists", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "DUP-12",
        kilometraje_actual: 19000,
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      const existingAlert = {
        id: 1,
        vehiculo: { id: 1 },
        email_enviado: false,
      } as Alerta;

      // Setup createQueryBuilder to return existing alert
      const mockQB = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([existingAlert]),
      };
      mockAlertaRepo.createQueryBuilder.mockReturnValue(mockQB);

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).not.toHaveBeenCalled();
      expect(alertaRepo.save).not.toHaveBeenCalled();
    });

    it("should process multiple vehicles and generate multiple alerts", async () => {
      const mockVehiculos = [
        {
          id: 1,
          patente: "VEH1-12",
          marca: "Mercedes",
          modelo: "Sprinter",
          kilometraje_actual: 19000,
          estado: EstadoVehiculo.Activo,
          plan_preventivo: {
            tipo_intervalo: TipoIntervalo.KM,
            intervalo: 10000,
            proximo_kilometraje: 20000,
            activo: true,
          },
        },
        {
          id: 2,
          patente: "VEH2-34",
          marca: "Ford",
          modelo: "Transit",
          kilometraje_actual: 29500,
          estado: EstadoVehiculo.Activo,
          plan_preventivo: {
            tipo_intervalo: TipoIntervalo.KM,
            intervalo: 10000,
            proximo_kilometraje: 30000,
            activo: true,
          },
        },
      ] as Vehiculo[];

      mockVehiculoRepo.find.mockResolvedValue(mockVehiculos);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockImplementation((data) => data);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve({ id: Math.random(), ...alerta }),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      expect(alertaRepo.create).toHaveBeenCalledTimes(2);
      // Should be called 4 times: 2 to create, 2 to mark as sent
      expect(alertaRepo.save).toHaveBeenCalledTimes(4);
      expect(mailService.enviarAlertasPreventivas).toHaveBeenCalledTimes(1);
    });

    it("should NOT send email if no alerts were generated", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "SAFE-12",
        kilometraje_actual: 10000, // Far from threshold
        estado: EstadoVehiculo.Activo,
        plan_preventivo: {
          tipo_intervalo: TipoIntervalo.KM,
          proximo_kilometraje: 20000,
          activo: true,
        },
      } as Vehiculo;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);

      await service.verificarAlertasPreventivas();

      expect(mailService.enviarAlertasPreventivas).not.toHaveBeenCalled();
    });

    it("should mark alerts as sent after email is sent successfully", async () => {
      const mockPlan = {
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
        proximo_kilometraje: 20000,
        activo: true,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        patente: "MAIL-12",
        marca: "Nissan",
        modelo: "Urvan",
        kilometraje_actual: 19500,
        estado: EstadoVehiculo.Activo,
        plan_preventivo: mockPlan,
      } as Vehiculo;

      const mockAlerta = {
        id: 1,
        vehiculo: mockVehiculo,
        email_enviado: false,
      } as Alerta;

      mockVehiculoRepo.find.mockResolvedValue([mockVehiculo]);
      mockAlertaRepo.findOne.mockResolvedValue(null);
      mockAlertaRepo.create.mockReturnValue(mockAlerta);
      mockAlertaRepo.save.mockImplementation((alerta) =>
        Promise.resolve(alerta),
      );
      mockMailService.enviarAlertasPreventivas.mockResolvedValue(undefined);

      await service.verificarAlertasPreventivas();

      // Should be called twice: once to create, once to mark as sent
      expect(alertaRepo.save).toHaveBeenCalledTimes(2);
      const secondCall = mockAlertaRepo.save.mock.calls[1][0];
      expect(secondCall.email_enviado).toBe(true);
    });
  });

  describe("marcarAtendida", () => {
    it("should delete alerts for the specified vehicle", async () => {
      mockAlertaRepo.delete.mockResolvedValue({ affected: 1 });

      await service.marcarAtendida(5);

      expect(alertaRepo.delete).toHaveBeenCalledWith({
        vehiculo: { id: 5 },
      });
    });
  });

  describe("getAlertasPendientes", () => {
    it("should return only pending alerts", async () => {
      const mockAlertas = [
        { id: 1, email_enviado: false },
        { id: 2, email_enviado: false },
      ] as Alerta[];

      mockAlertaRepo.find.mockResolvedValue(mockAlertas);

      const result = await service.getAlertasPendientes();

      expect(alertaRepo.find).toHaveBeenCalledWith({
        where: { email_enviado: false },
        relations: ["vehiculo"],
        order: { fecha_generacion: "DESC" },
      });
      expect(result).toEqual(mockAlertas);
    });
  });

  describe("findAll", () => {
    it("should return all alerts with vehicle relations", async () => {
      const mockAlertas = [
        { id: 1, email_enviado: true },
        { id: 2, email_enviado: false },
      ] as Alerta[];

      mockAlertaRepo.find.mockResolvedValue(mockAlertas);

      const result = await service.findAll();

      expect(alertaRepo.find).toHaveBeenCalledWith({
        relations: ["vehiculo"],
        order: { fecha_generacion: "DESC" },
      });
      expect(result).toEqual(mockAlertas);
    });
  });
});
