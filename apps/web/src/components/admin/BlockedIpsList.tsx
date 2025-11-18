import React, { useState } from 'react';
import styles from '../../styles/Admin.module.css';
import ActionButton from './ActionButton';
import ConfirmDialog from './ConfirmDialog';

interface BlockedIpsListProps {
  blockedIps: string[];
  onUnblock: (ip: string) => Promise<void>;
  onViewDetails: (ip: string) => void;
  loading?: boolean;
}

export default function BlockedIpsList({
  blockedIps,
  onUnblock,
  onViewDetails,
  loading = false,
}: BlockedIpsListProps) {
  const [unblockingIp, setUnblockingIp] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    ip: string;
  }>({ isOpen: false, ip: '' });

  const handleUnblockClick = (ip: string) => {
    setConfirmDialog({ isOpen: true, ip });
  };

  const handleConfirmUnblock = async () => {
    if (confirmDialog.ip) {
      setUnblockingIp(confirmDialog.ip);
      try {
        await onUnblock(confirmDialog.ip);
      } finally {
        setUnblockingIp(null);
        setConfirmDialog({ isOpen: false, ip: '' });
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading blocked IPs...</div>;
  }

  if (!blockedIps || blockedIps.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No blocked IPs at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.blockedIpsList}>
        {blockedIps.map((ip) => (
          <div key={ip} className={styles.blockedIpItem}>
            <div className={styles.blockedIpInfo}>
              <span className={styles.blockedIpAddress}>{ip}</span>
            </div>
            <div className={styles.blockedIpActions}>
              <ActionButton
                onClick={() => onViewDetails(ip)}
                variant="secondary"
                className={styles.viewButton}
              >
                View Details
              </ActionButton>
              <ActionButton
                onClick={() => handleUnblockClick(ip)}
                variant="success"
                disabled={unblockingIp === ip}
                loading={unblockingIp === ip}
                className={styles.unblockButton}
              >
                Unblock
              </ActionButton>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Unblock IP Address"
        message={`Are you sure you want to unblock ${confirmDialog.ip}?`}
        confirmText="Unblock"
        cancelText="Cancel"
        variant="warning"
        onConfirm={handleConfirmUnblock}
        onCancel={() => setConfirmDialog({ isOpen: false, ip: '' })}
      />
    </>
  );
}

