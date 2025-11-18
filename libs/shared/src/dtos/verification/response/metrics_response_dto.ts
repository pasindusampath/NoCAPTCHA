/**
 * DTO for verification metrics record
 */
export class VerificationMetricsDto {
  id: number;
  token: string;
  page?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  timestamp: Date;

  constructor(data: {
    id: number;
    token: string;
    page?: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
    device?: string;
    timestamp: Date;
  }) {
    this.id = data.id;
    this.token = data.token;
    this.page = data.page;
    this.success = data.success;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.device = data.device;
    this.timestamp = data.timestamp;
  }
}

/**
 * DTO for metrics response with pagination
 */
export class MetricsResponseDto {
  metrics: VerificationMetricsDto[];
  total: number;
  page?: number;
  limit?: number;

  constructor(data: {
    metrics: VerificationMetricsDto[];
    total: number;
    page?: number;
    limit?: number;
  }) {
    this.metrics = data.metrics;
    this.total = data.total;
    this.page = data.page;
    this.limit = data.limit;
  }
}

