import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to fix estado_vehiculo enum mismatch
 *
 * Problem: The TypeScript enum uses 'Activo' and 'Inactivo'
 * but the database enum was created with 'Disponible', 'EnMantenimiento', 'FueraDeServicio'
 *
 * This migration updates the database enum to match the TypeScript enum
 */
export class FixEstadoVehiculoEnum1736033300000 implements MigrationInterface {
  name = 'FixEstadoVehiculoEnum1736033300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Rename the old enum type
    await queryRunner.query(`ALTER TYPE estado_vehiculo RENAME TO estado_vehiculo_old`);

    // Step 2: Create the new enum type with correct values
    await queryRunner.query(`CREATE TYPE estado_vehiculo AS ENUM ('Activo', 'Inactivo')`);

    // Step 3: Update the column to use the new enum type
    // First, we need to convert the column to text, then to the new enum
    // Map old values to new values: Disponible -> Activo, EnMantenimiento -> Activo, FueraDeServicio -> Inactivo
    await queryRunner.query(`
      ALTER TABLE vehiculos
      ALTER COLUMN estado TYPE estado_vehiculo
      USING (
        CASE estado::text
          WHEN 'Disponible' THEN 'Activo'
          WHEN 'EnMantenimiento' THEN 'Activo'
          WHEN 'FueraDeServicio' THEN 'Inactivo'
          ELSE 'Activo'
        END
      )::estado_vehiculo
    `);

    // Step 4: Set the default value
    await queryRunner.query(`ALTER TABLE vehiculos ALTER COLUMN estado SET DEFAULT 'Activo'`);

    // Step 5: Drop the old enum type
    await queryRunner.query(`DROP TYPE estado_vehiculo_old`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Rename the current enum type
    await queryRunner.query(`ALTER TYPE estado_vehiculo RENAME TO estado_vehiculo_new`);

    // Step 2: Recreate the old enum type
    await queryRunner.query(`CREATE TYPE estado_vehiculo AS ENUM ('Disponible', 'EnMantenimiento', 'FueraDeServicio')`);

    // Step 3: Convert back the column
    // Map: Activo -> Disponible, Inactivo -> FueraDeServicio
    await queryRunner.query(`
      ALTER TABLE vehiculos
      ALTER COLUMN estado TYPE estado_vehiculo
      USING (
        CASE estado::text
          WHEN 'Activo' THEN 'Disponible'
          WHEN 'Inactivo' THEN 'FueraDeServicio'
          ELSE 'Disponible'
        END
      )::estado_vehiculo
    `);

    // Step 4: Set the default value
    await queryRunner.query(`ALTER TABLE vehiculos ALTER COLUMN estado SET DEFAULT 'Disponible'`);

    // Step 5: Drop the new enum type
    await queryRunner.query(`DROP TYPE estado_vehiculo_new`);
  }
}
