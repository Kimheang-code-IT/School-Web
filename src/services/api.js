/**
 * API client: base URL from config, GET helper with optional auth.
 * Used by data hooks; fallback to static JSON when API fails.
 */

const getBaseUrl = () => {
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_BASE_URL) {
    const base = window.APP_CONFIG.API_BASE_URL;
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }
  return '/api/v1';
};

const getHeaders = () => {
  const headers = { 'Content-Type': 'application/json' };
  const token = typeof window !== 'undefined' && window.APP_CONFIG?.API_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

/**
 * GET request to API. Returns parsed JSON. Throws on non-OK or parse error.
 * @param {string} endpoint - Path without base URL (e.g. '/courses')
 * @returns {Promise<any>}
 */
export async function get(endpoint) {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
}

/**
 * POST request to API. Returns parsed JSON. Throws on non-OK or parse error.
 * @param {string} endpoint - Path without base URL
 * @param {object} body - JSON-serializable body
 * @returns {Promise<any>}
 */
export async function post(endpoint, body) {
  const baseUrl = getBaseUrl();
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`API ${response.status}: ${response.statusText}`);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error('Invalid JSON response');
  }
}
