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
- Active, cancelled, waitlisted, completed, present, absent, and pending participant records
- A QR attendance test event named `Today Relief Packing QR Test`
- Approved and pending fundraisers
- Verified and submitted donations
- Feedback analytics data
- User notifications, achievements, and activity logs

## QR Attendance Test

Login as `user@bayanihanhub.test`, open the Dashboard, and scan:

```text
DEMO-TODAY-QR
```

The dashboard chooses the joined event that has already started. Staff/Admin can also open Events, choose the QR action for an event that has started, and copy the full `eventId:token` payload.

## Important

The in-memory database resets when the backend server restarts. Use a real MongoDB connection if you need persistent data.
