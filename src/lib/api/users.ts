/**
 * Users API client
 */
import { apiClient, ApiResponse } from './client';

export interface UserNotificationPreferences {
  email_notifications: boolean;
  event_reminders: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  student_id?: string;
  interests?: string[];
  recommendation_preferences?: any;
  notification_preferences?: UserNotificationPreferences;
  created_at?: string;
  updated_at?: string;
}

export interface UpdateProfileData {
  display_name?: string;
  interests?: string[];
}

export interface ProfileEditData {
  first_name?: string;
  last_name?: string;
  email?: string;
  student_id?: string;
}

export interface UpdateInterestsData {
  interests: string[];
}

export interface RecommendationPreferencesData {
  preferred_categories: string[];
  preferred_activity_types: string[];
  available_time_slots: string[];
}

export async function getMyProfile(token: string): Promise<ApiResponse<UserProfile>> {
  return apiClient.get('/api/users/profile', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function fetchMyProfile(): Promise<ApiResponse<UserProfile>> {
  return apiClient.get('/api/users/profile');
}

export async function updateProfile(
  data: UpdateProfileData,
  token: string
): Promise<ApiResponse<UserProfile>> {
  return apiClient.post('/api/users/profile', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function editProfile(
  data: ProfileEditData
): Promise<ApiResponse<UserProfile>> {
  return apiClient.put('/api/users/profile', data);
}

export async function updateInterests(
  data: UpdateInterestsData,
  token: string
): Promise<ApiResponse<any>> {
  return apiClient.put('/api/users/interests', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function createRecommendationPreferences(
  data: RecommendationPreferencesData,
  token: string
): Promise<ApiResponse<{ message: string; preferences: RecommendationPreferencesData }>> {
  return apiClient.post('/api/users/recommendation-preferences', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function checkEmailExists(
  email: string
): Promise<ApiResponse<{ exists: boolean; role?: string }>> {
  const params = new URLSearchParams({ email });
  return apiClient.get(`/api/users/check-email?${params}`);
}

export async function updateRecommendationPreferences(
  data: RecommendationPreferencesData,
  token: string
): Promise<ApiResponse<{ message: string }>> {
  return apiClient.put('/api/users/recommendation-preferences', data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export async function updateNotificationPreferences(
  data: { email_notifications: boolean; event_reminders: boolean }
): Promise<ApiResponse<{ message: string; notification_preferences: { email_notifications: boolean; event_reminders: boolean } }>> {
  return apiClient.put('/api/users/notification-preferences', data);
}

export async function deleteMyAccount(): Promise<ApiResponse<null>> {
  return apiClient.delete('/api/users/me');
}
