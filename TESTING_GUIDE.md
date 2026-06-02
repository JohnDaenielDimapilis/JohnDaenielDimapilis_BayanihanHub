# 🧪 Testing Guide

## Test Environment Setup

Before testing, ensure:
1. Backend running on http://localhost:5000
2. Frontend running on http://localhost:5173
3. MongoDB connected and seeded with demo data
4. Demo accounts created (see SETUP_GUIDE.md)

---

## Manual Testing Checklist

### 🔐 Authentication Tests

- [ ] **Register New Account**
  - Navigate to `/register`
  - Fill in name, email, password
  - Submit
  - ✅ Expected: Redirected to dashboard

- [ ] **Login with Valid Credentials**
  - Navigate to `/login`
  - Enter `admin@bayanihanhub.test` / `Password123`
  - ✅ Expected: Logged in, token stored in localStorage

- [ ] **Login with Invalid Credentials**
  - Enter wrong email/password
  - ✅ Expected: Error message displayed

- [ ] **Session Persistence**
  - Login, refresh page
  - ✅ Expected: Still logged in, data preserved

- [ ] **Logout**
  - Click Logout button
  - ✅ Expected: Redirected to login, session cleared

---

### 📅 Event Management Tests

#### Admin Account: `admin@bayanihanhub.test`

- [ ] **View Events List**
  - Navigate to Events
  - ✅ Expected: See all events (Pending, Approved, Rejected)

- [ ] **Approve Event**
  - Find Pending event
  - Click Approve
  - ✅ Expected: Status changes to Approved

- [ ] **Reject Event**
  - Find Pending event
  - Click Reject
  - ✅ Expected: Status changes to Rejected

#### Staff Account: `staff@bayanihanhub.test`

- [ ] **Create Event**
  - Navigate to Events
  - Fill in event form
  - Submit
  - ✅ Expected: Event created with Pending status

- [ ] **View Own Events**
  - Logged in as staff
  - ✅ Expected: See all events created

- [ ] **Edit Event**
  - Click Edit on own event
  - Change a field
  - Submit
  - ✅ Expected: Event updated, status reset to Pending

#### User Account: `user@bayanihanhub.test`

- [ ] **View Only Approved Events**
  - Navigate to Events
  - ✅ Expected: See only Approved events, no Pending

- [ ] **Cannot Create Events**
  - No form visible for users
  - ✅ Expected: Form hidden for User role

---

### 👥 Participant Management Tests

#### User Account Tests

- [ ] **Join Event**
  - View approved event
  - Click "Join"
  - ✅ Expected: Joined event, participation recorded

- [ ] **Cannot Join Twice**
  - Try joining same event again
  - ✅ Expected: Error message "already joined"

- [ ] **Cannot Exceed Capacity**
  - Event limit reached
  - Try to join
  - ✅ Expected: Error "participant limit reached"

#### Staff Account Tests

- [ ] **View Participants**
  - Navigate to Participants
  - ✅ Expected: See all participants of own events

- [ ] **Mark Attendance**
  - Select participant
  - Mark as Present/Absent
  - ✅ Expected: Attendance updated

---

### 💚 Fundraiser & Donation Tests

#### Staff Account Tests

- [ ] **Create Fundraiser**
  - Navigate to Fundraisers
  - Fill form, submit
  - ✅ Expected: Fundraiser created with Pending status

#### Admin Account Tests

- [ ] **Approve Fundraiser**
  - Find Pending fundraiser
  - Click Approve
  - ✅ Expected: Status changes to Approved

#### User Account Tests

- [ ] **Submit Donation**
  - Go to Donations
  - Select fundraiser, enter amount
  - Submit
  - ✅ Expected: Donation recorded

- [ ] **View Donation History**
  - See own donations in list
  - ✅ Expected: Only see personal donations

---

### 💬 Feedback Tests

#### User Account Tests

- [ ] **Submit Feedback**
  - Must have joined event
  - Navigate to Feedback
  - Fill form with rating and comment
  - Submit
  - ✅ Expected: Feedback recorded

- [ ] **Cannot Submit Twice**
  - Try submitting feedback for same event
  - ✅ Expected: Error "already submitted feedback"

#### Staff Account Tests

- [ ] **View Feedback**
  - Navigate to Feedback
  - ✅ Expected: See feedback for own events only

---

### 🏆 Achievement Tests

#### User Account Tests

- [ ] **Auto-Generate Badges**
  - After joining event: "Event Participant" badge appears
  - After donating: "Donor" badge appears
  - After feedback: "Feedback Contributor" badge appears
  - ✅ Expected: Badges auto-generate

- [ ] **Track Points**
  - Join event (10 pts)
  - Donate (10 pts)
  - Submit feedback (5 pts)
  - ✅ Expected: Points calculated correctly

---

### 📊 Reports Tests

#### Admin Account Tests

- [ ] **Dashboard Statistics**
  - Go to Dashboard
  - ✅ Expected: See correct event, fundraiser, donation counts

- [ ] **Detailed Reports**
  - Navigate to Reports
  - ✅ Expected: See breakdown by status, totals, trends

#### Staff Account Tests

- [ ] **Staff Reports**
  - View Reports
  - ✅ Expected: See only own events' statistics

---

### 📝 Logs & Security Tests

#### Admin Account Tests

