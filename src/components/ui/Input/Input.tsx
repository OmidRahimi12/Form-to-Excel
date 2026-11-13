import type { InputHTMLAttributes, Ref } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  inputRef?: Ref<HTMLInputElement>;
}

export function Input({ inputRef, ...props }: InputProps) {
  return <input ref={inputRef} className={`field ${props.className ?? ''}`} {...props} />;
}
