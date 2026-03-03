import { defineConfig } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';
import { User } from './src/entities/User';
import { Ticket } from './src/entities/Ticket';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  driver: MongoDriver,
  clientUrl: process.env.MONGO_URI || 'mongodb://localhost:27017/helpdesk',
  entities: [User, Ticket],
  entitiesTs: ['src/entities'],
  migrations: {
    path: 'src/migrations',
    pathTs: 'src/migrations',
  },
  seeder: {
    path: 'src/seeders',
    pathTs: 'src/seeders',
  },
  debug: process.env.NODE_ENV === 'development',
});
