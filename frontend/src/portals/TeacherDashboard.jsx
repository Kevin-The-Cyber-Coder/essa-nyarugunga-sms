import { API_URL } from '../config/api';
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { GradebookPanel } from './GradebookPanel';
import { ClassAnnouncementsPanel } from './ClassAnnouncementsPanel';
import GroupedNav from '../components/GroupedNav';
import ThemeToggle from '../components/ThemeToggle';
import PreferencesPanel from '../components/PreferencesPanel';
import ClassResourcesPanel from '../components/resources/ClassResourcesPanel';


const getToken = () => localStorage.getItem('portalToken');
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// ─── helpers ─────────────────────────────────────────────────────────────────
const fmt = (d) => d ? new Date(d).toLocaleDateString('en-RW', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

const getFormattedDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-RW', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// Escape text before putting it into SweetAlert's html option
const escapeHtml = (str = '') =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

// ─── shared UI atoms ─────────────────────────────────────────────────────────
const Badge = ({ text, color, bg, size = 11 }) => (
  <span style={{ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: size, fontWeight: 700, color, background: bg, whiteSpace: 'nowrap' }}>
    {typeof text === 'string' ? text.replace(/_/g, ' ').toUpperCase() : text}
  </span>
);

const Avatar = ({ name = '?', size = 36, bg = '#1a3a5c', color = '#ffc107', img }) => {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  return img
    ? <img src={img} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    : <div style={{ width: size, height: size, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.38, flexShrink: 0, letterSpacing: 1 }}>{initials}</div>;
};

const Modal = ({ open, onClose, title, children, width = 520 }) => {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: 'var(--surface-card)', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 24px 80px rgba(0,0,0,.25)' }}>
        <div style={{ padding: '18px 22px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--surface-card)', zIndex: 1, borderRadius: '16px 16px 0 0' }}>
          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, color: 'var(--text-faint)', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '20px 22px' }}>{children}</div>
      </div>
    </div>
  );
};

const Field = ({ label, children, required }) => (
  <div style={{ marginBottom: 14 }}>
    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5, letterSpacing: 0.5 }}>
      {label?.toUpperCase()}{required && <span style={{ color: '#e74c3c' }}> *</span>}
    </label>
    {children}
  </div>
);

const inputStyle = { width: '100%', padding: '9px 12px', border: '1.5px solid var(--surface-sunken-2)', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .2s' };
const Inp = (props) => <input {...props} style={{ ...inputStyle, ...props.style }}
  onFocus={e => e.target.style.borderColor = '#1a3a5c'} onBlur={e => e.target.style.borderColor = ''} />;
const Sel = ({ children, ...props }) => <select {...props} style={{ ...inputStyle, background: 'var(--surface-card)', ...props.style }}>{children}</select>;
const Txt = (props) => <textarea {...props} style={{ ...inputStyle, resize: 'vertical', minHeight: 80, ...props.style }}
  onFocus={e => e.target.style.borderColor = '#1a3a5c'} onBlur={e => e.target.style.borderColor = ''} />;

const Btn = ({ children, onClick, icon, color = '#1a3a5c', textColor = 'var(--on-solid)', small, danger, disabled, style: s }) => {
  const bg = danger ? '#e74c3c' : disabled ? '#ccc' : color;
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: bg, color: textColor, border: 'none', borderRadius: 8, padding: small ? '6px 13px' : '9px 18px', fontSize: small ? 12 : 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, transition: 'all 0.2s', whiteSpace: 'nowrap', ...s }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.filter = 'brightness(1.05)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.filter = ''; e.currentTarget.style.transform = ''; } }}>
      {icon && <i className={icon} style={{ fontSize: 13 }} />}{children}
    </button>
  );
};

const StatCard = ({ icon, label, value, sub, accent = '#9b59b6', bg = '#f3e5f5', onClick }) => (
  <div onClick={onClick} style={{ background: 'var(--surface-card)', borderRadius: 16, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 12px rgba(0,0,0,.06)', cursor: onClick ? 'pointer' : 'default', transition: 'all 0.2s', border: '1px solid var(--surface-page)' }}
    onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,.12)'; } }}
    onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,.06)'; } }}>
    <div style={{ width: 50, height: 50, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <i className={icon} style={{ fontSize: 20, color: accent }} />
    </div>
    <div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--navy)', lineHeight: 1, fontFamily: 'Georgia, serif' }}>{value ?? '—'}</div>
      <div style={{ fontSize: 12, color: 'var(--text-faint)', marginTop: 3 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: accent, marginTop: 3, fontWeight: 600 }}>{sub}</div>}
    </div>
  </div>
);

