import { apiRequest, ApiResponse } from './client';

export interface NotificationResponse {
  id: string;
  user_id: string;
  type: string;
  title: string;
  content: string;
  club_id?: string;
  club_name?: string;
  reference_id?: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationListResponse {
  notifications: NotificationResponse[];
  total: number;
  unread_count: number;
}

export async function getMyNotifications(params?: {
  limit?: number;
  unread_only?: boolean;
}): Promise<ApiResponse<NotificationListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.unread_only) queryParams.append('unread_only', 'true');
  
  const url = `/api/notifications${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<NotificationListResponse>(url, { method: 'GET' });
}

export async function getUnreadCount(): Promise<ApiResponse<{ unread_count: number }>> {
  return apiRequest<{ unread_count: number }>('/api/notifications/unread-count', { method: 'GET' });
}

export async function markNotificationAsRead(notificationId: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(
    `/api/notifications/${notificationId}/read`,
    { method: 'PUT' }
  );
}

export async function markAllNotificationsAsRead(): Promise<ApiResponse<{ message: string; count: number }>> {
  return apiRequest<{ message: string; count: number }>(
    '/api/notifications/read-all',
    { method: 'PUT' }
  );
}

export async function deleteNotification(notificationId: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(
    `/api/notifications/${notificationId}`,
    { method: 'DELETE' }
  );
}
