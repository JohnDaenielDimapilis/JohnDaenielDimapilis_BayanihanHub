# 📚 BayanihanHub API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All requests (except register/login) require a Bearer token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (201):**
```json
{
  "message": "Account registered successfully.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

---

### POST /auth/login
Login to existing account.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User"
  }
}
```

---

### GET /auth/me
Get current authenticated user's profile.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "User",
  "createdAt": "2026-05-30T10:00:00Z",
  "updatedAt": "2026-05-30T10:00:00Z"
}
```

---

## 📅 Event Endpoints

### GET /events
List all events (users see only approved, admin/staff see all).

**Query Parameters:**
- None required

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "title": "Community Feeding Program",
    "description": "Monthly feeding activity for community",
    "date": "2026-06-15T00:00:00Z",
    "location": "Town Hall",
    "participantLimit": 100,
    "status": "Approved",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Jane Staff",
      "role": "Staff"
    },
    "createdAt": "2026-05-30T10:00:00Z"
  }
]
```

---

### POST /events
Create a new event (Staff/Admin only).

**Request:**
```json
{
  "title": "Medical Mission",
  "description": "Free medical services",
  "date": "2026-06-22",
  "location": "Community Center",
  "participantLimit": 200
}
```

**Response (201):**
```json
{
  "message": "Event created and submitted for admin approval.",
  "event": {
    "_id": "507f1f77bcf86cd799439033",
    "title": "Medical Mission",
    "status": "Pending",
    "createdBy": "507f1f77bcf86cd799439022"
  }
}
```

---

### GET /events/:id
Get specific event details.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Community Feeding Program",
  "description": "Monthly feeding activity",
  "date": "2026-06-15T00:00:00Z",
  "location": "Town Hall",
  "participantLimit": 100,
  "status": "Approved",
  "createdBy": {
    "_id": "507f1f77bcf86cd799439022",
    "name": "Jane Staff"
  }
}
```

---

### PUT /events/:id
Update an event (only by creator or admin).

**Request:**
```json
{
  "title": "Updated Event Title",
  "participantLimit": 150
}
```

**Response (200):**
```json
{
  "message": "Event updated and returned to pending status.",
  "event": { ... }
}
```

---

### DELETE /events/:id
Delete an event (creator or admin only).

**Response (200):**
```json
{
  "message": "Event deleted successfully."
}
```

---

### PATCH /events/:id/approve
Approve an event (Admin only).

**Response (200):**
```json
{
  "message": "Event approved successfully.",
  "event": { ... with status: "Approved" }
}
```

---

### PATCH /events/:id/reject
Reject an event (Admin only).

**Response (200):**
```json
{
  "message": "Event rejected successfully.",
  "event": { ... with status: "Rejected" }
}
```

---

## 🎯 Participant Endpoints

### POST /participants/events/:eventId/join
Join an approved event.

**Response (201):**
```json
{
  "message": "Event joined successfully.",
  "participant": {
    "_id": "507f1f77bcf86cd799439044",
    "userId": "507f1f77bcf86cd799439011",
    "eventId": "507f1f77bcf86cd799439033",
    "attendanceStatus": "Pending",
    "participationStatus": "Joined"
  }
}
```

---

### GET /participants
List participants (filtered by role).

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439044",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "eventId": {
      "_id": "507f1f77bcf86cd799439033",
      "title": "Community Feeding Program"
    },
    "attendanceStatus": "Pending",
    "participationStatus": "Joined"
  }
]
```

---

### PATCH /participants/:id/status
Mark participant attendance.

**Request:**
```json
{
  "attendanceStatus": "Present"
}
```

**Response (200):**
```json
{
  "message": "Participant status updated successfully.",
  "participant": { ... }
}
```

---

## 💚 Fundraiser Endpoints

### GET /fundraisers
List fundraisers.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439055",
    "title": "School Supplies Drive",
    "purpose": "Provide school kits for 300 learners",
    "targetAmount": 90000,
    "deadline": "2026-06-30T00:00:00Z",
    "status": "Approved",
    "createdBy": {
      "_id": "507f1f77bcf86cd799439022",
      "name": "Jane Staff"
    }
  }
]
```

---

### POST /fundraisers
Create a new fundraiser (Staff/Admin).

**Request:**
```json
{
  "title": "Disaster Relief Fund",
  "purpose": "Food packs and hygiene kits",
  "targetAmount": 120000,
  "deadline": "2026-07-02",
  "description": "Relief supplies for affected families"
}
```

**Response (201):**
```json
{
  "message": "Fundraiser created and submitted for admin approval.",
  "fundraiser": { ... }
}
```

---

### PATCH /fundraisers/:id/approve
Approve fundraiser (Admin only).

**Response (200):**
```json
{
  "message": "Fundraiser approved successfully.",
  "fundraiser": { ... with status: "Approved" }
}
```

---

## 💰 Donation Endpoints

### POST /donations
Submit a donation.

**Request:**
```json
{
  "fundraiserId": "507f1f77bcf86cd799439055",
  "amount": 5000,
  "donationType": "Cash",
  "donationPurpose": "School Supplies Drive",
  "paymentReference": "GC-88421"
}
```

**Response (201):**
```json
{
  "message": "Donation recorded successfully.",
  "donation": {
    "_id": "507f1f77bcf86cd799439066",
    "donor": "507f1f77bcf86cd799439011",
    "amount": 5000,
    "donationType": "Cash",
    "donationStatus": "Recorded"
  }
}
```

---

### GET /donations
List donations (filtered by role).

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439066",
    "donor": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "amount": 5000,
    "donationType": "Cash",
    "donationPurpose": "School Supplies Drive",
    "paymentReference": "GC-88421"
  }
]
```

