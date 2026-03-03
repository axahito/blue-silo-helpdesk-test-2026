import { Entity, Property, Enum, PrimaryKey, Embedded, ArrayType } from '@mikro-orm/core';
import { ObjectId } from '@mikro-orm/mongodb';
import { Role, Priority, Status, Critical, LogEntry } from '../types/types';

@Entity({ collection: 'tickets' })
export class Ticket {
  @PrimaryKey()
  _id!: ObjectId;

  @Property({ type: 'string' })
  title!: string;

  @Property({ type: 'string', nullable: true })
  description?: string;

  @Property({ type: 'string', nullable: true })
  category?: string;

  @Property({ type: 'string', nullable: true })
  expectedCompletion?: string;

  @Enum(() => ['Low', 'Med', 'High'] as const)
  priority: Priority = 'Med';

  @Enum(() => ['New', 'Attending', 'Completed'] as const)
  status: Status = 'New';

  @Enum(() => [...Object.values(Role), null] as const)
  escalation?: Role | null = null;

  @Enum(() => ['C1', 'C2', 'C3', 'None'] as const)
  critical: Critical = 'None';

  @Property({ type: 'array' })
  logs: LogEntry[] = [];

  @Property({ type: 'string' })
  createdBy!: string;

  @Property()
  createdAt: Date = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt: Date = new Date();
}
