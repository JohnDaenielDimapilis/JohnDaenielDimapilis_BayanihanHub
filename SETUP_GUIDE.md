# 🚀 BayanihanHub - Complete Setup Guide (Windows)

## **QUICK START (5 minutes)**

### Prerequisites
- **Node.js 18+** (Download from [nodejs.org](https://nodejs.org))
- **MongoDB** (Local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cloud database)
- **Git** (Download from [git-scm.com](https://git-scm.com))
- **Visual Studio Code** (Optional, for editing)

### Step 1: Extract and Navigate
```bash
# Extract the project folder if it's zipped
# Open Command Prompt (cmd) or PowerShell in the project directory
cd C:\Users\YourUsername\Downloads\bayanihanhub-a-centralized-foundation-event-and
```

### Step 2: Install Dependencies
```bash
npm run install:all
```
This installs packages for both backend (server/) and frontend (client/).

### Step 3: Configure Environment Variables

**Create `server/.env` file:**
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster-url/bayanihanhub
JWT_SECRET=your_super_secret_key_here_change_this_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Replace with your actual MongoDB connection string:**
- **For MongoDB Atlas Cloud (Recommended):**
  1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
  2. Create a free account
  3. Create a cluster (choose M0 free tier)
  4. Click "Connect" → "Drivers"
  5. Copy the connection string
  6. Replace `<username>:<password>` and `<cluster-url>` in your `.env`

- **For Local MongoDB:**
  ```
  MONGO_URI=mongodb://localhost:27017/bayanihanhub
  ```
  (Install MongoDB Community Server locally if not already installed)

### Step 4: Seed Demo Data
```bash
npm run seed --prefix server
```

This creates demo accounts:
- **Admin**: `admin@bayanihanhub.test` / `Password123`
- **Staff**: `staff@bayanihanhub.test` / `Password123`
- **User**: `user@bayanihanhub.test` / `Password123`

### Step 5: Start the Application

**Terminal 1 - Start Backend (API Server):**
```bash
npm run server
```
Expected output: `✅ BayanihanHub server running on port 5000`

**Terminal 2 - Start Frontend (React UI):**
```bash
npm run client
```
Expected output: `VITE v6.0.7 ready in 123 ms`

### Step 6: Open in Browser
- **Frontend**: http://localhost:5173
- **API Health Check**: http://localhost:5000/api/health
- **Login** with any demo account above

---

## **TROUBLESHOOTING**

### MongoDB Connection Error
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:**
- Ensure MongoDB is running (if local): Open another terminal and run `mongod`
- OR use MongoDB Atlas cloud database with correct connection string

### Port Already in Use
```
❌ Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:**
```bash
# Find process using port 5000 (Windows PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# OR change port in server/.env
PORT=5001
```

### JWT Secret Invalid
```
❌ Error: JsonWebTokenError: secretOrPrivateKey must be a non-empty string
```
**Solution:** Ensure `JWT_SECRET` is set in `server/.env` (at least 8 characters)

### Node Modules Issues
```bash
# Clear and reinstall
rmdir /s node_modules
npm run install:all
```

---

## **PRODUCTION DEPLOYMENT**

### Build for Production
```bash
# Build frontend
npm run build --prefix client

# Start backend in production
set NODE_ENV=production
npm start --prefix server
```

### Environment Variables (Production)
```bash
PORT=5000
MONGO_URI=mongodb+srv://prod_user:prod_password@prod-cluster/bayanihanhub
JWT_SECRET=your_very_long_random_secure_secret_key_here_at_least_32_chars
JWT_EXPIRES_IN=7d
CLIENT_URL=https://yourdomain.com
NODE_ENV=production
```

### Deploy to Heroku
```bash
# Install Heroku CLI
# Login: heroku login
# Create app: heroku create your-app-name
# Set config: heroku config:set JWT_SECRET=your_secret
# Deploy: git push heroku main
```

### Deploy to DigitalOcean
```bash
# Create droplet (Ubuntu 22.04)
# SSH into droplet
# Install Node.js, MongoDB, git
# Clone repo: git clone <your-repo>
# Follow steps 2-5 from Quick Start
# Use PM2 to keep server running: npm install -g pm2
# Start: pm2 start "npm start --prefix server" --name bayanihanhub
```

---

## **FEATURES CHECKLIST**

### ✅ Authentication & Authorization
- [x] User registration
- [x] User login with JWT
- [x] Role-based access control (Admin, Staff, User)
- [x] Password hashing with bcryptjs

### ✅ Event Management
- [x] Create events (Staff/Admin)
- [x] Approve/reject events (Admin only)
- [x] Join events (Users)
- [x] Track participant attendance
- [x] View event details

### ✅ Fundraising
- [x] Create fundraising campaigns (Staff/Admin)
- [x] Approve/reject campaigns (Admin only)
- [x] Track donation progress
- [x] Record donations from users
- [x] Monitor fundraiser deadlines

### ✅ Donations
- [x] Submit donation records
- [x] Track donation types (Cash, Bank Transfer, In-kind)
- [x] Generate donation reports
- [x] Monitor donation status

### ✅ Feedback & Achievements
- [x] Post-event feedback from participants
- [x] Automatic badge generation (Participant, Donor, etc.)
- [x] Achievement points system
- [x] View user achievements and progress

### ✅ Reporting & Analytics
- [x] Dashboard with key metrics
- [x] Event summary reports
- [x] Donation analytics
- [x] Participant statistics

### ✅ Security & Monitoring
- [x] Activity logs and audit trails
- [x] Failed login tracking
- [x] Unauthorized access detection
- [x] Role-based endpoint protection

### ✅ Account Management (Admin)
- [x] Create user accounts
- [x] Update user information
- [x] Deactivate/activate accounts
- [x] View all accounts and roles

---

## **DEFAULT ROLES & PERMISSIONS**

### 👑 Admin
- Approve/reject events and fundraisers
- Manage user accounts and roles
- View system reports and analytics
- Monitor security logs
- View all donations and feedback

### 👔 Staff
- Create events and fundraisers
- Monitor their own events' participants
- View feedback for their events
- Create fundraising campaigns
- Generate reports for their campaigns

### 👤 User
- View approved events
- Join events and track participation
- Submit donations
- Post feedback on events
- View personal achievements

---

## **API ENDPOINTS SUMMARY**

### Authentication
```
POST   /api/auth/register     - Register new account
POST   /api/auth/login        - Login (returns JWT)
GET    /api/auth/me           - Get current user profile
```

### Events
```
GET    /api/events            - List events (filtered by role)
POST   /api/events            - Create event (Staff/Admin)
GET    /api/events/:id        - Get event details
PUT    /api/events/:id        - Update event (Staff/Admin)
DELETE /api/events/:id        - Delete event (Admin)
PATCH  /api/events/:id/approve - Approve event (Admin)
PATCH  /api/events/:id/reject  - Reject event (Admin)
```

### Participants
```
POST   /api/participants/events/:eventId/join - Join event
GET    /api/participants      - List participants (Admin/Staff)
PATCH  /api/participants/:id/status           - Update attendance
```

### Fundraisers & Donations
```
GET    /api/fundraisers       - List fundraisers
POST   /api/fundraisers       - Create fundraiser
PATCH  /api/fundraisers/:id/approve - Approve fundraiser
PATCH  /api/fundraisers/:id/reject  - Reject fundraiser

POST   /api/donations         - Submit donation
GET    /api/donations         - View donations (filtered by role)
```

### Reports & Analytics
```
GET    /api/dashboard         - Get dashboard statistics
GET    /api/reports           - Get detailed reports
GET    /api/achievements      - View achievements
GET    /api/logs              - View activity logs
GET    /api/security          - Security summary
GET    /api/security/logs     - Security logs
```

### Account Management (Admin)
```
GET    /api/accounts          - List all accounts
POST   /api/accounts          - Create account
PUT    /api/accounts/:id      - Update account
DELETE /api/accounts/:id      - Delete account
```

---

## **FOLDER STRUCTURE**

```
bayanihanhub/
├── server/
│   ├── src/
│   │   ├── server.js           - Express app entry point
│   │   ├── config/db.js        - MongoDB connection
│   │   ├── controllers/        - Business logic
│   │   ├── models/             - MongoDB schemas
│   │   ├── routes/             - API endpoints
│   │   ├── middleware/         - Auth, validation, error handling
│   │   └── utils/              - Helper functions
│   ├── .env.example            - Environment template
│   └── package.json            - Backend dependencies
│
├── client/
│   ├── src/
│   │   ├── App.jsx             - Main React app
│   │   ├── pages/              - Page components
│   │   ├── components/         - Shared components
│   │   ├── context/            - Auth context
│   │   └── api/client.js       - API functions
│   ├── vite.config.js          - Vite bundler config
│   └── package.json            - Frontend dependencies
│
├── package.json                - Root package manager
└── README.md                   - Project documentation
```

---

## **DATABASE SCHEMA**

### Collections
- **Users** - User accounts with roles
- **Events** - Foundation events (pending/approved/rejected)
- **Fundraisers** - Fundraising campaigns
- **Donations** - Donation records
- **Participants** - Event participants with attendance
- **Feedback** - Post-event feedback from users
- **Achievements** - User badges and points
- **Logs** - Activity audit trail
- **ActivityLog** - Security and action logs

---

## **SAMPLE REQUESTS**

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@bayanihanhub.test",
    "password": "Password123"
  }'
```

### Create Event
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Community Feeding Program",
    "description": "Monthly feeding activity",
    "date": "2026-06-15",
    "location": "Town Hall",
    "participantLimit": 100
  }'
```

### Join Event
```bash
curl -X POST http://localhost:5000/api/participants/events/<eventId>/join \
  -H "Authorization: Bearer <token>"
```

### Submit Donation
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "fundraiserId": "<fundraiserId>",
    "amount": 5000,
    "donationType": "Cash",
    "donationPurpose": "School Supplies Drive",
    "paymentReference": "GC-88421"
  }'
```

---

## **SUPPORT & CONTACT**

For issues, questions, or contributions:
1. Check this guide's Troubleshooting section
2. Review API endpoints documentation
3. Contact the development team

---

**Last Updated**: May 2026  
**Version**: 1.0.0  
**Status**: Production Ready ✅
