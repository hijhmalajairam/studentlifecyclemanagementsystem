const BASE_URL = 'http://localhost:8000/api';

export const fetchAPI = async (endpoint: string, options: RequestInit = {}) => {
  const headers: any = {
    ...options.headers,
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }
    // If we're on the login page, just throw a generic auth error to be overridden by the actual text later
    const errorData = await response.text();
    throw new Error(errorData || 'Invalid username or password.');
  }

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(errorData || 'API request failed');
  }
  
  // If response is empty, don't try to parse JSON
  if (response.status === 204) return null;
  
  return response.json();
};
