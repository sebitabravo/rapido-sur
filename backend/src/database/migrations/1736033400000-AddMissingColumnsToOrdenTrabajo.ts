import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to add missing columns to ordenes_trabajo table
 *
 * The entity OrdenTrabajo has these columns that weren't in the initial migration:
 * - prioridad (enum: BAJA, MEDIA, ALTA)
 * - fecha_inicio (timestamp, nullable)
 * - costo_estimado (decimal 10,2, nullable)
 * - costo_real (decimal 10,2, nullable)
 */
export class AddMissingColumnsToOrdenTrabajo1736033400000 implements MigrationInterface {
  name = 'AddMissingColumnsToOrdenTrabajo1736033400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the prioridad_orden_trabajo enum type
    await queryRunner.query(`
      CREATE TYPE prioridad_orden_trabajo AS ENUM ('BAJA', 'MEDIA', 'ALTA');
    `);

    // Add prioridad column with default value MEDIA
    await queryRunner.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN prioridad prioridad_orden_trabajo NOT NULL DEFAULT 'MEDIA';
    `);

    // Add fecha_inicio column (nullable timestamp for when work starts)
    await queryRunner.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN fecha_inicio TIMESTAMP;
    `);

    // Add costo_estimado column (nullable decimal for estimated cost)
    await queryRunner.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN costo_estimado DECIMAL(10, 2);
    `);

    // Add costo_real column (nullable decimal for actual cost)
    await queryRunner.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN costo_real DECIMAL(10, 2);
    `);

    // Create index on prioridad for filtering
    await queryRunner.query(`
      CREATE INDEX idx_orden_trabajo_prioridad ON ordenes_trabajo(prioridad);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index first
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orden_trabajo_prioridad;`);

    // Drop columns
    await queryRunner.query(`ALTER TABLE ordenes_trabajo DROP COLUMN IF EXISTS costo_real;`);
    await queryRunner.query(`ALTER TABLE ordenes_trabajo DROP COLUMN IF EXISTS costo_estimado;`);
    await queryRunner.query(`ALTER TABLE ordenes_trabajo DROP COLUMN IF EXISTS fecha_inicio;`);
    await queryRunner.query(`ALTER TABLE ordenes_trabajo DROP COLUMN IF EXISTS prioridad;`);

    // Drop the enum type
    await queryRunner.query(`DROP TYPE IF EXISTS prioridad_orden_trabajo;`);
  }
}
