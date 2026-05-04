/**
 * Subscriptions API client
 */
import { apiClient, ApiResponse } from './client';

export interface Subscription {
  id: string;
  user_id: string;
  club_id: string;
  subscribed_at: string;
  is_active: boolean;
  notification_enabled: boolean;
}

export interface SubscriptionListResponse {
  subscriptions: Subscription[];
  total: number;
}

export interface Subscriber {
  id: string;
  user_id: string;
  user_email: string | null;
  user_display_name: string | null;
  club_id: string;
  subscribed_at: string;
  is_active: boolean;
  notification_enabled: boolean;
}

export interface SubscriberListResponse {
  subscribers: Subscriber[];
  total: number;
}

export interface SubscriptionCheckResponse {
  is_subscribed: boolean;
  club_id: string;
}

export async function subscribeToClub(
  clubId: string
): Promise<ApiResponse<Subscription>> {
  return apiClient.post('/api/subscriptions', { club_id: clubId });
}

export async function unsubscribeFromClub(
  clubId: string
): Promise<ApiResponse<void>> {
  return apiClient.delete(`/api/subscriptions/${clubId}`);
}

export async function getMySubscriptions(): Promise<ApiResponse<SubscriptionListResponse>> {
  return apiClient.get('/api/subscriptions/my');
}

export async function checkSubscription(
  clubId: string
): Promise<ApiResponse<SubscriptionCheckResponse>> {
  return apiClient.get(`/api/subscriptions/check/${clubId}`);
}

export async function updateNotificationSettings(
  clubId: string,
  notificationEnabled: boolean
): Promise<ApiResponse<Subscription>> {
  return apiClient.put(`/api/subscriptions/${clubId}/notifications`, {
    notification_enabled: notificationEnabled,
  });
}

export async function getClubSubscribers(
  clubId: string
): Promise<ApiResponse<SubscriberListResponse>> {
  return apiClient.get(`/api/subscriptions/clubs/${clubId}/subscribers`);
}
