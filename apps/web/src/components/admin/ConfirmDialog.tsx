import React, { useEffect } from 'react';
import styles from '../../styles/Admin.module.css';
import ActionButton from './ActionButton';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'info',
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const variantClass = styles[`dialog${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.dialogInfo;

  return (
    <div className={styles.dialogOverlay} onClick={onCancel}>
      <div className={`${styles.dialog} ${variantClass}`} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.dialogTitle}>{title}</h3>
        <p className={styles.dialogMessage}>{message}</p>
        <div className={styles.dialogActions}>
          <ActionButton onClick={onCancel} variant="secondary">
            {cancelText}
          </ActionButton>
          <ActionButton
            onClick={onConfirm}
            variant={variant === 'danger' ? 'danger' : 'primary'}
          >
            {confirmText}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}

