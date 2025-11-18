import React, { useState, FormEvent } from 'react';
import styles from '../../styles/Admin.module.css';

interface IpSearchFormProps {
  onSearch: (ip: string) => Promise<void>;
  loading?: boolean;
}

// Basic IPv4 and IPv6 validation
const isValidIp = (ip: string): boolean => {
  // IPv4 regex
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  // IPv6 regex (simplified)
  const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/;
  
  if (ipv4Regex.test(ip)) {
    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  }
  
  return ipv6Regex.test(ip);
};

export default function IpSearchForm({ onSearch, loading = false }: IpSearchFormProps) {
  const [ip, setIp] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!ip.trim()) {
      setError('Please enter an IP address');
      return;
    }

    if (!isValidIp(ip.trim())) {
      setError('Please enter a valid IP address (IPv4 or IPv6)');
      return;
    }

    try {
      await onSearch(ip.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search IP');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.ipSearchForm}>
      <div className={styles.ipSearchField}>
        <label htmlFor="ip-search" className={styles.ipSearchLabel}>
          Search IP Address
        </label>
        <div className={styles.ipSearchInputGroup}>
          <input
            type="text"
            id="ip-search"
            value={ip}
            onChange={(e) => {
              setIp(e.target.value);
              setError(null);
            }}
            placeholder="e.g., 192.168.1.1 or 2001:0db8::1"
            className={styles.ipSearchInput}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !ip.trim()}
            className={`${styles.actionButton} ${styles.buttonPrimary} ${styles.ipSearchButton}`}
          >
            {loading ? 'Loading...' : 'Search'}
          </button>
        </div>
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </form>
  );
}

