import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to add avatar column to usuarios table
 * and stock_minimo column to repuestos table
 */
export class AddAvatarAndStockMinimo1765300000000 implements MigrationInterface {
  name = "AddAvatarAndStockMinimo1765300000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add avatar column to usuarios table
    const hasAvatarColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'avatar'
    `);

    if (hasAvatarColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "usuarios" 
        ADD COLUMN "avatar" VARCHAR(255) DEFAULT 'default'
      `);
      console.log("✅ Added 'avatar' column to usuarios table");
    } else {
      console.log("⏭️  Column 'avatar' already exists in usuarios table");
    }

    // Add stock_minimo column to repuestos table
    const hasStockMinimoColumn = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'repuestos' AND column_name = 'stock_minimo'
    `);

    if (hasStockMinimoColumn.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "repuestos" 
        ADD COLUMN "stock_minimo" INTEGER DEFAULT 0
      `);
      console.log("✅ Added 'stock_minimo' column to repuestos table");
    } else {
      console.log("⏭️  Column 'stock_minimo' already exists in repuestos table");
    }

    // Update existing repuestos with stock_minimo as 20% of cantidad_stock
    await queryRunner.query(`
      UPDATE "repuestos" 
      SET stock_minimo = GREATEST(1, ROUND(cantidad_stock * 0.2))
      WHERE stock_minimo = 0 OR stock_minimo IS NULL
    `);
    console.log("✅ Updated stock_minimo values for existing repuestos");
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove avatar column
    await queryRunner.query(`
      ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "avatar"
    `);

    // Remove stock_minimo column
    await queryRunner.query(`
      ALTER TABLE "repuestos" DROP COLUMN IF EXISTS "stock_minimo"
    `);
  }
}
