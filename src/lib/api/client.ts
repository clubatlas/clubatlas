/**
 * ClubAtlas API Client
 * 백엔드 API와 통신하기 위한 클라이언트 유틸리티
 */
import { getIdToken } from '../firebase/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * API 요청 헬퍼 함수
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // FormData인 경우 Content-Type을 설정하지 않음 (브라우저가 자동 설정)
    const isFormData = options.body instanceof FormData;
    
    const headers: HeadersInit = isFormData
      ? { ...options.headers }
      : {
          'Content-Type': 'application/json',
          ...options.headers,
        };
    
    // Authorization 헤더가 없고, 인증이 필요한 엔드포인트인 경우 자동으로 토큰 추가
    if (!headers['Authorization' as keyof HeadersInit] && 
        !endpoint.includes('/api/auth/signup')) {
      try {
        const token = await getIdToken();
        if (token) {
          (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
        }
      } catch (err) {
        // 토큰 가져오기 실패 시 무시 (공개 엔드포인트일 수 있음)
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
 * API 클라이언트
 */
export const apiClient = {
  /**
   * GET 요청
   */
  get: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  /**
   * POST 요청
   */
  post: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * PUT 요청
   */
  put: <T = any>(endpoint: string, body?: any, options?: RequestInit) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  /**
   * DELETE 요청
   */
  delete: <T = any>(endpoint: string, options?: RequestInit) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * 헬스체크
 */
export async function checkHealth(): Promise<ApiResponse<{ status: string; service: string }>> {
  return apiClient.get('/health');
}

/**
 * API 상태 확인
 */
export async function getApiStatus(): Promise<ApiResponse<{
  message: string;
  status: string;
  version: string;
  docs: string;
}>> {
  return apiClient.get('/');
}











