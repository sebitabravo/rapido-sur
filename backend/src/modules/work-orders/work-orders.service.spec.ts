import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { WorkOrdersService } from "./work-orders.service";
import { OrdenTrabajo } from "./entities/orden-trabajo.entity";
import { Vehiculo } from "../vehicles/entities/vehiculo.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { PlanPreventivo } from "../preventive-plans/entities/plan-preventivo.entity";
import { DetalleRepuesto } from "../part-details/entities/detalle-repuesto.entity";
import { Repuesto } from "../parts/entities/repuesto.entity";
import { Tarea } from "../tasks/entities/tarea.entity";
import {
  EstadoOrdenTrabajo,
  TipoOrdenTrabajo,
  RolUsuario,
  EstadoVehiculo,
  TipoIntervalo,
} from "../../common/enums";

describe("WorkOrdersService", () => {
  let service: WorkOrdersService;
  let otRepo: Repository<OrdenTrabajo>;
  let vehiculoRepo: Repository<Vehiculo>;
  let usuarioRepo: Repository<Usuario>;
  let planRepo: Repository<PlanPreventivo>;
  let detalleRepo: Repository<DetalleRepuesto>;
  let repuestoRepo: Repository<Repuesto>;
  let tareaRepo: Repository<Tarea>;

  // Mock repositories
  const mockOtRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockVehiculoRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockUsuarioRepo = {
    findOne: jest.fn(),
  };

  const mockPlanRepo = {
    save: jest.fn(),
  };

  const mockDetalleRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockRepuestoRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockTareaRepo = {
    findOne: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkOrdersService,
        {
          provide: getRepositoryToken(OrdenTrabajo),
          useValue: mockOtRepo,
        },
        {
          provide: getRepositoryToken(Vehiculo),
          useValue: mockVehiculoRepo,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
        {
          provide: getRepositoryToken(PlanPreventivo),
          useValue: mockPlanRepo,
        },
        {
          provide: getRepositoryToken(DetalleRepuesto),
          useValue: mockDetalleRepo,
        },
        {
          provide: getRepositoryToken(Repuesto),
          useValue: mockRepuestoRepo,
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

    service = module.get<WorkOrdersService>(WorkOrdersService);
    otRepo = module.get<Repository<OrdenTrabajo>>(
      getRepositoryToken(OrdenTrabajo),
    );
    vehiculoRepo = module.get<Repository<Vehiculo>>(
      getRepositoryToken(Vehiculo),
    );
    usuarioRepo = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    planRepo = module.get<Repository<PlanPreventivo>>(
      getRepositoryToken(PlanPreventivo),
    );
    detalleRepo = module.get<Repository<DetalleRepuesto>>(
      getRepositoryToken(DetalleRepuesto),
    );
    repuestoRepo = module.get<Repository<Repuesto>>(
      getRepositoryToken(Repuesto),
    );
    tareaRepo = module.get<Repository<Tarea>>(getRepositoryToken(Tarea));

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create work order with auto-generated number", async () => {
      const createDto = {
        vehiculo_id: 1,
        tipo: TipoOrdenTrabajo.Preventivo,
        descripcion: "Mantenimiento 10.000 km",
      };

      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
      } as Vehiculo;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null), // No previous OT
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockOtRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockOtRepo.create.mockReturnValue({
        numero_ot: "OT-2025-00001",
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        vehiculo: mockVehiculo,
        estado: EstadoOrdenTrabajo.Pendiente,
      });
      mockOtRepo.save.mockResolvedValue({
        id: 1,
        numero_ot: "OT-2025-00001",
        tipo: createDto.tipo,
        descripcion: createDto.descripcion,
        vehiculo: mockVehiculo,
        estado: EstadoOrdenTrabajo.Pendiente,
      });

      const result = await service.create(createDto);

      expect(vehiculoRepo.findOne).toHaveBeenCalledWith({
        where: { id: createDto.vehiculo_id },
      });
      expect(result.numero_ot).toBe("OT-2025-00001");
      expect(result.estado).toBe(EstadoOrdenTrabajo.Pendiente);
    });

    it("should generate consecutive work order numbers", async () => {
      const createDto = {
        vehiculo_id: 1,
        tipo: TipoOrdenTrabajo.Correctivo,
        descripcion: "Reparación motor",
      };

      const mockVehiculo = { id: 1, patente: "ABCD-12" } as Vehiculo;

      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          numero_ot: "OT-2025-00042",
        }),
      };

      mockVehiculoRepo.findOne.mockResolvedValue(mockVehiculo);
      mockOtRepo.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockOtRepo.create.mockReturnValue({
        numero_ot: "OT-2025-00043",
      });
      mockOtRepo.save.mockResolvedValue({
        id: 2,
        numero_ot: "OT-2025-00043",
      });

      const result = await service.create(createDto);

      expect(result.numero_ot).toBe("OT-2025-00043");
    });

    it("should throw NotFoundException if vehicle does not exist", async () => {
      const createDto = {
        vehiculo_id: 999,
        tipo: TipoOrdenTrabajo.Preventivo,
        descripcion: "Test",
      };

      mockVehiculoRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Vehículo no encontrado",
      );
    });
  });

  describe("asignarMecanico", () => {
    it("should assign mechanic and change state to ASIGNADA", async () => {
      const ordenId = 1;
      const asignarDto = { mecanico_id: 2 };

      const mockOrden = {
        id: ordenId,
        numero_ot: "OT-2025-00001",
        estado: EstadoOrdenTrabajo.Pendiente,
      } as OrdenTrabajo;

      const mockMecanico = {
        id: 2,
        nombre_completo: "Juan Pérez",
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockUsuarioRepo.findOne.mockResolvedValue(mockMecanico);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        mecanico: mockMecanico,
        estado: EstadoOrdenTrabajo.Asignada,
      });

      const result = await service.asignarMecanico(ordenId, asignarDto);

      expect(result.estado).toBe(EstadoOrdenTrabajo.Asignada);
      expect(result.mecanico).toBe(mockMecanico);
    });

    it("should allow JefeMantenimiento to be assigned", async () => {
      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.Pendiente,
      } as OrdenTrabajo;

      const mockJefe = {
        id: 3,
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockUsuarioRepo.findOne.mockResolvedValue(mockJefe);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        mecanico: mockJefe,
        estado: EstadoOrdenTrabajo.Asignada,
      });

      const result = await service.asignarMecanico(1, { mecanico_id: 3 });

      expect(result.estado).toBe(EstadoOrdenTrabajo.Asignada);
    });

    it("should throw BadRequestException if user is not mechanic or supervisor", async () => {
      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.Pendiente,
      } as OrdenTrabajo;

      const mockAdmin = {
        id: 4,
        rol: RolUsuario.Administrador,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockUsuarioRepo.findOne.mockResolvedValue(mockAdmin);

      await expect(
        service.asignarMecanico(1, { mecanico_id: 4 }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException if OT is not in PENDIENTE state", async () => {
      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
      } as OrdenTrabajo;

      const mockMecanico = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockUsuarioRepo.findOne.mockResolvedValue(mockMecanico);

      await expect(
        service.asignarMecanico(1, { mecanico_id: 2 }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.asignarMecanico(1, { mecanico_id: 2 }),
      ).rejects.toThrow(/No se puede asignar una OT en estado/);
    });
  });

  describe("registrarTrabajo", () => {
    it("should change state from ASIGNADA to EN_PROGRESO", async () => {
      const mockMecanico = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.Asignada,
        mecanico: mockMecanico,
        vehiculo: { id: 1, kilometraje_actual: 10000 } as Vehiculo,
        detalles_repuestos: [],
        tareas: [],
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        estado: EstadoOrdenTrabajo.EnProgreso,
      });

      const result = await service.registrarTrabajo(
        1,
        { observaciones: "Iniciando trabajo" },
        mockMecanico,
      );

      expect(result.estado).toBe(EstadoOrdenTrabajo.EnProgreso);
    });

    it("should throw ForbiddenException if mechanic is not assigned to the OT", async () => {
      const mockMecanico = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockOtroMecanico = {
        id: 3,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.Asignada,
        mecanico: mockOtroMecanico,
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);

      await expect(
        service.registrarTrabajo(1, {}, mockMecanico),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should not allow decreasing vehicle mileage", async () => {
      const mockMecanico = {
        id: 2,
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        mecanico: mockMecanico,
        vehiculo: { id: 1, kilometraje_actual: 15000 } as Vehiculo,
        detalles_repuestos: [],
        tareas: [],
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);

      await expect(
        service.registrarTrabajo(
          1,
          { kilometraje_actual: 14000 },
          mockMecanico,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registrarTrabajo(
          1,
          { kilometraje_actual: 14000 },
          mockMecanico,
        ),
      ).rejects.toThrow(/El kilometraje no puede ser menor al actual/);
    });

    it("should throw BadRequestException if part stock is insufficient", async () => {
      const mockMecanico = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = { id: 1 } as Tarea;
      const mockRepuesto = {
        id: 1,
        nombre: "Filtro de aceite",
        cantidad_stock: 2,
        precio_unitario: 5000,
      } as Repuesto;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        mecanico: mockMecanico,
        vehiculo: { id: 1, kilometraje_actual: 10000 } as Vehiculo,
        detalles_repuestos: [],
        tareas: [mockTarea],
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockRepuestoRepo.findOne.mockResolvedValue(mockRepuesto);
      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.registrarTrabajo(
          1,
          {
            repuestos: [
              {
                repuesto_id: 1,
                cantidad: 5, // More than available stock (2)
                tarea_id: 1,
              },
            ],
          },
          mockMecanico,
        ),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.registrarTrabajo(
          1,
          {
            repuestos: [
              { repuesto_id: 1, cantidad: 5, tarea_id: 1 },
            ],
          },
          mockMecanico,
        ),
      ).rejects.toThrow(/Stock insuficiente/);
    });
  });

  describe("cerrar", () => {
    it("should close work order and calculate total cost", async () => {
      const mockVehiculo = {
        id: 1,
        patente: "ABCD-12",
        kilometraje_actual: 10000,
        estado: EstadoVehiculo.EnMantenimiento,
      } as Vehiculo;

      const mockOrden = {
        id: 1,
        numero_ot: "OT-2025-00001",
        estado: EstadoOrdenTrabajo.EnProgreso,
        tipo: TipoOrdenTrabajo.Correctivo,
        vehiculo: mockVehiculo,
        detalles_repuestos: [
          {
            cantidad_usada: 2,
            precio_unitario_momento: 5000,
          },
          {
            cantidad_usada: 1,
            precio_unitario_momento: 8000,
          },
        ],
        tareas: [{ completada: true }, { completada: true }],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        estado: EstadoOrdenTrabajo.Finalizada,
        costo_total: 18000, // (2 * 5000) + (1 * 8000)
        fecha_cierre: new Date(),
      });
      mockVehiculoRepo.save.mockResolvedValue(mockVehiculo);

      const result = await service.cerrar(1);

      expect(result.estado).toBe(EstadoOrdenTrabajo.Finalizada);
      expect(result.costo_total).toBe(18000);
      expect(result.fecha_cierre).toBeDefined();
    });

    it("should throw BadRequestException if OT is not EN_PROGRESO", async () => {
      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.Pendiente,
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);

      await expect(service.cerrar(1)).rejects.toThrow(BadRequestException);
      await expect(service.cerrar(1)).rejects.toThrow(
        /Solo se pueden cerrar órdenes en progreso/,
      );
    });

    it("should throw BadRequestException if there are incomplete tasks", async () => {
      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        vehiculo: { id: 1 } as Vehiculo,
        detalles_repuestos: [],
        tareas: [
          { completada: true },
          { completada: false }, // Incomplete task
        ],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);

      await expect(service.cerrar(1)).rejects.toThrow(BadRequestException);
      await expect(service.cerrar(1)).rejects.toThrow(
        /No se puede cerrar la OT con tareas incompletas/,
      );
    });

    it("should recalculate preventive plan for KM-based maintenance", async () => {
      const mockPlan = {
        id: 1,
        tipo_intervalo: TipoIntervalo.KM,
        intervalo: 10000,
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        kilometraje_actual: 25000,
        plan_preventivo: mockPlan,
        estado: EstadoVehiculo.EnMantenimiento,
      } as Vehiculo;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        tipo: TipoOrdenTrabajo.Preventivo,
        vehiculo: mockVehiculo,
        detalles_repuestos: [],
        tareas: [{ completada: true }],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        estado: EstadoOrdenTrabajo.Finalizada,
      });
      mockVehiculoRepo.save.mockResolvedValue(mockVehiculo);
      mockPlanRepo.save.mockResolvedValue({
        ...mockPlan,
        proximo_kilometraje: 35000, // 25000 + 10000
      });

      await service.cerrar(1);

      expect(planRepo.save).toHaveBeenCalled();
      const savedPlan = mockPlanRepo.save.mock.calls[0][0];
      expect(savedPlan.proximo_kilometraje).toBe(35000);
    });

    it("should recalculate preventive plan for time-based maintenance", async () => {
      const mockPlan = {
        id: 1,
        tipo_intervalo: TipoIntervalo.Tiempo,
        intervalo: 180, // 180 days (6 months)
      } as PlanPreventivo;

      const mockVehiculo = {
        id: 1,
        plan_preventivo: mockPlan,
        estado: EstadoVehiculo.EnMantenimiento,
      } as Vehiculo;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        tipo: TipoOrdenTrabajo.Preventivo,
        vehiculo: mockVehiculo,
        detalles_repuestos: [],
        tareas: [{ completada: true }],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        estado: EstadoOrdenTrabajo.Finalizada,
      });
      mockVehiculoRepo.save.mockResolvedValue(mockVehiculo);
      mockPlanRepo.save.mockImplementation((plan) => {
        return Promise.resolve(plan);
      });

      await service.cerrar(1);

      expect(planRepo.save).toHaveBeenCalled();
      const savedPlan = mockPlanRepo.save.mock.calls[0][0];
      expect(savedPlan.proxima_fecha).toBeDefined();
    });

    it("should update vehicle ultima_revision and set to Activo", async () => {
      const mockVehiculo = {
        id: 1,
        estado: EstadoVehiculo.EnMantenimiento,
      } as Vehiculo;

      const mockOrden = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
        tipo: TipoOrdenTrabajo.Correctivo,
        vehiculo: mockVehiculo,
        detalles_repuestos: [],
        tareas: [{ completada: true }],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);
      mockOtRepo.save.mockResolvedValue({
        ...mockOrden,
        estado: EstadoOrdenTrabajo.Finalizada,
      });
      mockVehiculoRepo.save.mockImplementation((vehiculo) => {
        return Promise.resolve(vehiculo);
      });

      await service.cerrar(1);

      expect(vehiculoRepo.save).toHaveBeenCalled();
      const savedVehiculo = mockVehiculoRepo.save.mock.calls[0][0];
      expect(savedVehiculo.estado).toBe(EstadoVehiculo.Activo);
      expect(savedVehiculo.ultima_revision).toBeDefined();
    });
  });

  describe("findOne", () => {
    it("should return work order with relations", async () => {
      const mockOrden = {
        id: 1,
        numero_ot: "OT-2025-00001",
        vehiculo: { id: 1, patente: "ABCD-12" },
        mecanico: { id: 2, nombre_completo: "Juan Pérez" },
        tareas: [],
        detalles_repuestos: [],
      } as any;

      mockOtRepo.findOne.mockResolvedValue(mockOrden);

      const result = await service.findOne(1);

      expect(result).toBe(mockOrden);
      expect(otRepo.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: [
          "vehiculo",
          "mecanico",
          "tareas",
          "tareas.detalles_repuestos",
          "tareas.detalles_repuestos.repuesto",
        ],
      });
    });

    it("should throw NotFoundException if work order does not exist", async () => {
      mockOtRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        "Orden de trabajo no encontrada",
      );
    });
  });
});
