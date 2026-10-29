const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => localStorage.getItem('portalToken');
export const getCurrentUserId = () => localStorage.getItem('userId');
export const getCurrentRole = () => localStorage.getItem('userRole');

const auth = (opts = {}) => ({
  ...opts,
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
    ...(opts.headers || {})
  }
});

async function parseBody(res) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}

async function http(path, opts = {}) {
  const res = await fetch(`${API_URL}/api${path}`, opts);
  const data = await parseBody(res);
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data || {};
}

export const chatApi = {
  conversations: (params = '') => http(`/messages/conversations${params}`),
  thread: (id, params = '') => http(`/messages/thread/${id}${params}`),
  send: (payload) => http('/messages/send', { method: 'POST', ...auth(), body: JSON.stringify(payload) }),
  createConversation: (payload) => http('/messages/conversations', { method: 'POST', ...auth(), body: JSON.stringify(payload) }),
  markRead: (conversationId) => http(`/messages/conversations/${conversationId}/read`, { method: 'PUT' }),
  edit: (messageId, content) => http(`/messages/${messageId}`, { method: 'PUT', ...auth(), body: JSON.stringify({ content }) }),
  remove: (messageId, scope = 'me') => http(`/messages/${messageId}?scope=${scope}`, { method: 'DELETE' }),
  react: (messageId, emoji) => http(`/messages/${messageId}/react`, { method: 'POST', ...auth(), body: JSON.stringify({ emoji }) }),
  pin: (messageId, value) => http(`/messages/${messageId}/pin`, { method: 'PUT', ...auth(), body: JSON.stringify({ value }) }),
  star: (messageId) => http(`/messages/${messageId}/star`, { method: 'POST' }),
  forward: (messageId, conversationIds) => http(`/messages/${messageId}/forward`, { method: 'POST', ...auth(), body: JSON.stringify({ conversationIds }) }),
  report: (messageId, reason) => http(`/messages/${messageId}/report`, { method: 'POST', ...auth(), body: JSON.stringify({ reason }) }),
  markUnread: (messageId) => http(`/messages/${messageId}/unread`, { method: 'PUT' }),
  bulk: (action, messageIds, scope) => http('/messages/bulk', { method: 'POST', ...auth(), body: JSON.stringify({ action, messageIds, scope }) }),
  clearChat: (conversationId) => http(`/messages/conversations/${conversationId}/messages`, { method: 'DELETE' }),
  archive: (conversationId, value) => http(`/messages/conversations/${conversationId}/archive`, { method: 'PUT', ...auth(), body: JSON.stringify({ value }) }),
  pinConversation: (conversationId, value) => http(`/messages/conversations/${conversationId}/pin`, { method: 'PUT', ...auth(), body: JSON.stringify({ value }) }),
  muteConversation: (conversationId, until) => http(`/messages/conversations/${conversationId}/mute`, { method: 'PUT', ...auth(), body: JSON.stringify({ until }) }),
  blocks: () => http('/messages/blocks'),
  block: (userId) => http('/messages/blocks', { method: 'POST', ...auth(), body: JSON.stringify({ userId }) }),
  unblock: (userId) => http(`/messages/blocks/${userId}`, { method: 'DELETE', ...auth() }),
  directory: () => http('/messages/users'),
  search: (params = '') => http(`/messages/search${params}`),
  starred: () => http('/messages/starred'),
  uploadConfig: () => http('/files/config'),

  // Class resources (a document shelf, distinct from chat attachments).
  classResources: (classId) => http(`/classes/${classId}/resources`),
  addClassResource: (classId, payload) => http(`/classes/${classId}/resources`, { method: 'POST', ...auth(), body: JSON.stringify(payload) }),
  deleteClassResource: (classId, resourceId) => http(`/classes/${classId}/resources/${resourceId}`, { method: 'DELETE', ...auth() }),

  // Uses XHR rather than fetch because fetch cannot report upload progress.
  // `onProgress` receives a 0-100 integer.
  upload: (files, onProgress) => new Promise((resolve, reject) => {
    const fd = new FormData();
    for (const f of files) fd.append('files', f);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${getToken()}`);

    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
    }

    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON error body */ }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data || {});
      reject(new Error(data?.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));

    xhr.send(fd);
  })
};

export const isValidId = (value) =>
  typeof value === 'string' && /^[0-9a-fA-F]{24}$/.test(value);