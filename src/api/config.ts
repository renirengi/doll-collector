export const API_URL = 'http://localhost:3000';

export interface ApiError {
  message: string;
  status?: number;
  data?: unknown;
}

export const BASE_URL = API_URL;

export const apiClient = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');

      const currentPath = window.location.pathname;
      if (currentPath !== '/' && currentPath !== '/login') {
        window.location.href = '/';
      }

      throw new Error('Unauthorized');
    }

    let errorMessage = 'Request failed';
    try {
      const errorResponse = await response.json();
      errorMessage =
        errorResponse.message || errorResponse.error || errorMessage;
    } catch {
      errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    }

    const error = new Error(errorMessage) as Error & ApiError;
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null as T;
  }

  return response.json();
};
