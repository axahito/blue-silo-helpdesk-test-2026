# MikroORM Setup & Migration Guide

This project has been refactored from Mongoose to **MikroORM** for better database abstraction, migrations, and seeding capabilities.

## What Changed

- **ORM**: Mongoose → MikroORM with MongoDB driver
- **Models**: `src/models/` → `src/entities/`
- **Connection**: Now initialized in `src/utils/connect.ts` via MikroORM
- **Migrations**: New `src/migrations/` directory for tracking schema changes
- **Seeders**: New `src/seeders/` directory for initial data population

## Installation

After pulling these changes, install new dependencies:

```bash
npm install
```

## Configuration

Create a `.env` file in the server directory:

```env
MONGO_URI=mongodb://localhost:27017/helpdesk
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
npm start
```

## Database Operations

### Seed the Database

Populate initial data (3 test users with different roles):

```bash
npm run seed
```

This creates:
- `agent_l1` (Role: L1)
- `agent_l2` (Role: L2)
- `agent_l3` (Role: L3)

All users have password: `password123`

### Creating a New Migration

When you modify an entity schema:

```bash
npm run migration:create -- --name your_migration_name
```

This generates a new migration file in `src/migrations/`.

### Running Migrations

Apply all pending migrations:

```bash
npm run migration:up
```

### Rollback Migrations

Undo the last migration:

```bash
npm run migration:down
```

### View Migration Status

```bash
npm run mikro-orm -- migration:list
```

## Entities

Entities are defined in `src/entities/`:

- **User**: Authentication users with roles (L1, L2, L3)
- **Ticket**: Support tickets with embedded logs array

### Modifying Entities

1. Update the entity file (e.g., `src/entities/User.ts`)
2. Run: `npm run migration:create`
3. Edit the migration file to describe the changes
4. Run: `npm run migration:up`

## Best Practices

✅ **Always create migrations** when changing entity schemas
✅ **Use seeders** for environment setup (not HTTP endpoints)
✅ **Fork the EntityManager** (`em.fork()`) in controllers to avoid context issues
✅ **Use `persistAndFlush()`** to save changes to the database

## Architecture

```
src/
├── entities/          # Data models
│   ├── User.ts
│   └── Ticket.ts
├── controllers/       # Business logic
├── routes/           # Endpoint definitions
├── middleware/       # Auth, validation
├── migrations/       # Schema version control
├── seeders/          # Initial data
└── utils/            # Utilities (database connection)
```

## Reference Documentation

- [MikroORM Docs](https://mikro-orm.io/)
- [MikroORM MongoDB Guide](https://mikro-orm.io/docs/mongodb)
- [Migrations Guide](https://mikro-orm.io/docs/migrations)
