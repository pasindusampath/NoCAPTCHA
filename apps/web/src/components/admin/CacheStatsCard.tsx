import React from 'react';
import { CacheStatsDto } from '@nx-mono-repo-deployment-test/shared/src';
import styles from '../../styles/Admin.module.css';

interface CacheStatsCardProps {
  stats: CacheStatsDto | null;
  loading?: boolean;
  title: string;
  icon: string;
  value: number;
  label: string;
}

export default function CacheStatsCard({
  stats,
  loading = false,
  title,
  icon,
  value,
  label,
}: CacheStatsCardProps) {
  const displayValue = stats ? value : 0;

  return (
    <div className={styles.statsCard}>
      <div className={styles.statsCardHeader}>
        <span className={styles.statsCardIcon}>{icon}</span>
        <h3 className={styles.statsCardTitle}>{title}</h3>
      </div>
      {loading ? (
        <div className={styles.statsCardLoading}>Loading...</div>
      ) : (
        <div className={styles.statsCardValue}>
          {displayValue.toLocaleString()}
        </div>
      )}
      <div className={styles.statsCardLabel}>{label}</div>
    </div>
  );
}

