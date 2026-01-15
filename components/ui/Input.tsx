'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-neon-cyan font-orbitron text-sm uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neon-cyan">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              retro-input w-full rounded-lg
              ${icon ? 'pl-12' : ''}
              ${error ? 'border-neon-pink' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-2 text-neon-pink text-sm font-vt323">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
