import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../modules/users/entities/usuario.entity';
import { Vehiculo } from '../modules/vehicles/entities/vehiculo.entity';
import { PlanPreventivo } from '../modules/preventive-plans/entities/plan-preventivo.entity';
import { OrdenTrabajo } from '../modules/work-orders/entities/orden-trabajo.entity';
import { Tarea } from '../modules/tasks/entities/tarea.entity';
import { Repuesto } from '../modules/parts/entities/repuesto.entity';
import { DetalleRepuesto } from '../modules/part-details/entities/detalle-repuesto.entity';
import { Alerta } from '../modules/alerts/entities/alerta.entity';
import {
  RolUsuario,
  EstadoVehiculo,
  TipoIntervalo,
  TipoOrdenTrabajo,
  EstadoOrdenTrabajo,
  TipoAlerta
} from '../common/enums';

/**
 * Database Seeding Service
 * Creates comprehensive sample data for development and testing
 * Includes: Users, Vehicles, Preventive Plans, Work Orders, Tasks, Parts, Alerts
 * Only runs if ENABLE_SEEDING=true in environment variables
 */
@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepo: Repository<Vehiculo>,
    @InjectRepository(PlanPreventivo)
    private readonly planRepo: Repository<PlanPreventivo>,
    @InjectRepository(OrdenTrabajo)
    private readonly ordenRepo: Repository<OrdenTrabajo>,
    @InjectRepository(Tarea)
    private readonly tareaRepo: Repository<Tarea>,
    @InjectRepository(Repuesto)
    private readonly repuestoRepo: Repository<Repuesto>,
    @InjectRepository(DetalleRepuesto)
    private readonly detalleRepo: Repository<DetalleRepuesto>,
    @InjectRepository(Alerta)
    private readonly alertaRepo: Repository<Alerta>,
    private readonly configService: ConfigService,
  ) { }

  async onModuleInit() {
    const enableSeeding = this.configService.get<string>('ENABLE_SEEDING');

    if (enableSeeding === 'true') {
      this.logger.log('🌱 Seeding is enabled, starting comprehensive database seed...');
      await this.seed();
    } else {
      this.logger.log('⏭️  Seeding is disabled (set ENABLE_SEEDING=true to enable)');
    }
  }

  private async seed() {
    try {
      const stats = {
        users: { new: 0, existing: 0 },
        vehicles: { new: 0, existing: 0 },
        plans: { new: 0, existing: 0 },
        parts: { new: 0, existing: 0 },
        orders: { new: 0, existing: 0 },
        tasks: { new: 0, existing: 0 },
        alerts: { new: 0, existing: 0 },
      };

      this.logger.log('👥 Seeding users...');
      const users = await this.seedUsers(stats);

      this.logger.log('🚗 Seeding vehicles...');
      const vehicles = await this.seedVehicles(stats);

      this.logger.log('📋 Seeding preventive plans...');
      await this.seedPreventivePlans(vehicles, stats);

      this.logger.log('🔧 Seeding parts catalog...');
      const parts = await this.seedParts(stats);

      this.logger.log('📝 Seeding work orders...');
      const orders = await this.seedWorkOrders(vehicles, users, stats);

      this.logger.log('✅ Seeding tasks...');
      await this.seedTasks(orders, users, parts, stats);

      this.logger.log('⚠️  Seeding alerts...');
      await this.seedAlerts(vehicles, stats);

      this.logger.log('');
      this.logger.log('✅ Database seeding completed successfully!');
      this.logger.log('📊 Seeding summary:');
      this.logger.log(`   👥 Users: ${stats.users.new} new, ${stats.users.existing} existing`);
      this.logger.log(`   🚗 Vehicles: ${stats.vehicles.new} new, ${stats.vehicles.existing} existing`);
      this.logger.log(`   📋 Preventive Plans: ${stats.plans.new} new, ${stats.plans.existing} existing`);
      this.logger.log(`   🔧 Parts: ${stats.parts.new} new, ${stats.parts.existing} existing`);
      this.logger.log(`   📝 Work Orders: ${stats.orders.new} new, ${stats.orders.existing} existing`);
      this.logger.log(`   ✅ Tasks: ${stats.tasks.new} new, ${stats.tasks.existing} existing`);
      this.logger.log(`   ⚠️  Alerts: ${stats.alerts.new} new, ${stats.alerts.existing} existing`);

      if (stats.users.new > 0) {
        this.logger.warn('⚠️  IMPORTANT: Change all default passwords immediately after first login');
      }
    } catch (error) {
      this.logger.error('❌ Error seeding database:', error.message);
      this.logger.error(error.stack);
    }
  }

  private async createUser(data: {
    nombre_completo: string;
    email: string;
    password: string;
    rol: RolUsuario;
  }, stats?: any): Promise<Usuario> {
    const exists = await this.usuarioRepo.findOne({
      where: { email: data.email },
    });

    if (exists) {
      if (stats) stats.users.existing++;
      return exists;
    }

    const password_hash = await bcrypt.hash(data.password, 12);
    const user = this.usuarioRepo.create({
      nombre_completo: data.nombre_completo,
      email: data.email,
      password_hash,
      rol: data.rol,
      activo: true,
    });

    await this.usuarioRepo.save(user);
    if (stats) stats.users.new++;
    return user;
  }

  private async seedUsers(stats?: any): Promise<Usuario[]> {
    const users: Usuario[] = [];

    // Admin
    users.push(await this.createUser({
      nombre_completo: 'Administrador del Sistema',
      email: 'admin@rapidosur.cl',
      password: 'Admin123!',
      rol: RolUsuario.Administrador,
    }, stats));

    // Maintenance Managers
    users.push(await this.createUser({
      nombre_completo: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@rapidosur.cl',
      password: 'Manager123!',
      rol: RolUsuario.JefeMantenimiento,
    }, stats));

    users.push(await this.createUser({
      nombre_completo: 'María González',
      email: 'maria.gonzalez@rapidosur.cl',
      password: 'Manager123!',
      rol: RolUsuario.JefeMantenimiento,
    }, stats));

    // Mechanics
    users.push(await this.createUser({
      nombre_completo: 'Pedro Muñoz',
      email: 'pedro.munoz@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }, stats));

    users.push(await this.createUser({
      nombre_completo: 'Juan Pérez',
      email: 'juan.perez@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }, stats));

    users.push(await this.createUser({
      nombre_completo: 'Luis Silva',
      email: 'luis.silva@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }, stats));

    users.push(await this.createUser({
      nombre_completo: 'Roberto Torres',
      email: 'roberto.torres@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }, stats));

    return users;
  }

  private async seedVehicles(stats?: any): Promise<Vehiculo[]> {
    const vehiclesData = [
      { patente: 'CJRT19', marca: 'Mercedes-Benz', modelo: 'Sprinter 515', anno: 2020, kilometraje: 85000 },
      { patente: 'FLXP75', marca: 'Mercedes-Benz', modelo: 'OF-1722', anno: 2019, kilometraje: 120000 },
      { patente: 'GZWY34', marca: 'Volkswagen', modelo: 'Crafter', anno: 2021, kilometraje: 45000 },
      { patente: 'HTRB82', marca: 'Iveco', modelo: 'Daily 70C17', anno: 2018, kilometraje: 150000 },
      { patente: 'KLPQ56', marca: 'Mercedes-Benz', modelo: 'Sprinter 415', anno: 2022, kilometraje: 30000 },
      { patente: 'NZXC91', marca: 'Hyundai', modelo: 'County', anno: 2019, kilometraje: 95000 },
      { patente: 'PRTS47', marca: 'Mercedes-Benz', modelo: 'LO-915', anno: 2017, kilometraje: 180000 },
      { patente: 'QWVB23', marca: 'Volkswagen', modelo: 'Delivery 9.170', anno: 2020, kilometraje: 75000 },
      { patente: 'RTYU65', marca: 'Iveco', modelo: 'Tector 170E25', anno: 2021, kilometraje: 55000 },
      { patente: 'SDFG88', marca: 'Mercedes-Benz', modelo: 'Atego 1726', anno: 2018, kilometraje: 135000 },
    ];

    const vehicles: Vehiculo[] = [];

    for (const data of vehiclesData) {
      const exists = await this.vehiculoRepo.findOne({
        where: { patente: data.patente },
      });

      if (!exists) {
        const vehicle = this.vehiculoRepo.create({
          ...data,
          kilometraje_actual: data.kilometraje,
          estado: EstadoVehiculo.Activo,
          ultima_revision: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Random date within last 90 days
        });
        await this.vehiculoRepo.save(vehicle);
        if (stats) stats.vehicles.new++;
        vehicles.push(vehicle);
      } else {
        if (stats) stats.vehicles.existing++;
        vehicles.push(exists);
      }
    }

    return vehicles;
  }

  private async seedPreventivePlans(vehicles: Vehiculo[], stats?: any): Promise<void> {
    for (const vehicle of vehicles) {
      // Skip if plan already exists
      const existingPlan = await this.planRepo.findOne({
        where: { vehiculo: { id: vehicle.id } },
      });

      if (existingPlan) {
        if (stats) stats.plans.existing++;
        continue;
      }

      // Alternate between KM and Time intervals
      const useKm = vehicles.indexOf(vehicle) % 2 === 0;
      const intervalo = useKm ? 10000 : 180;

      const planData: any = {
        vehiculo: vehicle,
        tipo_mantenimiento: useKm ? 'Mantenimiento Preventivo por Kilometraje' : 'Mantenimiento Preventivo por Tiempo',
        tipo_intervalo: useKm ? TipoIntervalo.KM : TipoIntervalo.Tiempo,
        intervalo: intervalo,
        descripcion: useKm
          ? 'Mantenimiento preventivo cada 10,000 km: cambio de aceite, filtros, revisión de frenos'
          : 'Mantenimiento preventivo semestral: inspección general, cambio de fluidos, revisión eléctrica',
        activo: true,
      };

      // CRITICAL: Set proximo_kilometraje or proxima_fecha based on tipo_intervalo
      if (useKm) {
        // For KM plans, calculate next maintenance based on current mileage
        planData.proximo_kilometraje = vehicle.kilometraje_actual + intervalo;
      } else {
        // For Time plans, calculate next maintenance based on ultima_revision
        const proximaFecha = new Date(vehicle.ultima_revision);
        proximaFecha.setDate(proximaFecha.getDate() + intervalo);
        planData.proxima_fecha = proximaFecha;
      }

      const plan = this.planRepo.create(planData);

      await this.planRepo.save(plan);
      if (stats) stats.plans.new++;
    }
  }

  private async seedParts(stats?: any): Promise<Repuesto[]> {
    const partsData = [
      { codigo: 'ACE-15W40', nombre: 'Aceite Motor 15W40', categoria: 'Lubricantes', precio_unitario: 25000, cantidad_stock: 50, stock_minimo: 10, activo: true },
      { codigo: 'FILT-ACE-001', nombre: 'Filtro Aceite', categoria: 'Filtros', precio_unitario: 8500, cantidad_stock: 40, stock_minimo: 8, activo: true },
      { codigo: 'FILT-AIRE-001', nombre: 'Filtro Aire', categoria: 'Filtros', precio_unitario: 12000, cantidad_stock: 35, stock_minimo: 7, activo: true },
      { codigo: 'FILT-COMB-001', nombre: 'Filtro Combustible', categoria: 'Filtros', precio_unitario: 15000, cantidad_stock: 30, stock_minimo: 6, activo: true },
      { codigo: 'PAST-DEL-001', nombre: 'Pastillas Freno Delanteras', categoria: 'Frenos', precio_unitario: 45000, cantidad_stock: 25, stock_minimo: 5, activo: true },
      { codigo: 'PAST-TRA-001', nombre: 'Pastillas Freno Traseras', categoria: 'Frenos', precio_unitario: 38000, cantidad_stock: 20, stock_minimo: 4, activo: true },
      { codigo: 'DISC-FRE-001', nombre: 'Discos Freno', categoria: 'Frenos', precio_unitario: 85000, cantidad_stock: 15, stock_minimo: 3, activo: true },
      { codigo: 'BAT-12V-100AH', nombre: 'Batería 12V 100Ah', categoria: 'Eléctrico', precio_unitario: 95000, cantidad_stock: 10, stock_minimo: 2, activo: true },
      { codigo: 'NEU-215-75-R17', nombre: 'Neumático 215/75 R17.5', categoria: 'Neumáticos', precio_unitario: 120000, cantidad_stock: 20, stock_minimo: 4, activo: true },
      { codigo: 'LIQ-REF-001', nombre: 'Líquido Refrigerante', categoria: 'Lubricantes', precio_unitario: 18000, cantidad_stock: 45, stock_minimo: 9, activo: true },
      { codigo: 'LIQ-FRE-DOT4', nombre: 'Líquido Frenos DOT4', categoria: 'Frenos', precio_unitario: 12000, cantidad_stock: 30, stock_minimo: 6, activo: true },
      { codigo: 'COR-DIST-001', nombre: 'Correa Distribución', categoria: 'Motor', precio_unitario: 55000, cantidad_stock: 12, stock_minimo: 2, activo: true },
      { codigo: 'BUJ-4UN-001', nombre: 'Bujías (juego 4)', categoria: 'Motor', precio_unitario: 28000, cantidad_stock: 18, stock_minimo: 4, activo: true },
      { codigo: 'ALT-001', nombre: 'Alternador', categoria: 'Eléctrico', precio_unitario: 180000, cantidad_stock: 5, stock_minimo: 1, activo: true },
      { codigo: 'MOT-ARR-001', nombre: 'Motor Arranque', categoria: 'Eléctrico', precio_unitario: 150000, cantidad_stock: 4, stock_minimo: 1, activo: true },
    ];

    const parts: Repuesto[] = [];

    for (const data of partsData) {
      const exists = await this.repuestoRepo.findOne({
        where: { nombre: data.nombre },
      });

      if (!exists) {
        const part = this.repuestoRepo.create(data);
        await this.repuestoRepo.save(part);
        if (stats) stats.parts.new++;
        parts.push(part);
      } else {
        if (stats) stats.parts.existing++;
        parts.push(exists);
      }
    }

    return parts;
  }

  private async seedWorkOrders(vehicles: Vehiculo[], users: Usuario[], stats?: any): Promise<OrdenTrabajo[]> {
    const mechanics = users.filter(u => u.rol === RolUsuario.Mecanico);
    const orders: OrdenTrabajo[] = [];

    // Create various work orders in different states
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const mechanic = mechanics[i % mechanics.length];

      // Preventive order (completed)
      const preventiveOtNumber = `OT-2025-${String(i * 3 + 1).padStart(5, '0')}`;
      const existingPreventive = await this.ordenRepo.findOne({
        where: { numero_ot: preventiveOtNumber },
      });

      if (!existingPreventive) {
        const preventiveOrder = this.ordenRepo.create({
          numero_ot: preventiveOtNumber,
          vehiculo: vehicle,
          tipo: TipoOrdenTrabajo.Preventivo,
          estado: EstadoOrdenTrabajo.Finalizada,
          descripcion: 'Mantenimiento preventivo programado',
          fecha_creacion: new Date(Date.now() - (60 - i * 5) * 24 * 60 * 60 * 1000),
          fecha_cierre: new Date(Date.now() - (57 - i * 5) * 24 * 60 * 60 * 1000),
          mecanico: mechanic,
          costo_total: 0, // Will be calculated from tasks
        });
        await this.ordenRepo.save(preventiveOrder);
        if (stats) stats.orders.new++;
        orders.push(preventiveOrder);
      } else {
        if (stats) stats.orders.existing++;
        orders.push(existingPreventive);
      }

      // Corrective order (completed)
      if (i < 7) {
        const correctiveOtNumber = `OT-2025-${String(i * 3 + 2).padStart(5, '0')}`;
        const existingCorrective = await this.ordenRepo.findOne({
          where: { numero_ot: correctiveOtNumber },
        });

        if (!existingCorrective) {
          const correctiveOrder = this.ordenRepo.create({
            numero_ot: correctiveOtNumber,
            vehiculo: vehicle,
            tipo: TipoOrdenTrabajo.Correctivo,
            estado: EstadoOrdenTrabajo.Finalizada,
            descripcion: i % 3 === 0
              ? 'Falla en sistema de frenos - revisión urgente'
              : i % 3 === 1
                ? 'Problema eléctrico - luces intermitentes'
                : 'Fuga de líquido refrigerante',
            fecha_creacion: new Date(Date.now() - (45 - i * 4) * 24 * 60 * 60 * 1000),
            fecha_cierre: new Date(Date.now() - (42 - i * 4) * 24 * 60 * 60 * 1000),
            mecanico: mechanic,
            costo_total: 0,
          });
          await this.ordenRepo.save(correctiveOrder);
          if (stats) stats.orders.new++;
          orders.push(correctiveOrder);
        } else {
          if (stats) stats.orders.existing++;
          orders.push(existingCorrective);
        }
      }

      // In-progress orders
      if (i < 3) {
        const inProgressOtNumber = `OT-2025-${String(i * 3 + 3).padStart(5, '0')}`;
        const existingInProgress = await this.ordenRepo.findOne({
          where: { numero_ot: inProgressOtNumber },
        });

        if (!existingInProgress) {
          const inProgressOrder = this.ordenRepo.create({
            numero_ot: inProgressOtNumber,
            vehiculo: vehicle,
            tipo: i % 2 === 0 ? TipoOrdenTrabajo.Preventivo : TipoOrdenTrabajo.Correctivo,
            estado: EstadoOrdenTrabajo.EnProgreso,
            descripcion: i % 2 === 0
              ? 'Servicio de mantenimiento 10,000 km'
              : 'Revisión de suspensión - ruidos anormales',
            fecha_creacion: new Date(Date.now() - (5 - i) * 24 * 60 * 60 * 1000),
            mecanico: mechanic,
            costo_total: 0,
          });
          await this.ordenRepo.save(inProgressOrder);
          if (stats) stats.orders.new++;
          orders.push(inProgressOrder);
        } else {
          if (stats) stats.orders.existing++;
          orders.push(existingInProgress);
        }
      }

      // Pending orders
      if (i >= 7) {
        const pendingOtNumber = `OT-2025-${String(i * 3 + 3).padStart(5, '0')}`;
        const existingPending = await this.ordenRepo.findOne({
          where: { numero_ot: pendingOtNumber },
        });

        if (!existingPending) {
          const pendingOrder = this.ordenRepo.create({
            numero_ot: pendingOtNumber,
            vehiculo: vehicle,
            tipo: TipoOrdenTrabajo.Correctivo,
            estado: EstadoOrdenTrabajo.Pendiente,
            descripcion: 'Revisión general solicitada por conductor',
            fecha_creacion: new Date(Date.now() - (2 - (i - 7)) * 24 * 60 * 60 * 1000),
            costo_total: 0,
          });
          await this.ordenRepo.save(pendingOrder);
          if (stats) stats.orders.new++;
          orders.push(pendingOrder);
        } else {
          if (stats) stats.orders.existing++;
          orders.push(existingPending);
        }
      }
    }

    return orders;
  }

  private async seedTasks(orders: OrdenTrabajo[], users: Usuario[], parts: Repuesto[], stats?: any): Promise<void> {
    const mechanics = users.filter(u => u.rol === RolUsuario.Mecanico);

    for (const order of orders) {
      // Check if tasks already exist for this order
      const existingTasks = await this.tareaRepo.count({
        where: { orden_trabajo: { id: order.id } },
      });

      if (existingTasks > 0) {
        if (stats) stats.tasks.existing += existingTasks;
        continue;
      }

      const mechanic = order.mecanico || mechanics[0];
      let totalCost = 0;

      // Create tasks based on order type and state
      if (order.tipo === TipoOrdenTrabajo.Preventivo) {
        // Oil change task
        const oilTask = this.tareaRepo.create({
          orden_trabajo: order,
          descripcion: 'Cambio de aceite de motor y filtro',
          completada: order.estado === EstadoOrdenTrabajo.Finalizada,
          fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 7 * 24 * 60 * 60 * 1000),
          mecanico_asignado: mechanic,
          horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 1.5 : 0,
        });
        await this.tareaRepo.save(oilTask);
        if (stats) stats.tasks.new++;
        if (stats) stats.tasks.new++;

        // Add parts to completed tasks
        if (order.estado === EstadoOrdenTrabajo.Finalizada) {
          const aceite = parts.find(p => p.nombre.includes('Aceite'));
          const filtroAceite = parts.find(p => p.nombre.includes('Filtro Aceite'));

          if (aceite) {
            const detalle1 = this.detalleRepo.create({
              tarea: oilTask,
              repuesto: aceite,
              cantidad_usada: 4,
              precio_unitario_momento: aceite.precio_unitario,
            });
            await this.detalleRepo.save(detalle1);
            totalCost += 4 * aceite.precio_unitario;
          }

          if (filtroAceite) {
            const detalle2 = this.detalleRepo.create({
              tarea: oilTask,
              repuesto: filtroAceite,
              cantidad_usada: 1,
              precio_unitario_momento: filtroAceite.precio_unitario,
            });
            await this.detalleRepo.save(detalle2);
            totalCost += filtroAceite.precio_unitario;
          }
        }

        // Air filter task
        const airFilterTask = this.tareaRepo.create({
          orden_trabajo: order,
          descripcion: 'Reemplazo de filtro de aire',
          completada: order.estado === EstadoOrdenTrabajo.Finalizada,
          fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 7 * 24 * 60 * 60 * 1000),
          mecanico_asignado: mechanic,
          horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 0.5 : 0,
        });
        await this.tareaRepo.save(airFilterTask);
        if (stats) stats.tasks.new++;
        if (stats) stats.tasks.new++;

        if (order.estado === EstadoOrdenTrabajo.Finalizada) {
          const filtroAire = parts.find(p => p.nombre.includes('Filtro Aire'));
          if (filtroAire) {
            const detalle = this.detalleRepo.create({
              tarea: airFilterTask,
              repuesto: filtroAire,
              cantidad_usada: 1,
              precio_unitario_momento: filtroAire.precio_unitario,
            });
            await this.detalleRepo.save(detalle);
            totalCost += filtroAire.precio_unitario;
          }
        }

        // Brake inspection
        const brakeTask = this.tareaRepo.create({
          orden_trabajo: order,
          descripcion: 'Inspección de sistema de frenos',
          completada: order.estado === EstadoOrdenTrabajo.Finalizada,
          fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 7 * 24 * 60 * 60 * 1000),
          mecanico_asignado: mechanic,
          horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 1.0 : 0,
        });
        await this.tareaRepo.save(brakeTask);
        if (stats) stats.tasks.new++;

      } else {
        // Corrective tasks
        if (order.descripcion.includes('frenos')) {
          const brakeTask = this.tareaRepo.create({
            orden_trabajo: order,
            descripcion: 'Reemplazo de pastillas de freno',
            completada: order.estado === EstadoOrdenTrabajo.Finalizada,
            fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 3 * 24 * 60 * 60 * 1000),
            mecanico_asignado: mechanic,
            horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 2.5 : 0,
          });
          await this.tareaRepo.save(brakeTask);
          if (stats) stats.tasks.new++;

          if (order.estado === EstadoOrdenTrabajo.Finalizada) {
            const pastillas = parts.find(p => p.nombre.includes('Pastillas Freno Delanteras'));
            if (pastillas) {
              const detalle = this.detalleRepo.create({
                tarea: brakeTask,
                repuesto: pastillas,
                cantidad_usada: 1,
                precio_unitario_momento: pastillas.precio_unitario,
              });
              await this.detalleRepo.save(detalle);
              totalCost += pastillas.precio_unitario;
            }
          }
        } else if (order.descripcion.includes('eléctrico')) {
          const electricTask = this.tareaRepo.create({
            orden_trabajo: order,
            descripcion: 'Diagnóstico y reparación sistema eléctrico',
            completada: order.estado === EstadoOrdenTrabajo.Finalizada,
            fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 5 * 24 * 60 * 60 * 1000),
            mecanico_asignado: mechanic,
            horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 3.0 : 0,
          });
          await this.tareaRepo.save(electricTask);
          if (stats) stats.tasks.new++;

          if (order.estado === EstadoOrdenTrabajo.Finalizada) {
            const bateria = parts.find(p => p.nombre.includes('Batería'));
            if (bateria) {
              const detalle = this.detalleRepo.create({
                tarea: electricTask,
                repuesto: bateria,
                cantidad_usada: 1,
                precio_unitario_momento: bateria.precio_unitario,
              });
              await this.detalleRepo.save(detalle);
              totalCost += bateria.precio_unitario;
            }
          }
        } else {
          const generalTask = this.tareaRepo.create({
            orden_trabajo: order,
            descripcion: 'Reparación de fuga en sistema de refrigeración',
            completada: order.estado === EstadoOrdenTrabajo.Finalizada,
            fecha_vencimiento: new Date(order.fecha_creacion.getTime() + 4 * 24 * 60 * 60 * 1000),
            mecanico_asignado: mechanic,
            horas_trabajadas: order.estado === EstadoOrdenTrabajo.Finalizada ? 2.0 : 0,
          });
          await this.tareaRepo.save(generalTask);
          if (stats) stats.tasks.new++;

          if (order.estado === EstadoOrdenTrabajo.Finalizada) {
            const refrigerante = parts.find(p => p.nombre.includes('Refrigerante'));
            if (refrigerante) {
              const detalle = this.detalleRepo.create({
                tarea: generalTask,
                repuesto: refrigerante,
                cantidad_usada: 2,
                precio_unitario_momento: refrigerante.precio_unitario,
              });
              await this.detalleRepo.save(detalle);
              totalCost += 2 * refrigerante.precio_unitario;
            }
          }
        }
      }

      // Update order total cost
      if (totalCost > 0) {
        order.costo_total = totalCost;
        await this.ordenRepo.save(order);
      }
    }
  }

  private async seedAlerts(vehicles: Vehiculo[], stats?: any): Promise<void> {
    // Create some sample alerts for vehicles that need maintenance
    for (let i = 0; i < 4; i++) {
      const vehicle = vehicles[i];

      // Check if alert already exists for this vehicle
      const existingAlert = await this.alertaRepo.findOne({
        where: { vehiculo: { id: vehicle.id } },
      });

      if (existingAlert) {
        if (stats) stats.alerts.existing++;
        continue;
      }

      const alert = this.alertaRepo.create({
        vehiculo: vehicle,
        tipo_alerta: i % 2 === 0 ? TipoAlerta.Kilometraje : TipoAlerta.Fecha,
        mensaje: i % 2 === 0
          ? `Vehículo ${vehicle.patente} próximo a mantenimiento preventivo (9,500 km desde última revisión)`
          : `Vehículo ${vehicle.patente} próximo a mantenimiento preventivo (5 meses desde última revisión)`,
        fecha_generacion: new Date(),
        email_enviado: i < 2, // First 2 alerts have email sent
      });

      await this.alertaRepo.save(alert);
      if (stats) stats.alerts.new++;
    }
  }
}
