"use client";
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export function Button({ children, variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        'inline-flex items-center justify-center rounded-[18px] px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2',
        variant === 'primary' && 'bg-arogya-500 text-white shadow-lg hover:bg-arogya-600',
        variant === 'secondary' && 'bg-white border border-[rgba(15,38,23,0.06)] text-arogya-700',
        variant === 'ghost' && 'bg-transparent text-arogya-700',
        className
      )}
    >
      {children}
    </button>
  );
}
