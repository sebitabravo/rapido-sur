import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('report_history')
export class ReportHistory {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tipo: string; // 'Indisponibilidad' | 'Costos'

    @Column({ name: 'fecha_inicio' })
    fechaInicio: string;

    @Column({ name: 'fecha_fin' })
    fechaFin: string;

    @CreateDateColumn({ name: 'fecha_generacion' })
    fechaGeneracion: Date;

    @Column({ nullable: true })
    usuario: string;
}
