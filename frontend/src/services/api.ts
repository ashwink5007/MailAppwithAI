/**
 * Base API HTTP client.
 *
 * All backend communication goes through this module.
 * Components and services never call fetch() directly.
 *
 * Requests use the Next.js same-origin rewrites, which forward the session to
 * Spring Boot without relying on a cross-site browser cookie handoff.
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
  // Requests stay same-origin; Next.js rewrites forward the session to Spring.
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
