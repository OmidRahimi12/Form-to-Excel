import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../../components/ui';

interface BackupActionsProps {
  busy: boolean;
  onCreate: () => void;
  onSelect: (file: File) => void;
}

export function BackupActions({ busy, onCreate, onSelect }: BackupActionsProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  return <Card className="backup-actions">
    <div><h2>{t('backupCreateTitle')}</h2><p>{t('backupCreateDescription')}</p><Button disabled={busy} onClick={onCreate}>{t(busy ? 'backupWorking' : 'createBackup')}</Button></div>
    <div><h2>{t('backupRestoreTitle')}</h2><p>{t('backupRestoreDescription')}</p><input ref={inputRef} className="visually-hidden" type="file" tabIndex={-1} aria-hidden="true" accept=".zip,application/zip" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onSelect(file); event.currentTarget.value = ''; }} /><Button variant="secondary" disabled={busy} aria-label={t('selectBackupFile')} onClick={() => inputRef.current?.click()}>{t('selectBackupFile')}</Button></div>
  </Card>;
}
