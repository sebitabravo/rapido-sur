import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial Schema Migration
 *
 * This migration creates all the tables for the Rápido Sur maintenance management system
 * including:
 * - Users (usuarios) with RBAC roles
 * - Vehicles (vehiculos) with maintenance history
 * - Work Orders (ordenes_trabajo) - system core
 * - Tasks (tareas) within work orders
 * - Parts (repuestos) catalog
 * - Part Details (detalles_repuestos) - many-to-many relationship
 * - Preventive Plans (planes_preventivos)
 * - Alerts (alertas) for preventive maintenance
 *
 * All tables include:
 * - created_at and updated_at timestamps for auditing
 * - deleted_at timestamp for soft deletes (except intermediate tables)
 * - ON DELETE RESTRICT on all foreign keys to prevent accidental deletions
 */
export class InitialSchema1736033200000 implements MigrationInterface {
  name = 'InitialSchema1736033200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create custom types (enums)
    await queryRunner.query(`
      CREATE TYPE rol_usuario AS ENUM ('Administrador', 'JefeMantenimiento', 'Mecanico');
    `);

    await queryRunner.query(`
      CREATE TYPE estado_vehiculo AS ENUM ('Disponible', 'EnMantenimiento', 'FueraDeServicio');
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_orden_trabajo AS ENUM ('Preventivo', 'Correctivo');
    `);

    await queryRunner.query(`
      CREATE TYPE estado_orden_trabajo AS ENUM ('Pendiente', 'Asignada', 'EnProgreso', 'Finalizada');
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_intervalo AS ENUM ('KM', 'Tiempo');
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_alerta AS ENUM ('Kilometraje', 'Tiempo');
    `);

    // Create usuarios table
    await queryRunner.query(`
      CREATE TABLE usuarios (
        id SERIAL PRIMARY KEY,
        nombre_completo VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        rol rol_usuario NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // Create index on email for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_usuarios_email ON usuarios(email);
    `);

    // Create vehiculos table
    await queryRunner.query(`
      CREATE TABLE vehiculos (
        id SERIAL PRIMARY KEY,
        patente VARCHAR(10) NOT NULL UNIQUE,
        modelo VARCHAR(100) NOT NULL,
        marca VARCHAR(50) NOT NULL,
        anno INTEGER NOT NULL,
        kilometraje_actual DECIMAL(10, 2) NOT NULL DEFAULT 0,
        estado estado_vehiculo NOT NULL DEFAULT 'Disponible',
        ultima_revision DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP
      );
    `);

