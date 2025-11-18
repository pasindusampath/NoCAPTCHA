import { 
  IApiResponse, 
  VerifyResponseDto, 
  MetricsResponseDto 
} from '@nx-mono-repo-deployment-test/shared/src';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Verify a Turnstile token
 * @param token - The Turnstile token to verify
 * @param page - Optional page identifier
 * @returns API response with verification result
 */
export const verifyToken = async (
  token: string, 
  page?: string
): Promise<IApiResponse<VerifyResponseDto>> => {
  const response = await fetch(`${apiUrl}/api/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, page }),
  });

  if (!response.ok) {
    throw new Error(`Failed to verify token: ${response.statusText}`);
  }

  return await response.json();
};

/**
 * Get verification metrics
 * @param filters - Optional filters for metrics query
 * @returns API response with metrics data
 */
export const getMetrics = async (filters?: {
  startDate?: string;
  endDate?: string;
  success?: boolean;
  page?: string;
  limit?: number;
  offset?: number;
}): Promise<IApiResponse<MetricsResponseDto>> => {
  const queryParams = new URLSearchParams();
  
  if (filters) {
    if (filters.startDate) queryParams.append('startDate', filters.startDate);
    if (filters.endDate) queryParams.append('endDate', filters.endDate);
    if (filters.success !== undefined) queryParams.append('success', filters.success.toString());
    if (filters.page) queryParams.append('page', filters.page);
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.offset) queryParams.append('offset', filters.offset.toString());
  }

  const url = `${apiUrl}/api/metrics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch metrics: ${response.statusText}`);
  }

  return await response.json();
};

