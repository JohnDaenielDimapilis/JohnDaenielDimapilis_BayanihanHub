# BayanihanHub

A web app for managing foundation events, fundraisers, donations, and volunteers. Built with MongoDB, Express, React, and Node.js.

## Setup

You'll need **Node.js 18+** and a **MongoDB** database (local or [Atlas](https://www.mongodb.com/atlas)).

1. Install dependencies:

```bash
npm run install:all
```

2. Create a `.env` file in the `server/` folder (copy from `.env.example`):

```
PORT=5000
MONGO_URI=mongodb+srv://youruser:yourpass@yourcluster.mongodb.net/bayanihanhub
JWT_SECRET=pick-something-random-and-long
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

3. Seed demo accounts (optional):

```bash
npm run seed --prefix server
```

This creates three test users:
- **Admin:** admin@bayanihanhub.test / Password123
- **Staff:** staff@bayanihanhub.test / Password123
- **User:** user@bayanihanhub.test / Password123

4. Start the app:

```bash
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:5000.

## How it works

There are three roles:

- **Admin** -- full access. Approves events/fundraisers, manages user accounts, views logs and security info.
- **Staff** -- creates events and fundraisers (which need Admin approval before they go live). Can view reports and participant lists.
- **User** -- joins events, donates to fundraisers, leaves feedback, earns achievement badges.

The general flow: Staff creates an event or fundraiser, Admin approves it, then Users can participate or donate. The system tracks everything -- participation, donations, feedback -- and hands out achievement badges automatically.

## Project structure

```
server/src/
  server.js          -- Express app entry point
  config/db.js       -- MongoDB connection
  models/            -- Mongoose schemas (User, Event, Fundraiser, Donation, etc.)
  controllers/       -- Route handlers
  routes/            -- API route definitions
  middleware/        -- Auth, validation, error handling
  seed.js            -- Demo data seeder

client/src/
  App.jsx            -- Routes
  pages/             -- Dashboard, Events, Fundraisers, Donations, etc.
  components/        -- Layout, ProtectedRoute, StatCard, StatusBadge
  context/           -- AuthContext (login state)
  api/client.js      -- Axios/fetch wrapper
```

## API

All endpoints are under `/api`. Auth uses Bearer tokens (JWT).

| Area | Endpoints |
|------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Events | CRUD + `PATCH /:id/approve`, `PATCH /:id/reject` |
| Fundraisers | CRUD + approve/reject |
| Donations | `GET /donations`, `POST /donations` |
| Participants | `POST /participants/events/:id/join`, `PATCH /:id/status` |
| Feedback | `GET /feedback`, `POST /feedback` |
| Achievements | `GET /achievements`, `PATCH /:id/recalculate` |
| Reports | `GET /reports` |
| Logs | `GET /logs` (Admin only) |
| Security | `GET /security`, `GET /security/logs` (Admin only) |
| Accounts | CRUD (Admin only) |
| Dashboard | `GET /dashboard` |

## Troubleshooting

**Can't connect to MongoDB** -- Double-check your `MONGO_URI` in `.env`. If you're using Atlas, make sure your IP is whitelisted in Network Access.

**Port 5000 already in use** -- Change `PORT` in `.env` or kill whatever's using it.

**CORS errors** -- Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly.
