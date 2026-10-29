import { useState } from 'react';
import { chatApi } from './chatApi';
import { roleIcon } from './chatFormat';

const TYPES = [
  { value: '', label: 'Any type' },
  { value: 'text', label: 'Text' },
  { value: 'link', label: 'Links' },
  { value: 'voice', label: 'Voice notes' },
  { value: 'image', label: 'Images' }
];

const FILE_KINDS = [
  { value: '', label: 'Any file' },
  { value: 'image', label: 'Images' },
  { value: 'pdf', label: 'PDF' },
  { value: 'doc', label: 'Word' },
  { value: 'sheet', label: 'Excel' },
  { value: 'slides', label: 'Slides' },
  { value: 'archive', label: 'Archive' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' }
];

// Full-text search across the caller's own conversations. All filters are
// server-side, so a class or file-type filter is applied to the whole history
// rather than the page the client happens to be showing.
const MessageSearch = ({ conversations = [], onOpen }) => {
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [fileKind, setFileKind] = useState('');
  const [classId, setClassId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const classGroups = conversations.filter((c) => c.category === 'class' && c.classId);

  const run = async (e) => {
    e?.preventDefault();
    const term = q.trim();
    if (!term && !type && !fileKind && !classId) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (term) params.set('q', term);
      if (type) params.set('type', type);
      if (fileKind) params.set('fileKind', fileKind);
      if (classId) params.set('classId', classId);
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const d = await chatApi.search(`?${params.toString()}`);
      setResults(d?.results || []);
    } catch (err) {
      setResults([]);
      alert(err.message || 'Search failed.');
    } finally {
      setLoading(false);
    }
  };

  const pick = (hit) => {
    const conv = hit.conversation
      || conversations.find((c) => String(c._id) === String(hit.conversationId));
    if (conv && onOpen) onOpen(conv);
  };

  return (
    <div style={{ padding: 8 }}>
      <form onSubmit={run} style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
        <input className="ck-search-input" placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          <select className="ck-search-select" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <select className="ck-search-select" value={fileKind} onChange={(e) => setFileKind(e.target.value)}>
            {FILE_KINDS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          {classGroups.length > 0 && (
            <select className="ck-search-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">All classes</option>
              {classGroups.map((c) => <option key={c._id} value={c.classId}>{c.name || 'Class group'}</option>)}
            </select>
          )}
          <input type="date" className="ck-search-select" value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
          <input type="date" className="ck-search-select" value={to} onChange={(e) => setTo(e.target.value)} title="To" />
        </div>
        <button className="ck-btn primary" type="submit" disabled={loading}>
          <i className={`fas ${loading ? 'fa-spinner fa-spin' : 'fa-magnifying-glass'}`} /> Search
        </button>
      </form>

      {results && results.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--text-faint-2)', fontSize: 12, padding: 16 }}>No messages match.</p>
      )}

      {results && results.map((hit) => (
        <button
          key={hit._id}
          onClick={() => pick(hit)}
          style={{
            display: 'block', width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
            background: 'var(--surface-card, #fff)', borderRadius: 10, padding: '10px 12px', marginBottom: 6,
            borderLeft: '3px solid var(--navy, #1a3a5c)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
            <i className={`fas ${hit.conversation?.type === 'group' ? 'fa-people-group' : roleIcon(hit.conversation?.participants?.[0]?.role)}`} style={{ fontSize: 11, color: 'var(--navy)' }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)' }}>
              {hit.conversation?.name || 'Conversation'}
            </span>
            <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-faint)' }}>
              {new Date(hit.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            <b>{hit.senderName || 'Someone'}:</b> {hit.content || (hit.attachments?.length ? '[Attachment]' : '')}
          </div>
        </button>
      ))}
    </div>
  );
};

export default MessageSearch;