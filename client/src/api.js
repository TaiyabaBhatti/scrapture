const BASE = import.meta.env.VITE_API_URL || '';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}
const json = (method, body) => ({
  method,
  headers: { 'Content-Type': 'application/json' },
  body: body ? JSON.stringify(body) : undefined,
});

export const getIdea = (formData) => fetch(`${BASE}/api/idea`, { method: 'POST', body: formData }).then(handle);
export const getVisual = (formData) => fetch(`${BASE}/api/visualize`, { method: 'POST', body: formData }).then(handle);
export const saveCreation = (body) => fetch(`${BASE}/api/gallery`, json('POST', body)).then(handle);
export const listMine = (clientId) => fetch(`${BASE}/api/gallery?clientId=${encodeURIComponent(clientId)}`).then(handle);
export const listCommunity = () => fetch(`${BASE}/api/community`).then(handle);
export const deleteCreation = (id, clientId) =>
  fetch(`${BASE}/api/gallery/${id}?clientId=${encodeURIComponent(clientId)}`, { method: 'DELETE' }).then(handle);
export const madeIt = (id) => fetch(`${BASE}/api/gallery/${id}/made`, { method: 'POST' }).then(handle);
