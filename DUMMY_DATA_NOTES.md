# Dummy Data Notes

These dummy records are for local testing and school review only.

## Demo Login Accounts

- Admin: `admin@bayanihanhub.test` / `Password123`
- Staff: `staff@bayanihanhub.test` / `Password123`
- User: `user@bayanihanhub.test` / `Password123`
- Extra users: `miguel@bayanihanhub.test`, `sofia@bayanihanhub.test`, and `banned@bayanihanhub.test`

## How Dummy Data Loads

If `server/.env` does not provide a working `MONGO_URI`, BayanihanHub starts an in-memory MongoDB server for local development. During that startup it seeds:

- User, Staff, Admin, and temporarily banned accounts
- User-visible events in Open, Full, Closed, Finished, and Cancelled states
- One Pending Review event for Approval Requests
- User-submitted Pending Review event and fundraiser proposals for the normal User account
- Event duration fields (`startDateTime`, `endDateTime`, `durationType`) and sample official event picture URLs
- Active, cancelled, waitlisted, completed, present, absent, and pending participant records
- A QR attendance test event named `Today Relief Packing QR Test`
- Approved and pending fundraisers with beneficiary/place fields and seeded fundraiser progress updates
- Verified and submitted donations with donor messages
- Feedback analytics data with sample review picture URLs
- User notifications, milestone achievements, and activity logs
- Achievement dummy data uses total-based badges only: `Level 1 Donator` from verified donation amount and `Level 2 Helper` from total events joined. No average or computed points are used.
- Staff can review the seeded user-submitted event and fundraiser proposals; staff-created proposals remain for Admin review.

## QR Attendance Test

Login as `user@bayanihanhub.test`, open the Dashboard, and scan:

```text
DEMO-TODAY-QR
```

The dashboard chooses the joined event that has already started. Staff/Admin can also open Events, choose the QR action for an event that has started, and copy the full `eventId:token` payload.

## Important

The in-memory database resets when the backend server restarts. Use a real MongoDB connection if you need persistent data.
