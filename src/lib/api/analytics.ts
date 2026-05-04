/**
 * Analytics API client
 */
import { apiClient, ApiResponse } from './client';

export interface AnalyticsTrendsResponse {
  months: string[];
  subscribers: number[];
}

export async function getAnalyticsTrends(
  clubId: string,
  months: number = 6
): Promise<ApiResponse<AnalyticsTrendsResponse>> {
  return apiClient.get(
    `/api/analytics/clubs/${clubId}/trends?months=${months}`
  );
}