---

## 💬 Feedback Endpoints

### POST /feedback
Submit event feedback.

**Request:**
```json
{
  "eventId": "507f1f77bcf86cd799439033",
  "rating": 5,
  "comment": "Great event, well organized!",
  "suggestions": "Consider adding more volunteer stations"
}
```

**Response (201):**
```json
{
  "message": "Feedback submitted successfully.",
  "feedback": {
    "_id": "507f1f77bcf86cd799439077",
    "userId": "507f1f77bcf86cd799439011",
    "eventId": "507f1f77bcf86cd799439033",
    "rating": 5
  }
}
```

---

### GET /feedback
Get feedback (Staff see only their events' feedback).

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439077",
    "userId": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "eventId": {
      "_id": "507f1f77bcf86cd799439033",
      "title": "Community Feeding Program"
    },
    "rating": 5,
    "comment": "Great event!"
  }
]
```

---

## 🏆 Achievement Endpoints

### GET /achievements
Get user achievements.

**Response (200):**
```json
{
  "_id": "507f1f77bcf86cd799439088",
  "userId": "507f1f77bcf86cd799439011",
  "points": 240,
  "badges": ["Event Participant", "Donor"],
  "totalEventsJoined": 5,
  "totalDonations": 3,
  "totalFeedbackSubmitted": 2
}
```

---

## 📊 Report Endpoints

### GET /reports
Get analytics reports.

**Response (200):**
```json
{
  "totalUsers": 150,
  "totalEvents": 25,
  "approvedEvents": 20,
  "pendingEvents": 3,
  "totalParticipants": 487,
  "totalDonations": 45,
  "totalDonationAmount": 450000,
  "totalFeedback": 120
}
```

---

## 📝 Log Endpoints

### GET /logs
Get activity logs (Admin/Staff).

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439099",
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe"
    },
    "role": "User",
    "action": "Joined Event",
    "module": "Participant",
    "status": "Success",
    "createdAt": "2026-05-30T10:00:00Z"
  }
]
```

---

## 🔒 Security Endpoints

### GET /security
Get security summary (Admin only).

**Response (200):**
```json
{
  "failedLogins": 3,
  "unauthorizedAttempts": 0,
  "inactiveUsers": 2,
  "roleChanges": 5
}
```

---

### GET /security/logs
Get security logs (Admin only).

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439100",
    "user": { ... },
    "action": "Failed login attempt",
    "module": "Security",
    "outcome": "Failed",
    "createdAt": "2026-05-30T09:30:00Z"
  }
]
```

---

## 👥 Account Endpoints (Admin Only)

### GET /accounts
List all user accounts.

**Response (200):**
```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "User",
    "createdAt": "2026-05-30T10:00:00Z"
  }
]
```

---

### POST /accounts
Create new account.

**Request:**
```json
{
  "name": "Jane Admin",
  "email": "jane@example.com",
  "password": "TempPassword123",
  "role": "Admin"
}
```

---

### PUT /accounts/:id
Update account details.

**Request:**
```json
{
  "name": "Jane Admin Updated",
  "role": "Staff"
}
```

---

### DELETE /accounts/:id
Delete account.

**Response (200):**
```json
{
  "message": "Account deleted."
}
```

---

## 📈 Dashboard Endpoint

### GET /dashboard
Get dashboard statistics.

**Response (200):**
```json
{
  "events": 25,
  "fundraisers": 12,
  "pendingApprovals": 5,
  "donationTotal": 450000,
  "donationCount": 45,
  "participants": 487,
  "achievements": 120
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "message": "Error description here"
}
```

Common status codes:
- **400** - Bad Request (missing fields, invalid data)
- **401** - Unauthorized (missing or invalid token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **409** - Conflict (duplicate email, already joined, etc.)
- **500** - Server Error

---

**Last Updated**: May 2026  
**API Version**: 1.0.0
