import { useEffect, useMemo, useState } from 'react';
import { chatApi } from './chatApi';
import { roleLabel, roleIcon } from './chatFormat';

const initials = (name) => {
  const parts = String(name || '?').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
};

const avatarColor = (seed) => {
  let hash = 0;
  for (const ch of String(seed || '')) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  const colors = ['#16653f', '#2563eb', '#7c3aed', '#b45309', '#0e7490', '#be185d'];
  return colors[hash % colors.length];
};

const relTime = (iso) => {
  if (!iso) return null;
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
};

// A read-only profile card for conversation participants. Directory data is
// fetched once and looked up by userId; the fallback props render instantly
// from what the conversation already carries. When `participants` is supplied
// (group threads) it first shows a member list.
const UserProfileDrawer = ({ userId, participants, peer, online, onClose, onMessage, onBlock, canBlockUser }) => {
  const [selected, setSelected] = useState(userId || null);
  const [directory, setDirectory] = useState(null);

  useEffect(() => { setSelected(userId || null); }, [userId]);

  useEffect(() => {
    let active = true;
    chatApi.directory().then((d) => { if (active) setDirectory(d?.users || {}); }).catch(() => {});
    return () => { active = false; };
  }, []);

  const flat = useMemo(() => Object.values(directory || {}).flat(), [directory]);

  const showList = !!participants && !selected;
  const selectedPeer = participants?.find((p) => String(p.userId) === String(selected)) || peer;
  const profile = selected ? flat.find((u) => String(u._id) === String(selected)) : null;

  const name = profile?.fullName || selectedPeer?.name || 'Member';
  const role = profile?.role || selectedPeer?.role;
  const isOnline = profile ? profile.isOnline : (selected === peer?.userId ? online : undefined);
  const lastSeen = profile?.lastSeenAt || selectedPeer?.lastSeenAt;

  const rows = [];
  if (profile?.email) rows.push({ icon: 'fa-envelope', label: profile.email });
  if (profile?.className) rows.push({ icon: 'fa-graduation-cap', label: profile.className });
  if (profile?.studentId) rows.push({ icon: 'fa-id-card', label: profile.studentId });
  if (profile?.sdmsCode) rows.push({ icon: 'fa-hashtag', label: profile.sdmsCode });
  if (profile?.department) rows.push({ icon: 'fa-book', label: profile.department });

  return (
    <div className="ck-profile-drawer">
      <div className="ck-profile-head">
        {showList ? (
          <span style={{ fontWeight: 700, marginLeft: 4 }}>Members</span>
        ) : (
          <button className="ck-iconbtn" title="Back" onClick={() => (participants ? setSelected(null) : onClose())}>
            <i className={`fas ${participants ? 'fa-arrow-left' : 'fa-xmark'}`} />
          </button>
        )}
        {!showList && <span style={{ fontWeight: 700, marginLeft: 4 }}>Profile</span>}
        <button className="ck-iconbtn" style={{ marginLeft: 'auto' }} onClick={onClose} title="Close"><i className="fas fa-xmark" /></button>
      </div>

      {showList ? (
        <div style={{ padding: 8, overflowY: 'auto' }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted, #6b7684)', padding: '4px 8px' }}>
            {participants.length} participant(s)
          </div>
          {participants.map((p) => (
            <button
              key={p.userId}
              onClick={() => setSelected(p.userId)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', border: 'none', background: 'none', cursor: 'pointer', padding: '8px 10px', borderRadius: 10, textAlign: 'left' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--surface-2, #f2f6fa)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              <span className="ck-avatar" style={{ background: avatarColor(p.userId), width: 30, height: 30, fontSize: 12 }}>
                {initials(p.name)}
              </span>
              <span style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: 13, fontWeight: 600 }}>{p.name || 'Member'}</span>
                <span style={{ fontSize: 11, color: 'var(--text-faint, #93a0af)' }}>{roleLabel(p.role)}</span>
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ padding: 16, textAlign: 'center' }}>
          <span className="ck-avatar" style={{ background: avatarColor(selected), width: 72, height: 72, fontSize: 26, margin: '0 auto 10px' }}>
            {initials(name)}
          </span>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #1f2933)' }}>{name}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted, #6b7684)', marginBottom: 4 }}>
            <i className={`fas ${roleIcon(role)}`} style={{ marginRight: 5 }} />{roleLabel(role)}
          </div>
          <div style={{ fontSize: 12, marginBottom: 12, color: isOnline ? '#1d9d55' : 'var(--text-faint, #93a0af)' }}>
            {isOnline ? '● Online' : lastSeen ? `Last seen ${relTime(lastSeen)}` : 'Offline'}
          </div>

          {rows.length > 0 && (
            <div className="ck-profile-info">
              {rows.map((r) => (
                <div key={r.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '5px 0', color: 'var(--text, #1f2933)' }}>
                  <i className={`fas ${r.icon}`} style={{ width: 16, color: 'var(--navy, #1a3a5c)' }} />
                  <span style={{ wordBreak: 'break-word' }}>{r.label}</span>
                </div>
              ))}
            </div>
          )}

          {onMessage && selectedPeer && (
            <button className="ck-btn primary" style={{ marginTop: 12, width: '100%' }} onClick={() => onMessage(selectedPeer)}>
              <i className="fas fa-comment" /> Message
            </button>
          )}
          {canBlockUser && onBlock && selectedPeer && (
            <button className="ck-btn" style={{ marginTop: 8, width: '100%', color: '#e74c3c' }} onClick={() => onBlock(selectedPeer)}>
              <i className="fas fa-ban" /> Block user
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserProfileDrawer;