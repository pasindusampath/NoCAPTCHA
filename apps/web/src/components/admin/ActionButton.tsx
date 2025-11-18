import React from 'react';
import styles from '../../styles/Admin.module.css';

interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'danger' | 'success' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export default function ActionButton({
  onClick,
  children,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}: ActionButtonProps) {
  const variantClass = styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.buttonPrimary;

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${styles.actionButton} ${variantClass} ${className}`}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}

