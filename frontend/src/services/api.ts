/**
 * Base API HTTP client.
 *
 * All backend communication goes through this module.
 * Components and services never call fetch() directly.
 *
 * With the Next.js rewrites in next.config.ts, /api/** calls are transparently
 * proxied to the Spring Boot backend (localhost:8080) by the Next.js dev server.
 * This means all requests are same-origin from the browser's perspective,
 * so session cookies are sent automatically without any CORS configuration.
 *
 * In production, configure the proxy target via NEXT_PUBLIC_API_URL.
 */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/**
 * Generic API request helper.
 * Throws an error with the server's message if success is false.
 */
async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  // Use relative URL — Next.js proxy rewrites handle routing to the backend.
  // credentials: 'include' ensures session cookies are sent on cross-origin
  // fallback requests (e.g., if the proxy is bypassed).
  const response = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    credentials: 'include',
    ...options,
  });

  // Parse the body regardless of HTTP status (backend sends structured errors too)
  let body: ApiResponse<T>;
  try {
    body = await response.json();
  } catch {
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  if (!response.ok || !body.success) {
    throw new Error(body.message || `Request failed with status ${response.status}`);
  }

  return body;
}

export const api = {
  get: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' }),
  post: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  patch: <T>(endpoint: string, body: unknown) =>
    apiRequest<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
  delete: <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' }),
};
