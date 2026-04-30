/**
 * Clubs API 클라이언트
 */
import { apiClient, ApiResponse } from './client';

export interface MeetingSchedule {
  day: string;
  time_slots: string[];
  location?: string;
}

export interface ClubLeader {
  uid: string;
  name: string;
  role: string;
  email?: string;
  avatar_url?: string;
}

export interface ClubStats {
  total_members?: number;
  total_subscribers?: number;
  total_events?: number;
  view_count?: number;
  established_date?: string;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  tagline?: string;
  categories: string[];
  tags?: string[];
  activity_type: string[];
  meeting_schedule?: MeetingSchedule[];
  leaders?: ClubLeader[];
  contact_email?: string;
  website?: string;
  social_media?: string;
  stats?: ClubStats;
  logo_url?: string;
  banner_url?: string;
  media_urls?: string[];
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
}

export interface ClubListResponse {
  clubs: Club[];
  total: number;
  page: number;
  page_size: number;
}

export async function getClubs(
  params?: {
    categories?: string;
    activity_type?: string;
    page?: number;
    page_size?: number;
  }
): Promise<ApiResponse<ClubListResponse>> {
  const queryParams = new URLSearchParams();
  if (params?.categories) queryParams.append('categories', params.categories);
  if (params?.activity_type) queryParams.append('activity_type', params.activity_type);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.page_size) queryParams.append('page_size', params.page_size.toString());

  const queryString = queryParams.toString();
  return apiClient.get(`/api/clubs${queryString ? `?${queryString}` : ''}`);
}

export async function getClub(clubId: string): Promise<ApiResponse<Club>> {
  return apiClient.get(`/api/clubs/${clubId}`);
}

export async function getMyManagedClub(): Promise<ApiResponse<Club>> {
  return apiClient.get('/api/clubs/my/managed');
}

export interface ClubUpdate {
  name?: string;
  description?: string;
  tagline?: string;
  categories?: string[];
  tags?: string[];
  activity_type?: string[];
  meeting_schedule?: MeetingSchedule[];
  leaders?: ClubLeader[];
  contact_email?: string;
  website?: string;
  social_media?: string;
  logo_url?: string;
  banner_url?: string;
  media_urls?: string[];
}

export async function updateClub(clubId: string, clubData: ClubUpdate): Promise<ApiResponse<Club>> {
  return apiClient.put(`/api/clubs/${clubId}`, clubData);
}
