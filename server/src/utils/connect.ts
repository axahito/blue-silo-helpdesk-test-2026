import { MikroORM } from '@mikro-orm/core';
import { MongoDriver } from '@mikro-orm/mongodb';

let orm: MikroORM<MongoDriver> | null = null;

export async function connectDB(): Promise<MikroORM<MongoDriver>> {
  if (orm) {
    return orm;
  }

  orm = await MikroORM.init<MongoDriver>();
  console.log('MikroORM connected to MongoDB');
  return orm;
}

export function getORM(): MikroORM<MongoDriver> {
  if (!orm) {
    throw new Error('ORM not initialized. Call connectDB first.');
  }
  return orm;
}
