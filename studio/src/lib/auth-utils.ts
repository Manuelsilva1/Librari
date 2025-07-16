import { cookies } from 'next/headers';

export const getAuthHeaders = (): Record<string, string> => {
  let token: string | null | undefined = null;

  if (typeof window !== 'undefined') {
    token = localStorage.getItem('authToken');
  } else {
    token = cookies().get('authToken')?.value;
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