const Table = ({ cols, rows, emptyMsg = 'No data found' }) => (
  <div style={{ overflowX: 'auto', borderRadius: 10, border: '1px solid var(--surface-page)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 500 }}>
      <thead>
        <tr style={{ background: 'var(--surface-muted)' }}>
          {cols.map((c, i) => <th key={i} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', letterSpacing: .8, borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>{c.toUpperCase()}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 36, color: 'var(--text-faint-2)', fontSize: 13 }}>{emptyMsg}</td></tr>
          : rows.map((row, i) => <tr key={i} style={{ borderBottom: '1px solid var(--surface-muted)', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#fafbff'} onMouseLeave={e => e.currentTarget.style.background = ''}>{row}</tr>)}
      </tbody>
    </table>
  </div>
);
const TD = ({ children, style }) => <td style={{ padding: '10px 14px', fontSize: 13, color: 'var(--text-body)', ...style }}>{children}</td>;

// Offense categories
const offenseCategories = {
  minor: [
    { value: 'tardiness', label: '⏰ Tardiness/Lateness' },
    { value: 'uniform_violation', label: '👕 Uniform Violation' },
    { value: 'missing_homework', label: '📚 Missing Homework' },
    { value: 'classroom_disruption', label: '🗣️ Classroom Disruption' },
    { value: 'phone_use', label: '📱 Phone Use in Class' }
  ],
  moderate: [
    { value: 'absenteeism', label: '📅 Absenteeism' },
    { value: 'disrespect', label: '😤 Disrespect to Teacher' },
    { value: 'cheating', label: '📝 Cheating/Plagiarism' },
    { value: 'bullying_verbal', label: '😔 Verbal Bullying' },
    { value: 'property_damage_minor', label: '🔨 Minor Property Damage' }
  ],
  major: [
    { value: 'assault', label: '👊 Physical Assault' },
    { value: 'theft', label: '💰 Theft' },
    { value: 'substance_abuse', label: '🍺 Substance Abuse' },
    { value: 'cyber_bullying', label: '💻 Cyber Bullying' },
    { value: 'threats', label: '⚠️ Threatening Behavior' }
  ]
};

const assignmentTypes = [
  { value: 'homework', label: '📚 Homework' },
  { value: 'classwork', label: '📝 Classwork' },
  { value: 'project', label: '🎯 Project' },
];

// ═══════════════════════════════════════════════════════════════════
const TeacherDashboard = () => {
  const navigate = useNavigate();

  // layout
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // data
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [resourceClassId, setResourceClassId] = useState('');

  // modals
  const [assignmentModal, setAssignmentModal] = useState(false);
  const [disciplineModal, setDisciplineModal] = useState(false);
  const [gradeModal, setGradeModal] = useState(false);
  const [gradeAssignment, setGradeAssignment] = useState(null);
  const [gradeScores, setGradeScores] = useState({});
  const [gradingId, setGradingId] = useState(null);
  const [remindingId, setRemindingId] = useState(null);

  // forms
  const [assignmentForm, setAssignmentForm] = useState({
    title: '', description: '', classId: '', type: 'homework', dueDate: '', totalPoints: 100
  });
  const [disciplineForm, setDisciplineForm] = useState({
    studentId: '', category: '', description: '', incidentDate: new Date().toISOString().split('T')[0]
  });

  // file states
  const [assignmentFile, setAssignmentFile] = useState(null);

  const userName = localStorage.getItem('userName') || 'Teacher';

  // responsive
  useEffect(() => {
    const check = () => { setIsMobile(window.innerWidth <= 1024); if (window.innerWidth > 1024) setMobileOpen(false); };
    check(); window.addEventListener('resize', check); return () => window.removeEventListener('resize', check);
  }, []);

  // ─── API ──────────────────────────────────────────────────────────
  const api = useCallback(async (path, opts = {}) => {
    const res = await fetch(`${API_URL}/api${path}`, { headers: authHeaders(), ...opts });
    if (!res.ok) return Promise.reject(await res.json().catch(() => ({})));
    return res.json();
  }, []);

  const fetchClasses = useCallback(() => api('/academic-admin/classes').then(d => setClasses(Array.isArray(d) ? d : [])).catch(() => setClasses([])), [api]);
  const fetchStudents = useCallback(() => api('/academic-admin/students').then(d => setStudents(Array.isArray(d) ? d : [])).catch(() => setStudents([])), [api]);
  const fetchAssignments = useCallback(() => api('/teacher/assignments').then(d => setAssignments(Array.isArray(d) ? d : [])).catch(() => setAssignments([])), [api]);
  const fetchAnnouncements = useCallback(() => api('/announcements')
    .then(d => {
      const list = Array.isArray(d) ? d : [];
      setAnnouncements(list);
      list.forEach(ann => {
        if (ann?._id) api(`/announcements/${ann._id}/read`, { method: 'PUT' }).catch(() => {});
      });
    })
    .catch(() => setAnnouncements([])), [api]);

  // auth + load
  useEffect(() => {
    const token = getToken();
    const role = localStorage.getItem('userRole');
    if (!token || role !== 'teacher') {
      navigate('/portal/login');
      return;
    }
    Promise.all([
      fetchClasses(), fetchStudents(), fetchAssignments(), fetchAnnouncements()
    ]).finally(() => setLoading(false));
  }, [navigate, fetchClasses, fetchStudents, fetchAssignments, fetchAnnouncements]);

  // Create Assignment with File Upload
  const createAssignment = async () => {
    if (!assignmentForm.title || !assignmentForm.classId || !assignmentForm.dueDate) {
      Swal.fire('Missing Fields', 'Title, class and due date required', 'warning');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('title', assignmentForm.title);
      formData.append('description', assignmentForm.description);
      formData.append('classId', assignmentForm.classId);
      formData.append('type', assignmentForm.type);
      formData.append('dueDate', assignmentForm.dueDate);
      formData.append('totalPoints', assignmentForm.totalPoints);
      if (assignmentFile) {
        formData.append('file', assignmentFile);
      }

      const token = getToken();
      const response = await fetch(`${API_URL}/api/teacher/assignments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) throw await response.json().catch(() => ({}));

      Swal.fire('✅ Assignment Created!', 'Assignment published successfully', 'success');
      setAssignmentModal(false);
      setAssignmentForm({ title: '', description: '', classId: '', type: 'homework', dueDate: '', totalPoints: 100 });
      setAssignmentFile(null);
      fetchAssignments();
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to create assignment', 'error');
    }
    finally { setSaving(false); }
  };

  const remindAssignment = async (a) => {
    setRemindingId(a._id);
    try {
      const d = await api(`/teacher/assignments/${a._id}/remind`, { method: 'POST' });
      Swal.fire('Reminder sent', `Reached ${d.students || 0} student(s) and ${d.parents || 0} guardian(s).`, 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to send reminder', 'error');
    } finally { setRemindingId(null); }
  };

  const sendFeedback = async (student) => {
    const { value: messageText } = await Swal.fire({
      title: `Feedback for ${student.fullName}`,
      input: 'textarea',
      inputPlaceholder: 'Write your academic feedback…',
      showCancelButton: true,
      confirmButtonText: 'Send',
      confirmButtonColor: '#1a3a5c'
    });
    if (!messageText || !messageText.trim()) return;
    try {
      const d = await api('/teacher/feedback', { method: 'POST', body: JSON.stringify({ studentId: student._id, message: messageText }) });
      Swal.fire('Sent', `Delivered to ${d.reached || 1} recipient(s).`, 'success');
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to send feedback', 'error');
    }
  };

  const openGrading = (assignment) => {
    setGradeAssignment(assignment);
    const byStudent = {};
    (assignment.submissions || []).forEach(s => {
      byStudent[s.studentId] = { score: s.score ?? '', feedback: s.feedback || '' };
    });
    setGradeScores(byStudent);
    setGradeModal(true);
  };

  const saveGrade = async (studentId) => {
    const entry = gradeScores[studentId] || {};
    if (entry.score === '' || entry.score === null || entry.score === undefined) {
      Swal.fire('Missing Score', 'Enter a score before saving', 'warning');
      return;
    }
    setGradingId(String(studentId));
    try {
      await api(`/teacher/assignments/${gradeAssignment._id}/grade`, {
        method: 'PUT',
        body: JSON.stringify({ studentId, score: entry.score, feedback: entry.feedback || '' })
      });
      Swal.fire('Saved', 'Score and feedback saved', 'success');
      fetchAssignments();
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to save grade', 'error');
    } finally {
      setGradingId(null);
    }
  };

  const reportIncident = async () => {
    if (!disciplineForm.studentId || !disciplineForm.category || !disciplineForm.description) {
      Swal.fire('Missing Fields', 'Please fill all required fields', 'warning');
      return;
    }
    setSaving(true);
    try {
      const student = students.find(s => s._id === disciplineForm.studentId);
      await api('/discipline-admin/cases', {
        method: 'POST',
        body: JSON.stringify({
          studentId: disciplineForm.studentId,
          studentName: student?.fullName || 'Unknown',
          className: student?.classId?.className || '',
          category: disciplineForm.category,
          description: disciplineForm.description,
          status: 'pending'
        })
      });
      Swal.fire('✅ Incident Reported!', 'Report sent to Discipline Admin', 'success');
      setDisciplineModal(false);
      setDisciplineForm({ studentId: '', category: '', description: '', incidentDate: new Date().toISOString().split('T')[0] });
    } catch (e) {
      Swal.fire('Error', e.message || 'Failed to report', 'error');
    }
    finally { setSaving(false); }
  };


  const pendingAssignments = assignments.filter(a => new Date(a.dueDate) > new Date()).length;
  const totalStudents = students.length;
  const today = getFormattedDate();

  // Seven top-level domains; every feature below is reachable as a sub-item.
  const navGroups = [
    {
      id: 'g-dashboard', label: 'Dashboard', icon: 'fas fa-chart-line',
      items: [
        { id: 'overview', label: 'Dashboard', icon: 'fas fa-chart-line' },
      ]
    },
    {
      id: 'g-classes', label: 'My Teaching', icon: 'fas fa-chalkboard',
      items: [
        { id: 'classes', label: 'My Classes', icon: 'fas fa-school' },
        { id: 'students', label: 'My Students', icon: 'fas fa-user-graduate' },
      ]
    },
    {
      id: 'g-assessment', label: 'Assessment', icon: 'fas fa-clipboard-check',
      items: [
        { id: 'gradebook', label: 'Gradebook', icon: 'fas fa-table' },
        { id: 'assignments', label: 'Assignments', icon: 'fas fa-tasks', badge: pendingAssignments },
      ]
    },
    {
      id: 'g-resources', label: 'Resources', icon: 'fas fa-folder-open',
      items: [
        { id: 'class-resources', label: 'Class Resources', icon: 'fas fa-folder-open' },
      ]
    },
    {
      id: 'g-conduct', label: 'Conduct', icon: 'fas fa-exclamation-triangle',
      items: [
        { id: 'discipline', label: 'Report Issue', icon: 'fas fa-exclamation-triangle' },
      ]
    },
    {
      id: 'g-comms', label: 'Communication', icon: 'fas fa-comments',
      items: [
        { id: 'announcements', label: 'Class Notices', icon: 'fas fa-bullhorn' },
      ]
    },
    {
      id: 'g-account', label: 'Account', icon: 'fas fa-user-shield',
      items: [
        { id: 'profile', label: 'Profile', icon: 'fas fa-user-shield' },
      ]
    },
  ];

  // Flat lookup so the top bar can title the screen, not the domain.
  const menuItems = navGroups.flatMap(g => g.items);

  const sideW = isMobile ? 0 : sidebarOpen ? 260 : 72;

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'linear-gradient(135deg,var(--navy-deep),var(--navy))', color: 'var(--on-solid)', gap: 20 }}>
      <div style={{ width: 44, height: 44, border: '3px solid rgba(255,255,255,.15)', borderTopColor: '#ffc107', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
      <p style={{ margin: 0, fontSize: 16 }}>Loading Teacher Portal…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--surface-navy-tint)', fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .tab-anim{animation:fadeIn .22s ease}
        ::-webkit-scrollbar{width:5px;height:5px}::-webkit-scrollbar-thumb{background:#ccc;border-radius:10px}
        button, .btn-hover{cursor:pointer;transition:all 0.2s ease}
        button:hover, .btn-hover:hover{filter:brightness(1.05);transform:translateY(-1px)}
        @media(max-width:768px){.hide-mobile{display:none!important}}
      `}</style>

      {isMobile && mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 998 }} />}

      {/* ─── SIDEBAR ─── */}
      <aside style={{ position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 999, width: isMobile ? (mobileOpen ? 260 : 0) : sideW, background: 'linear-gradient(180deg,var(--navy-deep) 0%,var(--navy) 100%)', color: 'var(--on-solid)', display: 'flex', flexDirection: 'column', transition: 'width .3s ease', overflow: 'hidden', boxShadow: '3px 0 20px rgba(0,0,0,.18)' }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 11, flexShrink: 0 }}>
          <div style={{ width: 38, height: 38, background: '#ffc107', borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <i className="fas fa-chalkboard-user" style={{ fontSize: 16, color: 'var(--navy)' }} />
          </div>
          {(sidebarOpen || isMobile) && <div><div style={{ fontFamily: 'Georgia, serif', fontSize: 15, fontWeight: 600 }}>ESSA Portal</div><div style={{ fontSize: 10, opacity: .6, letterSpacing: 1 }}>TEACHER</div></div>}
          {!isMobile && <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'rgba(255,255,255,.4)', cursor: 'pointer', fontSize: 13, flexShrink: 0 }}><i className={`fas fa-chevron-${sidebarOpen ? 'left' : 'right'}`} /></button>}
        </div>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,.08)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Avatar name={userName} size={36} bg='rgba(255,193,7,.2)' color='#ffc107' />
          {(sidebarOpen || isMobile) && <div><div style={{ fontSize: 13, fontWeight: 600 }}>{userName}</div><div style={{ fontSize: 10, color: '#ffc107' }}>Teacher</div></div>}
        </div>
        <GroupedNav
          groups={navGroups}
          activeTab={activeTab}
          onSelect={setActiveTab}
          expanded={sidebarOpen || isMobile}
          isMobile={isMobile}
          onNavigate={() => isMobile && setMobileOpen(false)}
        />
        <div style={{ padding: 12, borderTop: '1px solid rgba(255,255,255,.08)', flexShrink: 0 }}>
          <button onClick={() => { localStorage.clear(); navigate('/portal/login'); }} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 12px', background: 'rgba(231,76,60,.2)', border: '1px solid rgba(231,76,60,.3)', borderRadius: 9, color: 'var(--tint-danger-line)', cursor: 'pointer', fontSize: 13, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(231,76,60,.4)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(231,76,60,.2)'; e.currentTarget.style.transform = ''; }}>
            <i className="fas fa-sign-out-alt" style={{ fontSize: 13 }} />{(sidebarOpen || isMobile) && 'Logout'}
          </button>
        </div>
      </aside>

      {/* ─── MAIN ─── */}
      <main style={{ flex: 1, marginLeft: isMobile ? 0 : sideW, transition: 'margin-left .3s', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {/* Top bar */}
        <div style={{ background: 'var(--surface-card)', padding: '11px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 8px rgba(0,0,0,.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {isMobile && <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'var(--navy)', color: 'var(--on-solid)', border: 'none', padding: '7px 10px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}>
              <i className="fas fa-bars" />
            </button>}
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-faint)', letterSpacing: .5 }}>ESSA NYARUGUNGA</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>{menuItems.find(m => m.id === activeTab)?.label || 'Dashboard'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle color="#1a3a5c" border="#e5e7eb" />
            <Avatar name={userName} size={32} />
            <div className="hide-mobile">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-body)' }}>{userName}</div>
              <div style={{ fontSize: 10, color: '#ffc107' }}>TEACHER</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: 20, overflowY: 'auto' }} className="tab-anim">

          {/* ══ OVERVIEW DASHBOARD ══ */}
          {activeTab === 'overview' && (
            <div>
              <div style={{ background: 'linear-gradient(135deg,var(--navy-deep),var(--navy))', borderRadius: 18, padding: '24px 28px', marginBottom: 22, color: 'var(--on-solid)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, boxShadow: '0 6px 24px rgba(26,58,92,.35)' }}>
                <div>
                  <div style={{ fontSize: 20, fontWeight: 600, fontFamily: 'Georgia, serif', marginBottom: 5 }}>Welcome back, {userName.split(' ')[0]}! 👨‍🏫</div>
                  <div style={{ fontSize: 12, opacity: .75 }}>{today}</div>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Btn onClick={() => setAssignmentModal(true)} icon="fas fa-plus" color="#ffc107" textColor="#1a3a5c">Create Assignment</Btn>
                </div>
              </div>

              {/* Stats Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 14, marginBottom: 20 }}>
                <StatCard icon="fas fa-school" label="My Classes" value={classes.length} sub="Assigned classes" accent="#9b59b6" bg="#f3e5f5" onClick={() => setActiveTab('classes')} />
                <StatCard icon="fas fa-user-graduate" label="Students" value={totalStudents} sub="Under my care" accent="#1abc9c" bg="#e0f7fa" onClick={() => setActiveTab('students')} />
                <StatCard icon="fas fa-tasks" label="Pending Assignments" value={pendingAssignments} sub="Need grading" accent="#f39c12" bg="#fff3e0" onClick={() => setActiveTab('assignments')} />
              </div>

              {/* Quick Actions */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <Btn onClick={() => setAssignmentModal(true)} icon="fas fa-tasks" color="#9b59b6">Create Assignment</Btn>
                <Btn onClick={() => setDisciplineModal(true)} icon="fas fa-exclamation-triangle" color="#e74c3c">Report Issue</Btn>
              </div>

              {/* Recent Announcements */}
              <div style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <h3 style={{ margin: 0, fontSize: 14, color: 'var(--navy)', fontWeight: 600 }}><i className="fas fa-bullhorn" style={{ marginRight: 7, color: '#ffc107' }} />Recent Announcements</h3>
                  <Btn small onClick={() => setActiveTab('announcements')} color="#1a3a5c">View All</Btn>
                </div>
                {announcements.slice(0, 3).map(ann => (
                  <div key={ann._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--surface-muted)' }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{ann.title}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>{fmt(ann.createdAt)}</div>
                  </div>
                ))}
                {announcements.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-faint-2)', padding: 20 }}>No announcements yet</p>}
              </div>
            </div>
          )}

          {/* ══ MY CLASSES ══ */}
          {activeTab === 'classes' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>My Classes</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{classes.length} classes assigned</p></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: 16 }}>
                {classes.map(cls => {
                  const classStudents = students.filter(s => s.classId?._id === cls._id);
                  return (
                    <div key={cls._id} style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)', borderLeft: '4px solid #9b59b6', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 16, color: 'var(--navy)' }}>{cls.grade} {cls.className}</h3>
                          <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-faint)' }}>Academic Year: {cls.academicYear}</p>
                        </div>
                        <Badge text={`${classStudents.length} students`} color="#3498db" bg="#e3f2fd" />
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                        <Btn small onClick={() => { setAssignmentForm(prev => ({ ...prev, classId: cls._id })); setAssignmentModal(true); }} icon="fas fa-tasks" color="#9b59b6">Create Assignment</Btn>
                      </div>
                    </div>
                  );
                })}
                {classes.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'var(--surface-card)', borderRadius: 14, color: 'var(--text-faint-2)' }}><i className="fas fa-school" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .3 }} />No classes assigned yet</div>}
              </div>
            </div>
          )}

          {/* ══ ASSIGNMENTS ══ */}
          {activeTab === 'assignments' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
                <div><h2 style={{ margin: 0, fontSize: 19, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>Assignments</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{assignments.length} total, {pendingAssignments} pending</p></div>
                <Btn onClick={() => setAssignmentModal(true)} icon="fas fa-plus" color="#9b59b6">Create Assignment</Btn>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {assignments.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'var(--surface-card)', borderRadius: 14, color: 'var(--text-faint-2)' }}><i className="fas fa-tasks" style={{ fontSize: 36, display: 'block', marginBottom: 10, opacity: .3 }} />No assignments created yet</div>}
                {assignments.map(a => {
                  const isDue = new Date(a.dueDate) < new Date();
                  return (
                    <div key={a._id} style={{ background: 'var(--surface-card)', borderRadius: 12, padding: '16px 18px', borderLeft: `4px solid ${isDue ? '#e74c3c' : '#27ae60'}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 14, color: 'var(--navy)' }}>{a.title}</h3>
                          <div style={{ display: 'flex', gap: 8, marginTop: 5, flexWrap: 'wrap' }}>
                            <Badge text={a.type} color="#9b59b6" bg="#f3e5f5" />
                            <Badge text={`Due: ${fmt(a.dueDate)}`} color={isDue ? '#e74c3c' : '#f39c12'} bg={isDue ? '#fdecea' : '#fff3e0'} />
                            <Badge text={`${a.totalPoints} pts`} color="#3498db" bg="#e3f2fd" />
                          </div>
                        </div>
                        <Btn small icon="fas fa-eye" color="#3498db" onClick={() => Swal.fire({
                          title: a.title,
                          html: `<p>${escapeHtml(a.description) || 'No description'}</p>${a.fileUrl ? `<a href="${encodeURI(a.fileUrl)}" target="_blank" rel="noreferrer">Download Attachment</a>` : ''}`,
                          width: 500
                        })}>View</Btn>
                        <Btn small icon="fas fa-check-double" color="#27ae60" onClick={() => openGrading(a)}>Submissions ({(a.submissions || []).length})</Btn>
                        <Btn small icon={remindingId === a._id ? 'fas fa-spinner fa-spin' : 'fas fa-bell'} color="#f39c12" onClick={() => remindAssignment(a)}>{remindingId === a._id ? 'Sending…' : 'Remind'}</Btn>
                      </div>
                      {a.description && <p style={{ margin: '8px 0 0', fontSize: 12, color: 'var(--text-secondary)' }}>{a.description.substring(0, 100)}{a.description.length > 100 ? '...' : ''}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ STUDENTS ══ */}
          {activeTab === 'students' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>My Students</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{students.length} students</p></div>
              <div style={{ background: 'var(--surface-card)', borderRadius: 14, boxShadow: '0 2px 10px rgba(0,0,0,.05)', overflowX: 'auto' }}>
                <Table
                  cols={['Student', 'Class', 'Parent', 'Contact', 'Actions']}
                  emptyMsg="No students found"
                  rows={students.map(s => (
                    <Fragment key={s._id || s.studentId}>
                      <TD>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{s.fullName}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{s.studentId || ''}</div>
                      </TD>
                      <TD>
                        {s.classId
                          ? <Badge text={`${s.classId.grade || ''} ${s.classId.className || ''}`.trim()} color="#3498db" bg="#e3f2fd" />
                          : '—'}
                      </TD>
                      <TD style={{ fontSize: 12 }}>{s.parentName || '—'}</TD>
                      <TD style={{ fontSize: 12 }}>{s.parentPhone || '—'}</TD>
                      <TD>
                        <Btn small icon="fas fa-comment-dots" color="#0e7490" onClick={() => sendFeedback(s)}>Feedback</Btn>
                      </TD>
                    </Fragment>
                  ))}
                />
              </div>
            </div>
          )}

          {/* ══ DISCIPLINE (REPORT ISSUE) ══ */}
          {activeTab === 'discipline' && (
            <div>
              <div style={{ marginBottom: 18 }}><h2 style={{ margin: 0, fontSize: 19, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>Report Student Issue</h2><p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>Report misbehavior to Discipline Admin</p></div>
              <div style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 24, maxWidth: 600, margin: '0 auto', boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <Field label="Student" required>
                  <Sel value={disciplineForm.studentId} onChange={e => setDisciplineForm(p => ({ ...p, studentId: e.target.value }))}>
                    <option value="">Select student…</option>
                    {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.classId?.grade || ''} {s.classId?.className || ''})</option>)}
                  </Sel>
                </Field>
                <Field label="Offense Category" required>
                  <Sel value={disciplineForm.category} onChange={e => setDisciplineForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category…</option>
                    <optgroup label="Minor Offenses">{offenseCategories.minor.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                    <optgroup label="Moderate Offenses">{offenseCategories.moderate.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                    <optgroup label="Major Offenses">{offenseCategories.major.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</optgroup>
                  </Sel>
                </Field>
                <Field label="Description" required>
                  <Txt value={disciplineForm.description} rows={4} placeholder="Describe the incident in detail..." onChange={e => setDisciplineForm(p => ({ ...p, description: e.target.value }))} />
                </Field>
                <Field label="Incident Date"><Inp type="date" value={disciplineForm.incidentDate} onChange={e => setDisciplineForm(p => ({ ...p, incidentDate: e.target.value }))} /></Field>
                <Btn onClick={reportIncident} icon="fas fa-paper-plane" color="#e74c3c" disabled={saving} style={{ width: '100%', justifyContent: 'center' }}>{saving ? 'Reporting…' : 'Report Incident'}</Btn>
              </div>
            </div>
          )}

          {/* ══ CLASS RESOURCES ══ */}
          {activeTab === 'class-resources' && (
            <div>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ margin: 0, fontSize: 19, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>Class Resources</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>Files and links for your classes. Students can open them from their portal.</p>
              </div>
              <div style={{ marginBottom: 16, maxWidth: 340 }}>
                <select
                  value={resourceClassId}
                  onChange={e => setResourceClassId(e.target.value)}
                  style={{ width: '100%', padding: '9px 10px', borderRadius: 9, border: '1.5px solid var(--surface-sunken-2)', background: 'var(--surface-card)', color: 'var(--text-body)', fontSize: 13, fontFamily: 'inherit' }}
                >
                  <option value="">Select a class…</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.grade} {c.className}</option>)}
                </select>
              </div>
              <ClassResourcesPanel classId={resourceClassId} canManage />
            </div>
          )}

          {/* ══ CLASS NOTICES ══ */}
          {activeTab === 'announcements' && (
            <div>
              <ClassAnnouncementsPanel />

              {/* The school-wide feed stays: a teacher's own notices sit above
                  it, and the head's notices are still worth reading. */}
              <div style={{ margin: '26px 0 18px' }}>
                <h2 style={{ margin: 0, fontSize: 17, color: 'var(--navy)', fontFamily: 'Georgia, serif' }}>School Announcements</h2>
                <p style={{ margin: '3px 0 0', fontSize: 12, color: 'var(--text-faint)' }}>{announcements.length} for the whole school</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {announcements.length === 0 && <div style={{ textAlign: 'center', padding: 50, background: 'var(--surface-card)', borderRadius: 14, color: 'var(--text-faint-2)' }}><i className="fas fa-bullhorn" style={{ fontSize: 32, display: 'block', marginBottom: 10, opacity: .3 }} />No announcements yet</div>}
                {announcements.map(ann => {
                  const pc = ann.priority === 'urgent' ? '#e74c3c' : ann.priority === 'high' ? '#f39c12' : '#27ae60';
                  return (
                    <div key={ann._id} style={{ background: 'var(--surface-card)', borderRadius: 12, padding: '15px 18px', borderLeft: `4px solid ${pc}`, boxShadow: '0 2px 8px rgba(0,0,0,.04)', transition: 'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateX(2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = ''}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                        <h3 style={{ margin: 0, fontSize: 14, color: 'var(--navy)' }}>{ann.title}</h3>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <Badge text={ann.priority} color={pc} bg={pc + '22'} />
                          <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>{fmt(ann.createdAt)}</span>
                        </div>
                      </div>
                      <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>{ann.content}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {activeTab === 'profile' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div style={{ background: 'linear-gradient(135deg,var(--navy-deep),var(--navy))', borderRadius: 18, padding: '30px', textAlign: 'center', marginBottom: 18, color: 'var(--on-solid)' }}>
                <Avatar name={userName} size={72} bg='rgba(255,193,7,.2)' color='#ffc107' />
                <h2 style={{ margin: '14px 0 3px', fontFamily: 'Georgia, serif', fontSize: 22 }}>{userName}</h2>
                <div style={{ fontSize: 11, opacity: .7, letterSpacing: 1 }}>TEACHER</div>
                <div style={{ fontSize: 12, opacity: .6, marginTop: 4 }}>{localStorage.getItem('userEmail') || 'teacher@essa.rw'}</div>
              </div>
              <div style={{ background: 'var(--surface-card)', borderRadius: 14, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,.05)' }}>
                <h3 style={{ margin: '0 0 16px', fontSize: 15, color: 'var(--navy)', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <i className="fas fa-lock" style={{ color: '#ffc107' }} />Change Password
                </h3>
                {[['Current Password', 'currentPw'], ['New Password', 'newPw'], ['Confirm New Password', 'confirmPw']].map(([label, id]) => (
                  <Field key={id} label={label} required><Inp type="password" id={id} placeholder={`Enter ${label.toLowerCase()}`} /></Field>
                ))}
                <Btn icon="fas fa-key" color="#1a3a5c" onClick={() => {
                  const cur = document.getElementById('currentPw')?.value;
                  const nw = document.getElementById('newPw')?.value;
                  const cf = document.getElementById('confirmPw')?.value;
                  if (!cur || !nw || !cf) { Swal.fire('Error', 'All fields required', 'warning'); return; }
                  if (nw !== cf) { Swal.fire('Error', 'Passwords do not match', 'error'); return; }
                  if (nw.length < 6) { Swal.fire('Error', 'Min 6 characters', 'error'); return; }
                  api('/user/change-password', { method: 'PUT', body: JSON.stringify({ currentPassword: cur, newPassword: nw }) })
                    .then(() => Swal.fire('✅ Password Updated!', '', 'success'))
                    .catch(e => Swal.fire('Error', e.message || 'Current password incorrect', 'error'));
                }}>Update Password</Btn>
              </div>

              <div style={{ marginTop: 16 }}>
                <PreferencesPanel />
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── MODALS ─── */}

      {/* Create Assignment Modal */}
      <Modal open={assignmentModal} onClose={() => setAssignmentModal(false)} title="Create Assignment" width={560}>
        <Field label="Title" required><Inp value={assignmentForm.title} placeholder="Assignment title" onChange={e => setAssignmentForm(p => ({ ...p, title: e.target.value }))} /></Field>
        <Field label="Class" required>
          <Sel value={assignmentForm.classId} onChange={e => setAssignmentForm(p => ({ ...p, classId: e.target.value }))}>
            <option value="">Select class…</option>
            {classes.map(c => <option key={c._id} value={c._id}>{c.grade} {c.className}</option>)}
          </Sel>
        </Field>
        <Field label="Assignment Type">
          <Sel value={assignmentForm.type} onChange={e => setAssignmentForm(p => ({ ...p, type: e.target.value }))}>
            {assignmentTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </Sel>
        </Field>
        <Field label="Description"><Txt value={assignmentForm.description} rows={4} placeholder="Instructions for students..." onChange={e => setAssignmentForm(p => ({ ...p, description: e.target.value }))} /></Field>
        <Field label="Due Date" required><Inp type="datetime-local" value={assignmentForm.dueDate} onChange={e => setAssignmentForm(p => ({ ...p, dueDate: e.target.value }))} /></Field>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Field label="Total Points"><Inp type="number" min="0" value={assignmentForm.totalPoints} onChange={e => setAssignmentForm(p => ({ ...p, totalPoints: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))} /></Field>
          <Field label="Attachment (PDF/DOC)"><input type="file" accept=".pdf,.doc,.docx,.jpg,.png" onChange={e => setAssignmentFile(e.target.files[0] || null)} style={{ fontSize: 13, padding: '6px 0' }} /></Field>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setAssignmentModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={createAssignment} icon="fas fa-paper-plane" color="#9b59b6" disabled={saving}>{saving ? 'Creating…' : 'Create Assignment'}</Btn>
        </div>
      </Modal>

      {/* Grade Submissions Modal */}
      <Modal open={gradeModal} onClose={() => setGradeModal(false)} title={`Grade: ${gradeAssignment?.title || ''}`} width={640}>
        {(gradeAssignment?.submissions || []).length === 0
          ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-faint)' }}><i className="fas fa-inbox" style={{ fontSize: 34, display: 'block', marginBottom: 10, opacity: .4 }} />No submissions yet</div>
          : (gradeAssignment?.submissions || []).map(sub => {
            const student = students.find(s => String(s._id) === String(sub.studentId));
            const entry = gradeScores[sub.studentId] || {};
            return (
              <div key={String(sub.studentId)} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: 12, marginBottom: 10, background: 'var(--surface-raised)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                  <div>
                    <strong style={{ fontSize: 13, color: 'var(--navy)' }}>{student?.fullName || sub.studentId}</strong>
                    <span style={{ marginLeft: 10, fontSize: 11, color: '#28a745', textTransform: 'capitalize' }}>{sub.status}</span>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 2 }}>
                      Submitted: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString() : '—'}
                      {sub.fileUrl && <> · <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#3498db' }}>View file</a></>}
                    </div>
                  </div>
                  <Btn small color="#27ae60" disabled={gradingId === String(sub.studentId)} onClick={() => saveGrade(sub.studentId)}>{gradingId === String(sub.studentId) ? 'Saving…' : 'Save Grade'}</Btn>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 10 }}>
                  <input type="number" min="0" max="100" placeholder="Score / 100"
                    value={entry.score ?? ''}
                    onChange={e => setGradeScores(p => ({ ...p, [sub.studentId]: { ...(p[sub.studentId] || {}), score: e.target.value } }))}
                    style={{ padding: '8px 10px', border: '1.5px solid var(--surface-sunken-2)', borderRadius: 8, fontSize: 13 }} />
                  <input placeholder="Feedback for student…"
                    value={entry.feedback || ''}
                    onChange={e => setGradeScores(p => ({ ...p, [sub.studentId]: { ...(p[sub.studentId] || {}), feedback: e.target.value } }))}
                    style={{ padding: '8px 10px', border: '1.5px solid var(--surface-sunken-2)', borderRadius: 8, fontSize: 13 }} />
                </div>
              </div>
            );
          })}
      </Modal>

      {/* Report Incident Modal */}
      <Modal open={disciplineModal} onClose={() => setDisciplineModal(false)} title="Report Student Misbehavior" width={560}>
        <Field label="Student" required>
          <Sel value={disciplineForm.studentId} onChange={e => setDisciplineForm(p => ({ ...p, studentId: e.target.value }))}>
            <option value="">Select student…</option>
            {students.map(s => <option key={s._id} value={s._id}>{s.fullName} ({s.classId?.grade || ''} {s.classId?.className || ''})</option>)}
          </Sel>
        </Field>
        <Field label="Offense Category" required>
          <Sel value={disciplineForm.category} onChange={e => setDisciplineForm(p => ({ ...p, category: e.target.value }))}>
            <option value="">Select category…</option>
            {[...offenseCategories.minor, ...offenseCategories.moderate, ...offenseCategories.major].map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Sel>
        </Field>
        <Field label="Description" required><Txt value={disciplineForm.description} rows={4} placeholder="Describe what happened..." onChange={e => setDisciplineForm(p => ({ ...p, description: e.target.value }))} /></Field>
        <Field label="Incident Date"><Inp type="date" value={disciplineForm.incidentDate} onChange={e => setDisciplineForm(p => ({ ...p, incidentDate: e.target.value }))} /></Field>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn onClick={() => setDisciplineModal(false)} color="#f0f0f0" textColor="#666">Cancel</Btn>
          <Btn onClick={reportIncident} icon="fas fa-exclamation-triangle" color="#e74c3c" disabled={saving}>{saving ? 'Reporting…' : 'Report Incident'}</Btn>
        </div>
      </Modal>

    </div>
  );
};

export default TeacherDashboard;