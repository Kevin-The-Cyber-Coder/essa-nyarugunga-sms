import { API_URL } from '../config/api';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import WebsiteContentPanel from '../components/website/WebsiteContentPanel';
import ThemeToggle from '../components/ThemeToggle';
import { ROLES, ROLE_LABELS, normalizeRole } from '../config/roles';


const getToken = () => localStorage.getItem('portalToken');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'fa-gauge' },
  { id: 'applications', label: 'Applications', icon: 'fa-file-circle-check' },
  { id: 'parents', label: 'Parent links', icon: 'fa-users' },
  { id: 'content', label: 'Website content', icon: 'fa-newspaper' }
];

const STATUS_META = {
  submitted: { label: 'Submitted', color: '#7a4a00', bg: '#fff4e5' },
  under_review: { label: 'Under review', color: '#1d3f7a', bg: '#eef4ff' },
  approved: { label: 'Approved', color: '#1b5e20', bg: '#e8f5e9' },
  rejected: { label: 'Rejected', color: '#b91c1c', bg: '#fef2f2' },
  registered: { label: 'Registered', color: '#4a148c', bg: '#f3e5f5' }
};

const StatusPill = ({ status }) => {
  const s = STATUS_META[status] || { label: status, color: '#555', bg: '#eee' };
  return <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg }}>{s.label}</span>;
};

const btn = (bg, color = '#fff') => ({
  background: bg, color, border: 'none', borderRadius: 8, padding: '7px 12px',
  fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
  alignItems: 'center', gap: 6
});
const card = { background: 'var(--surface-card)', borderRadius: 14, padding: 18, border: '1px solid var(--surface-page)' };
const input = {
  width: '100%', padding: '9px 11px', border: '1.5px solid var(--surface-sunken-2)',
  borderRadius: 8, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'var(--surface-card)', color: 'var(--text-body)'
};
const label = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 };

