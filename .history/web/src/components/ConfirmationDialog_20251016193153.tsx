"use client";

import { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, X, Trash2, Edit, Save } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info' | 'success';
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  type = 'warning',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
}: ConfirmationDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      // Handle error if needed
      console.error('Confirmation action failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return <AlertTriangle className="text-red-400" size={24} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-400" size={24} />;
      case 'success':
        return <CheckCircle className="text-green-400" size={24} />;
      case 'info':
      default:
        return <Info className="text-blue-400" size={24} />;
    }
  };

  const getButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800';
      case 'success':
        return 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={isProcessing || isLoading ? undefined : onClose}
      />
      
      {/* Dialog */}
      <div className="relative w-full max-w-md bg-gray-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            {getIcon()}
            <h2 className="text-xl font-bold text-white">{title}</h2>
          </div>
          {!isProcessing && !isLoading && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <X className="text-gray-400" size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button
            onClick={onClose}
            disabled={isProcessing || isLoading}
            className="flex-1 py-3 px-6 bg-white/10 hover:bg-white/20 disabled:bg-white/5 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing || isLoading}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all ${getButtonStyle()}`}
          >
            {isProcessing || isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for managing confirmation dialogs
export function useConfirmationDialog() {
  const [dialog, setDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    confirmText?: string;
    cancelText?: string;
    onConfirm?: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
  });

  const showConfirmation = (config: Omit<typeof dialog, 'isOpen'>) => {
    setDialog({
      isOpen: true,
      ...config,
    });
  };

  const hideConfirmation = () => {
    setDialog(prev => ({ ...prev, isOpen: false }));
  };

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      type: 'danger',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm,
    });
  };

  const confirmEdit = (itemName: string, onConfirm: () => void | Promise<void>) => {
    showConfirmation({
      title: 'Save Changes',
      message: `Are you sure you want to save changes to "${itemName}"?`,
      type: 'info',
      confirmText: 'Save Changes',
      cancelText: 'Cancel',
      onConfirm,
    });
  };

  const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void | Promise<void>,
    options?: {
      type?: 'danger' | 'warning' | 'info' | 'success';
      confirmText?: string;
      cancelText?: string;
    }
  ) => {
    showConfirmation({
      title,
      message,
      onConfirm,
      ...options,
    });
  };

  const ConfirmationDialogComponent = () => (
    <ConfirmationDialog
      isOpen={dialog.isOpen}
      onClose={hideConfirmation}
      onConfirm={dialog.onConfirm || (() => {})}
      title={dialog.title}
      message={dialog.message}
      type={dialog.type}
      confirmText={dialog.confirmText}
      cancelText={dialog.cancelText}
    />
  );

  return {
    showConfirmation,
    hideConfirmation,
    confirmDelete,
    confirmEdit,
    confirmAction,
    ConfirmationDialog: ConfirmationDialogComponent,
  };
}
