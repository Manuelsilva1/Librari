export const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

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
