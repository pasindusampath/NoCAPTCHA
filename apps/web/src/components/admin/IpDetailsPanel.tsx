import React, { useState } from 'react';
import { IpStatsDto } from '@nx-mono-repo-deployment-test/shared/src';
import styles from '../../styles/Admin.module.css';
import ActionButton from './ActionButton';
import ConfirmDialog from './ConfirmDialog';

interface IpDetailsPanelProps {
  ipStats: IpStatsDto | null;
  ip: string;
  onBlock: (ip: string, durationMinutes?: number) => Promise<void>;
  onUnblock: (ip: string) => Promise<void>;
  onClear: (ip: string) => Promise<void>;
  loading?: boolean;
}

export default function IpDetailsPanel({
  ipStats,
  ip,
  onBlock,
  onUnblock,
  onClear,
  loading = false,
}: IpDetailsPanelProps) {
  const [blockDuration, setBlockDuration] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: 'block' | 'unblock' | 'clear';
  }>({ isOpen: false, type: 'block' });

  const handleBlock = async () => {
    setActionLoading('block');
    try {
      const duration = blockDuration ? parseInt(blockDuration, 10) : undefined;
      await onBlock(ip, duration);
      setBlockDuration('');
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, type: 'block' });
    }
  };

  const handleUnblock = async () => {
    setActionLoading('unblock');
    try {
      await onUnblock(ip);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, type: 'unblock' });
    }
  };

  const handleClear = async () => {
    setActionLoading('clear');
    try {
      await onClear(ip);
    } finally {
      setActionLoading(null);
      setConfirmDialog({ isOpen: false, type: 'clear' });
    }
  };

  const formatDate = (date?: Date): string => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  if (!ipStats && !loading) {
    return (
      <div className={styles.ipDetailsPanel}>
        <div className={styles.emptyState}>
          <p>Enter an IP address above to view details.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.ipDetailsPanel}>
        <div className={styles.ipDetailsHeader}>
          <h3 className={styles.ipDetailsTitle}>IP Details: {ip}</h3>
          {ipStats?.isBlocked && (
            <span className={styles.blockedBadge}>BLOCKED</span>
          )}
        </div>

        {loading ? (
          <div className={styles.loading}>Loading IP statistics...</div>
        ) : ipStats ? (
          <>
            <div className={styles.ipDetailsStats}>
              <div className={styles.ipStatItem}>
                <span className={styles.ipStatLabel}>Total Attempts:</span>
                <span className={styles.ipStatValue}>{ipStats.totalAttempts}</span>
              </div>
              <div className={styles.ipStatItem}>
                <span className={styles.ipStatLabel}>Recent Attempts:</span>
                <span className={styles.ipStatValue}>{ipStats.recentAttempts}</span>
              </div>
              <div className={styles.ipStatItem}>
                <span className={styles.ipStatLabel}>Successful:</span>
                <span className={`${styles.ipStatValue} ${styles.success}`}>
                  {ipStats.successAttempts}
                </span>
              </div>
              <div className={styles.ipStatItem}>
                <span className={styles.ipStatLabel}>Failed:</span>
                <span className={`${styles.ipStatValue} ${styles.danger}`}>
                  {ipStats.failedAttempts}
                </span>
              </div>
              <div className={styles.ipStatItem}>
                <span className={styles.ipStatLabel}>Status:</span>
                <span
                  className={`${styles.ipStatValue} ${
                    ipStats.isBlocked ? styles.blocked : styles.active
                  }`}
                >
                  {ipStats.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </div>
              {ipStats.blockUntil && (
                <div className={styles.ipStatItem}>
                  <span className={styles.ipStatLabel}>Blocked Until:</span>
                  <span className={styles.ipStatValue}>
                    {formatDate(ipStats.blockUntil)}
                  </span>
                </div>
              )}
              {ipStats.lastAttempt && (
                <div className={styles.ipStatItem}>
                  <span className={styles.ipStatLabel}>Last Attempt:</span>
                  <span className={styles.ipStatValue}>
                    {formatDate(ipStats.lastAttempt)}
                  </span>
                </div>
              )}
            </div>

            <div className={styles.ipDetailsActions}>
              <div className={styles.blockActionGroup}>
                <input
                  type="number"
                  placeholder="Duration (minutes, optional)"
                  value={blockDuration}
                  onChange={(e) => setBlockDuration(e.target.value)}
                  className={styles.blockDurationInput}
                  min="1"
                  disabled={actionLoading !== null}
                />
                <ActionButton
                  onClick={() => setConfirmDialog({ isOpen: true, type: 'block' })}
                  variant="danger"
                  disabled={actionLoading !== null || ipStats.isBlocked}
                  loading={actionLoading === 'block'}
                >
                  Block IP
                </ActionButton>
              </div>

              <ActionButton
                onClick={() => setConfirmDialog({ isOpen: true, type: 'unblock' })}
                variant="success"
                disabled={actionLoading !== null || !ipStats.isBlocked}
                loading={actionLoading === 'unblock'}
              >
                Unblock IP
              </ActionButton>

              <ActionButton
                onClick={() => setConfirmDialog({ isOpen: true, type: 'clear' })}
                variant="danger"
                disabled={actionLoading !== null}
                loading={actionLoading === 'clear'}
              >
                Clear Record
              </ActionButton>
            </div>
          </>
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'block'}
        title="Block IP Address"
        message={`Are you sure you want to block ${ip}?${
          blockDuration ? ` It will be blocked for ${blockDuration} minutes.` : ''
        }`}
        confirmText="Block"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleBlock}
        onCancel={() => setConfirmDialog({ isOpen: false, type: 'block' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'unblock'}
        title="Unblock IP Address"
        message={`Are you sure you want to unblock ${ip}?`}
        confirmText="Unblock"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleUnblock}
        onCancel={() => setConfirmDialog({ isOpen: false, type: 'unblock' })}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen && confirmDialog.type === 'clear'}
        title="Clear IP Record"
        message={`Are you sure you want to clear all records for ${ip}? This action cannot be undone.`}
        confirmText="Clear"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleClear}
        onCancel={() => setConfirmDialog({ isOpen: false, type: 'clear' })}
      />
    </>
  );
}

