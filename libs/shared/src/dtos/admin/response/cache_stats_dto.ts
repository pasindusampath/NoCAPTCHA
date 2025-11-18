/**
 * DTO for cache statistics response
 */
export class CacheStatsDto {
  totalRecords: number;
  blockedCount: number;
  totalAttempts: number;

  constructor(data: {
    totalRecords: number;
    blockedCount: number;
    totalAttempts: number;
  }) {
    this.totalRecords = data.totalRecords;
    this.blockedCount = data.blockedCount;
    this.totalAttempts = data.totalAttempts;
  }
}

