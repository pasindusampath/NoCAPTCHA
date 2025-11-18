/**
 * DTO for IP statistics response
 */
export class IpStatsDto {
  totalAttempts: number;
  recentAttempts: number;
  failedAttempts: number;
  successAttempts: number;
  isBlocked: boolean;
  blockUntil?: Date;
  lastAttempt?: Date;

  constructor(data: {
    totalAttempts: number;
    recentAttempts: number;
    failedAttempts: number;
    successAttempts: number;
    isBlocked: boolean;
    blockUntil?: Date;
    lastAttempt?: Date;
  }) {
    this.totalAttempts = data.totalAttempts;
    this.recentAttempts = data.recentAttempts;
    this.failedAttempts = data.failedAttempts;
    this.successAttempts = data.successAttempts;
    this.isBlocked = data.isBlocked;
    this.blockUntil = data.blockUntil ? new Date(data.blockUntil) : undefined;
    this.lastAttempt = data.lastAttempt ? new Date(data.lastAttempt) : undefined;
  }
}

