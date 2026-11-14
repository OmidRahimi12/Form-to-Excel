import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/shared';
import { Card } from '../../../components/ui';
import { BackupActions } from '../components/BackupActions';
import { RestoreConfirmation } from '../components/RestoreConfirmation';
import { useBackupRestore } from '../hooks/useBackupRestore';
import { PwaInstallCard } from '../../pwa/components/PwaInstallCard';

export function BackupSettingsPage() {
  const { t } = useTranslation();
  const backup = useBackupRestore();
  return <section className="module-page backup-page redesign-page settings-page">
    <PageHeader eyebrow={t('appName')} title={t('settings')} />
    <Card className="backup-notice"><p>{t('backupLocalOnlyNotice')}</p></Card>
    <PwaInstallCard />
    <BackupActions busy={backup.busy} onCreate={backup.createAndDownloadBackup} onSelect={backup.inspectBackup} />
    {backup.statusKey && <p className="backup-status" role="status" aria-live="polite">{t(backup.statusKey)}</p>}
    <RestoreConfirmation backup={backup.pendingBackup} busy={backup.busy} onCancel={backup.cancelRestore} onConfirm={backup.confirmRestore} errorMessage={backup.pendingBackup && backup.statusKey.startsWith('backupError') ? t(backup.statusKey) : undefined} />
  </section>;
}
