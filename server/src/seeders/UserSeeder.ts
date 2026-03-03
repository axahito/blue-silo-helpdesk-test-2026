import { Seeder } from '@mikro-orm/seeder';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/User';
import { Role } from '../types/types';
import bcrypt from 'bcrypt';

export class UserSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const users = [
      {
        username: 'agent_l1',
        passwordHash: await bcrypt.hash('password123', 10),
        role: Role.L1,
      },
      {
        username: 'agent_l2',
        passwordHash: await bcrypt.hash('password123', 10),
        role: Role.L2,
      },
      {
        username: 'agent_l3',
        passwordHash: await bcrypt.hash('password123', 10),
        role: Role.L3,
      },
    ];

    for (const userData of users) {
      // Check if user already exists
      const existing = await em.findOne(User, { username: userData.username });
      if (!existing) {
        const user = em.create(User, {
          ...userData,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as any);
        await em.persistAndFlush(user);
        console.log(`✓ Created user: ${userData.username}`);
      } else {
        console.log(`- User already exists: ${userData.username}`);
      }
    }
  }
}
