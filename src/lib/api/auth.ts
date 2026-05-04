/**
 * Authentication API client
 */
import { apiClient, ApiResponse } from './client';

export interface SignupStudentData {
  email: string;
  password: string;
  display_name: string;
  student_id?: string;
  department?: string;
}

export interface SignupStudentResponse {
  uid: string;
  email: string;
  display_name: string;
  role: string;
  message: string;
}

export interface LeaderAccessRequestData {
  email?: string;
  requested_club_id?: string;
  requested_club_name?: string;
  requested_role: string;
  reason: string;
}

export interface LeaderAccessRequestResponse {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  requested_club_id?: string;
  requested_club_name?: string;
  requested_role: string;
  reason: string;
  status: string;
  requested_at: string;
  processed_at?: string;
  processed_by?: string;
  admin_notes?: string;
}

export interface AuthVerifyResponse {
  uid: string;
  email: string;
  display_name?: string;
  role: string;
  is_authenticated: boolean;
  managed_club_ids?: string[];
  leader_position?: string;
}

/**
 * Student sign up
 */
export async function signupStudent(
  data: SignupStudentData
): Promise<ApiResponse<SignupStudentResponse>> {
  return apiClient.post('/api/auth/signup/student', data);
}

/**
 * Request leader access
 */
export async function requestLeaderAccess(
  data: LeaderAccessRequestData,
  token?: string
): Promise<ApiResponse<LeaderAccessRequestResponse>> {
  return apiClient.post('/api/auth/leader-access/request', data, token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : undefined
  );
}

/**
 * Get current user profile
 */
export async function getCurrentUserProfile(
  token: string
): Promise<ApiResponse<AuthVerifyResponse>> {
  return apiClient.get('/api/auth/me', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Check my leader access request status
 */
export async function getMyLeaderRequest(
  token: string
): Promise<ApiResponse<LeaderAccessRequestResponse | null>> {
  return apiClient.get('/api/auth/leader-access/my-request', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Verify token
 */
export async function verifyToken(
  token: string
): Promise<ApiResponse<AuthVerifyResponse>> {
  return getCurrentUserProfile(token);
}


