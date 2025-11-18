/**
 * In-memory cache service for verification attempts
 * Tracks user/IP verification patterns and implements blocking logic
 */

interface VerificationAttempt {
  ipAddress: string;
  timestamp: Date;
  success: boolean;
  token?: string;
  page?: string;
}

interface UserRecord {
  ipAddress: string;
  attempts: VerificationAttempt[];
  blocked: boolean;
  blockUntil?: Date;
  lastAttempt?: Date;
}

interface CacheConfig {
  maxAttemptsPerWindow: number; // Max attempts allowed in time window
  timeWindowMinutes: number; // Time window in minutes
  maxFailedAttempts: number; // Max failed attempts before blocking
  blockDurationMinutes: number; // How long to block after threshold
  cleanupIntervalMinutes: number; // How often to clean old records
}

export class VerificationCacheService {
  private static instance: VerificationCacheService;
  private cache: Map<string, UserRecord>; // Key: IP address
  private config: CacheConfig;
  private cleanupInterval?: NodeJS.Timeout;

  private constructor() {
    this.cache = new Map();
    this.config = {
      maxAttemptsPerWindow: parseInt(process.env.VERIFICATION_MAX_ATTEMPTS || '10', 10),
      timeWindowMinutes: parseInt(process.env.VERIFICATION_TIME_WINDOW || '5', 10),
      maxFailedAttempts: parseInt(process.env.VERIFICATION_MAX_FAILED || '5', 10),
      blockDurationMinutes: parseInt(process.env.VERIFICATION_BLOCK_DURATION || '15', 10),
      cleanupIntervalMinutes: parseInt(process.env.VERIFICATION_CLEANUP_INTERVAL || '30', 10),
    };

    // Start cleanup interval
    this.startCleanup();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): VerificationCacheService {
    if (!VerificationCacheService.instance) {
      VerificationCacheService.instance = new VerificationCacheService();
    }
    return VerificationCacheService.instance;
  }

  /**
   * Record a verification attempt
   */
  public recordAttempt(
    ipAddress: string,
    success: boolean,
    token?: string,
    page?: string
  ): void {
    const now = new Date();
    const record = this.getOrCreateRecord(ipAddress);

    // Add attempt
    record.attempts.push({
      ipAddress,
      timestamp: now,
      success,
      token,
      page,
    });

    record.lastAttempt = now;

    // Update block status based on patterns
    this.updateBlockStatus(record);

    // Clean old attempts outside time window
    this.cleanOldAttempts(record);
  }

  /**
   * Check if IP is blocked
   */
  public isBlocked(ipAddress: string): boolean {
    const record = this.cache.get(ipAddress);
    if (!record) {
      return false;
    }

    // Check if block has expired
    if (record.blocked && record.blockUntil) {
      if (new Date() > record.blockUntil) {
        // Block expired, unblock
        record.blocked = false;
        record.blockUntil = undefined;
        return false;
      }
      return true;
    }

    return record.blocked || false;
  }

  /**
   * Get remaining attempts before blocking
   */
  public getRemainingAttempts(ipAddress: string): number {
    const record = this.cache.get(ipAddress);
    if (!record) {
      return this.config.maxAttemptsPerWindow;
    }

    const recentAttempts = this.getRecentAttempts(record);
    return Math.max(0, this.config.maxAttemptsPerWindow - recentAttempts.length);
  }

  /**
   * Get failed attempts count in time window
   */
  public getFailedAttemptsCount(ipAddress: string): number {
    const record = this.cache.get(ipAddress);
    if (!record) {
      return 0;
    }

    const recentAttempts = this.getRecentAttempts(record);
    return recentAttempts.filter(a => !a.success).length;
  }

  /**
   * Get user record statistics
   */
  public getRecordStats(ipAddress: string): {
    totalAttempts: number;
    recentAttempts: number;
    failedAttempts: number;
    successAttempts: number;
    isBlocked: boolean;
    blockUntil?: Date;
    lastAttempt?: Date;
  } {
    const record = this.cache.get(ipAddress);
    if (!record) {
      return {
        totalAttempts: 0,
        recentAttempts: 0,
        failedAttempts: 0,
        successAttempts: 0,
        isBlocked: false,
      };
    }

    const recentAttempts = this.getRecentAttempts(record);
    const failedAttempts = recentAttempts.filter(a => !a.success);
    const successAttempts = recentAttempts.filter(a => a.success);

    return {
      totalAttempts: record.attempts.length,
      recentAttempts: recentAttempts.length,
      failedAttempts: failedAttempts.length,
      successAttempts: successAttempts.length,
      isBlocked: this.isBlocked(ipAddress),
      blockUntil: record.blockUntil,
      lastAttempt: record.lastAttempt,
    };
  }

