import { cloneElement, type ReactElement } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactElement;
  hint?: string;
  error?: string;
  required?: boolean;
}

export function FormField({ id, label, children, hint, error, required = false }: FormFieldProps) {
  const describedBy = [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(' ') || undefined;
  const control = cloneElement(children as ReactElement<{ id?: string; required?: boolean; 'aria-describedby'?: string; 'aria-invalid'?: boolean }>, {
    id,
    required,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : undefined,
  });
  return <div className="field-control">
    <label className="field-label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {control}
    {hint && <p className="field-hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="field-error" id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}
