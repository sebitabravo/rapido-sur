import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import {
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { Repository } from "typeorm";
import { TasksService } from "./tasks.service";
import { Tarea } from "./entities/tarea.entity";
import { OrdenTrabajo } from "../work-orders/entities/orden-trabajo.entity";
import { Usuario } from "../users/entities/usuario.entity";
import { CreateTareaDto } from "./dto/create-tarea.dto";
import { UpdateTareaDto } from "./dto/update-tarea.dto";
import { MarkCompletedDto } from "./dto/mark-completed.dto";
import { RolUsuario, EstadoOrdenTrabajo } from "../../common/enums";

describe("TasksService", () => {
  let service: TasksService;
  let tareaRepo: Repository<Tarea>;
  let otRepo: Repository<OrdenTrabajo>;
  let usuarioRepo: Repository<Usuario>;

  const mockTareaRepo = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  const mockOtRepo = {
    findOne: jest.fn(),
  };

  const mockUsuarioRepo = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Tarea),
          useValue: mockTareaRepo,
        },
        {
          provide: getRepositoryToken(OrdenTrabajo),
          useValue: mockOtRepo,
        },
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepo,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    tareaRepo = module.get<Repository<Tarea>>(getRepositoryToken(Tarea));
    otRepo = module.get<Repository<OrdenTrabajo>>(
      getRepositoryToken(OrdenTrabajo),
    );
    usuarioRepo = module.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new task", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Cambiar aceite",
        orden_trabajo_id: 1,
        mecanico_asignado_id: 2,
      };

      const mockOt = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
      } as OrdenTrabajo;

      const mockMecanico = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        descripcion: createDto.descripcion,
        completada: false,
      } as Tarea;

      mockOtRepo.findOne.mockResolvedValue(mockOt);
      mockUsuarioRepo.findOne.mockResolvedValue(mockMecanico);
      mockTareaRepo.create.mockReturnValue(mockTarea);
      mockTareaRepo.save.mockResolvedValue(mockTarea);

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(mockTareaRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          descripcion: createDto.descripcion,
          completada: false,
        }),
      );
    });

    it("should throw NotFoundException if work order does not exist", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Test",
        orden_trabajo_id: 999,
      };

      mockOtRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Orden de trabajo no encontrada",
      );
    });

    it("should throw BadRequestException if work order is finalized", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Test",
        orden_trabajo_id: 1,
      };

      const mockOt = {
        id: 1,
        estado: EstadoOrdenTrabajo.Finalizada,
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOt);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        /No se pueden agregar tareas a una orden finalizada/,
      );
    });

    it("should throw NotFoundException if mechanic does not exist", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Test",
        orden_trabajo_id: 1,
        mecanico_asignado_id: 999,
      };

      const mockOt = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
      } as OrdenTrabajo;

      mockOtRepo.findOne.mockResolvedValue(mockOt);
      mockUsuarioRepo.findOne.mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        "Mecánico no encontrado",
      );
    });

    it("should throw BadRequestException if user is not mechanic or supervisor", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Test",
        orden_trabajo_id: 1,
        mecanico_asignado_id: 2,
      };

      const mockOt = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
      } as OrdenTrabajo;

      const mockAdmin = {
        id: 2,
        rol: RolUsuario.Administrador,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOt);
      mockUsuarioRepo.findOne.mockResolvedValue(mockAdmin);

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        /El usuario debe ser mecánico o jefe de mantenimiento/,
      );
    });

    it("should allow JefeMantenimiento to be assigned", async () => {
      const createDto: CreateTareaDto = {
        descripcion: "Test",
        orden_trabajo_id: 1,
        mecanico_asignado_id: 2,
      };

      const mockOt = {
        id: 1,
        estado: EstadoOrdenTrabajo.EnProgreso,
      } as OrdenTrabajo;

      const mockJefe = {
        id: 2,
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      mockOtRepo.findOne.mockResolvedValue(mockOt);
      mockUsuarioRepo.findOne.mockResolvedValue(mockJefe);
      mockTareaRepo.create.mockReturnValue({} as Tarea);
      mockTareaRepo.save.mockResolvedValue({} as Tarea);

      await expect(service.create(createDto)).resolves.not.toThrow();
    });
  });

  describe("update", () => {
    it("should update task successfully", async () => {
      const updateDto: UpdateTareaDto = {
        descripcion: "Nueva descripción",
        horas_trabajadas: 2,
      };

      const mockUser = {
        id: 2,
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      const mockTarea = {
        id: 1,
        descripcion: "Vieja descripción",
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.EnProgreso,
        },
        mecanico_asignado: { id: 2 },
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);
      mockTareaRepo.save.mockResolvedValue({
        ...mockTarea,
        ...updateDto,
      });

      const result = await service.update(1, updateDto, mockUser);

      expect(result.descripcion).toBe(updateDto.descripcion);
    });

    it("should throw NotFoundException if task does not exist", async () => {
      const mockUser = {
        id: 1,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockTareaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.update(999, {}, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if task is already completed", async () => {
      const mockUser = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: true,
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.update(1, {}, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(1, {}, mockUser),
      ).rejects.toThrow(/No se puede modificar una tarea completada/);
    });

    it("should throw BadRequestException if work order is finalized", async () => {
      const mockUser = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.Finalizada,
        },
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.update(1, {}, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.update(1, {}, mockUser),
      ).rejects.toThrow(/No se pueden modificar tareas de una orden finalizada/);
    });

    it("should throw ForbiddenException if mechanic tries to update task not assigned to them", async () => {
      const mockUser = {
        id: 3,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.EnProgreso,
        },
        mecanico_asignado: { id: 2 }, // Different mechanic
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.update(1, {}, mockUser),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should allow JefeMantenimiento to update any task", async () => {
      const mockUser = {
        id: 3,
        rol: RolUsuario.JefeMantenimiento,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.EnProgreso,
        },
        mecanico_asignado: { id: 2 },
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);
      mockTareaRepo.save.mockResolvedValue(mockTarea);

      await expect(
        service.update(1, {}, mockUser),
      ).resolves.not.toThrow();
    });
  });

  describe("markAsCompleted", () => {
    it("should mark task as completed", async () => {
      const dto: MarkCompletedDto = {
        observaciones_finales: "Trabajo completado exitosamente",
      };

      const mockUser = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.EnProgreso,
        },
        mecanico_asignado: { id: 2 },
        observaciones: "Observación inicial",
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);
      mockTareaRepo.save.mockImplementation((tarea) =>
        Promise.resolve(tarea),
      );

      const result = await service.markAsCompleted(1, dto, mockUser);

      expect(result.completada).toBe(true);
      expect(result.observaciones).toContain("FINALIZADO");
      expect(result.observaciones).toContain(dto.observaciones_finales);
    });

    it("should throw NotFoundException if task does not exist", async () => {
      const mockUser = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      mockTareaRepo.findOne.mockResolvedValue(null);

      await expect(
        service.markAsCompleted(999, {}, mockUser),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw BadRequestException if task is already completed", async () => {
      const mockUser = {
        id: 2,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: true,
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.markAsCompleted(1, {}, mockUser),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.markAsCompleted(1, {}, mockUser),
      ).rejects.toThrow("La tarea ya está completada");
    });

    it("should throw ForbiddenException if mechanic tries to complete task not assigned to them", async () => {
      const mockUser = {
        id: 3,
        rol: RolUsuario.Mecanico,
      } as Usuario;

      const mockTarea = {
        id: 1,
        completada: false,
        orden_trabajo: {
          estado: EstadoOrdenTrabajo.EnProgreso,
        },
        mecanico_asignado: { id: 2 },
      } as any;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      await expect(
        service.markAsCompleted(1, {}, mockUser),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.markAsCompleted(1, {}, mockUser),
      ).rejects.toThrow(/Solo el mecánico asignado puede completar esta tarea/);
    });
  });

  describe("findAll", () => {
    it("should return all tasks with relations", async () => {
      const mockTareas = [
        { id: 1, descripcion: "Tarea 1" },
        { id: 2, descripcion: "Tarea 2" },
      ] as Tarea[];

      mockTareaRepo.find.mockResolvedValue(mockTareas);

      const result = await service.findAll();

      expect(result).toEqual(mockTareas);
      expect(mockTareaRepo.find).toHaveBeenCalledWith({
        relations: ["orden_trabajo", "mecanico_asignado"],
      });
    });
  });

  describe("findOne", () => {
    it("should return task by id", async () => {
      const mockTarea = {
        id: 1,
        descripcion: "Tarea 1",
      } as Tarea;

      mockTareaRepo.findOne.mockResolvedValue(mockTarea);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTarea);
    });

    it("should return null if task not found", async () => {
      mockTareaRepo.findOne.mockResolvedValue(null);

      const result = await service.findOne(999);

      expect(result).toBeNull();
    });
  });
});
