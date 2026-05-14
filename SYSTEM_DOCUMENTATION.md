# BayanihanHub

## System Documentation

**System Name:** BayanihanHub  
**System Type:** Web-based foundation event and fundraising management platform  
**Technology Stack:** React.js, Vite, HTML5, JavaScript ES6+, Tailwind CSS, Node.js, Express.js, MongoDB, Mongoose, JWT, bcryptjs, GitHub, and Vercel  
**Prepared by:** [Insert prepared by]  
**Institution / Organization:** [Insert institution or organization]  
**Date:** [Insert date]  
**Version:** 1.0  

---

## Table of Contents

1. Introduction  
2. Project Background  
3. Objectives of the System  
   3.1 General Objective  
   3.2 Specific Objectives  
4. Scope and Limitations  
5. Technologies, Languages, and Tools Used  
   5.1 Backend Language  
   5.2 Database  
   5.3 HTML  
   5.4 CSS  
   5.5 JavaScript  
   5.6 Supporting Tools  
6. System Architecture  
   6.1 Presentation Layer  
   6.2 Application / Backend Layer  
   6.3 Database Layer  
   6.4 Optional Integration or Automation Layer  
7. System Actors and User Roles  
8. Functional Requirements  
9. Non-Functional Requirements  
10. Frontend Documentation  
11. Backend Documentation  
    11.1 Authentication and Session Management  
    11.2 Role-Based Access Control  
    11.3 Main System Processing  
    11.4 Data Validation  
    11.5 Notification Processing  
    11.6 Activity Log Recording  
    11.7 Report Generation  
12. Database Documentation  
13. System Functions and Modules  
14. Complete System Workflow  
15. Development Process from Start to Finish  
16. Testing Documentation  
17. Implementation and Deployment  
18. Security and Privacy Controls  
19. Reports and Monitoring  
20. Risk Management and Controls  
21. Maintenance Plan  
22. Documentation Standards  
23. Conclusion  
24. Appendices  

---

## 1. Introduction

BayanihanHub is a web-based foundation event and fundraising management platform designed to centralize the operational processes of a foundation. The system supports the management of events, fundraising campaigns, donation records, participant registration, feedback, achievements, reports, approval workflows, and activity logs. It is intended to provide Admin, Staff, and User roles with organized access to the functions that correspond to their responsibilities.

The system was developed to address the need for a more structured, accessible, transparent, and efficient way of managing foundation-related activities. In many foundation environments, information about events, volunteers, donors, donations, feedback, and reports may be handled through manual records, spreadsheets, messaging applications, or scattered files. These methods can make it difficult to monitor progress, verify approvals, retrieve records, and produce accurate reports.

BayanihanHub improves this process by providing a centralized digital platform where authorized users can create, view, approve, update, and monitor important foundation records. The system helps Staff organize operational activities, helps Admin users review and approve critical records, and helps regular Users participate in approved events, contribute donations, submit feedback, and view their achievements.

---

## 2. Project Background

Before the implementation of BayanihanHub, foundation activities may be managed through traditional or semi-manual methods such as paper forms, printed attendance sheets, spreadsheet files, group chats, email threads, and separate donation records. While these methods can support small operations, they may become inefficient as the number of events, participants, donors, and reports increases.

Common challenges in the current process include difficulty tracking event approvals, limited visibility of participant records, inconsistent donation monitoring, delayed report preparation, and lack of centralized activity history. Manual processes can also result in duplicate records, missing information, delayed communication, and difficulty identifying who performed a specific action.

BayanihanHub was proposed to provide a centralized digital solution for foundation event and fundraising management. The system is designed to organize major records in one platform, enforce role-based access, provide approval workflows, and maintain activity logs for accountability.

The expected improvement from using BayanihanHub includes faster access to records, clearer role responsibilities, improved monitoring of events and fundraisers, better donation tracking, easier report generation, and improved transparency in administrative decisions.

---

## 3. Objectives of the System

### 3.1 General Objective

The general objective of the project is to develop BayanihanHub, a web-based foundation event and fundraising management platform, that helps foundation administrators, staff members, volunteers, donors, and participants manage, access, monitor, and process foundation events, fundraising campaigns, donations, feedback, achievements, reports, and logs in a more organized and efficient manner.

### 3.2 Specific Objectives

1. To provide a secure login and role-based access system for Admin, Staff, and User accounts.
2. To allow Staff users to create and manage foundation event records.
3. To allow Admin users to approve or reject submitted events before they become visible to Users.
4. To allow Staff users to create and manage fundraising campaign records.
5. To allow Admin users to approve or reject submitted fundraising campaigns before they become available for donations.
6. To allow Users to view approved events and join events as participants.
7. To allow Users to donate to approved fundraising campaigns.
8. To allow Users to submit event feedback and view achievement records.
9. To provide dashboards that summarize important information for each user role.
10. To generate reports for monitoring, evaluation, and decision-making.
11. To maintain activity logs and security-related logs for accountability and traceability.
12. To improve the usability, accessibility, maintainability, and reliability of the foundation management process.

---

## 4. Scope and Limitations

### Scope

BayanihanHub covers the following system functions:

- User registration and login.
- Role-based access control for Admin, Staff, and User roles.
- Public pages including Landing Page, About Page, Login Page, and Register Page.
- Shared authenticated pages including Dashboard, Profile, Events, Fundraising, Feedback, and Achievements.
- Admin pages including Admin Dashboard, Manage Users, Approve Events, Approve Fundraisers, Reports, Activity Logs, and Security Logs.
- Staff pages including Staff Dashboard, Create Event, Manage Events, Create Fundraiser, Manage Fundraisers, Participant Records, Feedback Records, and Submit Report.
- User pages including User Dashboard, Browse Events, My Joined Events, Donate, My Donations, My Achievements, and Submit Feedback.
- Event record creation, viewing, updating, deletion, joining, approval, and rejection.
- Fundraiser record creation, viewing, updating, deletion, approval, and rejection.
- Donation recording for approved fundraising campaigns.
- Feedback submission and viewing.
- Achievement tracking.
- Summary reports, event reports, fundraising reports, and participation reports.
- Activity logs and security-related logs.
- Demo login accounts for role-based inspection while the database is not yet configured.

