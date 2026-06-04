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

3. Seed demo accounts (optional for a real MongoDB database):

```bash
npm run seed --prefix server
```

This creates three test users:
- **Admin:** admin@bayanihanhub.test / Password123
- **Staff:** staff@bayanihanhub.test / Password123
- **User:** user@bayanihanhub.test / Password123

When `MONGO_URI` is missing or local MongoDB is unavailable, the app starts an in-memory MongoDB server and automatically seeds dummy accounts plus event, registration, QR attendance, fundraiser, donation, feedback, notification, and log records. See `DUMMY_DATA_NOTES.md`.

4. Start the app:

```bash
npm run dev
```

Frontend runs on http://localhost:5173, backend on http://localhost:5000.

## How it works

There are three roles:

- **Admin** -- full access. Approves events/fundraisers/donations, manages user accounts, views reports and logs.
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
| Events | CRUD + approve/reject, registration, cancel, finish, QR generate/scan, history |
| Fundraisers | CRUD + approve/reject |
| Donations | `GET /donations`, `POST /donations` |
| Participants | join/cancel/check-in, manual Present/Absent, event participant export |
| Feedback | `GET /feedback`, `POST /feedback` |
| Achievements | `GET /achievements`, `PATCH /:id/recalculate` |
| Reports | summary + events, participants, donations, fundraisers, feedback tabs |
| Logs | `GET /logs` (Admin only) |
| Approval Requests | Events, fundraisers, and donations pending Admin action |
| Accounts | CRUD, edit, reset password, temporary ban, unban, disable (Admin only) |
| Dashboard | `GET /dashboard` |

## Troubleshooting

**Can't connect to MongoDB** -- Double-check your `MONGO_URI` in `.env`. If you're using Atlas, make sure your IP is whitelisted in Network Access.

**Port 5000 already in use** -- Change `PORT` in `.env` or kill whatever's using it.

**CORS errors** -- Make sure `CLIENT_URL` in `.env` matches your frontend URL exactly.
