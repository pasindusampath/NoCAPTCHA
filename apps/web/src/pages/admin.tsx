import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import {
  getCacheStats,
  getBlockedIps,
  getIpStats,
  blockIp,
  unblockIp,
  clearIp,
} from '../services/adminService';
import {
  CacheStatsDto,
  BlockedIpsResponseDto,
  IpStatsDto,
} from '@nx-mono-repo-deployment-test/shared/src';
import CacheStatsCard from '../components/admin/CacheStatsCard';
import BlockedIpsList from '../components/admin/BlockedIpsList';
import IpSearchForm from '../components/admin/IpSearchForm';
import IpDetailsPanel from '../components/admin/IpDetailsPanel';
import styles from '../styles/Admin.module.css';

export default function Admin() {
  const [cacheStats, setCacheStats] = useState<CacheStatsDto | null>(null);
  const [blockedIps, setBlockedIps] = useState<string[]>([]);
  const [selectedIp, setSelectedIp] = useState<string>('');
  const [ipStats, setIpStats] = useState<IpStatsDto | null>(null);
  const [loading, setLoading] = useState({
    stats: false,
    blocked: false,
    ipStats: false,
  });
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);

  // Fetch cache statistics
  const fetchCacheStats = useCallback(async () => {
    setLoading((prev) => ({ ...prev, stats: true }));
    setError(null);
    try {
      const response = await getCacheStats();
      if (response.success && response.data) {
        setCacheStats(response.data);
      } else {
        setError(response.error || 'Failed to fetch cache statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch cache statistics');
    } finally {
      setLoading((prev) => ({ ...prev, stats: false }));
    }
  }, []);

  // Fetch blocked IPs
  const fetchBlockedIps = useCallback(async () => {
    setLoading((prev) => ({ ...prev, blocked: true }));
    setError(null);
    try {
      const response = await getBlockedIps();
      if (response.success && response.data) {
        setBlockedIps(response.data.blocked);
      } else {
        setError(response.error || 'Failed to fetch blocked IPs');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch blocked IPs');
    } finally {
      setLoading((prev) => ({ ...prev, blocked: false }));
    }
  }, []);

  // Fetch IP statistics
  const fetchIpStats = useCallback(async (ip: string) => {
    setLoading((prev) => ({ ...prev, ipStats: true }));
    setError(null);
    try {
      const response = await getIpStats(ip);
      if (response.success && response.data) {
        setIpStats(response.data);
        setSelectedIp(ip);
      } else {
        setError(response.error || 'Failed to fetch IP statistics');
        setIpStats(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch IP statistics');
      setIpStats(null);
    } finally {
      setLoading((prev) => ({ ...prev, ipStats: false }));
    }
  }, []);

  // Handle IP search
  const handleIpSearch = useCallback(
    async (ip: string) => {
      await fetchIpStats(ip);
    },
    [fetchIpStats]
  );

  // Handle block IP
  const handleBlockIp = useCallback(
    async (ip: string, durationMinutes?: number) => {
      setError(null);
      try {
        const response = await blockIp(ip, durationMinutes);
        if (response.success) {
          setSuccessMessage(response.data?.message || `IP ${ip} has been blocked`);
          // Refresh data
          await Promise.all([fetchCacheStats(), fetchBlockedIps()]);
          // Refresh IP stats if this is the selected IP
          if (selectedIp === ip) {
            await fetchIpStats(ip);
          }
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(response.error || 'Failed to block IP');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to block IP');
      }
    },
    [fetchCacheStats, fetchBlockedIps, fetchIpStats, selectedIp]
  );

  // Handle unblock IP
  const handleUnblockIp = useCallback(
    async (ip: string) => {
      setError(null);
      try {
        const response = await unblockIp(ip);
        if (response.success) {
          setSuccessMessage(response.data?.message || `IP ${ip} has been unblocked`);
          // Refresh data
          await Promise.all([fetchCacheStats(), fetchBlockedIps()]);
          // Refresh IP stats if this is the selected IP
          if (selectedIp === ip) {
            await fetchIpStats(ip);
          }
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(response.error || 'Failed to unblock IP');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to unblock IP');
      }
    },
    [fetchCacheStats, fetchBlockedIps, fetchIpStats, selectedIp]
  );

  // Handle clear IP
  const handleClearIp = useCallback(
    async (ip: string) => {
      setError(null);
      try {
        const response = await clearIp(ip);
        if (response.success) {
          setSuccessMessage(response.data?.message || `Record for IP ${ip} has been cleared`);
          // Refresh data
          await Promise.all([fetchCacheStats(), fetchBlockedIps()]);
          // Clear IP stats if this is the selected IP
          if (selectedIp === ip) {
            setIpStats(null);
            setSelectedIp('');
          }
          // Clear success message after 3 seconds
          setTimeout(() => setSuccessMessage(null), 3000);
        } else {
          setError(response.error || 'Failed to clear IP');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to clear IP');
      }
    },
    [fetchCacheStats, fetchBlockedIps, selectedIp]
  );

  // Handle view IP details
  const handleViewDetails = useCallback(
    async (ip: string) => {
      await fetchIpStats(ip);
    },
    [fetchIpStats]
  );

  // Initial data fetch
  useEffect(() => {
    fetchCacheStats();
    fetchBlockedIps();
  }, [fetchCacheStats, fetchBlockedIps]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchCacheStats();
      fetchBlockedIps();
      if (selectedIp) {
        fetchIpStats(selectedIp);
      }
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, fetchCacheStats, fetchBlockedIps, fetchIpStats, selectedIp]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Admin Dashboard - MonkeyVerify</title>
        <meta name="description" content="Admin dashboard for managing verification cache and IP blocking" />
      </Head>

      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            <span className={styles.highlight}>Admin</span> Dashboard
          </h1>
          <div className={styles.navigation}>
            <Link href="/" className={styles.navLink}>
              ← Home
            </Link>
            <Link href="/verify" className={styles.navLink}>
              Verify Demo
            </Link>
          </div>
        </div>

        {error && (
          <div className={styles.errorBanner} role="alert">
            {error}
          </div>
        )}

        {successMessage && (
          <div className={styles.successBanner} role="alert">
            {successMessage}
          </div>
        )}

        <div className={styles.controls}>
          <label className={styles.autoRefreshLabel}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className={styles.autoRefreshCheckbox}
            />
            Auto-refresh (10s)
          </label>
          <button
            onClick={() => {
              fetchCacheStats();
              fetchBlockedIps();
              if (selectedIp) {
                fetchIpStats(selectedIp);
              }
            }}
            className={styles.refreshButton}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Cache Statistics Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Cache Statistics</h2>
          <div className={styles.statsGrid}>
            <CacheStatsCard
              stats={cacheStats}
              loading={loading.stats}
              title="Total Records"
              icon="📊"
              value={cacheStats?.totalRecords || 0}
              label="IP addresses tracked"
            />
            <CacheStatsCard
              stats={cacheStats}
              loading={loading.stats}
              title="Blocked IPs"
              icon="🚫"
              value={cacheStats?.blockedCount || 0}
              label="Currently blocked"
            />
            <CacheStatsCard
              stats={cacheStats}
              loading={loading.stats}
              title="Total Attempts"
              icon="🔢"
              value={cacheStats?.totalAttempts || 0}
              label="Verification attempts"
            />
          </div>
        </section>

        {/* Blocked IPs Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Blocked IP Addresses</h2>
          <BlockedIpsList
            blockedIps={blockedIps}
            onUnblock={handleUnblockIp}
            onViewDetails={handleViewDetails}
            loading={loading.blocked}
          />
        </section>

        {/* IP Search and Details Section */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>IP Lookup & Management</h2>
          <IpSearchForm onSearch={handleIpSearch} loading={loading.ipStats} />
          <IpDetailsPanel
            ipStats={ipStats}
            ip={selectedIp}
            onBlock={handleBlockIp}
            onUnblock={handleUnblockIp}
            onClear={handleClearIp}
            loading={loading.ipStats}
          />
        </section>
      </main>
    </div>
  );
}