### Limitations

The following limitations apply to the current version of BayanihanHub:

- The system depends on correct and complete user input.
- The system requires internet access when hosted online.
- Database-backed account creation, login, and persistent records require a configured MongoDB connection string.
- The current prototype does not include a live payment gateway integration.
- The current prototype does not include automatic real-world attendance verification.
- Notifications are represented through system messages and workflow status updates; a full notification delivery service may be added in future development.
- The system does not replace human decision-making. Admin approval is still required for events and fundraisers.
- Advanced cybersecurity monitoring, formal audit services, payroll, tax computation, and full accounting functions are outside the scope of the current prototype.
- Actual testing results, evaluation scores, and respondent data must be inserted after formal system testing and evaluation.

---

## 5. Technologies, Languages, and Tools Used

| Technology / Language | Purpose in the System |
|---|---|
| HTML5 | Structures web pages, forms, dashboards, tables, navigation, and visible page content. |
| CSS / Tailwind CSS | Provides layout, colors, spacing, typography, responsive design, status badges, cards, buttons, and dashboard styling. |
| JavaScript ES6+ | Handles frontend logic, interactivity, form behavior, routing, API calls, and dynamic rendering. |
| React.js | Builds reusable frontend components and page-based user interfaces. |
| Vite | Provides the frontend development server and production build process. |
| Node.js | Runs the backend JavaScript environment. |
| Express.js | Handles REST API routes, middleware, request processing, and error handling. |
| MongoDB | Stores system data such as users, events, fundraisers, donations, feedback, achievements, reports, and logs. |
| Mongoose | Defines database schemas and manages MongoDB operations in the backend. |
| JWT | Provides token-based authentication for protected routes. |
| bcryptjs | Hashes user passwords before storing them. |
| express-validator | Validates request inputs before backend processing. |
| Helmet | Adds basic HTTP security headers. |
| CORS | Controls which frontend origins may access the backend API. |
| Git and GitHub | Supports version control, repository hosting, and source code management. |
| Vercel | Provides hosting and deployment for the web application. |
| npm | Manages project dependencies and scripts. |

### 5.1 Backend Language

The backend of BayanihanHub uses Node.js with Express.js. This backend layer processes user requests, validates inputs, manages authentication, applies role-based access control, connects to the MongoDB database, handles event and fundraiser approvals, records donations and feedback, generates reports, and creates activity logs.

### 5.2 Database

BayanihanHub uses MongoDB with Mongoose. The database stores user accounts, roles, event records, fundraising campaigns, donations, feedback, achievements, activity logs, and generated reports. MongoDB provides a flexible document-based structure suitable for managing records with related references such as users, events, fundraisers, and reports.

### 5.3 HTML

HTML is used to structure the visible parts of the system, including pages, forms, dashboards, tables, cards, headings, buttons, and navigation elements. In the React frontend, JSX is used to write HTML-like structures inside JavaScript components.

### 5.4 CSS

CSS, implemented through Tailwind CSS utility classes, is used to design the visual appearance of BayanihanHub. It controls layout, spacing, colors, typography, rounded cards, responsive sidebars, buttons, status badges, and mobile-friendly page behavior.

### 5.5 JavaScript

JavaScript is used on both the frontend and backend. On the frontend, JavaScript controls routing, form validation, local demo authentication, API requests, dynamic dashboards, and interactive components. On the backend, JavaScript processes requests, validates data, connects to the database, manages authentication, and enforces business rules.

### 5.6 Supporting Tools

The project uses GitHub for repository hosting, Vercel for deployment, npm for dependency management, and the browser for local and hosted system testing. MongoDB Atlas may be used as the hosted database provider. Additional tools such as diagramming software, Figma, or presentation software may be used for documentation, design mockups, and capstone presentation materials.

---

## 6. System Architecture

BayanihanHub follows a layered web application architecture. The frontend provides the user interface, the backend processes system logic, and the database stores system records. Communication between the frontend and backend is performed through RESTful API endpoints.

### 6.1 Presentation Layer

The presentation layer is the user-facing part of the system. It includes public pages, authenticated dashboards, forms, tables, side navigation, buttons, status labels, summary cards, and other visual components. This layer is built using React.js, Vite, HTML5, JavaScript, and Tailwind CSS.

### 6.2 Application / Backend Layer

The backend layer processes user actions and system requests. It validates data, handles authentication, applies role-based access control, manages approval workflows, records activity logs, generates reports, and connects the frontend to the database. This layer is built using Node.js, Express.js, JWT, bcryptjs, middleware, controllers, routes, services, and utility functions.

### 6.3 Database Layer

The database layer stores and manages all persistent system data. It includes collections for users, events, fundraisers, donations, feedback, achievements, activity logs, and reports. This layer uses MongoDB and Mongoose schemas.

### 6.4 Optional Integration or Automation Layer

The current version supports web deployment through Vercel and database connectivity through MongoDB. Future integrations may include payment gateway processing, email notifications, SMS notifications, QR-based attendance verification, scheduled report generation, and automated backup services.

**Figure 1. System Architecture of BayanihanHub**  
[Insert system architecture diagram]

---

## 7. System Actors and User Roles

| Actor / User Role | Description | Main Functions | Access Restrictions |
|---|---|---|---|
| General User | A volunteer, donor, member, or participant who interacts with approved foundation activities. | Register, log in, view approved events, join events, donate to fundraisers, submit feedback, view donations, and view achievements. | Cannot approve records, manage users, view security logs, or access Admin and Staff management functions. |
| Staff | An internal foundation worker responsible for operational management. | Create events, manage events, create fundraisers, manage fundraisers, monitor participants, view feedback records, view donations, and submit reports. | Cannot manage user roles, approve final public visibility unless given Admin authority, or view security logs. |
| Administrator | The highest authority in the system. | Manage users, approve or reject events and fundraisers, view reports, view dashboards, view activity logs, and monitor security logs. | Has broad administrative access but must still follow authentication and validation rules. |
| System Visitor | A non-authenticated visitor accessing the public pages. | View landing page, about page, login page, and registration page. | Cannot access protected dashboard pages or system records. |

