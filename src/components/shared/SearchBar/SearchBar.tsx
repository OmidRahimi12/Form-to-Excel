import { Search } from 'lucide-react';
import { Input } from '../../ui';

interface SearchBarProps {
  placeholder: string;
  value?: string;
  onChange?: (value: string) => void;
}

export function SearchBar({ placeholder, value, onChange }: SearchBarProps) {
  return <label className="search-bar"><Search size={18} aria-hidden="true" /><Input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder={placeholder} aria-label={placeholder} /></label>;
}
