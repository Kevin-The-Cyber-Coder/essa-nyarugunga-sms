# Security Policy

## Supported version

Security fixes are applied to the `main` branch of this repository. There are no long-term support branches at this time.

## Reporting a vulnerability

**Do not open a public issue for a security vulnerability.**

Use GitHub's private vulnerability reporting:

<https://github.com/Kevin-The-Cyber-Coder/essa-nyarugunga-sms/security/advisories/new>

Please include:

- A clear description of the issue and its impact.
- Steps to reproduce or a minimal proof of concept.
- The affected role, endpoint or page.
- Whether the issue affects the live deployment or local development.
- Any suggested mitigation.

Remove passwords, tokens, personal student data and other sensitive information from screenshots and logs.

Reports are reviewed on a best-effort basis. Valid reports will be acknowledged and fixed as soon as practical.

## Security scope

The following areas are in scope:

- Authentication and JWT handling.
- Role-based access control and privilege escalation.
- Parent, student and teacher data isolation.
- Admissions, registration, finance, exam and discipline authorization.
- File upload validation and storage access.
- CORS, rate limiting and security headers.
- Secret exposure and unsafe deployment configuration.
- Cross-site scripting or injection vulnerabilities.

## Out of scope

- Social engineering or phishing against staff.
- Denial-of-service testing against the live deployment.
- Vulnerabilities in third-party platforms (Vercel, Render, MongoDB Atlas, Cloudinary, Resend) that are not caused by this project's configuration.
- Reports that require access to a compromised administrator account without a separate privilege-escalation issue.
- Automated scanner output without a reproducible impact.

## Safe handling

- Do not access, modify or exfiltrate real student or staff data.
- Use test accounts and local data where possible.
- Do not disrupt the live service or attempt destructive testing.
- Give the maintainer reasonable time to fix the issue before public disclosure.

## Secrets

Production secrets belong in platform environment variables, never in the repository. If you believe a secret has been committed or exposed, report it privately and rotate the affected credential immediately.
