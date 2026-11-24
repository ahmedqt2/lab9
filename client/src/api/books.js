const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

async function request(path, { method = 'GET', body, signal } = {}) {
  if (!baseUrl) throw new Error('Set VITE_API_URL in client/.env, then restart Vite');
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    signal,
    ...(body === undefined ? {} : {
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
  });
  if (response.status === 204) return null;
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export function listBooks(filters, signal) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined) query.set(key, String(value));
  }
  return request(`/api/books?${query.toString()}`, { signal });
}
export const getStats = (signal) => request('/api/stats', { signal });
export const addBook = (body) => request('/api/books', { method: 'POST', body });
export const replaceBook = (id, body) => request(`/api/books/${id}`, { method: 'PUT', body });
export const patchBook = (id, body) => request(`/api/books/${id}`, { method: 'PATCH', body });
export const removeBook = (id) => request(`/api/books/${id}`, { method: 'DELETE' });
