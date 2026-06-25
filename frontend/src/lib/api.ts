const API_BASE = 'http://localhost:8080';
const TOKEN_KEY = 'campus-ops-token';

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

function clearStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

function redirectToLogin() {
  if (window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
}

function isJwtExpired(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload?.exp) {
      return false;
    }
    return Date.now() >= payload.exp * 1000;
  } catch {
    return false;
  }
}

function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

async function safeParseResponse(response: Response) {
  const raw = await response.text();
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return raw;
  }
}

async function request<T>(path: string, init: RequestInit = {}, useAuth = true): Promise<T> {
  const headers = new Headers(init.headers || {});
  headers.set('Content-Type', 'application/json');

  const isPublicAuthEndpoint = path === '/api/auth/login' || path === '/api/auth/register';
  if (useAuth && !isPublicAuthEndpoint) {
    const token = getStoredToken();
    if (!token) {
      clearStoredToken();
      redirectToLogin();
      throw new ApiError('Session expired, please login again');
    }
    if (isJwtExpired(token)) {
      clearStoredToken();
      redirectToLogin();
      throw new ApiError('Session expired, please login again');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new ApiError('Backend is not running');
  }

  const payload = await safeParseResponse(response);

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearStoredToken();
      redirectToLogin();
      throw new ApiError('Session expired, please login again', response.status);
    }

    const message =
      (payload && typeof payload === 'object' && 'message' in payload && String((payload as { message?: unknown }).message)) ||
      `Request failed with ${response.status}`;
    throw new ApiError(message, response.status);
  }

  return unwrap<T>(payload);
}

export async function login(email: string, password: string) {
  return request<{ accessToken: string }>(
    '/api/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    },
    false,
  );
}

export async function register(body: { fullName: string; email: string; password: string; role: string }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  }, false);
}

export function getToken() {
  return getStoredToken();
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  clearStoredToken();
}

export async function apiGet<T>(path: string) {
  return request<T>(path, { method: 'GET' });
}

export async function apiGetPublic<T>(path: string) {
  return request<T>(path, { method: 'GET' }, false);
}
