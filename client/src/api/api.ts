/**
 * Central API utility
 *
 * All HTTP calls in the app should go through `apiFetch` so the base URL
 * is sourced from a single place (VITE_API_URL in .env).
 *
 * Usage:
 *   const res = await apiFetch('/user/login', { method: 'POST', body: {...} })
 *   const data = await res.json()
 */

const BASE_URL = (import.meta.env.VITE_API_URL as string).replace(/\/$/, '')

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  body?: Record<string, unknown> | FormData | null
  /** JWT token — if omitted, reads from localStorage automatically */
  token?: string
}

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
): Promise<Response> {
  const { body, token: explicitToken, ...rest } = options

  // Read token from localStorage if not explicitly supplied
  const token = explicitToken ?? localStorage.getItem('pawtrack_token')

  const headers: Record<string, string> = {
    ...(rest.headers as Record<string, string>),
  }

  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`

  return fetch(url, {
    ...rest,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  })
}
