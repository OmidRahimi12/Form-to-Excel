import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}

export function Badge({ variant = 'neutral', className = '', ...props }: BadgeProps) {
  return <span className={`badge${variant === 'neutral' ? '' : ` badge--${variant}`} ${className}`} {...props} />;
}
