import { useId } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onValueChange: (value: string) => void;
  ariaLabel: string;
}

export function Tabs({ items, value, onValueChange, ariaLabel }: TabsProps) {
  const id = useId();
  const selectedItem = items.find((item) => item.id === value) ?? items[0];
  if (!selectedItem) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const rtl = document.documentElement.dir === 'rtl';
    const movesForward = (event.key === 'ArrowRight') !== rtl;
    const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : (currentIndex + (movesForward ? 1 : -1) + items.length) % items.length;
    const nextItem = items[nextIndex];
    onValueChange(nextItem.id);
    document.getElementById(`${id}-${nextItem.id}`)?.focus();
  };

  return <div className="tabs">
    <div className="tabs__list" role="tablist" aria-label={ariaLabel}>
      {items.map((item, index) => <button key={item.id} id={`${id}-${item.id}`} className="tabs__tab" type="button" role="tab" aria-selected={item.id === selectedItem.id} aria-controls={`${id}-panel`} tabIndex={item.id === selectedItem.id ? 0 : -1} onClick={() => onValueChange(item.id)} onKeyDown={(event) => handleKeyDown(event, index)}>{item.label}</button>)}
    </div>
    <div className="tabs__panel" id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-${selectedItem.id}`} tabIndex={0}>{selectedItem.content}</div>
  </div>;
}