const AdminAssistantDashboard = () => {
  const navigate = useNavigate();
  const role = normalizeRole(localStorage.getItem('userRole'));
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [overview, setOverview] = useState({});
  const [applications, setApplications] = useState([]);
  const [parents, setParents] = useState([]);
  const [students, setStudents] = useState([]);
  const [linkForm, setLinkForm] = useState({ parentName: '', phone: '', email: '', studentIds: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role !== ROLES.ADMIN_ASSISTANT && role !== ROLES.HEADMASTER) {
      navigate('/portal/login', { replace: true });
    }
  }, [role, navigate]);

  // Keep the sidebar as a drawer on small screens, like the other portals.
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth <= 1024);
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${getToken()}` };
      const [ov, apps, par, stu] = await Promise.all([
        fetch(`${API_URL}/api/admin-assistant/overview`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/admissions-admin/applications?limit=50`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/admin-assistant/parents`, { headers }).then((r) => r.json()),
        fetch(`${API_URL}/api/academic-admin/students`, { headers }).then((r) => r.json())
      ]);
      setOverview(ov || {});
      setApplications(apps?.applications || []);
      setParents(par?.data || []);
      setStudents(Array.isArray(stu) ? stu : (stu?.data || []));
    } catch {
      Swal.fire('Error', 'Could not load dashboard data.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const setStatus = async (id, status) => {
    const result = await Swal.fire({
      title: status === 'under_review' ? 'Start review?' : 'Confirm decision',
      icon: 'question', showCancelButton: true, confirmButtonText: 'Continue'
    });
    if (!result.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/admissions-admin/applications/${id}/status`, {
        method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status, notify: true })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update application');
      Swal.fire('Updated', `Application marked ${status.replace('_', ' ')}.`, 'success');
      await load();
    } catch (error) { Swal.fire('Error', error.message, 'error'); }
  };

  const register = async (app) => {
    const { value: classId } = await Swal.fire({
      title: `Register ${app.fullName}`,
      input: 'select',
      inputOptions: { '': 'No class yet', ...Object.fromEntries(students.map((s) => [String(s.classId?._id || ''), `${s.classId?.grade || ''} ${s.classId?.className || ''}`]).filter(([k]) => k)) },
      inputValue: '',
      text: 'Choose a class now, or leave blank to assign later.',
      showCancelButton: true,
      confirmButtonText: 'Create student'
    });
    if (classId === undefined) return;
    try {
      const res = await fetch(`${API_URL}/api/admissions-admin/applications/${app._id}/register`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify({ classId: classId || undefined })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not register student');
      Swal.fire('Registered', 'Student account created successfully.', 'success');
      await load();
    } catch (error) { Swal.fire('Error', error.message, 'error'); }
  };

  const linkParent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/api/admin-assistant/link-parent`, {
        method: 'POST', headers: authHeaders(), body: JSON.stringify(linkForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not link parent');
      Swal.fire('Linked', 'Parent can now see the selected children.', 'success');
      setLinkForm({ parentName: '', phone: '', email: '', studentIds: [] });
      await load();
    } catch (error) { Swal.fire('Error', error.message, 'error'); }
  };

  const toggleChild = (id) => setLinkForm((f) => ({
    ...f,
    studentIds: f.studentIds.includes(id) ? f.studentIds.filter((x) => x !== id) : [...f.studentIds, id]
  }));

  return (
    <div className="portal-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-page)', color: 'var(--text-body)' }}>
      {isMobile && mobileOpen && (
        <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998 }} />
      )}
      <aside style={{
        width: isMobile ? (mobileOpen ? 260 : 0) : (sidebarOpen ? 240 : 72),
        position: isMobile ? 'fixed' : 'static', top: 0, left: 0, bottom: 0,
        zIndex: isMobile ? 999 : undefined,
        background: '#12294a', color: '#fff', flexShrink: 0, overflow: 'hidden',
        display: 'flex', flexDirection: 'column', transition: 'width .2s'
      }}>
        <div style={{ padding: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#e8b931', color: '#12294a', display: 'grid', placeItems: 'center' }}>
            <i className="fas fa-user-gear" />
          </div>
          {sidebarOpen && <div><strong style={{ fontSize: 14 }}>ESSA Portal</strong><div style={{ fontSize: 11, opacity: .7 }}>Admin Assistant</div></div>}
        </div>
        <nav style={{ flex: 1, padding: '8px 10px' }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false); }} style={{
              width: '100%', textAlign: 'left', border: 0, borderRadius: 9, marginBottom: 6,
              padding: '10px 12px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
              background: tab === t.id ? 'rgba(232,185,49,.18)' : 'transparent',
              color: tab === t.id ? '#e8b931' : 'rgba(255,255,255,.78)'
            }}>
              <i className={`fas ${t.icon}`} style={{ marginRight: 10 }} />{sidebarOpen && t.label}
            </button>
          ))}
        </nav>
        {!isMobile && (
          <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.1)' }}>
            <button onClick={() => setSidebarOpen((v) => !v)} style={{ ...btn('transparent', '#fff'), width: '100%' }}>
              <i className={`fas ${sidebarOpen ? 'fa-angles-left' : 'fa-angles-right'}`} />{sidebarOpen && 'Collapse'}
            </button>
          </div>
        )}
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <header style={{
          background: 'var(--surface-card)', borderBottom: '1px solid var(--border)',
          padding: '12px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            {isMobile && (
              <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle navigation" style={{ ...btn('transparent', 'var(--text-secondary)'), marginRight: 8 }}>
                <i className="fas fa-bars" />
              </button>
            )}
            <strong style={{ fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>{TABS.find((t) => t.id === tab)?.label}</strong>
            <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{ROLE_LABELS[role]}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ThemeToggle />
            <button onClick={() => { localStorage.clear(); navigate('/portal/login'); }} style={btn('#b42318')}>
              <i className="fas fa-right-from-bracket" /> Logout
            </button>
          </div>
        </header>

        <main className="portal-main" style={{ maxWidth: 1200 }}>
          {loading && <p style={{ color: 'var(--text-faint)' }}>Loading…</p>}

          {tab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 14 }}>
              {[
                { label: 'Students', value: overview.students, icon: 'fa-user-graduate', color: '#1a3a5c' },
                { label: 'Linked parents', value: overview.parents, icon: 'fa-users', color: '#0e7490' },
                { label: 'Submitted', value: overview.applications?.submitted, icon: 'fa-inbox', color: '#7a4a00' },
                { label: 'Under review', value: overview.applications?.under_review, icon: 'fa-eye', color: '#1d3f7a' },
                { label: 'Approved', value: overview.applications?.approved, icon: 'fa-check', color: '#1b5e20' },
                { label: 'Registered', value: overview.applications?.registered, icon: 'fa-user-plus', color: '#4a148c' }
              ].map((s) => (
                <div key={s.label} style={card}>
                  <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: 20 }} />
                  <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', marginTop: 8 }}>{s.value ?? 0}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'applications' && (
            <div style={card}>
              <h3 style={{ margin: '0 0 14px', fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>Admission applications</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
                  <thead><tr>
                    {['Applicant', 'Number', 'Level', 'Status', 'Actions'].map((h) => (
                      <th key={h} style={{ textAlign: 'left', padding: 9, fontSize: 11, color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>{h.toUpperCase()}</th>
                    ))}
                  </tr></thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a._id} style={{ borderBottom: '1px solid var(--surface-muted)' }}>
                        <td style={{ padding: 9, fontSize: 13 }}>{a.fullName}</td>
                        <td style={{ padding: 9, fontSize: 12 }}>{a.applicationNumber}</td>
                        <td style={{ padding: 9, fontSize: 12 }}>{a.level}</td>
                        <td style={{ padding: 9 }}><StatusPill status={a.status} /></td>
                        <td style={{ padding: 9, whiteSpace: 'nowrap' }}>
                          {a.status === 'submitted' && <button onClick={() => setStatus(a._id, 'under_review')} style={btn('#1d3f7a')}>Review</button>}
                          {a.status === 'approved' && <button onClick={() => register(a)} style={btn('#4a148c')}><i className="fas fa-user-plus" /> Register</button>}
                          {['rejected', 'registered'].includes(a.status) && <span style={{ color: 'var(--text-faint)', fontSize: 12 }}>Complete</span>}
                        </td>
                      </tr>
                    ))}
                    {!applications.length && <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: 'var(--text-faint)' }}>No applications yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'parents' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 16 }}>
              <form onSubmit={linkParent} style={card}>
                <h3 style={{ margin: '0 0 14px', fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>Link a parent to children</h3>
                <div style={{ marginBottom: 12 }}><label style={label}>Parent name *</label><input style={input} value={linkForm.parentName} onChange={(e) => setLinkForm({ ...linkForm, parentName: e.target.value })} required /></div>
                <div style={{ marginBottom: 12 }}><label style={label}>Phone *</label><input style={input} value={linkForm.phone} onChange={(e) => setLinkForm({ ...linkForm, phone: e.target.value })} placeholder="0788000000" required /></div>
                <div style={{ marginBottom: 12 }}><label style={label}>Email</label><input type="email" style={input} value={linkForm.email} onChange={(e) => setLinkForm({ ...linkForm, email: e.target.value })} /></div>
                <div style={{ marginBottom: 12 }}>
                  <label style={label}>Children *</label>
                  <div style={{ maxHeight: 180, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 8, padding: 8 }}>
                    {students.map((s) => (
                      <label key={s._id} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, padding: 4 }}>
                        <input type="checkbox" checked={linkForm.studentIds.includes(s._id)} onChange={() => toggleChild(s._id)} />
                        {s.fullName} <span style={{ color: 'var(--text-faint)' }}>({s.studentId})</span>
                      </label>
                    ))}
                    {!students.length && <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>No students found.</span>}
                  </div>
                </div>
                <button type="submit" style={btn('#1a3a5c')}><i className="fas fa-link" /> Link parent</button>
              </form>

              <div style={card}>
                <h3 style={{ margin: '0 0 14px', fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>Linked parents ({parents.length})</h3>
                {parents.map((p) => (
                  <div key={p._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--surface-muted)' }}>
                    <strong style={{ fontSize: 13 }}>{p.parentName || 'Parent'}</strong>
                    <div style={{ fontSize: 12, color: 'var(--text-faint)' }}>{p.parentPhone} · {p.children?.length || 0} child(ren)</div>
                    <div style={{ fontSize: 12 }}>{p.children?.map((c) => c.fullName).join(', ') || '—'}</div>
                  </div>
                ))}
                {!parents.length && <p style={{ color: 'var(--text-faint)' }}>No verified links yet.</p>}
              </div>
            </div>
          )}

          {tab === 'content' && <WebsiteContentPanel role={role} />}
        </main>
      </div>
    </div>
  );
};

export default AdminAssistantDashboard;
