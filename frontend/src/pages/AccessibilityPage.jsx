import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

const AccessibilityPage = () => (
  <div className="site-shell">
    <Navbar />
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '80px 20px 60px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', color: 'var(--navy)', fontSize: 34 }}>Accessibility</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        ESSA Nyarugunga is committed to making this website usable by every member of our community.
        We aim to meet WCAG 2.1 AA: text has sufficient contrast, pages work at different zoom levels
        and screen sizes, links are descriptive, and images carry alternative text.
      </p>
      <h2 style={{ fontSize: 20, color: 'var(--navy)', marginTop: 28 }}>Using the site</h2>
      <ul style={{ color: 'var(--text-secondary)', lineHeight: 1.9 }}>
        <li>Navigate with a keyboard using Tab, Shift+Tab, Enter and the arrow keys.</li>
        <li>Zoom to 200% without losing content or controls.</li>
        <li>Use your browser or operating system settings to increase text size or contrast.</li>
      </ul>
      <h2 style={{ fontSize: 20, color: 'var(--navy)', marginTop: 28 }}>Need help?</h2>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>
        If any part of this site is difficult to use, please contact the school office. We will help you
        access the information you need and work to remove the barrier.
      </p>
    </main>
    <Footer />
  </div>
);

export default AccessibilityPage;
