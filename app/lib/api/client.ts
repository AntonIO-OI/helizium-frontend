const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

export type ApiResponse<T> = {
  data: T | null;
  error: string | null;
  status: number;
};

// Auth paths that must never trigger a refresh retry
const NO_RETRY_PATHS = new Set([
  '/auth/refresh',
  '/auth/sign',
  '/auth/signup',
  '/auth/lost-password/send-email',
  '/auth/lost-password/verify',
  '/auth/lost-password/change',
]);

async function attemptRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    return res.ok || res.status === 204;
  } catch {
    return false;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  captcha?: { id: string; value: string },
  isRetry = false,
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers as Record<string, string>),
  };

  if (captcha?.id) {
    headers['X-Captcha-Id'] = captcha.id;
    headers['X-Captcha-Value'] = captcha.value;
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    // On 401, attempt a single token refresh and retry the original request.
    if (res.status === 401 && !isRetry && !NO_RETRY_PATHS.has(path)) {
      const refreshed = await attemptRefresh();
      if (refreshed) {
        return request<T>(path, options, captcha, true);
      }
    }

    if (res.status === 204) {
      return { data: null, error: null, status: 204 };
    }

    let body: any = null;
    const ct = res.headers.get('content-type');
    if (ct && ct.includes('application/json')) {
      body = await res.json();
    }

    if (!res.ok) {
      const errMsg =
        body?.message ||
        body?.error ||
        `Request failed with status ${res.status}`;
      return { data: null, error: errMsg, status: res.status };
    }

    return { data: body as T, error: null, status: res.status };
  } catch (e: any) {
    return { data: null, error: e?.message || 'Network error', status: 0 };
  }
}

export const apiClient = {
  get: <T>(path: string, headers?: Record<string, string>) =>
    request<T>(path, { method: 'GET', headers }),

  post: <T>(
    path: string,
    body?: unknown,
    captcha?: { id: string; value: string },
    headers?: Record<string, string>,
  ) =>
    request<T>(
      path,
      { method: 'POST', body: JSON.stringify(body), headers },
      captcha,
    ),

  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),

  delete: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    }),
};