---

## 8. Functional Requirements

| Requirement ID | Functional Requirement | Description | Actor / User Role | Expected Output |
|---|---|---|---|---|
| FR-01 | User Registration | The system shall allow new users to create an account using full name, email, and password. | User | New account record or validation message. |
| FR-02 | User Login | The system shall allow registered users to log in using valid credentials. | Admin, Staff, User | Authenticated session and role-based dashboard access. |
| FR-03 | Demo Login | The system shall provide dummy demo accounts for Admin, Staff, and User dashboard inspection when the database is not configured. | System Visitor | Local demo session and dashboard access. |
| FR-04 | Role-Based Access Control | The system shall restrict functions and pages based on user role. | Admin, Staff, User | Authorized access or restricted access response. |
| FR-05 | User Profile Viewing | The system shall allow authenticated users to view profile details. | Admin, Staff, User | Displayed profile information. |
| FR-06 | Dashboard Display | The system shall display role-specific dashboard cards and summaries. | Admin, Staff, User | Dashboard with relevant statistics and records. |
| FR-07 | User Management | The system shall allow Admin users to view users and update account status or role. | Admin | Updated user account information. |
| FR-08 | Event Creation | The system shall allow Admin or Staff users to create event records. | Admin, Staff | Pending event record. |
| FR-09 | Event Viewing | The system shall allow users to view event records according to role and status. | Admin, Staff, User | Event list or event details. |
| FR-10 | Event Updating | The system shall allow authorized users to update event details. | Admin, Staff | Updated event record. |
| FR-11 | Event Deletion | The system shall allow authorized users to delete event records. | Admin, Staff | Deleted event record confirmation. |
| FR-12 | Event Approval | The system shall allow Admin users to approve or reject submitted events. | Admin | Updated event status and approval log. |
| FR-13 | Event Joining | The system shall allow Users to join approved or active events. | User | Participant registration record. |
| FR-14 | Fundraiser Creation | The system shall allow Admin or Staff users to create fundraiser records. | Admin, Staff | Pending fundraiser record. |
| FR-15 | Fundraiser Approval | The system shall allow Admin users to approve or reject submitted fundraisers. | Admin | Updated fundraiser status and approval log. |
| FR-16 | Donation Recording | The system shall allow Users to donate to approved fundraisers. | User | Donation record and updated fundraiser amount. |
| FR-17 | Feedback Submission | The system shall allow Users to submit event feedback with rating and comment. | User | Feedback record. |
| FR-18 | Feedback Viewing | The system shall allow authorized users to view feedback records. | Admin, Staff | Feedback table or summary. |
| FR-19 | Achievement Management | The system shall allow authorized users to create and view achievements. | Admin, Staff, User | Achievement records. |
| FR-20 | Report Generation | The system shall generate summary, event, fundraising, and participation reports. | Admin, Staff | Report data and stored report record. |
| FR-21 | Activity Logs | The system shall record important actions such as login, registration, approvals, donations, feedback, and report generation. | System, Admin | Activity log entries. |
| FR-22 | Security Logs | The system shall provide filtered security-related logs. | Admin | Security log table. |
| FR-23 | Status Messages | The system shall display validation, success, warning, and error messages. | Admin, Staff, User | Clear user-facing message. |
| FR-24 | Logout | The system shall allow authenticated users to end the current session. | Admin, Staff, User | Cleared session and return to login page. |

---

## 9. Non-Functional Requirements

| Requirement ID | Non-Functional Requirement | Description | Measurement / Standard |
|---|---|---|---|
| NFR-01 | Usability | The system shall provide clear pages, labels, navigation, and forms for all supported roles. | Users can identify and use major functions with minimal instruction. |
| NFR-02 | Performance | The system shall load pages and API responses efficiently under normal usage. | [Insert performance benchmark] |
| NFR-03 | Reliability | The system shall handle validation, authentication, authorization, and database errors gracefully. | Meaningful error messages and no unhandled user-facing crashes. |
| NFR-04 | Security | The system shall protect accounts and routes through hashed passwords, JWT authentication, and role-based access. | Passwords are not stored in plain text; protected endpoints require valid authorization. |
| NFR-05 | Maintainability | The system shall use modular folders for components, pages, routes, controllers, models, middleware, services, and utilities. | Code is organized according to documented structure. |
| NFR-06 | Scalability | The system shall allow future modules such as notifications, payment integration, and attendance verification. | Modular design supports future expansion. |
| NFR-07 | Availability | The deployed system shall be accessible through its hosting environment when services are available. | [Insert uptime target] |
| NFR-08 | Compatibility | The system shall run in modern web browsers and support responsive layouts. | Chrome, Edge, Firefox, and mobile browser checks: [Insert test result] |
| NFR-09 | Data Integrity | The system shall validate required fields and valid status values before saving records. | Invalid inputs are rejected before database persistence. |
| NFR-10 | Auditability | The system shall record important actions in activity logs. | Log records include activity type, description, IP address, user reference, and timestamp. |
| NFR-11 | Responsiveness | The interface shall adapt to desktop and mobile screen sizes. | Layout remains usable across common breakpoints. |
| NFR-12 | Privacy | The system shall avoid exposing password hashes and sensitive configuration values. | API responses exclude password fields; secrets use environment variables. |
| NFR-13 | Error Handling | The system shall return clear errors for missing configuration, invalid input, and unauthorized access. | Error responses include a readable message and appropriate HTTP status. |
| NFR-14 | Backup and Recovery | The system database should be backed up according to the organization's data policy. | [Insert backup schedule and recovery procedure] |
| NFR-15 | Accessibility | The system shall provide accessible labels, skip links, readable contrast, keyboard focus states, and semantic form controls. | Accessibility review: [Insert test result] |

---

## 10. Frontend Documentation

