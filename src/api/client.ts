type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

const isBrowser = typeof window !== 'undefined';
const isTauriRuntime = isBrowser && Boolean(
  (window as typeof window & { __TAURI__?: unknown }).__TAURI__
  || (window as typeof window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  || (window as typeof window & { __TAURI_METADATA__?: unknown }).__TAURI_METADATA__
  || (window.location?.protocol === 'tauri:' || window.location?.protocol === 'tauri')
);
const fallbackBase = isTauriRuntime ? 'https://47.108.156.226:1981/assistant/api' : '/assistant/api';
const API_BASE = import.meta.env.VITE_API_BASE_URL || fallbackBase;

export const isTauri = () => isTauriRuntime;

async function tauriInvoke<T>(command: string, payload?: Record<string, unknown>): Promise<T> {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke<T>(command, payload);
}

async function request<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const url = `${API_BASE}${path}`;
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Request failed: ${message} (url: ${url})`);
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status} ${response.statusText} (url: ${url})`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body),
  patch: <T>(path: string, body?: unknown) => request<T>('PATCH', path, body),
  delete: <T>(path: string) => request<T>('DELETE', path),
};

export const tauri = {
  invoke: tauriInvoke,
};
