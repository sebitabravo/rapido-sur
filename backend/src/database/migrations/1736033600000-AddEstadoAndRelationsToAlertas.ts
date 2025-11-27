import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add Estado and Relations to Alertas Migration
 *
 * This migration adds new fields to alertas table for better alert management:
 * - estado: Current state of the alert (Activa, EnProceso, Atendida, Descartada)
 * - razon_descarte: Reason for dismissing (if dismissed)
 * - fecha_descarte: When dismissed
 * - orden_trabajo_id: FK to work order created from alert
 * - descartada_por_id: FK to user who dismissed
 */
export class AddEstadoAndRelationsToAlertas1736033600000 implements MigrationInterface {
  name = 'AddEstadoAndRelationsToAlertas1736033600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create enum for estado_alerta
    await queryRunner.query(`
      CREATE TYPE estado_alerta AS ENUM ('Activa', 'EnProceso', 'Atendida', 'Descartada');
    `);

    // 2. Add estado column with default 'Activa'
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN estado estado_alerta NOT NULL DEFAULT 'Activa';
    `);

    // 3. Add razon_descarte column (nullable)
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN razon_descarte TEXT;
    `);

    // 4. Add fecha_descarte column (nullable)
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN fecha_descarte TIMESTAMP;
    `);

    // 5. Add orden_trabajo_id column with FK (nullable)
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN orden_trabajo_id INTEGER;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas
      ADD CONSTRAINT fk_alertas_orden_trabajo
      FOREIGN KEY (orden_trabajo_id)
      REFERENCES ordenes_trabajo(id)
      ON DELETE SET NULL;
    `);

    // 6. Add descartada_por_id column with FK (nullable)
    await queryRunner.query(`
      ALTER TABLE alertas ADD COLUMN descartada_por_id INTEGER;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas
      ADD CONSTRAINT fk_alertas_descartada_por
      FOREIGN KEY (descartada_por_id)
      REFERENCES usuarios(id)
      ON DELETE SET NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove columns and constraints in reverse order
    await queryRunner.query(`
      ALTER TABLE alertas DROP CONSTRAINT fk_alertas_descartada_por;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN descartada_por_id;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP CONSTRAINT fk_alertas_orden_trabajo;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN orden_trabajo_id;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN fecha_descarte;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN razon_descarte;
    `);

    await queryRunner.query(`
      ALTER TABLE alertas DROP COLUMN estado;
    `);

    await queryRunner.query(`
      DROP TYPE estado_alerta;
    `);
  }
}