The frontend of BayanihanHub is the part of the system that users see and interact with. It is built using React.js, Vite, JavaScript, HTML5, and Tailwind CSS. The frontend provides public pages, protected dashboards, forms, tables, summary cards, status labels, and role-specific navigation.

The system uses a clean dashboard layout, sidebar navigation, responsive design, cards for summaries, tables for records, clear buttons, consistent colors, status labels, and mobile-friendly navigation. Accessibility improvements include labels, focus states, skip links, and semantic form fields.

### Landing Page

**Purpose:** Introduces BayanihanHub and summarizes the purpose of the system.  
**Actors:** System Visitor, Admin, Staff, User.  
**Main Components:** Logo, navigation, hero section, feature cards, call-to-action buttons.  
**User Action:** Visitor reads system information and selects Register, Login, or About.  
**System Response:** The system navigates to the selected page.

### About Page

**Purpose:** Explains the project overview, objectives, and proposal context.  
**Actors:** System Visitor, Admin, Staff, User.  
**Main Components:** System overview, objective cards, explanatory sections.  
**User Action:** Visitor reviews information about BayanihanHub.  
**System Response:** The system displays the background and objectives.

### Login Page

**Purpose:** Allows users to authenticate and access role-specific dashboards.  
**Actors:** Admin, Staff, User, System Visitor.  
**Main Components:** Email field, password field, show/hide password button, demo credential cards, login button, validation messages.  
**User Action:** User enters credentials or selects a demo account and clicks Login.  
**System Response:** The system authenticates the user and redirects to the proper dashboard.

### Registration Page

**Purpose:** Allows new users to create an account when the database is configured.  
**Actors:** System Visitor.  
**Main Components:** Full name field, email field, password field, show/hide password button, register button, validation messages.  
**User Action:** Visitor submits account details.  
**System Response:** The system creates a new account or displays a validation/configuration message.

### Shared Dashboard Redirect Page

**Purpose:** Redirects authenticated users to their correct role dashboard.  
**Actors:** Admin, Staff, User.  
**Main Components:** Route logic.  
**User Action:** User opens `/dashboard`.  
**System Response:** The system redirects to Admin Dashboard, Staff Dashboard, or User Dashboard.

### Profile Page

**Purpose:** Displays account profile information.  
**Actors:** Admin, Staff, User.  
**Main Components:** Profile card, account status badge, role label, created date, updated date.  
**User Action:** User views profile details.  
**System Response:** The system displays the authenticated user's profile.

### Events Page

**Purpose:** Displays approved foundation events.  
**Actors:** Admin, Staff, User.  
**Main Components:** Event cards, event date, location, capacity, status badge.  
**User Action:** User reviews approved events.  
**System Response:** The system displays event information.

### Fundraising Page

**Purpose:** Displays approved fundraising campaigns.  
**Actors:** Admin, Staff, User.  
**Main Components:** Fundraiser cards, progress bar, target amount, current amount, status badge, donation link.  
**User Action:** User reviews fundraising campaigns.  
**System Response:** The system displays campaign information.

### Feedback Page

**Purpose:** Displays feedback records for authorized users.  
**Actors:** Admin, Staff.  
**Main Components:** Data table, rating, comment, event name, submitted user, date.  
**User Action:** User reviews submitted feedback.  
**System Response:** The system displays feedback records.

### Achievements Page

**Purpose:** Displays achievement records.  
**Actors:** Admin, Staff, User.  
**Main Components:** Achievement table, title, type, description, earned date.  
**User Action:** User reviews achievements.  
**System Response:** The system displays achievement records.

### Admin Dashboard

**Purpose:** Provides administrative monitoring and system overview.  
**Actors:** Admin.  
**Main Components:** Summary cards, recent feedback table, recent logs table.  
**User Action:** Admin monitors events, fundraisers, donations, users, participants, logs, and feedback.  
**System Response:** The system displays administrative summaries.

### Manage Users Page

**Purpose:** Allows Admin users to manage user accounts.  
**Actors:** Admin.  
**Main Components:** User table, role display, status badge, role/status action buttons.  
**User Action:** Admin changes role or status.  
**System Response:** The system updates account information and records activity.

### Approve Events Page

**Purpose:** Allows Admin users to approve or reject event submissions.  
**Actors:** Admin.  
**Main Components:** Event approval table, status badges, approve button, reject button.  
**User Action:** Admin approves or rejects an event.  
**System Response:** The system updates event status and logs the approval action.

### Approve Fundraisers Page

**Purpose:** Allows Admin users to approve or reject fundraiser submissions.  
**Actors:** Admin.  
**Main Components:** Fundraiser approval table, target amount, end date, status badge, approve button, reject button.  
**User Action:** Admin approves or rejects a fundraiser.  
**System Response:** The system updates fundraiser status and logs the approval action.

### Reports Page

**Purpose:** Allows Admin users to generate system reports.  
**Actors:** Admin.  
**Main Components:** Report cards, generated report display, JSON report preview.  
**User Action:** Admin selects a report type.  
**System Response:** The system generates and stores the report.

### Activity Logs Page

**Purpose:** Displays system activity records.  
**Actors:** Admin.  
**Main Components:** Activity log table, activity type, description, IP address, timestamp.  
**User Action:** Admin reviews activity history.  
**System Response:** The system displays activity logs.

### Security Logs Page

**Purpose:** Displays security-related logs.  
**Actors:** Admin.  
**Main Components:** Security log table, login activity, approval activity, account-related events.  
**User Action:** Admin reviews security events.  
**System Response:** The system displays filtered security logs.

### Staff Dashboard

**Purpose:** Provides operational summaries for Staff users.  
**Actors:** Staff.  
**Main Components:** Managed events count, pending events count, raised amount, feedback count, upcoming events table.  
**User Action:** Staff monitors operations.  
**System Response:** The system displays operational summaries.

### Create Event Page

**Purpose:** Allows Staff users to submit new event records.  
**Actors:** Staff.  
**Main Components:** Event title, description, location, date, capacity, submit button.  
**User Action:** Staff submits event details.  
**System Response:** The system creates a pending event record.

### Manage Events Page

