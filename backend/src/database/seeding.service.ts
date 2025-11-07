import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../modules/users/entities/usuario.entity';
import { RolUsuario } from '../common/enums';

/**
 * Database Seeding Service
 * Automatically creates initial users when the application starts
 * Only runs if ENABLE_SEEDING=true in environment variables
 */
@Injectable()
export class SeedingService implements OnModuleInit {
  private readonly logger = new Logger(SeedingService.name);

  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const enableSeeding = this.configService.get<string>('ENABLE_SEEDING');

    if (enableSeeding === 'true') {
      this.logger.log('🌱 Seeding is enabled, starting database seed...');
      await this.seed();
    } else {
      this.logger.log('⏭️  Seeding is disabled (set ENABLE_SEEDING=true to enable)');
    }
  }

  private async seed() {
    try {
      // Create Admin User
      await this.createUser({
        nombre_completo: 'Administrador del Sistema',
        email: 'admin@rapidosur.cl',
        password: 'Admin123!',
        rol: RolUsuario.Administrador,
      });

      // Create Maintenance Manager
      await this.createUser({
        nombre_completo: 'Jefe de Mantenimiento',
        email: 'jefe.mantenimiento@rapidosur.cl',
        password: 'Manager123!',
        rol: RolUsuario.JefeMantenimiento,
      });

      // Create Sample Mechanic
      await this.createUser({
        nombre_completo: 'Mecánico de Prueba',
        email: 'mecanico@rapidosur.cl',
        password: 'Mechanic123!',
        rol: RolUsuario.Mecanico,
      });

      this.logger.log('✅ Database seeding completed successfully!');
      this.logger.warn('⚠️  IMPORTANT: Change all default passwords immediately after first login');
    } catch (error) {
      this.logger.error('❌ Error seeding database:', error.message);
    }
  }

  private async createUser(data: {
    nombre_completo: string;
    email: string;
    password: string;
    rol: RolUsuario;
  }): Promise<void> {
    const exists = await this.usuarioRepo.findOne({
      where: { email: data.email },
    });

    if (!exists) {
      const password_hash = await bcrypt.hash(data.password, 12);
      const user = this.usuarioRepo.create({
        nombre_completo: data.nombre_completo,
        email: data.email,
        password_hash,
        rol: data.rol,
        activo: true,
      });

      await this.usuarioRepo.save(user);
      this.logger.log(`✅ ${data.rol} user created: ${data.email}`);
    } else {
      this.logger.log(`⚠️  User already exists: ${data.email}, skipping...`);
    }
  }
}
