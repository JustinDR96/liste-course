import React, { createContext, useContext, useState, useCallback } from 'react';
import { Button } from './button';

interface DialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'default' | 'destructive';
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  alert: (title: string, message: string) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | null>(null);

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog doit être utilisé dans DialogProvider');
  return ctx;
}

interface PendingDialog extends DialogOptions {
  resolve: (value: boolean) => void;
  alertOnly?: boolean;
}

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);

  const confirm = useCallback((options: DialogOptions): Promise<boolean> => {
    return new Promise(resolve => {
      setPending({ ...options, resolve });
    });
  }, []);

  const alert = useCallback((title: string, message: string): Promise<void> => {
    return new Promise(resolve => {
      setPending({
        title,
        message,
        confirmLabel: 'OK',
        resolve: () => resolve(),
        alertOnly: true,
      });
    });
  }, []);

  function handleConfirm() {
    pending?.resolve(true);
    setPending(null);
  }

  function handleCancel() {
    pending?.resolve(false);
    setPending(null);
  }

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}
      {pending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-base font-semibold text-gray-800 mb-2">{pending.title}</h2>
            <p className="text-sm text-gray-500 mb-6">{pending.message}</p>
            <div className="flex justify-end gap-2">
              {!pending.alertOnly && (
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  {pending.cancelLabel ?? 'Annuler'}
                </Button>
              )}
              <Button
                size="sm"
                variant={pending.variant === 'destructive' ? 'destructive' : 'default'}
                onClick={handleConfirm}
              >
                {pending.confirmLabel ?? 'Confirmer'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}