**Purpose:** Allows Staff users to monitor event records.  
**Actors:** Staff.  
**Main Components:** Event table, date, location, participant count, status badge.  
**User Action:** Staff reviews events.  
**System Response:** The system displays event records.

### Create Fundraiser Page

**Purpose:** Allows Staff users to submit new fundraiser records.  
**Actors:** Staff.  
**Main Components:** Campaign title, description, target amount, start date, end date, submit button.  
**User Action:** Staff submits fundraiser details.  
**System Response:** The system creates a pending fundraiser record.

### Manage Fundraisers Page

**Purpose:** Allows Staff users to monitor fundraiser records.  
**Actors:** Staff.  
**Main Components:** Fundraiser table, current amount, target amount, end date, status badge.  
**User Action:** Staff reviews fundraiser records.  
**System Response:** The system displays fundraiser records.

### Participant Records Page

**Purpose:** Displays participant information for foundation events.  
**Actors:** Staff.  
**Main Components:** Participant table, event title, participant name, email, event status.  
**User Action:** Staff reviews participant records.  
**System Response:** The system displays participant information.

### Submit Report Page

**Purpose:** Allows Staff users to submit operational reports.  
**Actors:** Staff.  
**Main Components:** Report title, report type, summary, recommendations, submit button.  
**User Action:** Staff submits report information.  
**System Response:** The system stores the report and logs the action.

### User Dashboard

**Purpose:** Provides user-specific summaries for volunteers, donors, and participants.  
**Actors:** User.  
**Main Components:** Approved events count, donation total, achievements count, upcoming events table.  
**User Action:** User monitors participation and contribution history.  
**System Response:** The system displays user summaries.

### Browse Events Page

**Purpose:** Allows Users to view and join approved events.  
**Actors:** User.  
**Main Components:** Event cards, join button, status badge.  
**User Action:** User clicks Join Event.  
**System Response:** The system records the user as a participant if capacity and status rules allow it.

### My Joined Events Page

**Purpose:** Displays events joined by the current user.  
**Actors:** User.  
**Main Components:** Joined event table, location, date, status.  
**User Action:** User reviews participation history.  
**System Response:** The system displays joined events.

### Donate Page

**Purpose:** Allows Users to record donations to approved fundraisers.  
**Actors:** User.  
**Main Components:** Fundraiser selection, amount field, payment method field, donation button, fundraiser cards.  
**User Action:** User submits donation details.  
**System Response:** The system records the donation and updates fundraiser progress.

### My Donations Page

**Purpose:** Displays donation history for the current user.  
**Actors:** User.  
**Main Components:** Donation table, fundraiser, amount, payment method, status, date.  
**User Action:** User reviews donation records.  
**System Response:** The system displays donation history.

### Submit Feedback Page

**Purpose:** Allows Users to submit event feedback.  
**Actors:** User.  
**Main Components:** Event selector, rating selector, comment field, submit button.  
**User Action:** User submits feedback.  
**System Response:** The system records the feedback and logs the action.

---

## 11. Backend Documentation

The backend of BayanihanHub processes user actions, validates data, connects to the database, enforces access control, and generates system outputs. It follows a RESTful API structure with separated routes, controllers, middleware, models, services, and utilities.

### 11.1 Authentication and Session Management

The system uses JWT authentication for backend sessions. During successful login, the backend returns a token and sanitized user object. The token is stored by the frontend and sent in the `Authorization` header for protected API requests. Passwords are hashed using bcryptjs before storage. The frontend also supports local demo sessions for Admin, Staff, and User accounts while the database is not configured.

Unauthorized access is prevented by authentication middleware that verifies the token, checks the user record, and rejects inactive or unauthorized users.

### 11.2 Role-Based Access Control

Role-based access control is implemented through middleware that checks whether the authenticated user role is allowed to access a route. Admin-only routes reject Staff and User accounts. Staff routes reject regular User accounts when the function is operational or administrative. User routes restrict access to participant, donation, feedback, and achievement functions.

### 11.3 Main System Processing

The backend processes events, fundraisers, donations, feedback, achievements, reports, users, and logs. Staff users can create operational records. Admin users can approve or reject events and fundraisers. Users can join approved events, donate to approved fundraisers, submit feedback, and view their achievements.

### 11.4 Data Validation

The backend uses validation middleware to check required fields, email format, password length, valid MongoDB IDs, valid status values, valid dates, positive capacity values, positive donation amounts, and valid feedback ratings. Invalid requests are rejected before database processing.

### 11.5 Notification Processing

The current version uses user-facing notices and status messages to communicate validation errors, successful actions, warnings, and configuration issues. A full notification delivery module such as email, SMS, or in-app notifications is recommended for future development.

### 11.6 Activity Log Recording

Important user actions are recorded in the ActivityLog collection. These actions include registration, login, failed login attempts, account updates, event creation, event approval, event rejection, fundraiser creation, fundraiser approval, fundraiser rejection, donations, feedback submission, achievements, and report generation. Activity logs support accountability and traceability.

### 11.7 Report Generation

Reports are generated through backend report services. The system supports summary reports, event reports, fundraising reports, and participation reports. Report records are stored in the database and associated with the user who generated them.

---

## 12. Database Documentation

The database stores all data needed by BayanihanHub. The current implementation uses MongoDB collections managed through Mongoose models.

| Table / Collection Name | Purpose | Important Fields | Relationship |
|---|---|---|---|
| users | Stores account information and role assignments. | fullName, email, password, role, status, createdAt, updatedAt | A user may create events, create fundraisers, donate, submit feedback, receive achievements, and generate reports. |
| events | Stores event records and participant lists. | eventTitle, description, location, eventDate, capacity, status, createdBy, approvedBy, participants | An event is created by a user, approved by an Admin, and may have many participants. |
| fundraisers | Stores fundraising campaign records. | campaignTitle, description, targetAmount, currentAmount, startDate, endDate, status, createdBy, approvedBy | A fundraiser is created by a user, approved by an Admin, and may receive many donations. |
| donations | Stores donation records. | donorId, fundraiserId, donationAmount, paymentMethod, donationStatus, createdAt | A donation belongs to one donor and one fundraiser. |
| feedback | Stores user feedback for events. | userId, eventId, rating, comment, createdAt | Feedback belongs to one user and one event. |
| achievements | Stores achievement records assigned to users. | userId, achievementTitle, description, achievementType, earnedDate | An achievement belongs to one user. |
| activitylogs | Stores activity and security-related actions. | userId, activityType, description, ipAddress, createdAt | A log may belong to one user and records important system actions. |
| reports | Stores generated report data. | reportTitle, reportType, generatedBy, reportData, createdAt | A report is generated by one user and contains summarized system data. |

