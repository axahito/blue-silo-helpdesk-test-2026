import { Entity, Property, Enum, PrimaryKey } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Role } from '../types/types';

@Entity({ collection: 'users' })
export class User {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ type: 'string', unique: true })
  username!: string;

  @Property({ type: 'string' })
  passwordHash!: string;

  @Enum(() => Role)
  role: Role = Role.L1;

  @Property({ type: 'string', nullable: true })
  refreshToken: string | null = null;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
