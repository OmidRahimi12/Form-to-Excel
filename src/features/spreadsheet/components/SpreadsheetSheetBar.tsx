import { useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/shared';
import { Button, Input, Modal } from '../../../components/ui';

interface SpreadsheetSheetBarProps {
  names: string[];
  activeName: string;
  onSelect: (name: string) => void;
  onAdd: (name: string) => Promise<boolean>;
  onRename: (name: string) => boolean;
  onDelete: () => void;
  onError: (key?: string) => void;
  disabled: boolean;
}

export function SpreadsheetSheetBar({ names, activeName, onSelect, onAdd, onRename, onDelete, onError, disabled }: SpreadsheetSheetBarProps) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'add' | 'rename' | null>(null);
  const [name, setName] = useState('');
  const open = (nextMode: 'add' | 'rename') => { onError(undefined); setMode(nextMode); setName(nextMode === 'rename' ? activeName : nextAvailableName(names)); };
  const submit = async () => {
    onError(undefined);
    const complete = mode === 'add' ? await onAdd(name) : onRename(name);
    if (complete) setMode(null);
  };

  return <div className="spreadsheet-sheet-bar">
    <div className="spreadsheet-sheet-tabs" role="tablist" aria-label={t('worksheets')}>
      {names.map((sheetName, index) => <button key={sheetName} type="button" role="tab" disabled={disabled} aria-selected={sheetName === activeName} tabIndex={sheetName === activeName ? 0 : -1} className={sheetName === activeName ? 'spreadsheet-sheet-tab is-active' : 'spreadsheet-sheet-tab'} onClick={() => onSelect(sheetName)} onKeyDown={(event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const tabs = Array.from(event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
        const movesForward = (event.key === 'ArrowRight') !== (document.documentElement.dir === 'rtl');
        const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (movesForward ? 1 : -1) + tabs.length) % tabs.length;
        onSelect(names[nextIndex]);
        tabs[nextIndex]?.focus();
      }}>{sheetName}</button>)}
    </div>
    <div className="spreadsheet-sheet-actions"><Button variant="ghost" aria-label={t('newWorksheet')} disabled={disabled} onClick={() => open('add')}><Plus size={17} aria-hidden="true" />{t('newWorksheet')}</Button><Button variant="ghost" aria-label={t('renameWorksheet')} disabled={disabled} onClick={() => open('rename')}><Pencil size={17} aria-hidden="true" />{t('renameWorksheet')}</Button><Button variant="danger" aria-label={t('deleteWorksheet')} disabled={disabled || names.length <= 1} onClick={onDelete}><Trash2 size={17} aria-hidden="true" />{t('deleteWorksheet')}</Button></div>
    <Modal open={Boolean(mode)} title={t(mode === 'add' ? 'newWorksheet' : 'renameWorksheet')} onClose={() => setMode(null)}>
      <FormField id="worksheet-name" label={t('worksheetName')} required><Input id="worksheet-name" autoFocus maxLength={31} value={name} onChange={(event) => setName(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') void submit(); }} /></FormField>
      <footer className="dialog-actions"><Button onClick={() => void submit()}>{t(mode === 'add' ? 'createWorksheet' : 'renameWorksheet')}</Button><Button variant="secondary" onClick={() => setMode(null)}>{t('cancel')}</Button></footer>
    </Modal>
  </div>;
}

function nextAvailableName(names: string[]): string {
  let index = 1;
  while (names.some((name) => name.toLocaleLowerCase() === `sheet${index}`)) index += 1;
  return `Sheet${index}`;
}
