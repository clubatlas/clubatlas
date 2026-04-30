import { apiRequest, ApiResponse } from './client';

export interface Bookmark {
  id?: string;
  user_id: string;
  club_id: string;
  created_at?: string;
}

export interface BookmarkCreate {
  club_id: string;
}

export interface BookmarkedClub {
  bookmark_id: string;
  club_id: string;
  club_name: string;
  club_tagline?: string | null;
  club_description: string;
  categories: string[];
  logo_url?: string | null;
  banner_url?: string | null;
  match_score?: number | null;
  match_reason?: string | null;
  bookmarked_at: string;
}

export interface BookmarkListResponse {
  bookmarks: BookmarkedClub[];
  total: number;
}

export async function createBookmark(clubId: string): Promise<ApiResponse<Bookmark>> {
  return apiRequest<Bookmark>('/api/bookmarks', {
    method: 'POST',
    body: JSON.stringify({ club_id: clubId }),
  });
}

export async function getMyBookmarks(): Promise<ApiResponse<BookmarkListResponse>> {
  return apiRequest<BookmarkListResponse>('/api/bookmarks/my', { method: 'GET' });
}

export async function deleteBookmark(clubId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/bookmarks/${clubId}`, { method: 'DELETE' });
}

export async function checkBookmark(clubId: string): Promise<ApiResponse<{ is_bookmarked: boolean }>> {
  return apiRequest<{ is_bookmarked: boolean }>(`/api/bookmarks/${clubId}/check`, { method: 'GET' });
}
