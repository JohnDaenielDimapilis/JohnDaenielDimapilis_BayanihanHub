# BayanihanHub Development Guidelines

## ISO-Aligned Development Principles

- Functional suitability: every feature should map to a system requirement from the BayanihanHub proposal.
- Reliability: handle API, validation, authentication, authorization, and database errors gracefully.
- Security: protect routes, hash passwords, validate inputs, use environment variables, and avoid exposing sensitive data.
- Usability: keep pages readable, responsive, accessible, and clear for Admin, Staff, and User workflows.
- Maintainability: organize code into focused models, controllers, routes, middleware, services, components, hooks, and utilities.
- Accountability: log important user actions, approval decisions, failed login attempts, and report generation.
- Portability: keep configuration environment-based so the project can run locally and deploy to Vercel.

## Naming Conventions

- React components and pages use PascalCase, such as `AdminDashboard.jsx` and `EventCard.jsx`.
- React hooks use camelCase with a `use` prefix, such as `useAuth.jsx` and `useResource.js`.
- Utility files use camelCase, such as `formatDate.js` and `validateForm.js`.
- Mongoose models use PascalCase, such as `User.js`, `Event.js`, and `Donation.js`.
- Controllers use camelCase with the `Controller` suffix, such as `authController.js`.
- Routes use camelCase with the `Routes` suffix, such as `eventRoutes.js`.
- Middleware uses camelCase, such as `authMiddleware.js` and `roleMiddleware.js`.
- Database fields use camelCase and descriptive names, such as `eventTitle`, `approvalStatus`, and `donationAmount`.

## Branch Naming Standards

- `main`
- `develop`
- `feature/authentication`
- `feature/admin-dashboard`
- `feature/event-management`
- `feature/fundraising-management`
- `feature/report-generation`
- `fix/login-validation`
- `docs/update-readme`

## Commit Message Standards

Format:

```txt
type(scope): action summary
```

Allowed types:

- `feat` for new features
- `fix` for bug fixes
- `docs` for documentation
- `style` for formatting or UI styling
- `refactor` for code restructuring
- `test` for test-related work
- `chore` for setup or maintenance
- `security` for authentication, validation, or access control improvements

Good examples:

```txt
chore(project): initialize MERN application structure
feat(auth): add JWT login and registration
feat(events): create event approval workflow
feat(fundraising): add donation record management
feat(admin): add user management dashboard
security(auth): hash user passwords with bcrypt
fix(events): validate required event fields before submission
docs(readme): add setup and deployment instructions
style(ui): improve responsive dashboard layout
refactor(api): separate route logic into controllers
```

## Code Quality Checklist

- Code is modular and organized by responsibility.
- Functions are short, focused, and named clearly.
- Reusable UI components are preferred over repeated markup.
- API routes delegate business logic to controllers and services.
- Mongoose schemas use validation and meaningful field names.
- UI forms include labels, required fields, and validation messages.
- Tables and cards use readable status badges and consistent spacing.
- No credentials, tokens, or secrets are hard-coded.

## Security Checklist

- Passwords are hashed before storage.
- JWT tokens are required for protected routes.
- Role middleware protects Admin-only and Staff-only actions.
- Users can access only their allowed pages and API actions.
- Inputs are validated before controller logic runs.
- API responses do not return password hashes.
- Failed login attempts and important actions are logged.
- Environment variables are used for secrets and database configuration.

## Pull Request Checklist

- The PR title follows the project commit style.
- The PR description explains what changed and why.
- New or changed routes include validation and authorization checks.
- UI changes are responsive across mobile and desktop widths.
- Documentation is updated when setup, routes, roles, or workflows change.
- Build or relevant checks have been run locally.
- No unrelated files or generated secrets are included.
