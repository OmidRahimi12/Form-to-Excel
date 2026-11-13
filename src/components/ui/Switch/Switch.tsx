import type { ReactNode } from 'react';

interface SwitchProps {
  label: ReactNode;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ label, checked, onCheckedChange, disabled = false }: SwitchProps) {
  return <span className="switch-control"><span>{label}</span><button className="switch" type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onCheckedChange(!checked)}><span className="sr-only">{label}</span></button></span>;
}
