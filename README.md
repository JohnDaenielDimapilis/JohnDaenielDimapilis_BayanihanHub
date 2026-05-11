# BayanihanHub

BayanihanHub is a professional full-stack MERN web application based on the proposal **“BayanihanHub: A Centralized Foundation Event and Fundraising Management System.”** It centralizes foundation events, fundraisers, donations, participant registration, feedback, achievements, reports, approval workflows, activity logs, and basic security controls.

## Features

- Role-based portals for Admin, Staff, and User accounts
- JWT authentication with bcrypt password hashing
- Event creation, editing, participant registration, and Admin approval
- Fundraising campaign creation, donation recording, and Admin approval
- Feedback and achievement tracking
- Summary, event, fundraising, and participation reports
- Activity, approval, login, and security logs
- Responsive React dashboard built with Tailwind CSS
- RESTful Express API with Mongoose models and validation

## Tech Stack

- Frontend: React.js, Vite, HTML5, JavaScript ES6+, Tailwind CSS
- Backend: Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs
- Deployment: GitHub and Vercel

## User Roles

- Admin: manages accounts, approves or rejects events and fundraisers, views reports, dashboards, activity logs, approval logs, and security logs.
- Staff: creates and updates events, submits events for approval, monitors participants, creates fundraisers, tracks donations and feedback, and submits reports.
- User: registers, logs in, views approved events, joins events, donates to approved fundraisers, submits feedback, and views achievements.

## Local Installation

1. Clone the repository.
2. Install root, client, and server dependencies:

```bash
npm run install:all
```

3. Create environment files:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

4. Update `server/.env` with a real MongoDB connection string and secure JWT secret.
5. Run the development servers:

```bash
npm run dev
```

## Environment Variables

Backend `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Frontend `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Local Commands

```bash
npm run dev
npm run build
npm --prefix client run preview
npm --prefix server start
```

## API Overview

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/profile`
- Users: `GET /api/users`, `GET /api/users/:id`, `PATCH /api/users/:id/status`, `PATCH /api/users/:id/role`
- Events: `POST /api/events`, `GET /api/events`, `GET /api/events/approved`, `GET /api/events/:id`, `PUT /api/events/:id`, `DELETE /api/events/:id`, `PATCH /api/events/:id/approve`, `PATCH /api/events/:id/reject`, `POST /api/events/:id/join`
- Fundraisers: `POST /api/fundraisers`, `GET /api/fundraisers`, `GET /api/fundraisers/approved`, `GET /api/fundraisers/:id`, `PUT /api/fundraisers/:id`, `DELETE /api/fundraisers/:id`, `PATCH /api/fundraisers/:id/approve`, `PATCH /api/fundraisers/:id/reject`
- Donations: `POST /api/donations`, `GET /api/donations`, `GET /api/donations/my-donations`
- Feedback: `POST /api/feedback`, `GET /api/feedback`, `GET /api/feedback/event/:eventId`
- Achievements: `POST /api/achievements`, `GET /api/achievements`, `GET /api/achievements/my-achievements`
- Reports: `POST /api/reports`, `GET /api/reports/summary`, `GET /api/reports/events`, `GET /api/reports/fundraising`, `GET /api/reports/participation`
- Logs: `GET /api/logs/activity`, `GET /api/logs/security`

## Approval Workflow

Staff can create events and fundraising campaigns, but new records are saved with `pending` status. Admin users approve or reject these records through protected API endpoints. Only records with `approved` or `active` status are shown through the public approved routes and user-facing pages.

## Security and Traceability

Passwords are hashed with bcryptjs before storage. JWT tokens protect authenticated API routes. Role middleware rejects unauthorized Admin, Staff, and User access. Express validators check important inputs. Activity logs record login events, failed login attempts, account changes, approvals, donations, event joins, report generation, and other important actions.

## Vercel Deployment

The repository includes `vercel.json` for a single Vercel project. The frontend builds from `client` and the Express API is exposed through `api/index.js`.

Required Vercel environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
CLIENT_URL=https://your-vercel-domain.vercel.app
NODE_ENV=production
VITE_API_BASE_URL=/api
```

Use these Vercel settings if deploying manually:

- Project name: `JohnDaenielDimapilis_BayanihanHub`
- Build command: `npm --prefix client install && npm --prefix client run build`
- Output directory: `client/dist`
- Root directory: repository root

## Git Commit Standards

Use this format:

```txt
type(scope): action summary
```

Examples:

```txt
chore(project): initialize MERN application structure
feat(auth): add JWT login and registration
feat(events): create event approval workflow
feat(fundraising): add donation record management
security(auth): hash user passwords with bcrypt
docs(readme): add setup and deployment instructions
```