    // Create index on patente for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_vehiculos_patente ON vehiculos(patente);
    `);

    // Create planes_preventivos table
    await queryRunner.query(`
      CREATE TABLE planes_preventivos (
        id SERIAL PRIMARY KEY,
        vehiculo_id INTEGER NOT NULL,
        tipo_intervalo tipo_intervalo NOT NULL,
        intervalo INTEGER NOT NULL,
        descripcion TEXT NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT true,
        proximo_mantenimiento_km DECIMAL(10, 2),
        proximo_mantenimiento_fecha DATE,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_plan_preventivo_vehiculo
          FOREIGN KEY (vehiculo_id)
          REFERENCES vehiculos(id)
          ON DELETE RESTRICT,
        CONSTRAINT uq_vehiculo_plan UNIQUE (vehiculo_id)
      );
    `);

    // Create ordenes_trabajo table
    await queryRunner.query(`
      CREATE TABLE ordenes_trabajo (
        id SERIAL PRIMARY KEY,
        numero_ot VARCHAR(20) NOT NULL UNIQUE,
        tipo tipo_orden_trabajo NOT NULL,
        descripcion TEXT NOT NULL,
        estado estado_orden_trabajo NOT NULL DEFAULT 'Pendiente',
        fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        fecha_cierre TIMESTAMP,
        costo_total DECIMAL(10, 2) NOT NULL DEFAULT 0,
        observaciones TEXT,
        vehiculo_id INTEGER NOT NULL,
        mecanico_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT fk_orden_trabajo_vehiculo
          FOREIGN KEY (vehiculo_id)
          REFERENCES vehiculos(id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_orden_trabajo_mecanico
          FOREIGN KEY (mecanico_id)
          REFERENCES usuarios(id)
          ON DELETE RESTRICT
      );
    `);

    // Create indexes for work orders
    await queryRunner.query(`
      CREATE INDEX idx_orden_trabajo_numero ON ordenes_trabajo(numero_ot);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orden_trabajo_vehiculo ON ordenes_trabajo(vehiculo_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orden_trabajo_mecanico ON ordenes_trabajo(mecanico_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_orden_trabajo_estado ON ordenes_trabajo(estado);
    `);

    // Create tareas table
    await queryRunner.query(`
      CREATE TABLE tareas (
        id SERIAL PRIMARY KEY,
        descripcion TEXT NOT NULL,
        completada BOOLEAN NOT NULL DEFAULT false,
        fecha_vencimiento DATE,
        horas_trabajadas DECIMAL(5, 2),
        observaciones TEXT,
        orden_trabajo_id INTEGER NOT NULL,
        mecanico_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_tarea_orden_trabajo
          FOREIGN KEY (orden_trabajo_id)
          REFERENCES ordenes_trabajo(id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_tarea_mecanico
          FOREIGN KEY (mecanico_id)
          REFERENCES usuarios(id)
          ON DELETE RESTRICT
      );
    `);

    // Create index on orden_trabajo_id for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_tarea_orden_trabajo ON tareas(orden_trabajo_id);
    `);

    // Create repuestos table
    await queryRunner.query(`
      CREATE TABLE repuestos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        codigo VARCHAR(50) NOT NULL UNIQUE,
        precio_unitario DECIMAL(10, 2) NOT NULL,
        cantidad_stock INTEGER NOT NULL DEFAULT 0,
        descripcion TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP,
        CONSTRAINT chk_repuesto_stock_positive CHECK (cantidad_stock >= 0),
        CONSTRAINT chk_repuesto_precio_positive CHECK (precio_unitario >= 0)
      );
    `);

    // Create index on codigo for faster lookups
    await queryRunner.query(`
      CREATE INDEX idx_repuesto_codigo ON repuestos(codigo);
    `);

    // Create detalles_repuestos table (many-to-many between tareas and repuestos)
    await queryRunner.query(`
      CREATE TABLE detalles_repuestos (
        id SERIAL PRIMARY KEY,
        tarea_id INTEGER NOT NULL,
        repuesto_id INTEGER NOT NULL,
        cantidad_usada INTEGER NOT NULL,
        precio_unitario_momento DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_detalle_repuesto_tarea
          FOREIGN KEY (tarea_id)
          REFERENCES tareas(id)
          ON DELETE RESTRICT,
        CONSTRAINT fk_detalle_repuesto_repuesto
          FOREIGN KEY (repuesto_id)
          REFERENCES repuestos(id)
          ON DELETE RESTRICT,
        CONSTRAINT chk_cantidad_usada_positive CHECK (cantidad_usada > 0)
      );
    `);

    // Create indexes for part details
    await queryRunner.query(`
      CREATE INDEX idx_detalle_repuesto_tarea ON detalles_repuestos(tarea_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_detalle_repuesto_repuesto ON detalles_repuestos(repuesto_id);
    `);

    // Create alertas table
    await queryRunner.query(`
      CREATE TABLE alertas (
        id SERIAL PRIMARY KEY,
        vehiculo_id INTEGER NOT NULL,
        tipo tipo_alerta NOT NULL,
        mensaje TEXT NOT NULL,
        leida BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_alerta_vehiculo
          FOREIGN KEY (vehiculo_id)
          REFERENCES vehiculos(id)
          ON DELETE RESTRICT
      );
    `);

    // Create indexes for alerts
    await queryRunner.query(`
      CREATE INDEX idx_alerta_vehiculo ON alertas(vehiculo_id);
    `);

    await queryRunner.query(`
      CREATE INDEX idx_alerta_leida ON alertas(leida);
    `);

    // Create trigger for updating updated_at timestamp
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Apply triggers to all tables
    const tables = [
      'usuarios',
      'vehiculos',
      'planes_preventivos',
      'ordenes_trabajo',
      'tareas',
      'repuestos',
      'detalles_repuestos',
      'alertas',
    ];

    for (const table of tables) {
      await queryRunner.query(`
        CREATE TRIGGER update_${table}_updated_at
        BEFORE UPDATE ON ${table}
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop triggers first
    const tables = [
      'usuarios',
      'vehiculos',
      'planes_preventivos',
      'ordenes_trabajo',
      'tareas',
      'repuestos',
      'detalles_repuestos',
      'alertas',
    ];

    for (const table of tables) {
      await queryRunner.query(`DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};`);
    }

    await queryRunner.query(`DROP FUNCTION IF EXISTS update_updated_at_column();`);

    // Drop tables in reverse order (respecting foreign keys)
    await queryRunner.query(`DROP TABLE IF EXISTS alertas CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS detalles_repuestos CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS repuestos CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS tareas CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS ordenes_trabajo CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS planes_preventivos CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS vehiculos CASCADE;`);
    await queryRunner.query(`DROP TABLE IF EXISTS usuarios CASCADE;`);

    // Drop custom types
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_alerta;`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_intervalo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_orden_trabajo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS tipo_orden_trabajo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS estado_vehiculo;`);
    await queryRunner.query(`DROP TYPE IF EXISTS rol_usuario;`);
  }
}
