/**
 * SuperAdmin-only API client
 */
import { apiClient, ApiResponse } from './client';
import { LeaderAccessRequestResponse } from './auth';

export interface LeaderAccessRequestApproval {
  assign_to_club_id: string;
  admin_notes?: string;
}

export interface LeaderAccessRequestRejection {
  admin_notes: string;
}

export interface UserRoleUpdate {
  role: string;
}

export async function getAllLeaderRequests(
  token: string,
  status?: 'pending' | 'approved' | 'rejected'
): Promise<ApiResponse<LeaderAccessRequestResponse[]>> {
  const queryParams = status ? `?status_filter=${status}` : '';
  return apiClient.get(`/api/admin/leader-requests${queryParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function getLeaderRequest(
  requestId: string,
  token: string
): Promise<ApiResponse<LeaderAccessRequestResponse>> {
  return apiClient.get(`/api/admin/leader-requests/${requestId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function approveLeaderRequest(
  requestId: string,
  data: LeaderAccessRequestApproval,
  token: string
): Promise<ApiResponse<LeaderAccessRequestResponse>> {
  return apiClient.post(`/api/admin/leader-requests/${requestId}/approve`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function rejectLeaderRequest(
  requestId: string,
  data: LeaderAccessRequestRejection,
  token: string
): Promise<ApiResponse<LeaderAccessRequestResponse>> {
  return apiClient.post(`/api/admin/leader-requests/${requestId}/reject`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateUserRole(
  uid: string,
  data: UserRoleUpdate,
  token: string
): Promise<ApiResponse<{ message: string; uid: string; new_role: string }>> {
  return apiClient.put(`/api/admin/leader-requests/users/${uid}/role`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