Major relationships include:

- A user has one role value.
- A user may create many events or fundraisers.
- A user may join many events.
- An event may have many participants.
- A fundraiser may have many donation records.
- A donation belongs to a donor and a fundraiser.
- Feedback belongs to a user and an event.
- Activity logs record user actions.
- Reports are generated from stored system records.

**Figure 2. Entity Relationship Diagram of BayanihanHub**  
[Insert database diagram]

---

## 13. System Functions and Modules

### Login and Authentication Module

**Purpose:** Authenticates users and creates secure sessions.  
**Actors:** Admin, Staff, User.  
**Required Input:** Email and password.  
**System Process:** The system validates credentials, checks demo accounts or backend records, and creates a session.  
**Expected Output:** Authenticated user session and role-based dashboard access.

### User Registration Module

**Purpose:** Allows new users to create accounts.  
**Actors:** System Visitor.  
**Required Input:** Full name, email, and password.  
**System Process:** The system validates data, checks duplicate email, hashes password, and stores the account.  
**Expected Output:** New user account or validation message.

### User Management Module

**Purpose:** Allows Admin users to manage user accounts.  
**Actors:** Admin.  
**Required Input:** User ID, status value, or role value.  
**System Process:** The system updates user role or status and logs the action.  
**Expected Output:** Updated user account record.

### Dashboard Module

**Purpose:** Provides summary information based on role.  
**Actors:** Admin, Staff, User.  
**Required Input:** Authenticated session.  
**System Process:** The system retrieves relevant records and displays summary cards.  
**Expected Output:** Role-specific dashboard.

### Profile Management Module

**Purpose:** Displays authenticated user profile information.  
**Actors:** Admin, Staff, User.  
**Required Input:** Authenticated session.  
**System Process:** The system retrieves user profile details.  
**Expected Output:** Profile page.

### Event Management Module

**Purpose:** Manages foundation event records.  
**Actors:** Admin, Staff, User.  
**Required Input:** Event title, description, location, date, capacity, and status actions.  
**System Process:** Staff creates pending events, Admin approves or rejects events, and Users join approved events.  
**Expected Output:** Event records, participant records, and approval status.

### Fundraising Management Module

**Purpose:** Manages foundation fundraising campaigns.  
**Actors:** Admin, Staff, User.  
**Required Input:** Campaign title, description, target amount, start date, end date, and approval actions.  
**System Process:** Staff creates pending fundraisers, Admin approves or rejects fundraisers, and Users donate to approved campaigns.  
**Expected Output:** Fundraiser records, donation progress, and approval status.

### Donation Module

**Purpose:** Records donations to approved fundraisers.  
**Actors:** User, Staff, Admin.  
**Required Input:** Fundraiser ID, donation amount, and payment method.  
**System Process:** The system validates the fundraiser, records donation, updates current amount, and logs activity.  
**Expected Output:** Donation record and updated fundraiser progress.

### Feedback Module

**Purpose:** Collects and displays event feedback.  
**Actors:** User, Staff, Admin.  
**Required Input:** Event ID, rating, and comment.  
**System Process:** The system validates input, stores feedback, and makes it available to authorized roles.  
**Expected Output:** Feedback record.

### Achievement Module

**Purpose:** Tracks user achievements.  
**Actors:** Admin, Staff, User.  
**Required Input:** User ID, achievement title, description, and achievement type.  
**System Process:** Authorized users create achievement records; Users view their achievements.  
**Expected Output:** Achievement record.

### Approval Module

**Purpose:** Controls visibility of events and fundraisers.  
**Actors:** Admin.  
**Required Input:** Event or fundraiser ID and approval action.  
**System Process:** The system updates the record status and logs the approval or rejection.  
**Expected Output:** Approved or rejected record.

### Report Generation Module

**Purpose:** Generates summaries for monitoring and decision-making.  
**Actors:** Admin, Staff.  
**Required Input:** Report type and optional report content.  
**System Process:** The system gathers records, creates report data, stores the report, and logs the action.  
**Expected Output:** Generated report.

### Activity Logs Module

**Purpose:** Records important system actions.  
**Actors:** System, Admin.  
**Required Input:** User action and action details.  
**System Process:** The backend records activity type, description, user, IP address, and timestamp.  
**Expected Output:** Activity log entry.

### Logout Module

**Purpose:** Ends the authenticated session.  
**Actors:** Admin, Staff, User.  
**Required Input:** Logout action.  
**System Process:** The frontend clears local authentication data.  
**Expected Output:** User is returned to the login page.

---

## 14. Complete System Workflow

1. User opens BayanihanHub.
2. User selects Login or Register.
3. User enters account credentials or selects a demo account.
4. The system validates the submitted information.
5. The system authenticates the user or displays an error message.
6. The system redirects the authenticated user to the appropriate dashboard based on role.
7. The user selects a module such as Events, Fundraising, Donations, Feedback, Reports, or Logs.
8. The user enters or updates required information.
9. The system validates the information.
10. The system saves valid data to the database when the database is configured.
11. The system displays confirmation or updated records.
12. Admin users review and approve or reject pending events and fundraisers.
13. Users view approved events and fundraisers.
14. Users join events, donate, submit feedback, and view achievements.
15. Admin and Staff users monitor records through dashboards and reports.
16. The system records important actions in activity logs.
17. The user logs out.

### Text-Based Workflow Diagram

