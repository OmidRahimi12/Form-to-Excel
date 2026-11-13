import type { InputHTMLAttributes, ReactNode } from 'react';

interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode;
}

export function Radio({ label, className = '', ...props }: RadioProps) {
  return <label className="choice-control"><input type="radio" className={className} {...props} /><span>{label}</span></label>;
}
