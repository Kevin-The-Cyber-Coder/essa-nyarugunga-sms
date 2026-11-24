import { useEffect, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { resourceApi } from './resourceApi';

const kindIcon = (r) => {
  if (r.kind === 'link') return 'fa-link';
  if (r.kind === 'image') return 'fa-image';
  if (r.kind === 'pdf') return 'fa-file-pdf';
  if (r.kind === 'audio') return 'fa-file-audio';
  if (r.kind === 'video') return 'fa-file-video';
  return 'fa-file';
};

const input = {
  width: '100%', padding: '8px 10px', border: '1.5px solid var(--surface-sunken-2)',
  borderRadius: 8, fontSize: 13, fontFamily: 'inherit', boxSizing: 'border-box',
  background: 'var(--surface-card)', color: 'var(--text-body)'
};
const button = (bg = '#1a3a5c') => ({
  border: 'none', borderRadius: 8, padding: '7px 12px', fontSize: 12,
  fontWeight: 700, color: '#fff', background: bg, cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center', gap: 6
});

/**
 * Class document shelf. Files and links persist for the class and are managed
 * through the class resource endpoints.
 */
const ClassResourcesPanel = ({ classId, canManage = false }) => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileRef = useRef(null);

  const load = async () => {
    if (!classId) return;
    setLoading(true);
    try {
      const data = await resourceApi.list(classId);
      setResources(Array.isArray(data?.resources) ? data.resources : []);
    } catch {
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [classId]);

  const addLink = async (e) => {
    e.preventDefault();
    if (!link.trim()) return;
    setBusy(true);
    try {
      await resourceApi.add(classId, { title: title || link, link: link.trim(), kind: 'link' });
      setTitle(''); setLink('');
      await load();
    } catch (error) {
      Swal.fire('Error', error.message || 'Could not add the link.', 'error');
    } finally {
      setBusy(false);
    }
  };

  const addFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true); setProgress(0);
    try {
      const uploaded = await resourceApi.upload([file], setProgress);
      const stored = uploaded?.files?.[0];
      if (!stored) throw new Error('Upload returned no file.');
      await resourceApi.add(classId, {
        title: title || stored.name,
        url: stored.url, name: stored.name, mime: stored.mime,
        size: stored.size, kind: stored.kind
      });
      setTitle('');
      await load();
    } catch (error) {
      Swal.fire('Error', error.message || 'Could not upload the file.', 'error');
    } finally {
      setBusy(false); setProgress(0);
    }
  };

  const remove = async (resource) => {
    const answer = await Swal.fire({
      title: 'Remove resource?', text: resource.title, icon: 'warning',
      showCancelButton: true, confirmButtonColor: '#b42318', confirmButtonText: 'Remove'
    });
    if (!answer.isConfirmed) return;
    try {
      await resourceApi.remove(classId, resource._id);
      setResources((prev) => prev.filter((r) => String(r._id) !== String(resource._id)));
    } catch (error) {
      Swal.fire('Error', error.message || 'Could not remove the resource.', 'error');
    }
  };

  if (!classId) {
    return <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Select a class to view its resources.</p>;
  }

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {canManage && (
        <form onSubmit={addLink} style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 8 }}>
            <input style={input} placeholder="Title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input style={input} placeholder="Paste a link…" value={link} onChange={(e) => setLink(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button type="submit" style={button()} disabled={busy || !link.trim()}><i className="fas fa-link" /> Add link</button>
            <button type="button" style={button('#0e7490')} disabled={busy} onClick={() => fileRef.current?.click()}>
              <i className={`fas ${busy ? 'fa-spinner fa-spin' : 'fa-upload'}`} /> {busy ? `Uploading ${progress}%` : 'Upload file'}
            </button>
            <input ref={fileRef} type="file" hidden onChange={addFile} />
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>Loading resources…</p>
      ) : resources.length === 0 ? (
        <p style={{ fontSize: 13, color: 'var(--text-faint)' }}>No resources shared for this class yet.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 7 }}>
          {resources.map((r) => (
            <li key={r._id} style={{
              display: 'flex', alignItems: 'center', gap: 9, padding: '9px 11px',
              background: 'var(--surface-card)', border: '1px solid var(--border)', borderRadius: 10
            }}>
              <i className={`fas ${kindIcon(r)}`} style={{ color: 'var(--navy)', width: 16 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <a href={r.url || r.link} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, fontWeight: 600, color: 'var(--text-body)', textDecoration: 'none',
                  display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                }}>{r.title}</a>
                {r.description && <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{r.description}</div>}
              </div>
              {canManage && (
                <button onClick={() => remove(r)} title="Remove" style={button('#b42318')}><i className="fas fa-trash" /></button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClassResourcesPanel;
