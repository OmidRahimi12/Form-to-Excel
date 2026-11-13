import { Button, Modal } from '../../ui';
import { useTranslation } from 'react-i18next';

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  busy?: boolean;
  errorMessage?: string;
}

export function ConfirmationDialog({ open, title, message, confirmLabel, onCancel, onConfirm, busy = false, errorMessage }: ConfirmationDialogProps) {
  const { t } = useTranslation();
  return <Modal open={open} title={title} onClose={onCancel} dismissible={!busy}>
    <p className="dialog-copy">{message}</p>
    {errorMessage && <p className="dialog-error" role="alert">{errorMessage}</p>}
    <footer className="dialog-actions"><Button variant="secondary" onClick={onCancel} disabled={busy}>{t('cancel')}</Button><Button onClick={onConfirm} disabled={busy}>{confirmLabel}</Button></footer>
  </Modal>;
}
