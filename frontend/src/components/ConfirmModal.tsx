import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-card confirm-modal" style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-danger)' }}>
            <AlertTriangle size={20} />
            <h3 style={{ fontSize: '1.2rem' }}>{title}</h3>
          </div>
          <button className="btn-close-modal" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '0.5rem 0' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
            {message}
          </p>
        </div>

        <div className="modal-footer" style={{ borderTop: 'none', padding: '0', marginTop: '0.5rem' }}>
          <button type="button" className="btn-cancel" onClick={onCancel}>
            {cancelText}
          </button>
          <button 
            type="button" 
            className="btn-submit" 
            style={{ backgroundColor: 'var(--color-danger)', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.25)' }}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
