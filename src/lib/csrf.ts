export async function getCsrfToken(): Promise<string | null> {
  // First, check if the token is already in cookies. If we are using the Double Submit Cookie pattern,
  // the client needs to read it from the cookie.
  // Wait, if it's httpOnly, we can't read it. Let's assume the server sets a non-httpOnly generic token cookie.
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  if (match) return match[2];

  // If not, fetch it from the server
  try {
    const response = await fetch('/api/csrf-token');
    const data = await response.json();
    return data.token;
  } catch (err) {
    console.error('Failed to fetch CSRF token', err);
    return null;
  }
}

export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getCsrfToken();
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('x-csrf-token', token);
  }

  return fetch(url, {
    ...options,
    headers
  });
}
