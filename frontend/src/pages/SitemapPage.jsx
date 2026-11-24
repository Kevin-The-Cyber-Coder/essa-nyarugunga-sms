import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

const SECTIONS = [
  { title: 'School', links: [['/', 'Home'], ['/about', 'About ESSA'], ['/academics', 'Academics'], ['/admissions', 'Admissions']] },
  { title: 'Community', links: [['/news', 'News'], ['/gallery', 'Gallery'], ['/contact', 'Contact']] },
  { title: 'Legal', links: [['/terms-of-use', 'Terms of Use'], ['/privacy-policy', 'Privacy Policy'], ['/accessibility', 'Accessibility']] },
  { title: 'Portals', links: [['/portal/login', 'Staff & Parent Portal'], ['/set-password', 'Set Password']] }
];

const SitemapPage = () => (
  <div className="site-shell">
    <Navbar />
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '80px 20px 60px' }}>
      <h1 style={{ fontFamily: 'Georgia, serif', color: 'var(--navy)', fontSize: 34 }}>Sitemap</h1>
      <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
        Every public page of ESSA Nyarugunga, in one place.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 18, marginTop: 24 }}>
        {SECTIONS.map((section) => (
          <section key={section.title} style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
            <h2 style={{ fontSize: 15, color: 'var(--navy)', margin: '0 0 12px' }}>{section.title}</h2>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 9 }}>
              {section.links.map(([to, label]) => (
                <li key={to}><Link to={to} style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 14 }}>{label}</Link></li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
    <Footer />
  </div>
);

export default SitemapPage;
