import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { UserSeeder } from './UserSeeder';

async function runSeeders() {
  const orm = await MikroORM.init<MongoDriver>();
  const seeder = orm.getSeeder();

  try {
    await seeder.seed(UserSeeder);
    console.log('✓ Database seeded successfully');
  } catch (err) {
    console.error('✗ Seeding failed:', err);
    process.exit(1);
  } finally {
    await orm.close();
  }
}

runSeeders();
