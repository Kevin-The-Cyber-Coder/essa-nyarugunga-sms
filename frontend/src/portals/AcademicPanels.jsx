import React, { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('portalToken')}`
});

const api = async (path, opts = {}) => {
  const res = await fetch(`${API_URL}/api${path}`, { headers: authHeaders(), ...opts });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return Promise.reject(new Error(body.message || 'Request failed'));
  }
  return res.json();
};

const TERMS = ['Term 1', 'Term 2', 'Term 3'];
const YEARS = [String(new Date().getFullYear()), String(new Date().getFullYear() - 1)];
const EXAM_TYPES = ['CAT', 'Midterm', 'Final', 'Assignment', 'Practical', 'Other'];

const inputStyle = {
  width: '100%', padding: '8px 11px', border:'1.5px solid var(--surface-sunken-2)', borderRadius: 8,
  fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', background:'var(--surface-card)'
};
const Inp = (p) => <input {...p} style={{ ...inputStyle, ...p.style }} />;
const Sel = ({ children, ...p }) => <select {...p} style={{ ...inputStyle, ...p.style }}>{children}</select>;

const Panel = ({ title, sub, actions, children }) => (
  <div>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 18 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 19, color:'var(--navy)', fontFamily: 'Georgia, serif' }}>{title}</h2>
        {sub && <p style={{ margin: '5px 0 0', fontSize: 12.5, color:'var(--text-faint)', maxWidth: 640, lineHeight: 1.5 }}>{sub}</p>}
      </div>
      {actions && <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>{actions}</div>}
    </div>
    {children}
  </div>
);

const Card = ({ children, style }) => (
  <div style={{ background:'var(--surface-card)', borderRadius: 14, padding: 18, boxShadow: '0 2px 10px rgba(0,0,0,.05)', border:'1px solid var(--surface-page)', ...style }}>{children}</div>
);

const Btn = ({ children, onClick, icon, color = '#1a3a5c', small, danger, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: danger ? '#e74c3c' : disabled ? '#ccc' : color, color:'var(--on-solid)', border: 'none',
    borderRadius: 8, padding: small ? '6px 12px' : '8px 16px', fontSize: small ? 12 : 13,
    fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: 6, fontFamily: 'inherit'
  }}>{icon && <i className={icon} />}{children}</button>
);

const Table = ({ cols, rows, empty = 'Nothing to show yet' }) => (
  <div style={{ overflowX: 'auto', borderRadius: 10, border:'1px solid var(--surface-page)' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
      <thead>
        <tr style={{ background:'var(--surface-muted)' }}>
          {cols.map((c, i) => <th key={i} style={{ padding: '9px 13px', textAlign: 'left', fontSize: 10.5, fontWeight: 700, color:'var(--text-faint)', letterSpacing: .8, borderBottom:'1px solid var(--border)', whiteSpace: 'nowrap' }}>{c.toUpperCase()}</th>)}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} style={{ textAlign: 'center', padding: 30, color:'var(--text-faint-2)', fontSize: 13 }}>{empty}</td></tr>
          : rows.map((r, i) => <tr key={i} style={{ borderBottom:'1px solid var(--surface-muted)' }}>{r}</tr>)}
      </tbody>
    </table>
  </div>
);
const TD = ({ children, style }) => <td style={{ padding: '9px 13px', fontSize: 13, color:'var(--text-body)', ...style }}>{children}</td>;

const Tag = ({ text, color = '#1a3a5c', bg = '#eef2f6' }) => (
  <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 20, fontSize: 10.5, fontWeight: 700, color, background: bg }}>{text}</span>
);

const Metric = ({ label, value, sub, color = '#1a3a5c' }) => (
  <div style={{ background:'var(--surface-card)', borderRadius: 12, padding: '14px 16px', border:'1px solid var(--surface-page)' }}>
    <div style={{ fontSize: 11, color:'var(--text-faint)', fontWeight: 600, letterSpacing: .4 }}>{label.toUpperCase()}</div>
    <div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'Georgia, serif', marginTop: 4 }}>{value ?? '—'}</div>
    {sub && <div style={{ fontSize: 11, color:'var(--text-faint)', marginTop: 2 }}>{sub}</div>}
  </div>
);

const classLabel = (c) => (c ? `${c.grade || ''} ${c.className || ''}`.trim() : '—');
const picker = (classes, value, onChange, includeAll) => (
  <Sel value={value} onChange={e => onChange(e.target.value)} style={{ width: 190 }}>
    {includeAll && <option value="">All classes</option>}
    {classes.map(c => <option key={c._id} value={c._id}>{classLabel(c)}</option>)}
  </Sel>
);

export const SubjectAllocationPanel = ({ classes, teachers }) => {
  const [classId, setClassId] = useState('');
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({ subject: '', teacherId: '', periodsPerWeek: 4 });

  const load = useCallback(() => {
    const qs = classId ? `?classId=${classId}` : '';
    return api(`/subject-allocations${qs}`).then(d => setRows(d.allocations || [])).catch(() => setRows([]));
  }, [classId]);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!classId || !form.subject.trim()) { alert('Pick a class and enter a subject'); return; }
    try {
      await api('/subject-allocations', { method: 'POST', body: JSON.stringify({ ...form, classId, academicYear: String(new Date().getFullYear()) }) });
      setForm({ ...form, subject: '' });
      load();
    } catch (e) { alert(e.message); }
  };

  return (
    <Panel
      title="Subject Allocation"
      sub="Decide which teacher teaches which subject in which class. A class cannot have the same subject allocated twice."
      actions={<>{picker(classes, classId, setClassId, true)}</>}
    >
      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>SUBJECT
            <Inp value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Biology" style={{ marginTop: 4, width: 180 }} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>TEACHER
            <Sel value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })} style={{ marginTop: 4, width: 180 }}>
              <option value="">— Unassigned —</option>
              {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
            </Sel>
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>PERIODS / WEEK
            <Inp type="number" min="0" value={form.periodsPerWeek} onChange={e => setForm({ ...form, periodsPerWeek: e.target.value })} style={{ marginTop: 4, width: 120 }} />
          </label>
          <Btn icon="fas fa-plus" onClick={add}>Allocate</Btn>
        </div>
      </Card>

      <Table
        cols={['Class', 'Subject', 'Teacher', 'Periods/week', '']}
        rows={rows.map(a => (
          <tr key={a._id}>
            <TD>{a.className || '—'}</TD>
            <TD style={{ fontWeight: 600 }}>{a.subject}</TD>
            <TD>{a.teacherName || <Tag text="Unassigned" color="#b8860b" bg="#fff8e1" />}</TD>
            <TD>{a.periodsPerWeek}</TD>
            <TD>
              <Btn small danger icon="fas fa-trash" onClick={async () => {
                if (!confirm(`Remove ${a.subject} from this class?`)) return;
                await api(`/subject-allocations/${a._id}`, { method: 'DELETE' });
                load();
              }} />
            </TD>
          </tr>
        ))}
        empty={classId ? 'No subjects allocated for this class yet' : 'Pick a class to see its allocations'}
      />
    </Panel>
  );
};

// ── Exams ───────────────────────────────────────────────────────────────────
export const ExamsPanel = ({ classes }) => {
  const [exams, setExams] = useState([]);
  const [term, setTerm] = useState(TERMS[0]);
  const [year, setYear] = useState(YEARS[0]);
  const [form, setForm] = useState({ name: '', type: 'Midterm', weight: 20, maxScore: 100, examDate: '', instructions: '', classIds: [] });
  const [busy, setBusy] = useState(false);

  const load = useCallback(
    () => api(`/exams?term=${term}&year=${year}`).then(d => setExams(d.exams || [])).catch(() => setExams([])),
    [term, year]
  );
  useEffect(() => { load(); }, [load]);

  const create = async () => {
    if (!form.name.trim()) { alert('Exam name is required'); return; }
    setBusy(true);
    try {
      await api('/exams', {
        method: 'POST',
        body: JSON.stringify({ ...form, term, year: Number(year), classIds: form.classIds, examDate: form.examDate || undefined })
      });
      setForm({ ...form, name: '', instructions: '' });
      load();
    } catch (e) { alert(e.message); } finally { setBusy(false); }
  };

  const totalWeight = exams.filter(e => e.isPublished).reduce((a, e) => a + (e.weight || 0), 0);

  return (
    <Panel
      title="Exams & Weighting"
      sub="Set the weight of each assessment type. The weighted total feeds final grades, so the published weights should add up to 100."
      actions={
        <>
          <Sel value={term} onChange={e => setTerm(e.target.value)} style={{ width: 120 }}>
            {TERMS.map(t => <option key={t}>{t}</option>)}
          </Sel>
          <Sel value={year} onChange={e => setYear(e.target.value)} style={{ width: 110 }}>{YEARS.map(y => <option key={y}>{y}</option>)}</Sel>
        </>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12, marginBottom: 18 }}>
        <Metric label="Exams" value={exams.length} />
        <Metric label="Published weight" value={`${totalWeight}%`} sub={totalWeight === 100 ? 'Balanced' : 'Should total 100%'} color={totalWeight === 100 ? '#27ae60' : '#e67e22'} />
        <Metric label="Classes covered" value={new Set(exams.flatMap(e => e.classIds || []).map(String)).size} />
      </div>

      <Card style={{ marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>NAME
            <Inp value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Term 1 Midterm" style={{ marginTop: 4, width: 190 }} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>TYPE
            <Sel value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ marginTop: 4, width: 120 }}>
              {EXAM_TYPES.map(t => <option key={t}>{t}</option>)}
            </Sel>
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>WEIGHT %
            <Inp type="number" min="0" max="100" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} style={{ marginTop: 4, width: 90 }} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>MAX SCORE
            <Inp type="number" min="1" value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} style={{ marginTop: 4, width: 100 }} />
          </label>
          <label style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)' }}>DATE
            <Inp type="date" value={form.examDate} onChange={e => setForm({ ...form, examDate: e.target.value })} style={{ marginTop: 4, width: 150 }} />
          </label>
          <Btn icon="fas fa-plus" onClick={create} disabled={busy}>Create exam</Btn>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color:'var(--text-secondary)', marginBottom: 6 }}>CLASSES THIS EXAM COVERS</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {classes.map(c => {
              const on = form.classIds.includes(c._id);
              return (
                <button key={c._id} onClick={() => setForm({
                  ...form,
                  classIds: on ? form.classIds.filter(id => id !== c._id) : [...form.classIds, c._id]
                })} style={{
                  padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  border: `1.5px solid ${on ? '#1a3a5c' : '#e0e0e0'}`, background: on ? '#1a3a5c' : 'var(--surface-card)', color: on ? 'var(--on-solid)' : '#666'
                }}>{classLabel(c)}</button>
              );
            })}
          </div>
        </div>
      </Card>

      <Table
        cols={['Name', 'Type', 'Weight', 'Max', 'Date', 'Status', '']}
        rows={exams.map(e => (
          <tr key={e._id}>
            <TD style={{ fontWeight: 600 }}>{e.name}</TD>
            <TD><Tag text={e.type} /></TD>
            <TD>{e.weight}%</TD>
            <TD>{e.maxScore}</TD>
            <TD>{e.examDate ? new Date(e.examDate).toLocaleDateString('en-RW') : '—'}</TD>
            <TD>{e.isPublished ? <Tag text="Published" color="#27ae60" bg="#e8f5e9" /> : <Tag text="Draft" color="#888" bg="#f0f0f0" />}</TD>
            <TD style={{ whiteSpace: 'nowrap' }}>
              <Btn small color={e.isPublished ? '#6c757d' : '#27ae60'} onClick={async () => {
                await api(`/exams/${e._id}`, { method: 'PUT', body: JSON.stringify({ isPublished: !e.isPublished }) });
                load();
              }}>{e.isPublished ? 'Unpublish' : 'Publish'}</Btn>{' '}
              <Btn small danger icon="fas fa-trash" onClick={async () => {
                if (!confirm(`Delete ${e.name}?`)) return;
                await api(`/exams/${e._id}`, { method: 'DELETE' });
                load();
              }} />
            </TD>
          </tr>
        ))}
        empty="No exams set for this term yet"
      />
    </Panel>
  );
};