  /**
   * Manually block an IP address
   */
  public blockIp(ipAddress: string, durationMinutes?: number): void {
    const record = this.getOrCreateRecord(ipAddress);
    record.blocked = true;
    record.blockUntil = new Date(
      Date.now() + (durationMinutes || this.config.blockDurationMinutes) * 60 * 1000
    );
  }

  /**
   * Manually unblock an IP address
   */
  public unblockIp(ipAddress: string): void {
    const record = this.cache.get(ipAddress);
    if (record) {
      record.blocked = false;
      record.blockUntil = undefined;
    }
  }

  /**
   * Clear all records for an IP
   */
  public clearRecord(ipAddress: string): void {
    this.cache.delete(ipAddress);
  }

  /**
   * Get all blocked IPs
   */
  public getBlockedIps(): string[] {
    const blocked: string[] = [];
    for (const [ip] of this.cache.entries()) {
      if (this.isBlocked(ip)) {
        blocked.push(ip);
      }
    }
    return blocked;
  }

  /**
   * Get cache statistics
   */
  public getCacheStats(): {
    totalRecords: number;
    blockedCount: number;
    totalAttempts: number;
  } {
    let totalAttempts = 0;
    let blockedCount = 0;

    for (const record of this.cache.values()) {
      totalAttempts += record.attempts.length;
      if (this.isBlocked(record.ipAddress)) {
        blockedCount++;
      }
    }

    return {
      totalRecords: this.cache.size,
      blockedCount,
      totalAttempts,
    };
  }

  /**
   * Private helper methods
   */
  private getOrCreateRecord(ipAddress: string): UserRecord {
    if (!this.cache.has(ipAddress)) {
      this.cache.set(ipAddress, {
        ipAddress,
        attempts: [],
        blocked: false,
      });
    }
    return this.cache.get(ipAddress)!;
  }

  private getRecentAttempts(record: UserRecord): VerificationAttempt[] {
    const now = new Date();
    const windowStart = new Date(now.getTime() - this.config.timeWindowMinutes * 60 * 1000);
    
    return record.attempts.filter(
      attempt => attempt.timestamp >= windowStart
    );
  }

  private updateBlockStatus(record: UserRecord): void {
    const recentAttempts = this.getRecentAttempts(record);
    const failedAttempts = recentAttempts.filter(a => !a.success);

    // Block if too many failed attempts
    if (failedAttempts.length >= this.config.maxFailedAttempts && !record.blocked) {
      record.blocked = true;
      record.blockUntil = new Date(
        Date.now() + this.config.blockDurationMinutes * 60 * 1000
      );
      console.log(`🚫 Blocked IP ${record.ipAddress} due to ${failedAttempts.length} failed attempts`);
    }

    // Unblock if block expired
    if (record.blocked && record.blockUntil && new Date() > record.blockUntil) {
      record.blocked = false;
      record.blockUntil = undefined;
      console.log(`✅ Unblocked IP ${record.ipAddress} (block expired)`);
    }
  }

  private cleanOldAttempts(record: UserRecord): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - this.config.timeWindowMinutes * 2 * 60 * 1000);
    
    record.attempts = record.attempts.filter(
      attempt => attempt.timestamp >= cutoffTime
    );

    // Remove record if no attempts and not blocked
    if (record.attempts.length === 0 && !record.blocked) {
      this.cache.delete(record.ipAddress);
    }
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.performCleanup();
    }, this.config.cleanupIntervalMinutes * 60 * 1000);
  }

  private performCleanup(): void {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - this.config.timeWindowMinutes * 2 * 60 * 1000);
    let cleaned = 0;

    for (const [ip, record] of this.cache.entries()) {
      // Remove old attempts
      const beforeCount = record.attempts.length;
      record.attempts = record.attempts.filter(
        attempt => attempt.timestamp >= cutoffTime
      );

      // Remove record if empty and not blocked
      if (record.attempts.length === 0 && !record.blocked) {
        this.cache.delete(ip);
        cleaned++;
      } else if (record.attempts.length < beforeCount) {
        cleaned++;
      }

      // Check if block expired
      if (record.blocked && record.blockUntil && now > record.blockUntil) {
        record.blocked = false;
        record.blockUntil = undefined;
        cleaned++;
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} cache records`);
    }
  }

  /**
   * Shutdown cleanup interval (for testing or graceful shutdown)
   */
  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
  }
}

export default VerificationCacheService;

