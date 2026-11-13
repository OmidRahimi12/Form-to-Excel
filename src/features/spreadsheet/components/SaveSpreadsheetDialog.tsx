import { useEffect, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/shared';
import { Button, Input, Modal } from '../../../components/ui';

interface SaveSpreadsheetDialogProps {
  open: boolean;
  defaultName: string;
  busy: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<boolean>;
  onSaved: () => void;
}

export function SaveSpreadsheetDialog({ open, defaultName, busy, onClose, onSave, onSaved }: SaveSpreadsheetDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState(defaultName);
  useEffect(() => { if (open) setName(defaultName); }, [defaultName, open]);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || busy) return;
    if (await onSave(name)) { onSaved(); }
  };
  const handleClose = () => { if (!busy) onClose(); };
  return <Modal open={open} title={t('saveSpreadsheetAs')} onClose={handleClose} dismissible={!busy}>
    <form onSubmit={(event) => void submit(event)}>
      <FormField id="spreadsheet-file-name" label={t('spreadsheetFileName')} required><Input id="spreadsheet-file-name" value={name} onChange={(event) => setName(event.target.value)} disabled={busy} autoFocus maxLength={235} /></FormField>
      <p className="spreadsheet-file-extension">{t('spreadsheetXlsxExtension')}</p>
      <footer className="dialog-actions"><Button type="submit" disabled={busy || !name.trim()}>{busy ? t('savingWorkbook') : t('saveAs')}</Button><Button variant="secondary" disabled={busy} onClick={handleClose}>{t('cancel')}</Button></footer>
    </form>
  </Modal>;
}