```txt
Open BayanihanHub
        |
        v
Login / Register / Demo Login
        |
        v
Validate User Information
        |
        v
Role-Based Dashboard
        |
        +--> Admin: Manage users, approvals, reports, logs
        |
        +--> Staff: Create events, create fundraisers, monitor records, submit reports
        |
        +--> User: Browse events, join events, donate, submit feedback, view achievements
        |
        v
System Validates and Saves Records
        |
        v
Reports, Logs, and Updated Dashboards
        |
        v
Logout
```

---

## 15. Development Process from Start to Finish

### 15.1 Planning

The planning phase identified the need for a centralized web-based system that can support foundation event and fundraising operations. The planned system needed to support multiple user roles, approval workflows, participant registration, donation tracking, feedback, achievements, reports, and activity logs.

### 15.2 Requirements Gathering

Requirements may be gathered through stakeholder consultation, observation of existing foundation processes, review of manual forms, review of proposal documents, and analysis of expected user responsibilities. Actual interview notes, survey results, or respondent data should be inserted after formal requirements gathering.

[Insert actual requirements gathering data]

### 15.3 Requirements Analysis

The gathered information was converted into system roles, modules, workflows, database entities, and functional requirements. The analysis identified Admin, Staff, and User roles and mapped each role to specific actions and access restrictions.

### 15.4 System Design

The system design phase prepared the architecture, page structure, role-based routing, database models, approval workflows, API endpoints, and user interface direction. Diagrams such as system architecture, entity relationship diagram, use case diagram, and data flow diagram should be inserted when finalized.

[Insert design diagrams]

### 15.5 Frontend Development

The frontend was developed using React.js, Vite, JavaScript, HTML5, and Tailwind CSS. Pages were organized into public, shared, Admin, Staff, and User sections. Reusable components were created for forms, tables, status badges, notices, cards, event cards, fundraiser cards, and navigation layouts.

### 15.6 Backend Development

The backend was developed using Node.js and Express.js. It includes routes, controllers, models, middleware, services, and utilities. Backend logic handles authentication, role authorization, validation, database connection, event approval, fundraiser approval, donation recording, feedback submission, achievements, reports, and logs.

### 15.7 Database Development

The database design was implemented using MongoDB and Mongoose models. Collections were created for users, events, fundraisers, donations, feedback, achievements, activity logs, and reports. Field names follow camelCase naming conventions.

### 15.8 Integration

Frontend and backend integration was implemented through RESTful API calls using Axios. The frontend sends requests to API endpoints, while the backend validates, processes, and returns responses. The application is prepared for Vercel deployment and MongoDB database configuration.

### 15.9 Testing

Testing should include login, registration, role-based access, event creation, fundraiser creation, donation recording, feedback submission, approval workflows, report generation, logs, responsiveness, and accessibility. Actual results must be documented after formal testing.

[Insert test result]

### 15.10 Deployment

The system is prepared for deployment using GitHub and Vercel. The frontend build is generated through Vite, and the backend API is exposed through serverless functions. MongoDB must be configured through environment variables before real account creation and persistent records can function.

### 15.11 Maintenance

Maintenance includes database backups, account reviews, security updates, dependency updates, bug fixes, report reviews, log reviews, performance monitoring, documentation updates, and feature improvements based on user feedback.

---

## 16. Testing Documentation

| Test Case ID | Module | Test Scenario | Input | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|---|
| TC-01 | Login | User logs in with valid credentials. | Valid email and password. | User is redirected to role dashboard. | [Insert actual result] | [Insert status] |
| TC-02 | Demo Login | User logs in using Admin demo account. | Demo Admin credentials. | User is redirected to Admin Dashboard. | [Insert actual result] | [Insert status] |
| TC-03 | Registration | Visitor creates a new account. | Full name, email, password. | Account is created or validation message appears. | [Insert actual result] | [Insert status] |
| TC-04 | Role-Based Access | User attempts to access Admin page. | User account session. | Access is denied or redirected. | [Insert actual result] | [Insert status] |
| TC-05 | Dashboard Loading | Authenticated user opens dashboard. | Valid session. | Correct role dashboard loads. | [Insert actual result] | [Insert status] |
| TC-06 | Event Creation | Staff submits an event. | Event title, description, location, date, capacity. | Pending event is created. | [Insert actual result] | [Insert status] |
| TC-07 | Event Approval | Admin approves event. | Event ID and approve action. | Event status becomes approved. | [Insert actual result] | [Insert status] |
| TC-08 | Event Joining | User joins approved event. | Event ID. | User is added to participants. | [Insert actual result] | [Insert status] |
| TC-09 | Fundraiser Creation | Staff submits fundraiser. | Campaign title, description, target amount, dates. | Pending fundraiser is created. | [Insert actual result] | [Insert status] |
| TC-10 | Fundraiser Approval | Admin approves fundraiser. | Fundraiser ID and approve action. | Fundraiser status becomes approved. | [Insert actual result] | [Insert status] |
| TC-11 | Donation Recording | User donates to approved fundraiser. | Fundraiser ID, amount, payment method. | Donation is recorded and current amount updates. | [Insert actual result] | [Insert status] |
| TC-12 | Feedback Submission | User submits event feedback. | Event ID, rating, comment. | Feedback is recorded. | [Insert actual result] | [Insert status] |
| TC-13 | Report Generation | Admin generates summary report. | Report type. | Report data is generated and stored. | [Insert actual result] | [Insert status] |
| TC-14 | Activity Logs | User performs important action. | Login, approval, donation, or report action. | Activity log is created. | [Insert actual result] | [Insert status] |
| TC-15 | Logout | User logs out. | Logout action. | Session is cleared and login page appears. | [Insert actual result] | [Insert status] |
| TC-16 | Responsive Layout | User opens system on mobile width. | Mobile viewport. | Layout remains usable. | [Insert actual result] | [Insert status] |
| TC-17 | Accessibility | User navigates forms with keyboard. | Keyboard navigation. | Fields and buttons are reachable and labeled. | [Insert actual result] | [Insert status] |

---

## 17. Implementation and Deployment

