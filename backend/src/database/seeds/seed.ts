import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as bcrypt from 'bcrypt';
import { Usuario } from '../../modules/users/entities/usuario.entity';
import { RolUsuario } from '../../common/enums';

// Load environment variables
config();

/**
 * Database Seeding Script
 *
 * This script creates initial data for the system:
 * - Admin user with default credentials
 * - Maintenance manager user
 * - Sample mechanic user
 *
 * IMPORTANT: Change default passwords immediately after first login
 *
 * Usage:
 *   npm run seed
 */
async function seed() {
  console.log('🌱 Starting database seeding...\n');

  // Create database connection
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'rapido_sur',
    entities: [Usuario],
    synchronize: false, // Never use in production
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('✅ Database connection established\n');

    const usuarioRepository = dataSource.getRepository(Usuario);

    // ================================
    // 1. Create Admin User
    // ================================
    const adminExists = await usuarioRepository.findOne({
      where: { email: 'admin@rapidosur.cl' },
    });

    if (!adminExists) {
      const adminPassword = await bcrypt.hash('Admin123!', 12);
      const admin = usuarioRepository.create({
        nombre_completo: 'Administrador del Sistema',
        email: 'admin@rapidosur.cl',
        password_hash: adminPassword,
        rol: RolUsuario.Administrador,
        activo: true,
      });

      await usuarioRepository.save(admin);
      console.log('✅ Admin user created');
      console.log('   📧 Email: admin@rapidosur.cl');
      console.log('   🔑 Password: Admin123! (CHANGE IMMEDIATELY)\n');
    } else {
      console.log('⚠️  Admin user already exists, skipping...\n');
    }

    // ================================
    // 2. Create Maintenance Manager
    // ================================
    const managerExists = await usuarioRepository.findOne({
      where: { email: 'jefe.mantenimiento@rapidosur.cl' },
    });

    if (!managerExists) {
      const managerPassword = await bcrypt.hash('Manager123!', 12);
      const manager = usuarioRepository.create({
        nombre_completo: 'Jefe de Mantenimiento',
        email: 'jefe.mantenimiento@rapidosur.cl',
        password_hash: managerPassword,
        rol: RolUsuario.JefeMantenimiento,
        activo: true,
      });

      await usuarioRepository.save(manager);
      console.log('✅ Maintenance Manager created');
      console.log('   📧 Email: jefe.mantenimiento@rapidosur.cl');
      console.log('   🔑 Password: Manager123! (CHANGE IMMEDIATELY)\n');
    } else {
      console.log('⚠️  Maintenance Manager already exists, skipping...\n');
    }

    // ================================
    // 3. Create Sample Mechanic
    // ================================
    const mechanicExists = await usuarioRepository.findOne({
      where: { email: 'mecanico@rapidosur.cl' },
    });

    if (!mechanicExists) {
      const mechanicPassword = await bcrypt.hash('Mechanic123!', 12);
      const mechanic = usuarioRepository.create({
        nombre_completo: 'Mecánico de Prueba',
        email: 'mecanico@rapidosur.cl',
        password_hash: mechanicPassword,
        rol: RolUsuario.Mecanico,
        activo: true,
      });

      await usuarioRepository.save(mechanic);
      console.log('✅ Sample Mechanic created');
      console.log('   📧 Email: mecanico@rapidosur.cl');
      console.log('   🔑 Password: Mechanic123! (CHANGE IMMEDIATELY)\n');
    } else {
      console.log('⚠️  Sample Mechanic already exists, skipping...\n');
    }

    console.log('✅ Database seeding completed successfully!\n');
    console.log('⚠️  IMPORTANT: Change all default passwords immediately after first login\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seed().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
