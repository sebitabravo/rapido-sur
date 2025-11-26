import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix Alertas and Planes Preventivos Columns Migration
 *
 * This migration fixes the schema mismatch between TypeORM entities and database:
 *
 * For alertas table:
 * - Rename 'tipo' column to 'tipo_alerta'
 * - Rename 'leida' column to 'email_enviado'
 * - Add 'fecha_generacion' column
 * - Update tipo_alerta enum to include 'Fecha' instead of 'Tiempo'
 *
 * For planes_preventivos table:
 * - Add 'tipo_mantenimiento' column
 * - Rename 'proximo_mantenimiento_km' to 'proximo_kilometraje'
 * - Rename 'proximo_mantenimiento_fecha' to 'proxima_fecha'
 */
export class FixAlertasAndPlanesPreventivosColumns1736033500000 implements MigrationInterface {
  name = 'FixAlertasAndPlanesPreventivosColumns1736033500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Fix alertas table
    // 1. Rename 'tipo' column to 'tipo_alerta'
    await queryRunner.query(`
      ALTER TABLE alertas RENAME COLUMN tipo TO tipo_alerta;
    `);

    // 2. Rename 'leida' column to 'email_enviado'
    await queryRunner.query(`
      ALTER TABLE alertas RENAME COLUMN leida TO email_enviado;
    `);

    // 3. Add 'fecha_generacion' column
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN fecha_generacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);

    // 4. Update tipo_alerta enum - drop default first, then alter enum, then set default back
    // First rename the existing enum
    await queryRunner.query(`
      ALTER TYPE tipo_alerta RENAME TO tipo_alerta_old;
    `);

    // Create new enum with correct values
    await queryRunner.query(`
      CREATE TYPE tipo_alerta AS ENUM ('Kilometraje', 'Fecha');
    `);

    // Update column to use new enum (converting 'Tiempo' to 'Fecha')
    await queryRunner.query(`
      ALTER TABLE alertas
      ALTER COLUMN tipo_alerta TYPE tipo_alerta
      USING (
        CASE tipo_alerta::text
          WHEN 'Tiempo' THEN 'Fecha'::tipo_alerta
          ELSE tipo_alerta::text::tipo_alerta
        END
      );
    `);

    // Drop old enum
    await queryRunner.query(`
      DROP TYPE tipo_alerta_old;
    `);

    // Fix planes_preventivos table
    // 1. Add 'tipo_mantenimiento' column
    await queryRunner.query(`
      ALTER TABLE planes_preventivos ADD COLUMN tipo_mantenimiento VARCHAR(100) NOT NULL DEFAULT 'Mantenimiento General';
    `);

    // 2. Rename 'proximo_mantenimiento_km' to 'proximo_kilometraje'
    await queryRunner.query(`
      ALTER TABLE planes_preventivos RENAME COLUMN proximo_mantenimiento_km TO proximo_kilometraje;
    `);

    // 3. Rename 'proximo_mantenimiento_fecha' to 'proxima_fecha'
    await queryRunner.query(`
      ALTER TABLE planes_preventivos RENAME COLUMN proximo_mantenimiento_fecha TO proxima_fecha;
    `);

    // Change proximo_kilometraje from DECIMAL to INT as entity expects
    await queryRunner.query(`
      ALTER TABLE planes_preventivos ALTER COLUMN proximo_kilometraje TYPE INTEGER USING proximo_kilometraje::INTEGER;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert planes_preventivos changes
    // 1. Change proximo_kilometraje back to DECIMAL
    await queryRunner.query(`
      ALTER TABLE planes_preventivos ALTER COLUMN proximo_kilometraje TYPE DECIMAL(10, 2);
    `);

    // 2. Rename 'proxima_fecha' back to 'proximo_mantenimiento_fecha'
    await queryRunner.query(`
      ALTER TABLE planes_preventivos RENAME COLUMN proxima_fecha TO proximo_mantenimiento_fecha;
    `);

    // 3. Rename 'proximo_kilometraje' back to 'proximo_mantenimiento_km'
    await queryRunner.query(`
      ALTER TABLE planes_preventivos RENAME COLUMN proximo_kilometraje TO proximo_mantenimiento_km;
    `);

    // 4. Remove 'tipo_mantenimiento' column
    await queryRunner.query(`
      ALTER TABLE planes_preventivos DROP COLUMN tipo_mantenimiento;
    `);

    // Revert alertas changes
    // 1. Revert enum changes
    await queryRunner.query(`
      ALTER TYPE tipo_alerta RENAME TO tipo_alerta_old;
    `);

    await queryRunner.query(`
      CREATE TYPE tipo_alerta AS ENUM ('Kilometraje', 'Tiempo');
    `);

    await queryRunner.query(`
      ALTER TABLE alertas
      ALTER COLUMN tipo_alerta TYPE tipo_alerta
      USING (
        CASE tipo_alerta::text
          WHEN 'Fecha' THEN 'Tiempo'::tipo_alerta
          ELSE tipo_alerta::text::tipo_alerta
        END
      );
    `);

    await queryRunner.query(`
      DROP TYPE tipo_alerta_old;
    `);

    // 2. Remove 'fecha_generacion' column
    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN fecha_generacion;
    `);

    // 3. Rename 'email_enviado' back to 'leida'
    await queryRunner.query(`
      ALTER TABLE alertas RENAME COLUMN email_enviado TO leida;
    `);

    // 4. Rename 'tipo_alerta' back to 'tipo'
    await queryRunner.query(`
      ALTER TABLE alertas RENAME COLUMN tipo_alerta TO tipo;
    `);
  }
}
