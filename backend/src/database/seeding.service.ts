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
  ) {}

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
      this.logger.log('👥 Creating users...');
      const users = await this.seedUsers();
      
      this.logger.log('🚗 Creating vehicles...');
      const vehicles = await this.seedVehicles();
      
      this.logger.log('📋 Creating preventive plans...');
      await this.seedPreventivePlans(vehicles);
      
      this.logger.log('🔧 Creating parts catalog...');
      const parts = await this.seedParts();
      
      this.logger.log('📝 Creating work orders...');
      const orders = await this.seedWorkOrders(vehicles, users);
      
      this.logger.log('✅ Creating tasks...');
      await this.seedTasks(orders, users, parts);
      
      this.logger.log('⚠️  Creating alerts...');
      await this.seedAlerts(vehicles);

      this.logger.log('✅ Comprehensive database seeding completed successfully!');
      this.logger.warn('⚠️  IMPORTANT: Change all default passwords immediately after first login');
      this.logger.log('📊 Seeded data summary:');
      this.logger.log(`   👥 Users: ${users.length}`);
      this.logger.log(`   🚗 Vehicles: ${vehicles.length}`);
      this.logger.log(`   🔧 Parts: ${parts.length}`);
      this.logger.log(`   📝 Work Orders: ${orders.length}`);
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
  }): Promise<Usuario> {
    const exists = await this.usuarioRepo.findOne({
      where: { email: data.email },
    });

    if (exists) {
      this.logger.log(`⚠️  User already exists: ${data.email}, skipping...`);
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
    this.logger.log(`✅ ${data.rol} user created: ${data.email}`);
    return user;
  }

  private async seedUsers(): Promise<Usuario[]> {
    const users: Usuario[] = [];

    // Admin
    users.push(await this.createUser({
      nombre_completo: 'Administrador del Sistema',
      email: 'admin@rapidosur.cl',
      password: 'Admin123!',
      rol: RolUsuario.Administrador,
    }));

    // Maintenance Managers
    users.push(await this.createUser({
      nombre_completo: 'Carlos Rodríguez',
      email: 'carlos.rodriguez@rapidosur.cl',
      password: 'Manager123!',
      rol: RolUsuario.JefeMantenimiento,
    }));

    users.push(await this.createUser({
      nombre_completo: 'María González',
      email: 'maria.gonzalez@rapidosur.cl',
      password: 'Manager123!',
      rol: RolUsuario.JefeMantenimiento,
    }));

    // Mechanics
    users.push(await this.createUser({
      nombre_completo: 'Pedro Muñoz',
      email: 'pedro.munoz@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }));

    users.push(await this.createUser({
      nombre_completo: 'Juan Pérez',
      email: 'juan.perez@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }));

    users.push(await this.createUser({
      nombre_completo: 'Luis Silva',
      email: 'luis.silva@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }));

    users.push(await this.createUser({
      nombre_completo: 'Roberto Torres',
      email: 'roberto.torres@rapidosur.cl',
      password: 'Mechanic123!',
      rol: RolUsuario.Mecanico,
    }));

    return users;
  }

  private async seedVehicles(): Promise<Vehiculo[]> {
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
        vehicles.push(vehicle);
      } else {
        vehicles.push(exists);
      }
    }

    return vehicles;
  }

  private async seedPreventivePlans(vehicles: Vehiculo[]): Promise<void> {
    for (const vehicle of vehicles) {
      // Skip if plan already exists
      const existingPlan = await this.planRepo.findOne({
        where: { vehiculo: { id: vehicle.id } },
      });

      if (existingPlan) continue;

      // Alternate between KM and Time intervals
      const useKm = vehicles.indexOf(vehicle) % 2 === 0;

      const plan = this.planRepo.create({
        vehiculo: vehicle,
        tipo_mantenimiento: useKm ? 'Mantenimiento Preventivo por Kilometraje' : 'Mantenimiento Preventivo por Tiempo',
        tipo_intervalo: useKm ? TipoIntervalo.KM : TipoIntervalo.Tiempo,
        intervalo: useKm ? 10000 : 180, // 10,000 km or 180 days (6 months)
        descripcion: useKm 
          ? 'Mantenimiento preventivo cada 10,000 km: cambio de aceite, filtros, revisión de frenos'
          : 'Mantenimiento preventivo semestral: inspección general, cambio de fluidos, revisión eléctrica',
        activo: true,
      });

      await this.planRepo.save(plan);
    }
  }

  private async seedParts(): Promise<Repuesto[]> {
    const partsData = [
      { codigo: 'ACE-15W40', nombre: 'Aceite Motor 15W40', precio_unitario: 25000, cantidad_stock: 50 },
      { codigo: 'FILT-ACE-001', nombre: 'Filtro Aceite', precio_unitario: 8500, cantidad_stock: 40 },
      { codigo: 'FILT-AIRE-001', nombre: 'Filtro Aire', precio_unitario: 12000, cantidad_stock: 35 },
      { codigo: 'FILT-COMB-001', nombre: 'Filtro Combustible', precio_unitario: 15000, cantidad_stock: 30 },
      { codigo: 'PAST-DEL-001', nombre: 'Pastillas Freno Delanteras', precio_unitario: 45000, cantidad_stock: 25 },
      { codigo: 'PAST-TRA-001', nombre: 'Pastillas Freno Traseras', precio_unitario: 38000, cantidad_stock: 20 },
      { codigo: 'DISC-FRE-001', nombre: 'Discos Freno', precio_unitario: 85000, cantidad_stock: 15 },
      { codigo: 'BAT-12V-100AH', nombre: 'Batería 12V 100Ah', precio_unitario: 95000, cantidad_stock: 10 },
      { codigo: 'NEU-215-75-R17', nombre: 'Neumático 215/75 R17.5', precio_unitario: 120000, cantidad_stock: 20 },
      { codigo: 'LIQ-REF-001', nombre: 'Líquido Refrigerante', precio_unitario: 18000, cantidad_stock: 45 },
      { codigo: 'LIQ-FRE-DOT4', nombre: 'Líquido Frenos DOT4', precio_unitario: 12000, cantidad_stock: 30 },
      { codigo: 'COR-DIST-001', nombre: 'Correa Distribución', precio_unitario: 55000, cantidad_stock: 12 },
      { codigo: 'BUJ-4UN-001', nombre: 'Bujías (juego 4)', precio_unitario: 28000, cantidad_stock: 18 },
      { codigo: 'ALT-001', nombre: 'Alternador', precio_unitario: 180000, cantidad_stock: 5 },
      { codigo: 'MOT-ARR-001', nombre: 'Motor Arranque', precio_unitario: 150000, cantidad_stock: 4 },
    ];

    const parts: Repuesto[] = [];

    for (const data of partsData) {
      const exists = await this.repuestoRepo.findOne({
        where: { nombre: data.nombre },
      });

      if (!exists) {
        const part = this.repuestoRepo.create(data);
        await this.repuestoRepo.save(part);
        parts.push(part);
      } else {
        parts.push(exists);
      }
    }

    return parts;
  }

  private async seedWorkOrders(vehicles: Vehiculo[], users: Usuario[]): Promise<OrdenTrabajo[]> {
    const mechanics = users.filter(u => u.rol === RolUsuario.Mecanico);
    const orders: OrdenTrabajo[] = [];

    // Create various work orders in different states
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const mechanic = mechanics[i % mechanics.length];

      // Preventive order (completed)
      const preventiveOrder = this.ordenRepo.create({
        numero_ot: `OT-2025-${String(i * 3 + 1).padStart(5, '0')}`,
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
      orders.push(preventiveOrder);

      // Corrective order (completed)
      if (i < 7) {
        const correctiveOrder = this.ordenRepo.create({
          numero_ot: `OT-2025-${String(i * 3 + 2).padStart(5, '0')}`,
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
        orders.push(correctiveOrder);
      }

      // In-progress orders
      if (i < 3) {
        const inProgressOrder = this.ordenRepo.create({
          numero_ot: `OT-2025-${String(i * 3 + 3).padStart(5, '0')}`,
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
        orders.push(inProgressOrder);
      }

      // Pending orders
      if (i >= 7) {
        const pendingOrder = this.ordenRepo.create({
          numero_ot: `OT-2025-${String(i * 3 + 3).padStart(5, '0')}`,
          vehiculo: vehicle,
          tipo: TipoOrdenTrabajo.Correctivo,
          estado: EstadoOrdenTrabajo.Pendiente,
          descripcion: 'Revisión general solicitada por conductor',
          fecha_creacion: new Date(Date.now() - (2 - (i - 7)) * 24 * 60 * 60 * 1000),
          costo_total: 0,
        });
        await this.ordenRepo.save(pendingOrder);
        orders.push(pendingOrder);
      }
    }

    return orders;
  }

  private async seedTasks(orders: OrdenTrabajo[], users: Usuario[], parts: Repuesto[]): Promise<void> {
    const mechanics = users.filter(u => u.rol === RolUsuario.Mecanico);

    for (const order of orders) {
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

  private async seedAlerts(vehicles: Vehiculo[]): Promise<void> {
    // Create some sample alerts for vehicles that need maintenance
    for (let i = 0; i < 4; i++) {
      const vehicle = vehicles[i];
      
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
    }
  }
}
