import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/shared';
import { Button, Input, Modal } from '../../../components/ui';

interface CreateMergedFileDialogProps {
  open: boolean;
  busy: boolean;
  errorKey?: string;
  onClose: () => void;
  onSubmit: (fileName: string) => Promise<boolean>;
}

export function CreateMergedFileDialog({ open, busy, errorKey, onClose, onSubmit }: CreateMergedFileDialogProps) {
  const { t } = useTranslation();
  const [fileName, setFileName] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (await onSubmit(fileName)) {
      setFileName('');
      onClose();
    }
  };
  const close = () => { if (!busy) { setFileName(''); onClose(); } };

  return <Modal open={open} title={t('createMergedWorkbook')} onClose={close}>
    <form className="merge-dialog-form" onSubmit={(event) => void submit(event)}>
      <FormField id="merged-file-name" label={t('mergedFileName')} required hint={t('mergedFileNameHint')}>
        <Input value={fileName} onChange={(event) => setFileName(event.target.value)} maxLength={240} autoComplete="off" required />
      </FormField>
      {errorKey && <p className="file-feedback file-feedback--error" role="alert">{t(errorKey)}</p>}
      <footer className="dialog-actions">
        <Button type="button" variant="secondary" onClick={close} disabled={busy}>{t('cancel')}</Button>
        <Button type="submit" disabled={busy || !fileName.trim()}>{busy ? t('mergingFiles') : t('createMergedWorkbook')}</Button>
      </footer>
    </form>
  </Modal>;
}
