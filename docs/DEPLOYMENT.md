# Deployment

## Production URLs

| Service | URL |
| --- | --- |
| Frontend | <https://essa-nyarugunga-school-complex-syst-eta.vercel.app/> |
| API | <https://essa-api.onrender.com/> |
| Health check | <https://essa-api.onrender.com/api/health> |

## Topology

```text
Browser
  -> Vercel (React/Vite SPA)
  -> Render (Express API)
  -> MongoDB
  -> Cloudinary (uploads)
  -> Resend (email)
```

## Vercel setup

1. Import the GitHub repository into Vercel.
2. Set the Root Directory:
   - Use `frontend` if the project is configured as a frontend-only app, or
   - leave it at the repository root and let the checked-in `vercel.json` build `frontend/dist`.
3. Framework preset: **Vite**.
4. Build command: `npm run build` when the root directory is `frontend`.
5. Output directory: `dist` when the root directory is `frontend`.
6. Add the environment variable:

```dotenv
VITE_API_URL=https://essa-api.onrender.com
```

7. Deploy and confirm that direct links such as `/portal/headmaster` and `/set-password` return the SPA rather than a 404.

The repository includes both `vercel.json` and `frontend/vercel.json` so either root-directory configuration works.

## Render setup

1. Create a **Web Service** from the GitHub repository.
2. Root Directory: `backend`.
3. Runtime: Node.
4. Build command:

```bash
npm install
```

5. Start command:

```bash
npm start
```

6. Health check path:

```text
/api/health
```

7. Add the environment variables below and deploy.

### Required Render variables

```dotenv
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/essa_school?retryWrites=true&w=majority
JWT_SECRET=generate_a_long_random_secret
FRONTEND_URL=https://essa-nyarugunga-school-complex-syst-eta.vercel.app
```

Generate a JWT secret with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Email variables

```dotenv
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=ESSA Nyarugunga <no-reply@your-verified-domain>
ADMIN_EMAIL=admin@essa.rw
TEST_EMAIL=admin@essa.rw
```

- Create the API key at <https://resend.com/api-keys> with send permission.
- Verify the sender domain at <https://resend.com/domains>.
- Production email requires a verified domain. `resend.dev` test senders only deliver to the account email.

### Upload variables

```dotenv
STORAGE_PROVIDER=cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAX_UPLOAD_BYTES=10485760
```

Cloudinary credentials are available in the Cloudinary dashboard under **API Keys**. Do not expose the API secret in the frontend or commit it to Git.

### Optional variables

```dotenv
FRONTEND_URLS=
MONGODB_USERNAME=
MONGODB_PASSWORD=
RATE_LIMIT_API_MAX=500
RATE_LIMIT_AUTH_MAX=20
RATE_LIMIT_FORM_MAX=10
```

`FRONTEND_URLS` is a comma-separated list of extra CORS origins, useful for Vercel previews or additional hosts.

### Seed variables

Only needed when the database has no users:

```dotenv
SEED_HEADMASTER_EMAIL=admin@essa.rw
SEED_HEADMASTER_PASSWORD=choose_a_strong_password
SEED_HEADMASTER_NAME=Head Master
SEED_HEADMASTER_PHONE=+250788123456
```

Do not rely on the development default password in production.

## MongoDB

- Use MongoDB Atlas or another managed MongoDB service.
- Restrict network access to the API where possible.
- Keep the connection string in Render environment variables.
- Back up the database before schema or data migrations.

## Deploy flow

1. Push to `main`.
2. Render redeploys the API.
3. Vercel redeploys the frontend.
4. Run the smoke checks below.
5. If a deployment fails, roll back to the previous successful deployment on the affected platform.

## Smoke checks

### API

```bash
curl https://essa-api.onrender.com/api/health
curl -X POST https://essa-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@essa.rw","password":"admin123"}'
```

Expected: health returns `200`, login returns `200` with a token.

### Frontend

```bash
curl -I https://essa-nyarugunga-school-complex-syst-eta.vercel.app/
curl -I https://essa-nyarugunga-school-complex-syst-eta.vercel.app/portal/headmaster
```

Expected: both return `200`.

### Uploads

Sign in, open an authorized dashboard and upload an image. The saved URL should begin with:

```text
https://res.cloudinary.com/
```

An authenticated `GET /api/files/config` should report:

```json
{ "provider": "cloudinary" }
```

### Email

After setting Resend variables:

```bash
cd backend
node test.js
```

Or check the notification preferences response for:

```json
{ "providers": { "email": true } }
```

## Troubleshooting

| Symptom | Check |
| --- | --- |
| `Cannot GET /` | The API now returns a JSON status page; `/api/health` is the health check |
| Browser CORS error | `FRONTEND_URL` and the actual frontend origin must match |
| Login works in Postman but not the browser | Confirm the frontend bundle calls `https://essa-api.onrender.com` |
| `429 Too Many Requests` | Rate limits can be raised with `RATE_LIMIT_*` variables |
| `providers.email` is false | `RESEND_API_KEY` and `EMAIL_FROM` are missing or empty |
| Uploads return local URLs | `STORAGE_PROVIDER` or Cloudinary credentials are not configured |
| Direct portal link returns 404 | Confirm the Vercel SPA rewrite is being used |
| Rate-limit proxy warning | The backend must keep `app.set('trust proxy', 1)` on Render |

## Operational notes

- Render's local disk is ephemeral. Use Cloudinary for uploads.
- The schedulers assume one API instance. Scale carefully.
- Rotate exposed secrets immediately.
- Keep `.env` files out of Git.
- Use the Render health check and Vercel deployment logs for monitoring.
