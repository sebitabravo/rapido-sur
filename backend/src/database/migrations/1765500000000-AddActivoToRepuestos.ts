import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to add 'activo' column to repuestos table
 * This column was added to the entity but missing from database schema
 */
export class AddActivoToRepuestos1765500000000 implements MigrationInterface {
    name = "AddActivoToRepuestos1765500000000";

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if 'activo' column already exists
        const hasActivoColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repuestos' AND column_name = 'activo'
    `);

        if (hasActivoColumn.length === 0) {
            await queryRunner.query(`
        ALTER TABLE "repuestos" 
        ADD COLUMN "activo" BOOLEAN NOT NULL DEFAULT true
      `);
            console.log("✅ Added 'activo' column to repuestos table");
        } else {
            console.log("⏭️  Column 'activo' already exists in repuestos table");
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE "repuestos" DROP COLUMN IF EXISTS "activo"
    `);
    }
}
