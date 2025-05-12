/**
 * API Client Utility
 * Handles API requests with automatic token injection
 */

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL!;

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiRequest(endpoint: string, options: RequestOptions = {}) {
  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    // Handle 401 Unauthorized by clearing token and redirecting to login
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    throw new Error('API request failed');
  }

  return response.json();
}

// Common API methods
export const api = {
  get: (endpoint: string) => apiRequest(endpoint),
  
  post: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  
  put: (endpoint: string, data: any) => apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  
  delete: (endpoint: string) => apiRequest(endpoint, {
    method: 'DELETE',
  }),
}; 