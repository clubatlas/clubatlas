import { apiRequest, ApiResponse } from './client';

export interface Announcement {
  id?: string;
  club_id: string;
  title: string;
  content: string;
  status: string;
  created_by: string;
  sent_to: number;
  opens: number;
  created_at?: string;
  updated_at?: string;
}

export interface AnnouncementCreate {
  club_id: string;
  title: string;
  content: string;
}

export interface AnnouncementUpdate {
  title?: string;
  content?: string;
  status?: string;
}

export interface AnnouncementListResponse {
  announcements: Announcement[];
  total: number;
}

export async function getAnnouncements(params?: {
  club_id?: string;
  status_filter?: string;
  limit?: number;
}): Promise<ApiResponse<AnnouncementListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.club_id) queryParams.append('club_id', params.club_id);
  if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/api/announcements${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<AnnouncementListResponse>(url, { method: 'GET' });
}

export async function getAnnouncement(announcementId: string): Promise<ApiResponse<Announcement>> {
  return apiRequest<Announcement>(`/api/announcements/${announcementId}`, { method: 'GET' });
}

export async function createAnnouncement(announcementData: AnnouncementCreate): Promise<ApiResponse<Announcement>> {
  return apiRequest<Announcement>('/api/announcements', {
    method: 'POST',
    body: JSON.stringify(announcementData),
  });
}

export async function updateAnnouncement(announcementId: string, announcementData: AnnouncementUpdate): Promise<ApiResponse<Announcement>> {
  return apiRequest<Announcement>(`/api/announcements/${announcementId}`, {
    method: 'PUT',
    body: JSON.stringify(announcementData),
  });
}

export async function deleteAnnouncement(announcementId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/announcements/${announcementId}`, { method: 'DELETE' });
}