BayanihanHub may be implemented and deployed through the following steps:

1. Prepare the local or hosted environment.
2. Install Node.js and npm.
3. Clone or download the BayanihanHub source code.
4. Install project dependencies using `npm run install:all`.
5. Set up MongoDB or MongoDB Atlas.
6. Configure the backend environment variables, including `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV`.
7. Configure the frontend environment variable `VITE_API_BASE_URL`.
8. Run the system locally using `npm run dev`.
9. Create a default administrator account.
10. Open the system in a browser.
11. Test login, registration, dashboards, event management, fundraising, donations, feedback, reports, and logs.
12. Push the project to GitHub.
13. Connect the GitHub repository to Vercel.
14. Add production environment variables in Vercel.
15. Deploy the system through Vercel.
16. Verify that records, reports, approvals, and logs work correctly.
17. Provide user orientation or training before actual use.

---

## 18. Security and Privacy Controls

BayanihanHub applies the following security and privacy controls:

- Password hashing through bcryptjs.
- JWT-based authentication for protected backend routes.
- Role-based access control for Admin, Staff, and User functions.
- Input validation through frontend checks and backend validators.
- Protected API routes through authentication middleware.
- Admin-only restrictions for user management, approvals, reports, and logs.
- Record visibility control for approved events and fundraisers.
- Error handling for missing configuration, invalid input, unauthorized access, and database errors.
- Activity logs for login, failed login, approval, donation, feedback, and report generation actions.
- Environment variables for sensitive values such as database connection strings and JWT secrets.
- Password hashes excluded from API responses.
- Optional future CSRF protection for cookie-based authentication if the session method changes.
- Optional session timeout and refresh-token strategy for future enhancement.
- Recommended database backup and recovery plan.
- Secure handling of user information according to institutional or organizational privacy policies.

---

## 19. Reports and Monitoring

BayanihanHub supports monitoring through dashboards, reports, and logs. Reports help administrators and staff evaluate foundation operations, event activity, fundraising progress, participation, and system accountability.

Current and planned report categories include:

- User report.
- Event report.
- Fundraising report.
- Donation report.
- Participation report.
- Feedback report.
- Achievement report.
- Activity log report.
- Security log report.
- Status report.
- Monthly summary report.
- Yearly summary report.
- Admin monitoring dashboard.

Actual report formats, charts, and exported files may be added after formal reporting requirements are finalized.

[Insert sample report]

---

## 20. Risk Management and Controls

| Risk | Possible Effect | Control Measure |
|---|---|---|
| Incorrect user input | Invalid records, wrong reports, or failed transactions. | Use required fields, validation rules, and clear error messages. |
| Unauthorized access | Exposure or modification of restricted records. | Apply authentication, JWT verification, and role-based access control. |
| Missing records | Incomplete monitoring and reporting. | Use centralized database storage and activity logs. |
| Database failure | Account creation and persistent records may become unavailable. | Configure backup, recovery plan, and database health monitoring. |
| Server downtime | Users cannot access the system. | Use reliable hosting and monitor deployment status. |
| Notification failure | Users may miss updates or status changes. | Provide visible status labels and add notification monitoring in future versions. |
| Limited digital skills of users | Users may struggle to use the system. | Provide orientation, user manual, and simple interface design. |
| Incomplete documentation | Maintenance and future development may be difficult. | Maintain system documentation, user manual, and developer notes. |
| Resistance to system adoption | Users may continue using manual processes. | Conduct training and show benefits of centralized records. |
| Weak passwords | Accounts may be easier to compromise. | Enforce minimum password length and recommend stronger password policy. |
| Misconfigured environment variables | Authentication or database features may fail. | Use `.env.example`, deployment checklist, and health endpoint verification. |

---

## 21. Maintenance Plan

BayanihanHub should be maintained through regular technical and administrative activities:

- Perform scheduled database backups.
- Review user accounts, roles, and statuses.
- Update dependencies and security patches.
- Monitor activity logs and security logs.
- Review reports for accuracy and completeness.
- Fix bugs reported by users.
- Monitor system performance and page responsiveness.
- Review user feedback for improvement opportunities.
- Update documentation when features or workflows change.
- Improve accessibility and usability based on testing.
- Add future modules such as notifications, payment gateway integration, QR attendance, and exportable reports as needed.

---

## 22. Documentation Standards

This documentation follows the following standards:

1. Formal, professional, and objective language is used.
2. Clear headings and subheadings are provided.
3. Explanations are written in paragraph form.
4. Tables are used for roles, requirements, database structure, risks, and test cases.
5. Consistent terms are used throughout the document.
6. The document focuses only on BayanihanHub and its related features.
7. Test results, evaluation scores, and respondent data are not invented.
8. Placeholders are used for missing information, screenshots, diagrams, and formal test results.
9. Technical terms are explained in understandable language.
10. The documentation is aligned with the actual BayanihanHub implementation.

---

## 23. Conclusion

BayanihanHub supports a more organized, accessible, and accountable process for managing foundation events and fundraising activities. Through role-based access, dashboards, record management, approval workflows, donation tracking, feedback collection, achievement tracking, report generation, and activity logs, the system helps clarify user responsibilities and improve monitoring.

The system provides Admin users with control over approvals, user management, reports, and logs. Staff users are supported in event and fundraising operations, while Users are provided with access to approved events, donation functions, feedback submission, and achievement records. These features contribute to improved transparency, documentation, data security, and operational efficiency.

Further development may include full notification services, payment gateway integration, QR attendance verification, advanced analytics, exportable reports, and formal backup automation. Actual testing, evaluation, and user feedback should be inserted after system validation and deployment activities are completed.

---

## Appendices

### Appendix A: Source Code Structure

[Insert source code structure]

### Appendix B: Database Schema

[Insert database schema]

### Appendix C: System Screenshots

[Insert screenshot]

### Appendix D: Test Cases

[Insert complete test cases]

### Appendix E: User Manual

[Insert user manual]

### Appendix F: Evaluation Instrument

[Insert evaluation instrument]

### Appendix G: Sample Reports

[Insert sample reports]

