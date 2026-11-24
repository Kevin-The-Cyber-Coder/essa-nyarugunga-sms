import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../App.css';

const PAGES = [
  { to: '/', title: 'Home', text: 'ESSA Nyarugunga school website' },
  { to: '/about', title: 'About us', text: 'Our mission, history, leadership and campus' },
  { to: '/academics', title: 'Academics', text: 'Curriculum, programmes and learning support' },
  { to: '/admissions', title: 'Admissions', text: 'Apply to ESSA Nyarugunga, requirements and process' },
  { to: '/news', title: 'News', text: 'School news and announcements' },
  { to: '/gallery', title: 'Gallery', text: 'Photos from school life' },
  { to: '/contact', title: 'Contact', text: 'Reach the school office' },
  { to: '/terms-of-use', title: 'Terms of Use', text: 'Terms governing use of this website' },
  { to: '/privacy-policy', title: 'Privacy Policy', text: 'How personal information is handled' },
  { to: '/accessibility', title: 'Accessibility', text: 'Accessibility commitments and help' },
  { to: '/portal/login', title: 'Portal login', text: 'Staff, teacher, parent and student portals' }
];

const SearchPage = () => {
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') || '');
  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return [];
    return PAGES.filter(p => (p.title + ' ' + p.text).toLowerCase().includes(q));
  }, [term]);

  const submit = (e) => {
    e.preventDefault();
    setParams(term.trim() ? { q: term.trim() } : {});
  };

  return (
    <div className="site-shell">
      <Navbar />
      <main style={{ maxWidth: 820, margin: '0 auto', padding: '80px 20px 60px' }}>
        <h1 style={{ fontFamily: 'Georgia, serif', color: 'var(--navy)', fontSize: 34 }}>Search this site</h1>
        <form onSubmit={submit} style={{ display: 'flex', gap: 10, margin: '20px 0' }}>
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="What are you looking for?"
            aria-label="Search term"
            style={{ flex: 1, padding: '11px 14px', border: '1.5px solid var(--surface-sunken-2)', borderRadius: 9, fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ padding: '11px 20px', border: 'none', borderRadius: 9, background: 'var(--navy)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Search</button>
        </form>
        {term.trim() ? (
          results.length ? (
            <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
              {results.map((r) => (
                <li key={r.to} style={{ background: 'var(--surface-card)', borderRadius: 11, padding: 16 }}>
                  <Link to={r.to} style={{ color: 'var(--navy)', fontWeight: 700, textDecoration: 'none' }}>{r.title}</Link>
                  <p style={{ margin: '5px 0 0', color: 'var(--text-secondary)', fontSize: 13 }}>{r.text}</p>
                </li>
              ))}
            </ul>
          ) : <p style={{ color: 'var(--text-secondary)' }}>No pages match that search.</p>
        ) : <p style={{ color: 'var(--text-secondary)' }}>Enter a word or phrase to find a page.</p>}
      </main>
      <Footer />
    </div>
  );
};

export default SearchPage;
