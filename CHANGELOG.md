# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses semantic versioning for releases.

## [Unreleased]

### Added

- GitHub Actions CI for backend syntax checks and the frontend production build.
- Dependabot configuration for backend, frontend and GitHub Actions dependencies.
- Issue templates, pull request template, security policy, contribution guide and code of conduct.
- Architecture and deployment documentation.
- Shared responsive email templates with plain-text alternatives for invitations, password changes, admission updates, contact messages and notifications.
- Sub-admin invitation resend endpoint and a Resend action in the Headmaster admin table.
- Health endpoint reports whether email delivery is configured.

### Changed

- Account invitations use a single-use 24-hour password link; generated passwords are never included in email.
- Contact form submissions now send the visitor an acknowledgement as well as the office alert.

### Fixed

- Approved and rejected admission decisions now email applicants; the previous copy map used statuses that never occurred.
- Registered students and newly created teachers and students receive activation emails.
- Setup links cannot be reused after the account password changes.
- Duplicate Headmaster admission alert emails were removed.
- Invitation failures now show Resend's actual rejection message in the admin dialog instead of a generic notice.

## [1.0.0] - 2026-11-25

### Added

- Public school website with home, about, academics, admissions, news, gallery, contact, privacy, terms, accessibility, sitemap and search pages.
- Eight role-based portals for Headmaster, Academic Administrator, Discipline Administrator, Accounts Administrator, Admin Assistant, Teacher, Parent and Student.
- Server-enforced role and ownership checks for protected API routes.
- Admissions workflow with duplicate detection and controlled registration status.
- Teacher mark entry, Academic Administrator result review and publication, assignments and class resources.
- Finance workflows for fee structures, invoices, payments, expenses and budgets.
- Discipline case recording and parent notification.
- Embedded website content management with category ownership and draft/scheduled/published lifecycle.
- In-app notifications and Resend email delivery.
- Cloudinary-backed uploads for images and documents, with local-disk development fallback.
- Render health endpoint and API status response.
- Vercel SPA rewrites for direct portal and password links.
- Responsive UI with role-specific navigation, themes and preferences.

### Changed

- Frontend production builds resolve the API base centrally and ignore stale localhost values.
- Backend CORS allows the live Vercel origin and project preview URLs.
- Email delivery moved from SMTP/Nodemailer to Resend.
- Uploads moved from Render's ephemeral local filesystem to Cloudinary.
- Render deployments trust one proxy hop so rate limiting reads forwarded client IPs correctly.

### Fixed

- Direct links to `/portal/headmaster`, `/news` and `/set-password` no longer return 404.
- Live frontend requests now reach the Render API instead of `localhost`.
- Email links use the production frontend URL.
- Rate-limit validation no longer fails on Render's `X-Forwarded-For` header.

### Security

- CORS origin allowlisting, Helmet headers, JWT authentication and rate limiting are enabled.
- Upload size and file-type checks are applied before storage.
- Parent, student and teacher data access is scoped to explicit ownership relationships.
- Removed features and unused modules remain excluded from the current scope.
