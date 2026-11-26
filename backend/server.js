// ==================== LOAD ENVIRONMENT VARIABLES ====================
require('dotenv').config();

const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const path = require('path');

const connectDB = require('./config/database');
const seedDatabase = require('./utils/seedDatabase');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./config/rateLimit');
const { isEmailConfigured } = require('./config/email');
const notifier = require('./utils/notifier');
const { startReminderScheduler } = require('./utils/reminderScheduler');
const { startAnnouncementScheduler } = require('./utils/announcementBroadcast');
const { startContentScheduler } = require('./utils/contentScheduler');
const User = require('./models/User');

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Add it to your .env file.');
  process.exit(1);
}

// ==================== APP SETUP ====================
const app = express();
const server = http.createServer(app);

// Render terminates requests at one proxy hop. Without this, Express ignores
// X-Forwarded-For and express-rate-limit treats every visitor as the proxy IP.
app.set('trust proxy', 1);

const PRODUCTION_FRONTEND_URL = 'https://essa-nyarugunga-school-complex-syst-eta.vercel.app';
const LOCAL_FRONTEND_URLS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
];

const parseOrigins = (value) =>
  String(value || '')
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const allowedOrigins = new Set([
  PRODUCTION_FRONTEND_URL,
  ...LOCAL_FRONTEND_URLS,
  ...parseOrigins(process.env.FRONTEND_URLS),
  ...parseOrigins(process.env.FRONTEND_URL),
]);

// Vercel preview deployments use generated URLs under the same project name.
const isProjectPreview = (origin) =>
  /^https:\/\/essa-nyarugunga-school-complex-syst-eta(?:-[a-z0-9-]+)?\.vercel\.app$/i.test(origin);

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin) || isProjectPreview(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const apiStatus = () => ({
  success: true,
  name: 'ESSA Nyarugunga API',
  status: 'ok',
  frontend: process.env.FRONTEND_URL || PRODUCTION_FRONTEND_URL,
  // Boolean only: never expose the key or sender address. This lets operators
  // confirm at a glance whether invitations and notifications can be delivered.
  email: isEmailConfigured()
});

// Browsers land here when the bare API URL is opened. Keep the answer small and
// useful; the actual application routes all live under /api.
app.get('/', (req, res) => {
  res.json({
    ...apiStatus(),
    endpoints: {
      login: 'POST /api/auth/login',
      publicNews: 'GET /api/news/public',
      health: 'GET /api/health'
    }
  });
});

app.get('/api/health', (req, res) => res.json(apiStatus()));

app.use('/api', apiLimiter);

// ==================== ROUTES ====================
app.use('/api', require('./routes/authRoutes'));
app.use('/api', require('./routes/userRoutes'));
app.use('/api', require('./routes/contactRoutes'));
app.use('/api', require('./routes/announcementRoutes'));
app.use('/api', require('./routes/classResourceRoutes'));
app.use('/api', require('./routes/newsRoutes'));
app.use('/api', require('./routes/galleryRoutes'));
app.use('/api', require('./routes/contentRoutes'));
// Ahead of admissionRoutes so the richer admin endpoints match first. This
// router is deliberately not under /academic-admin: admissions belong to the
// Headmaster (decision) and Admin Assistant (review/registration) only.
app.use('/api/admissions-admin', require('./routes/admissionsAdminRoutes'));
app.use('/api', require('./routes/admissionRoutes'));
app.use('/api', require('./routes/headmasterRoutes'));
app.use('/api', require('./routes/adminAssistantRoutes'));
app.use('/api', require('./routes/academicAdminRoutes'));
app.use('/api', require('./routes/teacherRoutes'));
app.use('/api', require('./routes/studentRoutes'));
app.use('/api', require('./routes/parentRoutes'));
app.use('/api', require('./routes/disciplineAdminRoutes'));
app.use('/api', require('./routes/accountsRoutes'));
app.use('/api', require('./routes/resourceUploadRoutes'));
app.use('/api', require('./routes/notificationRoutes'));
app.use('/api', require('./routes/subjectRoutes'));
app.use('/api', require('./routes/examRoutes'));

// ==================== ERROR HANDLER ====================
app.use(errorHandler);

// ==================== DATABASE CONNECTION & START ====================
const PORT = process.env.PORT || 5000;

// Without this a port clash surfaces as an unhandled 'error' event: a stack
// trace with no hint that the cause is another app already on the port.
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ Port ${PORT} is already in use.`);
    console.error('   Another process is listening there. Either stop it, or set a');
    console.error(`   different PORT in backend/.env (currently ${PORT}).\n`);
  } else {
    console.error('❌ Server error:', err.message);
  }
  process.exit(1);
});

connectDB()
  .then(async () => {
    console.log('✅ MongoDB Connected');
    const userCount = await User.countDocuments();
    if (process.argv.includes('--seed') || process.env.SEED_DB === 'true' || userCount === 0) {
      await seedDatabase();
    }
    server.listen(PORT, () => {
      const target = process.env.FRONTEND_URL || PRODUCTION_FRONTEND_URL;
      console.log(`\n🚀 API      http://localhost:${PORT}`);
      console.log(`🚀 Frontend ${target}\n`);
      // Releases whatever quiet hours deferred. The timer is unref'd inside,
      // so it never holds a short-lived test process open on shutdown.
      notifier.startFlushLoop();
      // Promotes scheduled announcements whose time has arrived.
      startAnnouncementScheduler();

      // Publishes news/gallery items whose scheduled date has arrived.
      startContentScheduler();

      // Nudges pupils and guardians about assignments and exams that fall due
      // within the next day.
      startReminderScheduler();
    });
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  });