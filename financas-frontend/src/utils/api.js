const API_BASE = 'http://localhost:8080';

const getToken = () => localStorage.getItem('token');

const defaultHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`,
});

const handleResponse = async (res) => {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }
  return res;
};

export const api = {
  get: (path) =>
    fetch(`${API_BASE}${path}`, { headers: defaultHeaders() }).then(handleResponse),

  post: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: defaultHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PUT',
      headers: defaultHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'PATCH',
      headers: defaultHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path, body) =>
    fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: defaultHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    }).then(handleResponse),

  download: (path) =>
    fetch(`${API_BASE}${path}`, { headers: defaultHeaders() }),
};
