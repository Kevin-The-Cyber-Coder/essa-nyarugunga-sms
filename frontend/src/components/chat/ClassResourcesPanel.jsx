import { useEffect, useRef, useState } from 'react';
import { chatApi } from './chatApi';

const kindIcon = (r) => {
  if (r.kind === 'link') return 'fa-link';
  if (r.kind === 'image') return 'fa-image';
  if (r.kind === 'pdf') return 'fa-file-pdf';
  if (r.kind === 'audio') return 'fa-file-audio';
  if (r.kind === 'video') return 'fa-file-video';
  return 'fa-file';
};

// The class document shelf. Unlike a chat attachment, a resource stays put and
// is meant to be found weeks later, so it can be a stored file or an external
// link and carries its own description.
const ClassResourcesPanel = ({ classId, canManage = false }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const load = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const d = await chatApi.classResources(classId);
      setResources(d?.resources || []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [classId]);

  const addLink = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;
    setBusy(true);
    try {
      await chatApi.addClassResource(classId, { title: title || link, link: link.trim(), kind: 'link' });
      setTitle(''); setLink('');
      load();
    } catch (err) {
      alert(err.message || 'Could not add the link.');
    } finally {
      setBusy(false);
    }
  };

  const addFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const up = await chatApi.upload([file]);
      const stored = up?.files?.[0];
      if (stored) {
        await chatApi.addClassResource(classId, {
          title: title || stored.name,
          url: stored.url, name: stored.name, mime: stored.mime, size: stored.size, kind: stored.kind
        });
        setTitle('');
        load();
      }
    } catch (err) {
      alert(err.message || 'Could not upload the file.');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (resource) => {
    if (!window.confirm(`Remove "${resource.title}"?`)) return;
    try {
      await chatApi.deleteClassResource(classId, resource._id);
      setResources((prev) => prev.filter((r) => String(r._id) !== String(resource._id)));
    } catch (err) {
      alert(err.message || 'Could not remove the resource.');
    }
  };

  return (
    <div className="ck-resources">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <i className="fas fa-folder-open" style={{ color: 'var(--navy, #1a3a5c)' }} />
        <h4 style={{ margin: 0, color: 'var(--navy, #1a3a5c)' }}>Class resources</h4>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-faint, #8a94a2)' }}>{resources.length}</span>
      </div>

      {canManage && (
        <form onSubmit={addLink} className="ck-resource-add">
          <input className="ck-search-input" placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
          <input className="ck-search-input" placeholder="Paste a link…" value={link} onChange={(e) => setLink(e.target.value)} />
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="ck-btn primary" type="submit" disabled={busy || !link.trim()} style={{ flex: 1 }}>
              <i className="fas fa-link" /> Add link
            </button>
            <button className="ck-btn" type="button" disabled={busy} onClick={() => fileRef.current?.click()} style={{ flex: 1 }}>
              <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-upload'}`} /> Upload file
            </button>
            <input ref={fileRef} type="file" hidden onChange={addFile} />
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-faint-2)', fontSize: 12, padding: 14 }}>Loading…</p>
      ) : resources.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-faint-2)', fontSize: 12, padding: 14 }}>No resources shared yet.</p>
      ) : (
        <ul className="ck-resource-list">
          {resources.map((r) => (
            <li key={r._id} className="ck-resource-item">
              <i className={`fas ${kindIcon(r)}`} style={{ color: 'var(--navy, #1a3a5c)', width: 16 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={r.url || r.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #1f2933)', textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                >
                  {r.title}
                </a>
                {r.description && <div style={{ fontSize: 11, color: 'var(--text-faint, #8a94a2)' }}>{r.description}</div>}
              </div>
              {canManage && (
                <button className="ck-iconbtn" title="Remove" onClick={() => remove(r)}>
                  <i className="fas fa-trash" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassResourcesPanel;