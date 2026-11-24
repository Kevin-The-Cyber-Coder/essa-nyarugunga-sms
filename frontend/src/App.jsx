import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Pages
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import AcademicsPage from './pages/AcademicsPage';
import AdmissionsPage from './pages/AdmissionsPage';
import NewsPage from './pages/NewsPage';
import GalleryPage from './pages/GalleryPage';
import ContactPage from './pages/ContactPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import NotFoundPage from './pages/NotFoundPage';
import SitemapPage from './pages/SitemapPage';
import AccessibilityPage from './pages/AccessibilityPage';
import SearchPage from './pages/SearchPage';

// Portals. Dashboards are loaded on demand so the public site and the login
// screen do not download every role's charts and panels on first visit.
import PortalLogin from './portals/PortalLogin';
import SetPasswordPage from './portals/SetPasswordPage';
import ChangePasswordPage from './portals/ChangePasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

const HeadmasterDashboard = lazy(() => import('./portals/HeadmasterDashboard'));
const AcademicAdminDashboard = lazy(() => import('./portals/AcademicAdminDashboard'));
const AdminAssistantDashboard = lazy(() => import('./portals/AdminAssistantDashboard'));
const TeacherDashboard = lazy(() => import('./portals/TeacherDashboard'));
const StudentDashboard = lazy(() => import('./portals/StudentDashboard'));
const ParentDashboard = lazy(() => import('./portals/ParentDashboard'));
const AccountsAdminDashboard = lazy(() => import('./portals/AccountsAdminDashboard'));
const DisciplineAdminDashboard = lazy(() => import('./portals/DisciplineAdminDashboard'));

const PortalFallback = () => (
  <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: 'var(--text-faint)' }}>
    <i className="fas fa-circle-notch fa-spin" style={{ marginRight: 8 }} /> Loading portal…
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<PortalFallback />}>
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/academics" element={<AcademicsPage />} />
        <Route path="/admissions" element={<AdmissionsPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/set-password" element={<SetPasswordPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route path="/sitemap" element={<SitemapPage />} />
        <Route path="/accessibility" element={<AccessibilityPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />

        {/* Portal Login */}
        <Route path="/portal/login" element={<PortalLogin />} />

        {/* Forced password change - reachable while a change is outstanding */}
        <Route path="/portal/change-password" element={<ChangePasswordPage />} />

        {/* Protected Routes - Headmaster */}
        <Route
          path="/portal/headmaster"
          element={
            <ProtectedRoute allowedRoles={['headmaster']}>
              <HeadmasterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Admin Assistant */}
        <Route
          path="/portal/admin-assistant"
          element={
            <ProtectedRoute allowedRoles={['admin_assistant']}>
              <AdminAssistantDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Academic Admin */}
        <Route
          path="/portal/academic-admin"
          element={
            <ProtectedRoute allowedRoles={['academic_admin']}>
              <AcademicAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Accounts Admin - FIXED */}
        <Route
          path="/portal/accounts-admin"
          element={
            <ProtectedRoute allowedRoles={['accounts_admin']}>
              <AccountsAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Discipline Admin */}
        <Route
          path="/portal/discipline-admin"
          element={
            <ProtectedRoute allowedRoles={['discipline_admin']}>
              <DisciplineAdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Teacher */}
        <Route
          path="/portal/teacher"
          element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Student */}
        <Route
          path="/portal/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected Routes - Parent */}
        <Route
          path="/portal/parent"
          element={
            <ProtectedRoute allowedRoles={['parent']}>
              <ParentDashboard />
            </ProtectedRoute>
          }
        />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;