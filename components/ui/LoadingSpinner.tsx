'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

export default function LoadingSpinner({ size = 'md', message }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-3',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`retro-spinner ${sizeClasses[size]}`} />
      {message && (
        <p className="text-neon-cyan font-vt323 text-lg animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}
