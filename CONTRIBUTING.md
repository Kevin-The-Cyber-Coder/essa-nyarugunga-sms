# Contributing

Thank you for your interest in ESSA Nyarugunga School Management System. This project is intentionally focused: contributions should improve the current public website, the eight role portals, or the operational quality of the system without reintroducing removed features.

## Before you start

1. Read the [README](README.md) and [architecture notes](docs/ARCHITECTURE.md).
2. Check existing issues before opening a new one.
3. For security-sensitive problems, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Local setup

```bash
cd backend
npm install

cd ../frontend
npm install
```

Copy the environment examples:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Start the backend and frontend in separate terminals:

```bash
cd backend && npm run dev
cd frontend && npm run dev
```

The local defaults are:

```text
Frontend: http://localhost:5174
API:      http://localhost:5001
```

## Workflow

- Create a focused branch from `main`.
- Keep each pull request to one logical change.
- Use clear commit messages, preferably Conventional Commits:
  - `feat(admissions): ...`
  - `fix(auth): ...`
  - `docs(deploy): ...`
  - `refactor(frontend): ...`
- Rebase or merge `main` before opening the pull request if needed.
- Describe the user-facing effect and the verification you ran.

## Quality gates

Run these before opening a pull request:

```bash
cd frontend
npm run build

cd ../backend
node --check server.js
```

The GitHub Actions workflow also installs both applications, checks backend JavaScript syntax and builds the frontend.

## Security invariants

These rules are not optional:

- Exactly eight roles are supported: `headmaster`, `academic_admin`, `discipline_admin`, `accounts_admin`, `admin_assistant`, `teacher`, `parent`, `student`.
- `ROLE_ALIASES = Object.freeze({ super_admin: ROLES.HEADMASTER })` must remain in both role configurations.
- Backend authorization is authoritative. Hiding navigation in the frontend is not a security boundary.
- Teachers only access assigned classes/subjects.
- Parents only access linked, verified children.
- Students only access their own records.
- Finance, exam, discipline, admissions and registration duties remain separated.
- Admissions cannot jump directly to `registered`; registration must use the dedicated endpoint after approval.
- Website content management stays embedded in authorized dashboards; do not add a standalone CMS route.
- Removed features must not be reintroduced: quizzes, attendance, timetables, lesson plans, analytics dashboards, calendars/events, report cards, promotion/enrollment, SDMS login/codes, permission slips, subscriptions/newsletters, security history/locked UI, parent online payments, chat/Push/SMS/payroll, or mock content.

## Secrets

- Never commit `.env` files, API keys, JWT secrets, database passwords or SMTP/Resend/Cloudinary credentials.
- Use platform environment variables for Render and Vercel.
- If a secret is exposed, rotate it immediately and report the exposure privately.

## Pull request checklist

- [ ] The change is focused and explained.
- [ ] Frontend build passes.
- [ ] Backend syntax check passes.
- [ ] Role and ownership boundaries are preserved.
- [ ] No secrets or private student data are included.
- [ ] Documentation is updated when behaviour or configuration changes.

## Reporting bugs

Use the GitHub issue templates. Include reproduction steps, the affected role, the environment and sanitized logs. Do not include passwords, tokens or personal student data.
