// src/seeds/role.seed.ts
import { AppDataSource } from '../../data-source';
import { Role } from '../modules/roles/entities/role.entity';

(async () => {
  try {
    await AppDataSource.initialize(); 

    const roleRepository = AppDataSource.getRepository(Role);

    await roleRepository.save([
      { name: 'super-admin', description: 'Super admin role', is_active: true },
      { name: 'branch-admin', description: 'Branch admin role', is_active: true },
      { name: 'therapist', description: 'therapist role', is_active: true },
    ]);

    console.log('Roles seeded successfully.');
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Role seed failed:', error);
    process.exit(1);
  }
})();
