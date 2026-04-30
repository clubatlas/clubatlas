import { apiRequest, ApiResponse } from './client';

export interface UploadResponse {
  message: string;
  file_url: string;
}

export async function uploadClubLogo(
  clubId: string,
  file: File
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest<UploadResponse>(`/api/upload/club-logo?club_id=${clubId}`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadClubBanner(
  clubId: string,
  file: File
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest<UploadResponse>(`/api/upload/club-banner?club_id=${clubId}`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadClubMedia(
  clubId: string,
  file: File
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);
  
  return apiRequest<UploadResponse>(`/api/upload/club-media?club_id=${clubId}`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadLeaderAvatar(
  clubId: string,
  file: File
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<UploadResponse>(`/api/upload/leader-avatar?club_id=${clubId}`, {
    method: 'POST',
    body: formData,
  });
}

export async function deleteClubMedia(
  clubId: string,
  fileUrl: string
): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/upload/club-media?club_id=${clubId}&file_url=${encodeURIComponent(fileUrl)}`, {
    method: 'DELETE',
  });
}
