import { apiRequest, ApiResponse } from './client';

export interface RecommendationReason {
  type: string;
  description: string;
  score_contribution: number;
}

export interface ClubRecommendation {
  club_id: string;
  score: number;
  reasons: RecommendationReason[];
  rank: number;
}

export interface RecommendationResponse {
  recommendations: ClubRecommendation[];
  total: number;
  generated_at: string;
  algorithm_version: string;
}

export async function getRecommendations(params?: {
  limit?: number;
}): Promise<ApiResponse<RecommendationResponse>> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/api/recommendations${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<RecommendationResponse>(url, { method: 'GET' });
}

export async function saveRecommendationResult(params?: {
  limit?: number;
}): Promise<ApiResponse<{ message: string; recommendation_id: string; total_recommendations: number }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/api/recommendations/save${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<{ message: string; recommendation_id: string; total_recommendations: number }>(url, { method: 'POST' });
}

export async function getRecommendationHistory(params?: {
  limit?: number;
}): Promise<ApiResponse<{ user_id: string; total: number; history: any[] }>> {
  const queryParams = new URLSearchParams();
  
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  
  const url = `/api/recommendations/history${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  return apiRequest<{ user_id: string; total: number; history: any[] }>(url, { method: 'GET' });
}
