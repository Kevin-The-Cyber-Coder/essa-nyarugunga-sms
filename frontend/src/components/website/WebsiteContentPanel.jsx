import { API_URL } from '../../config/api';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Swal from 'sweetalert2';
import { canManageCategory, PERMISSIONS } from '../../config/roles';


const token = () => localStorage.getItem('portalToken');

const CATEGORIES = [
  { id: PERMISSIONS.CONTENT_CATEGORIES.ACADEMIC, label: 'Academic' },
  { id: PERMISSIONS.CONTENT_CATEGORIES.DISCIPLINE, label: 'Discipline' },
  { id: PERMISSIONS.CONTENT_CATEGORIES.FINANCIAL, label: 'Financial' },
  { id: PERMISSIONS.CONTENT_CATEGORIES.GENERAL, label: 'General' }
];

const STATUS = {
  draft: { label: 'Draft', color: '#7a4a00', bg: '#fff4e5' },
  scheduled: { label: 'Scheduled', color: '#1d3f7a', bg: '#eef4ff' },
  published: { label: 'Published', color: '#1b5e20', bg: '#e8f5e9' }
};

const fmt = (d) => d ? new Date(d).toLocaleString('en-RW', {
  day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
}) : '—';

const localInputValue = (d) => {
  if (!d) return '';
  const date = new Date(d);
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const StatusPill = ({ status }) => {
  const s = STATUS[status] || STATUS.draft;
  return <span style={{ padding: '3px 9px', borderRadius: 999, fontSize: 11, fontWeight: 700, color: s.color, background: s.bg }}>{s.label}</span>;
};

const emptyForm = (type) => ({
  title: '', summary: '', content: '', description: '',
  category: 'general', status: 'draft', publishAt: '', image: null
});

/**
 * Shared website content manager. Embedded inside an authorised dashboard;
 * there is deliberately no standalone CMS route. All permissions are
 * re-checked by the backend - the role checks here only shape the UI.
 */
const WebsiteContentPanel = ({ role }) => {
  const [type, setType] = useState('news');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm('news'));
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const allowedCategories = useMemo(
    () => CATEGORIES.filter((c) => canManageCategory(role, c.id)),
    [role]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/content/${type}`, {
        headers: { Authorization: `Bearer ${token()}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load content');
      setItems(Array.isArray(data.data) ? data.data : []);
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [type]);

  useEffect(() => { load(); }, [load]);

  const switchType = (next) => {
    setType(next);
    setForm(emptyForm(next));
    setEditing(null);
    setShowForm(false);
  };

  const openNew = () => {
    setForm({ ...emptyForm(type), category: allowedCategories[0]?.id || 'general' });
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title || '',
      summary: item.summary || '',
      content: item.content || '',
      description: item.description || '',
      category: item.category || 'general',
      status: item.status || (item.isPublished ? 'published' : 'draft'),
      publishAt: localInputValue(item.publishAt),
      image: null
    });
    setEditing(item._id);
    setShowForm(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = new FormData();
      body.append('title', form.title);
      body.append('category', form.category);
      body.append('status', form.status);
      if (form.status === 'scheduled') body.append('publishAt', new Date(form.publishAt).toISOString());
      if (type === 'news') {
        body.append('summary', form.summary);
        body.append('content', form.content || form.summary);
      } else {
        body.append('description', form.description);
      }
      if (form.image) body.append('image', form.image);

      const url = editing
        ? `${API_URL}/api/content/${type}/${editing}`
        : `${API_URL}/api/content/${type}`;
      const res = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not save content');

      Swal.fire('Saved', editing ? 'Content updated.' : 'Content created.', 'success');
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (item, status) => {
    try {
      const res = await fetch(`${API_URL}/api/content/${type}/${item._id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not update status');
      await load();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const remove = async (item) => {
    const answer = await Swal.fire({
      title: 'Delete this item?', text: item.title, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#b42318', confirmButtonText: 'Delete'
    });
    if (!answer.isConfirmed) return;
    try {
      const res = await fetch(`${API_URL}/api/content/${type}/${item._id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error('Could not delete content');
      await load();
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  const card = {
    background: 'var(--surface-card)', borderRadius: 14, padding: 18,
    border: '1px solid var(--surface-page)', boxShadow: '0 2px 10px rgba(0,0,0,.05)'
  };
  const input = {
    width: '100%', padding: '9px 12px', border: '1.5px solid var(--surface-sunken-2)',
    borderRadius: 8, fontSize: 14, fontFamily: 'inherit', boxSizing: 'border-box',
    background: 'var(--surface-card)', color: 'var(--text-body)'
  };
  const label = { display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 5 };
  const btn = (bg, color = '#fff') => ({
    background: bg, color, border: 'none', borderRadius: 8, padding: '7px 13px',
    fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex',
    alignItems: 'center', gap: 6
  });

  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['news', 'gallery'].map((t) => (
            <button key={t} onClick={() => switchType(t)} style={btn(type === t ? '#1a3a5c' : 'var(--surface-muted)', type === t ? '#fff' : 'var(--text-secondary)')}>
              <i className={`fas ${t === 'news' ? 'fa-newspaper' : 'fa-images'}`} /> {t === 'news' ? 'News' : 'Gallery'}
            </button>
          ))}
        </div>
        <button onClick={openNew} style={btn('#1a3a5c')}><i className="fas fa-plus" /> Add {type === 'news' ? 'news' : 'image'}</button>
      </div>

      {showForm && (
        <form onSubmit={submit} style={card}>
          <h3 style={{ margin: '0 0 14px', fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>
            {editing ? 'Edit' : 'New'} {type === 'news' ? 'news article' : 'gallery image'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
            <div>
              <label style={label}>Title *</label>
              <input style={input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>
            <div>
              <label style={label}>Category</label>
              <select style={input} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {allowedCategories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            </div>
            {type === 'news' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Summary</label>
                <input style={input} value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
              </div>
            )}
            {type === 'news' ? (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Content</label>
                <textarea style={{ ...input, minHeight: 90, resize: 'vertical' }} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
              </div>
            ) : (
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={label}>Description</label>
                <textarea style={{ ...input, minHeight: 70, resize: 'vertical' }} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
            )}
            <div>
              <label style={label}>Image {type === 'gallery' && !editing && '*'}</label>
              <input type="file" accept="image/*" style={input} onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })} />
            </div>
            <div>
              <label style={label}>Status</label>
              <select style={input} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            {form.status === 'scheduled' && (
              <div>
                <label style={label}>Publish at</label>
                <input type="datetime-local" style={input} value={form.publishAt} onChange={(e) => setForm({ ...form, publishAt: e.target.value })} required />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
            <button type="submit" style={btn('#1a3a5c')} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button type="button" onClick={() => setShowForm(false)} style={btn('var(--surface-muted)', 'var(--text-secondary)')}>Cancel</button>
          </div>
        </form>
      )}

      <div style={card}>
        <h3 style={{ margin: '0 0 12px', fontFamily: 'Georgia, serif', color: 'var(--navy)' }}>
          {type === 'news' ? 'News articles' : 'Gallery images'} <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text-faint)' }}>({items.length})</span>
        </h3>
        {loading ? <p style={{ color: 'var(--text-faint)' }}>Loading…</p> : items.length === 0 ? (
          <p style={{ color: 'var(--text-faint)' }}>No content yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 560 }}>
              <thead><tr>
                {['Title', 'Category', 'Status', 'Date', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 10px', fontSize: 11, color: 'var(--text-faint)', borderBottom: '1px solid var(--border)' }}>{h.toUpperCase()}</th>
                ))}
              </tr></thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item._id} style={{ borderBottom: '1px solid var(--surface-muted)' }}>
                    <td style={{ padding: '9px 10px', fontSize: 13, color: 'var(--text-body)' }}>
                      {item.image && <img src={item.image} alt="" style={{ width: 34, height: 34, objectFit: 'cover', borderRadius: 6, marginRight: 8, verticalAlign: 'middle' }} />}
                      {item.title}
                    </td>
                    <td style={{ padding: '9px 10px', fontSize: 12, textTransform: 'capitalize' }}>{item.category}</td>
                    <td style={{ padding: '9px 10px' }}><StatusPill status={item.status || (item.isPublished ? 'published' : 'draft')} /></td>
                    <td style={{ padding: '9px 10px', fontSize: 12, color: 'var(--text-faint)' }}>{fmt(item.publishAt || item.date)}</td>
                    <td style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>
                      <button onClick={() => openEdit(item)} style={btn('#1d3f7a')}><i className="fas fa-pen" /> Edit</button>{' '}
                      {item.status !== 'published' && <button onClick={() => setStatus(item, 'published')} style={btn('#1b5e20')}><i className="fas fa-check" /> Publish</button>}{' '}
                      {item.status === 'published' && <button onClick={() => setStatus(item, 'draft')} style={btn('#7a4a00')}><i className="fas fa-eye-slash" /> Unpublish</button>}{' '}
                      <button onClick={() => remove(item)} style={btn('#b42318')}><i className="fas fa-trash" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebsiteContentPanel;
