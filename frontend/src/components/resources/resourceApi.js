import { API_URL } from '../../config/api';

const token = () => localStorage.getItem('portalToken');

const request = async (path, opts = {}) => {
  const res = await fetch(`${API_URL}/api${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}`, ...(opts.headers || {}) }
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
};

export const resourceApi = {
  list: (classId) => request(`/classes/${classId}/resources`),
  add: (classId, payload) => request(`/classes/${classId}/resources`, {
    method: 'POST', body: JSON.stringify(payload)
  }),
  remove: (classId, resourceId) => request(`/classes/${classId}/resources/${resourceId}`, {
    method: 'DELETE'
  }),

  // XHR is used here because fetch cannot report upload progress.
  upload: (files, onProgress) => new Promise((resolve, reject) => {
    const fd = new FormData();
    for (const file of files) fd.append('files', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/api/files/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${token()}`);

    if (typeof onProgress === 'function') {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) onProgress(Math.round((event.loaded / event.total) * 100));
      };
    }

    xhr.onload = () => {
      let data = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* non-JSON error */ }
      if (xhr.status >= 200 && xhr.status < 300) return resolve(data || {});
      reject(new Error(data?.message || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed. Check your connection.'));
    xhr.onabort = () => reject(new Error('Upload cancelled.'));
    xhr.send(fd);
  })
};
