/**
 * ClubAtlas API Client
 * Client utility for communicating with the backend API
 */
import { getIdToken } from '../firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * API request helper function
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Do not set Content-Type for FormData (browser sets it automatically)
    const isFormData = options.body instanceof FormData;
    
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };
    
    // Automatically add token if Authorization header is missing and endpoint requires auth
    if (!headers['Authorization' as keyof HeadersInit] && 
        !endpoint.includes('/api/auth/signup')) {
      try {
        const token = await getIdToken();
        if (token) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        // Ignore token fetch failure (may be a public endpoint)
      }
    }

    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const detail = data?.detail;
      const errorMessage =
        typeof detail === 'string'
          ? detail
          : Array.isArray(detail)
          ? detail.map((e: { msg?: string }) => e.msg ?? String(e)).join(', ')
          : data?.message || 'An error occurred';
      return {
        status: response.status,
        error: errorMessage,
      };
    }

    return {
      status: response.status,
      data,
    };
  } catch (error) {
    return {
      status: 500,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * API client
 */
export const apiClient = {
  /**
   * GET request
   */
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST request
   */
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT request
   */
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE request
   */
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Health check
 */
export async function checkHealth(): Promise<ApiResponse<{ status: string; service: string }>> {
  return apiClient.get('/health');
}

/**
 * API status check
 */
export async function getApiStatus(): Promise<ApiResponse<{
  message: string;
  status: string;
  version: string;
  docs: string;
}>> {
  return apiClient.get('/');
}











