'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, disabled, children, ...props }, ref) => {
    const baseClasses = 'retro-btn rounded-lg font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2';
    
    const variantClasses = {
      primary: 'retro-btn-primary',
      secondary: 'retro-btn-secondary',
      danger: 'bg-gradient-to-r from-red-600 to-neon-pink text-white border-2 border-red-500 hover:shadow-[0_0_20px_rgba(255,45,149,0.5)]',
      ghost: 'bg-transparent text-neon-cyan hover:bg-neon-cyan/10',
    };
    
    const sizeClasses = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <div className="retro-spinner w-5 h-5 border-2" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
