import { apiRequest, ApiResponse } from './client';

export interface StudentInfo {
  uid: string;
  display_name?: string;
  email: string;
  subscription_count: number;
  created_at?: string;
}

export interface StudentsListResponse {
  students: StudentInfo[];
  total: number;
}

export async function getStudents(): Promise<ApiResponse<StudentsListResponse>> {
  return apiRequest<StudentsListResponse>('/api/superadmin/students', { method: 'GET' });
}

export async function deleteStudent(uid: string): Promise<ApiResponse<{ message: string; uid: string }>> {
  return apiRequest<{ message: string; uid: string }>(
    `/api/superadmin/students/${uid}`,
    { method: 'DELETE' }
  );
}

export interface ClubLeaderInfo {
  uid: string;
  display_name?: string;
  email: string;
  managed_club_ids: string[];
  managed_club_names: string[];
  role: string;
  status: string;
  created_at?: string;
}

export interface ClubLeadersResponse {
  leaders: ClubLeaderInfo[];
  total: number;
}

export async function getClubLeaders(params?: {
  status_filter?: 'active' | 'inactive';
}): Promise<ApiResponse<ClubLeadersResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.status_filter) {
    queryParams.append('status_filter', params.status_filter);
  }
  
  const url = `/api/superadmin/club-leaders${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<ClubLeadersResponse>(url, { method: 'GET' });
}

export async function updateClubLeader(
  uid: string,
  data: {
    display_name?: string;
    club_id?: string;
  }
): Promise<ApiResponse<{ message: string; uid: string; updated_fields: string[] }>> {
  return apiRequest<{ message: string; uid: string; updated_fields: string[] }>(
    `/api/superadmin/club-leaders/${uid}`,
    {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function updateLeaderStatus(
  uid: string,
  status: 'active' | 'inactive'
): Promise<ApiResponse<{ message: string; uid: string; status: string }>> {
  return apiRequest<{ message: string; uid: string; status: string }>(
    `/api/superadmin/club-leaders/${uid}/status?status=${status}`,
    { method: 'PUT' }
  );
}

export async function assignClubLeader(data: {
  email: string;
  club_id: string;
  role_title?: string;
}): Promise<ApiResponse<{ 
  message: string; 
  uid: string; 
  email: string; 
  club_id: string; 
  club_name: string 
}>> {
  return apiRequest<{ 
    message: string; 
    uid: string; 
    email: string; 
    club_id: string; 
    club_name: string 
  }>(
    '/api/superadmin/club-leaders/assign',
    {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
}

export async function removeLeaderFromClub(
  uid: string,
  clubId: string
): Promise<ApiResponse<{ message: string; uid: string; club_id: string; remaining_clubs: string[] }>> {
  return apiRequest<{ message: string; uid: string; club_id: string; remaining_clubs: string[] }>(
    `/api/superadmin/club-leaders/${uid}/clubs/${clubId}`,
    { method: 'DELETE' }
  );
}

export async function deleteClubLeader(
  uid: string
): Promise<ApiResponse<{ message: string; uid: string }>> {
  return apiRequest<{ message: string; uid: string }>(
    `/api/superadmin/club-leaders/${uid}`,
    { method: 'DELETE' }
  );
}
