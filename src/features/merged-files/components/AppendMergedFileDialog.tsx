import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { FormField } from '../../../components/shared';
import { Button, Modal, Select } from '../../../components/ui';
import type { MergedFileMetadata } from '../types/mergedFile';

interface AppendMergedFileDialogProps {
  open: boolean;
  busy: boolean;
  errorKey?: string;
  files: MergedFileMetadata[];
  onClose: () => void;
  onSubmit: (targetId: number) => Promise<boolean>;
}

export function AppendMergedFileDialog({ open, busy, errorKey, files, onClose, onSubmit }: AppendMergedFileDialogProps) {
  const { t } = useTranslation();
  const [targetId, setTargetId] = useState('');
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (targetId && await onSubmit(Number(targetId))) {
      setTargetId('');
      onClose();
    }
  };
  const close = () => { if (!busy) { setTargetId(''); onClose(); } };

  return <Modal open={open} title={t('appendToMergedWorkbook')} onClose={close}>
    <form className="merge-dialog-form" onSubmit={(event) => void submit(event)}>
      <FormField id="merged-file-target" label={t('chooseMergedWorkbook')} required>
        <Select value={targetId} onChange={(event) => setTargetId(event.target.value)} required>
          <option value="">{t('chooseMergedWorkbook')}</option>
          {files.map((file) => <option key={file.id} value={file.id}>{file.fileName}</option>)}
        </Select>
      </FormField>
      <p className="field-hint">{t('appendCompatibilityHint')}</p>
      {errorKey && <p className="file-feedback file-feedback--error" role="alert">{t(errorKey)}</p>}
      <footer className="dialog-actions">
        <Button type="button" variant="secondary" onClick={close} disabled={busy}>{t('cancel')}</Button>
        <Button type="submit" disabled={busy || !targetId}>{busy ? t('mergingFiles') : t('appendFile')}</Button>
      </footer>
    </form>
  </Modal>;
}
