import { apiRequest, ApiResponse } from './client';

export interface Event {
  id?: string;
  club_id: string;
  title: string;
  description: string;
  event_type: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  max_attendees?: number | null;
  attendees: string[];
  status: string;
  created_by: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventCreate {
  club_id: string;
  title: string;
  description: string;
  event_type?: string;
  start_datetime: string;
  end_datetime: string;
  location: string;
  max_attendees?: number | null;
}

export interface EventUpdate {
  title?: string;
  description?: string;
  event_type?: string;
  start_datetime?: string;
  end_datetime?: string;
  location?: string;
  max_attendees?: number | null;
  status?: string;
}

export interface EventListResponse {
  events: Event[];
  total: number;
}

export interface AttendanceRecord {
  event: Event;
  status: 'attended' | 'missed';
  club_name: string;
}

export interface AttendanceStats {
  total_events: number;
  attended: number;
  missed: number;
  attendance_rate: number;
}

export interface AttendanceHistoryResponse {
  records: AttendanceRecord[];
  stats: AttendanceStats;
}

export async function getEvents(params?: {
  club_id?: string;
  status_filter?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
}): Promise<ApiResponse<EventListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.club_id) queryParams.append('club_id', params.club_id);
  if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/api/events${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<EventListResponse>(url, { method: 'GET' });
}

export async function getMyCalendarEvents(params?: {
  start_date?: string;
  end_date?: string;
}): Promise<ApiResponse<EventListResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.start_date) queryParams.append('start_date', params.start_date);
  if (params?.end_date) queryParams.append('end_date', params.end_date);
  
  const url = `/api/events/my-calendar${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<EventListResponse>(url, { method: 'GET' });
}

export async function getEvent(eventId: string): Promise<ApiResponse<Event>> {
  return apiRequest<Event>(`/api/events/${eventId}`, { method: 'GET' });
}

export async function createEvent(eventData: EventCreate): Promise<ApiResponse<Event>> {
  return apiRequest<Event>('/api/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

export async function updateEvent(eventId: string, eventData: EventUpdate): Promise<ApiResponse<Event>> {
  return apiRequest<Event>(`/api/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(eventData),
  });
}

export async function deleteEvent(eventId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/events/${eventId}`, { method: 'DELETE' });
}

export async function attendEvent(eventId: string): Promise<ApiResponse<Event>> {
  return apiRequest<Event>(`/api/events/${eventId}/attend`, { method: 'POST' });
}

export async function cancelAttendance(eventId: string): Promise<ApiResponse<void>> {
  return apiRequest<void>(`/api/events/${eventId}/attend`, { method: 'DELETE' });
}

export async function sendEventReminder(eventId: string): Promise<ApiResponse<{ sent: number; message: string }>> {
  return apiRequest<{ sent: number; message: string }>(`/api/events/${eventId}/remind`, { method: 'POST' });
}

export async function getMyAttendanceHistory(params?: {
  status_filter?: 'attended' | 'missed' | 'all';
}): Promise<ApiResponse<AttendanceHistoryResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.status_filter) queryParams.append('status_filter', params.status_filter);
  
  const url = `/api/events/my-attendance${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<AttendanceHistoryResponse>(url, { method: 'GET' });
}
