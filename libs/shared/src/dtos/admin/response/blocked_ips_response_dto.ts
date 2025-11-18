/**
 * DTO for blocked IPs response
 */
export class BlockedIpsResponseDto {
  blocked: string[];
  count: number;

  constructor(data: {
    blocked: string[];
    count: number;
  }) {
    this.blocked = data.blocked;
    this.count = data.count;
  }
}

