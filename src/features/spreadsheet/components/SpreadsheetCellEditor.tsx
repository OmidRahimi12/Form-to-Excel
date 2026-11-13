import type { FormEvent, KeyboardEvent, Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/shared';
import { Button, Input } from '../../../components/ui';

interface SpreadsheetCellEditorProps {
  address: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  onCommit: (value: string) => void;
  onCancel: () => void;
  inputRef: Ref<HTMLInputElement>;
}

export function SpreadsheetCellEditor({ address, value, disabled, onChange, onCommit, onCancel, inputRef }: SpreadsheetCellEditorProps) {
  const { t } = useTranslation();
  const submit = (event: FormEvent) => { event.preventDefault(); onCommit(value); };
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Escape') { event.preventDefault(); onCancel(); }
  };
  return <form className="spreadsheet-cell-editor" onSubmit={submit}>
    <FormField id="spreadsheet-cell-value" label={`${t('cellValue')} (${address})`}><Input id="spreadsheet-cell-value" inputRef={inputRef} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} onKeyDown={handleKeyDown} /></FormField>
    <div className="spreadsheet-cell-editor__actions"><Button type="submit" disabled={disabled}>{t('applyCellValue')}</Button><Button variant="secondary" disabled={disabled} onClick={onCancel}>{t('cancelCellEdit')}</Button></div>
  </form>;
}
