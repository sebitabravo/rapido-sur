import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Migration to add notification preferences columns to usuarios table
 */
export class AddNotificationPreferences1765400000000 implements MigrationInterface {
  name = "AddNotificationPreferences1765400000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add notif_email column
    const hasNotifEmail = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'notif_email'
    `);

    if (hasNotifEmail.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "usuarios" 
        ADD COLUMN "notif_email" BOOLEAN DEFAULT true
      `);
      console.log("✅ Added 'notif_email' column to usuarios table");
    } else {
      console.log("⏭️  Column 'notif_email' already exists");
    }

    // Add notif_mantenimiento column
    const hasNotifMantenimiento = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'notif_mantenimiento'
    `);

    if (hasNotifMantenimiento.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "usuarios" 
        ADD COLUMN "notif_mantenimiento" BOOLEAN DEFAULT true
      `);
      console.log("✅ Added 'notif_mantenimiento' column to usuarios table");
    } else {
      console.log("⏭️  Column 'notif_mantenimiento' already exists");
    }

    // Add notif_reportes_semanales column
    const hasNotifReportes = await queryRunner.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'usuarios' AND column_name = 'notif_reportes_semanales'
    `);

    if (hasNotifReportes.length === 0) {
      await queryRunner.query(`
        ALTER TABLE "usuarios" 
        ADD COLUMN "notif_reportes_semanales" BOOLEAN DEFAULT false
      `);
      console.log("✅ Added 'notif_reportes_semanales' column to usuarios table");
    } else {
      console.log("⏭️  Column 'notif_reportes_semanales' already exists");
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "notif_email"
    `);
    await queryRunner.query(`
      ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "notif_mantenimiento"
    `);
    await queryRunner.query(`
      ALTER TABLE "usuarios" DROP COLUMN IF EXISTS "notif_reportes_semanales"
    `);
  }
}
