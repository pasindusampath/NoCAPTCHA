import {
  IApiResponse,
  CacheStatsDto,
  BlockedIpsResponseDto,
  IpStatsDto,
  BlockIpRequestDto,
  BlockIpResponseDto,
} from '@nx-mono-repo-deployment-test/shared/src';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Get cache statistics
 * @returns API response with cache statistics
 */
export const getCacheStats = async (): Promise<IApiResponse<CacheStatsDto>> => {
  const response = await fetch(`${apiUrl}/api/admin/cache/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch cache stats: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && data.data) {
    data.data = new CacheStatsDto(data.data);
  }
  return data;
};

/**
 * Get list of blocked IPs
 * @returns API response with blocked IPs
 */
export const getBlockedIps = async (): Promise<IApiResponse<BlockedIpsResponseDto>> => {
  const response = await fetch(`${apiUrl}/api/admin/cache/blocked`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch blocked IPs: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && data.data) {
    data.data = new BlockedIpsResponseDto(data.data);
  }
  return data;
};

/**
 * Get statistics for a specific IP
 * @param ip - The IP address to get stats for
 * @returns API response with IP statistics
 */
export const getIpStats = async (ip: string): Promise<IApiResponse<IpStatsDto>> => {
  const response = await fetch(`${apiUrl}/api/admin/cache/ip/${encodeURIComponent(ip)}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch IP stats: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && data.data) {
    data.data = new IpStatsDto(data.data);
  }
  return data;
};

/**
 * Block an IP address
 * @param ip - The IP address to block
 * @param durationMinutes - Optional duration in minutes (defaults to configured duration)
 * @returns API response with block confirmation
 */
export const blockIp = async (
  ip: string,
  durationMinutes?: number
): Promise<IApiResponse<BlockIpResponseDto>> => {
  const body: BlockIpRequestDto = new BlockIpRequestDto({ durationMinutes });

  const response = await fetch(`${apiUrl}/api/admin/cache/block/${encodeURIComponent(ip)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Failed to block IP: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && data.data) {
    data.data = new BlockIpResponseDto(data.data);
  }
  return data;
};

/**
 * Unblock an IP address
 * @param ip - The IP address to unblock
 * @returns API response with unblock confirmation
 */
export const unblockIp = async (ip: string): Promise<IApiResponse<BlockIpResponseDto>> => {
  const response = await fetch(`${apiUrl}/api/admin/cache/unblock/${encodeURIComponent(ip)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to unblock IP: ${response.statusText}`);
  }

  const data = await response.json();
  if (data.success && data.data) {
    data.data = new BlockIpResponseDto(data.data);
  }
  return data;
};

/**
 * Clear all records for an IP address
 * @param ip - The IP address to clear
 * @returns API response with clear confirmation
 */
export const clearIp = async (ip: string): Promise<IApiResponse<{ ip: string; message: string }>> => {
  const response = await fetch(`${apiUrl}/api/admin/cache/ip/${encodeURIComponent(ip)}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to clear IP: ${response.statusText}`);
  }

  return await response.json();
};

