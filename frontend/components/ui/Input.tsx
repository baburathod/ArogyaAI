import type { InputHTMLAttributes } from 'react';
import clsx from 'clsx';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function Input({ label, className, ...props }: InputProps) {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      {label ? <label className="text-sm font-medium text-[#12351f]">{label}</label> : null}
      <input
        {...props}
        className="input rounded-[12px] border border-[rgba(15,38,23,0.06)] bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-arogya-200"
      />
    </div>
  );
}
