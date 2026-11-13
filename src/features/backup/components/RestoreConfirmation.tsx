import { useTranslation } from 'react-i18next';
import { ConfirmationDialog } from '../../../components/shared';
import type { ValidatedBackup } from '../types/backup';

interface RestoreConfirmationProps {
  backup: ValidatedBackup | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  errorMessage?: string;
}

export function RestoreConfirmation({ backup, busy, onCancel, onConfirm, errorMessage }: RestoreConfirmationProps) {
  const { t } = useTranslation();
  return <ConfirmationDialog open={backup !== null} title={t('restoreConfirmTitle')} message={backup ? t('restoreConfirmMessage', { forms: backup.forms.length, files: backup.files.length, mergedFiles: backup.mergedFiles.length, notes: backup.notes.length, templates: backup.formTemplates.length }) : ''} confirmLabel={t(busy ? 'backupWorking' : 'restoreBackup')} onCancel={onCancel} onConfirm={onConfirm} busy={busy} errorMessage={errorMessage} />;
}
