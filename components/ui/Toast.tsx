'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (type: Toast['type'], message: string) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, type, message }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            retro-toast p-4 rounded-lg flex items-center justify-between gap-4
            animate-[slideIn_0.3s_ease-out]
            ${toast.type === 'success' ? 'retro-toast-success' : ''}
            ${toast.type === 'error' ? 'retro-toast-error' : ''}
            ${toast.type === 'info' ? 'border-neon-purple' : ''}
          `}
          onClick={() => onRemove(toast.id)}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && (
              <span className="text-neon-cyan text-xl">✓</span>
            )}
            {toast.type === 'error' && (
              <span className="text-neon-pink text-xl">✗</span>
            )}
            {toast.type === 'info' && (
              <span className="text-neon-purple text-xl">ℹ</span>
            )}
            <span className="font-vt323 text-lg">{toast.message}</span>
          </div>
          <button className="text-gray-400 hover:text-white">×</button>
        </div>
      ))}
    </div>
  );
}

// Add keyframe animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `;
  document.head.appendChild(style);
}
