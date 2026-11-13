import { useRef } from 'react';
import { FileUp, FileSpreadsheet, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import type { SpreadsheetImportKind } from '../types/spreadsheet';

interface SpreadsheetHomeActionsProps {
  busy: boolean;
  onCreate: () => void;
  onImport: (file: File, kind: SpreadsheetImportKind) => void;
}

export function SpreadsheetHomeActions({ busy, onCreate, onImport }: SpreadsheetHomeActionsProps) {
  const { t } = useTranslation();
  const xlsxInput = useRef<HTMLInputElement>(null);
  const csvInput = useRef<HTMLInputElement>(null);
  const handleFile = (kind: SpreadsheetImportKind, input: HTMLInputElement | null) => {
    const file = input?.files?.[0];
    if (file) onImport(file, kind);
    if (input) input.value = '';
  };

  return <div className="spreadsheet-home-actions">
    <input ref={xlsxInput} className="sr-only" type="file" aria-label={t('importXlsx')} accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={(event) => handleFile('xlsx', event.currentTarget)} />
    <input ref={csvInput} className="sr-only" type="file" aria-label={t('importCsv')} accept=".csv,text/csv" onChange={(event) => handleFile('csv', event.currentTarget)} />
    <Button disabled={busy} onClick={onCreate}><Plus size={18} aria-hidden="true" />{t('newWorkbook')}</Button>
    <Button variant="secondary" disabled={busy} onClick={() => xlsxInput.current?.click()}><FileSpreadsheet size={18} aria-hidden="true" />{t('importXlsx')}</Button>
    <Button variant="secondary" disabled={busy} onClick={() => csvInput.current?.click()}><FileUp size={18} aria-hidden="true" />{t('importCsv')}</Button>
  </div>;
}
