// Importing `cookies` from `next/headers` directly would make this file
// server-only. Instead, we dynamically load it when running on the server so
// that this utility can be used in Client Components as well.

// Type for the dynamically imported `cookies` function
type CookiesFn = typeof import('next/headers').cookies;

export const getAuthHeaders = async (): Promise<Record<string, string>> => {
  let token: string | null | undefined = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  } else {
    try {
      const { cookies }: { cookies: CookiesFn } = await import('next/headers');
      token = cookies().get('authToken')?.value;
    } catch {
      token = null;
    }
  }

  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const dispatchLogoutEvent = (): void => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('logout'));
  }
};
