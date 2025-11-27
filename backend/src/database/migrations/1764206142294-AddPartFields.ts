import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPartFields1764206142294 implements MigrationInterface {
    name = 'AddPartFields1764206142294'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repuestos" DROP COLUMN "descripcion"`);
        await queryRunner.query(`ALTER TABLE "repuestos" ADD "categoria" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "repuestos" ADD "stock_minimo" integer NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "repuestos" DROP COLUMN "stock_minimo"`);
        await queryRunner.query(`ALTER TABLE "repuestos" DROP COLUMN "categoria"`);
        await queryRunner.query(`ALTER TABLE "repuestos" ADD "descripcion" text`);
    }

}
