import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateReportHistoryTable1764206200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'report_history',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'tipo',
            type: 'varchar',
            length: '100',
          },
          {
            name: 'fecha_inicio',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'fecha_fin',
            type: 'varchar',
            length: '50',
          },
          {
            name: 'fecha_generacion',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'usuario',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('report_history');
  }
}
