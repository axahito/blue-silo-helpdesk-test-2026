# Helpdesk Ticket Maintenance System

A small full-stack application used for recruitment testing. It includes:

- **Backend**: Node.js + Express + MikroORM (MongoDB)
- **Frontend**: React + Vite + TypeScript
- **Authentication**: JWT stored in httpOnly cookies

---

## Tech Stack

### Server
- Node.js (TypeScript)
- Express
- MikroORM with MongoDB driver
- bcrypt for password hashing
- jsonwebtoken for JWTs
- jest/ts-jest for tests

### Client
- React (TypeScript)
- Vite build tool
- Axios for HTTP
- Tailwind CSS for styling

---

## Running the Application

### Backend
```bash
cd server
npm install
cp .env.example .env      # set MONGO_URI, JWT_SECRET, etc.
npm run seed               # populate dev users
npm run dev                # start in dev mode
```

### Frontend
```bash
cd client
npm install
npm run dev
```

You can run server and client in separate terminals simultaneously.

---

## Sample Credentials

The seeder creates three users (password = `password123`):

# Helpdesk Ticket Maintenance System

Small full-stack helpdesk demo app used for testing and recruitment.

## Tech stack

- Backend: Node.js (TypeScript), Express, MikroORM (MongoDB), jsonwebtoken, bcrypt
- Frontend: React + TypeScript, Vite, Axios, Tailwind CSS
- Testing: Jest + ts-jest (both frontend and backend), React Testing Library on client

---

## How to run

Run server and client in separate terminals.

Backend
```bash
cd server
npm install
# copy or edit environment file
cp .env.example .env
# (optional) run seed to create dev users
npm run seed
# start in dev (ts-node) mode
npm run dev
```

Frontend
```bash
cd client
npm install
npm run dev
```

Run tests
```bash
# Backend tests (Jest)
cd server && npm test

# Frontend tests (Jest)
cd client && npm test
```

---

## Sample credentials (created by seeder)

The seeder (`server/src/seeders`) creates three default users for development (password: `password123`):

- `agent_l1` / `password123` — role `L1`
- `agent_l2` / `password123` — role `L2`
- `agent_l3` / `password123` — role `L3`

You can also create users via the `POST /api/auth/seed` endpoint (development only).

---

## API & auth notes

- Auth endpoints: `POST /api/auth/login`, `POST /api/auth/seed`, `GET /api/auth/me`.
- Ticket endpoints: `GET|POST /api/tickets`, `GET|POST /api/tickets/:id/*` (status, log, escalate, critical, resolve).
- Authentication: JWTs are issued by the server and stored in httpOnly cookies; middleware (`requireAuth`, `requireRole`) enforces access control.

---

## Environment variables

Server (`server/.env`)
```
MONGO_URI=mongodb://localhost:27017/helpdesk
JWT_SECRET=your_jwt_secret_here
PORT=4000
NODE_ENV=development
```

Client (`client/.env`)
```
# Vite envs (if you host API elsewhere):
# VITE_API_BASE_URL=http://localhost:4000/api
```

---

## Migrations & seeders

- Migrations are managed with MikroORM. From the `server` folder use:

```bash
# create a migration (after changing entities)
npm run migration:create

# apply pending migrations
npm run migration:up

# rollback last migration
npm run migration:down
```

- Seeding: the repo includes seeders under `server/src/seeders`. Run:

```bash
cd server
npm run seed
```

This will populate development users and can be customized.

---

## Other notes

- The `/api/auth/seed` endpoint and seed scripts are intended for development only — remove or secure before production.
- Tests: this repo includes unit and Jest-only acceptance tests for both server and client. Run them with `npm test` in each folder.
- If you need CI, add a workflow to run `npm ci && npm test` for `server` and `client`.

Feel free to ask me to commit these README changes or to add CI/workflow files.