- [ ] **View Activity Logs**
  - Navigate to Logs
  - ✅ Expected: See all user actions (login, create, update, delete)

- [ ] **View Security Logs**
  - Go to Security
  - ✅ Expected: See failed logins, unauthorized attempts

- [ ] **View Security Summary**
  - Dashboard shows failed login count
  - ✅ Expected: Matches actual failed attempts

---

### 👥 Account Management Tests

#### Admin Account Tests

- [ ] **List Accounts**
  - Navigate to Accounts
  - ✅ Expected: See all user accounts

- [ ] **Create Account**
  - Click Create
  - Fill form, submit
  - ✅ Expected: New account created with role

- [ ] **Update Account**
  - Edit user details
  - ✅ Expected: Changes saved

- [ ] **Deactivate Account**
  - Toggle active status
  - ✅ Expected: User cannot login

- [ ] **Delete Account**
  - Delete account
  - ✅ Expected: Account removed from system

---

## API Testing with cURL

### Setup
```bash
# Login to get token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@bayanihanhub.test",
    "password": "Password123"
  }'
```

Save the returned token: `TOKEN="your_jwt_token_here"`

### Test API Endpoints

**Get Current User:**
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

**Get Events:**
```bash
curl -X GET http://localhost:5000/api/events \
  -H "Authorization: Bearer $TOKEN"
```

**Create Event (Staff):**
```bash
curl -X POST http://localhost:5000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Test Event",
    "description": "Test description",
    "date": "2026-06-15",
    "location": "Test Location",
    "participantLimit": 100
  }'
```

**Approve Event (Admin):**
```bash
curl -X PATCH http://localhost:5000/api/events/<EVENT_ID>/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

**Join Event (User):**
```bash
curl -X POST http://localhost:5000/api/participants/events/<EVENT_ID>/join \
  -H "Authorization: Bearer $USER_TOKEN"
```

**Submit Donation:**
```bash
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fundraiserId": "<FUNDRAISER_ID>",
    "amount": 5000,
    "donationType": "Cash",
    "donationPurpose": "Test",
    "paymentReference": "TEST-001"
  }'
```

**Get Dashboard:**
```bash
curl -X GET http://localhost:5000/api/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## Performance Testing

### Load Testing
Test with multiple concurrent users:
```bash
# Using Apache Bench (ab)
ab -n 100 -c 10 http://localhost:5000/api/health

# Using hey
hey -n 100 -c 10 http://localhost:5000/api/health
```

### Expected Response Times
- Health check: < 100ms
- List events: < 200ms
- Create event: < 500ms
- Dashboard: < 300ms

### Expected Success Rate
- ✅ 99.9% for all endpoints
- ✅ 100% for health checks

---

## Browser Testing

### Tested Browsers
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### Responsive Design Tests
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- ✅ All layouts should be responsive

---

## Edge Case Testing

- [ ] Empty database
- [ ] Rapid multiple requests
- [ ] Invalid ObjectIds
- [ ] Missing required fields
- [ ] Invalid date formats
- [ ] Negative numbers
- [ ] XSS injection attempts
- [ ] SQL injection in search (if applicable)

---

## Regression Testing Checklist

After any code changes, test:
- [ ] All authentication flows
- [ ] CRUD operations for each module
- [ ] Role-based access control
- [ ] Data validation
- [ ] Error messages
- [ ] API response formats
- [ ] Database transactions
- [ ] Session management

---

## Sample Test Data

### Demo Accounts (Pre-seeded)
```
Admin:  admin@bayanihanhub.test / Password123
Staff:  staff@bayanihanhub.test / Password123
User:   user@bayanihanhub.test / Password123
```

### Test Event Data
```
Title: Community Feeding Program
Date: 2026-06-15
Location: Barangay Hall
Limit: 100 participants
```

### Test Fundraiser Data
```
Title: School Supplies Drive
Target: PHP 90,000
Deadline: 2026-06-30
Purpose: Kits for 300 learners
```

---

## Known Limitations & Workarounds

### Issue: Concurrent Requests
Some race conditions with simultaneous requests
**Workaround**: Add small delay between requests in tests

### Issue: Email Uniqueness
Cannot test duplicate registration without clearing database
**Workaround**: Use new email for each test run

### Issue: Large File Uploads
No file upload functionality yet
**Planned**: Future enhancement

---

## Test Results Template

```
Test Date: _______________
Tester: ___________________
Environment: ______________
Browser: __________________

Features Tested:
- [ ] Authentication
- [ ] Events
- [ ] Fundraisers
- [ ] Donations
- [ ] Feedback
- [ ] Achievements
- [ ] Reports
- [ ] Logs
- [ ] Security
- [ ] Accounts

Issues Found:
1. ___________________________
2. ___________________________

Overall Status: PASS / FAIL
```

---

## Continuous Integration (CI) Testing

For automated testing, run:
```bash
# Test backend
npm test --prefix server

# Test frontend
npm test --prefix client

# E2E testing (future enhancement)
npm run e2e
```

---

## Support

For test-related issues:
1. Check [SETUP_GUIDE.md](./SETUP_GUIDE.md) Troubleshooting
2. Review [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
3. Verify database seeding: `npm run seed --prefix server`

---

**Last Updated**: May 2026  
**Stable Version**: 1.0.0 ✅
