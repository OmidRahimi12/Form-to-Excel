import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import { usePwa } from '../providers/PwaProvider';

export function PwaRuntimeNotice() {
  const { t } = useTranslation();
  const pwa = usePwa();

  return <>
    <span className="visually-hidden" role="status" aria-live="polite">{pwa.isOnline ? t('pwaOnlineStatus') : t('pwaOfflineStatus')}</span>
    {!pwa.isOnline && <aside className="pwa-notice pwa-notice--offline" role="status">
      <span>{t('pwaOfflineNotice')}</span>
    </aside>}
    {pwa.updateAvailable && !pwa.updateDismissed && <aside className="pwa-notice" role="status">
      <span>{pwa.updateError ? t('pwaUpdateError') : pwa.reloadAvailable ? t('pwaReloadReady') : pwa.updating ? t('pwaUpdating') : t('pwaUpdateAvailable')}</span>
      <div className="pwa-notice__actions">
        <Button variant="secondary" disabled={pwa.updating} onClick={pwa.dismissUpdate}>{t('pwaLater')}</Button>
        <Button disabled={pwa.updating || pwa.updateError} onClick={pwa.applyUpdate}>
          <RefreshCw size={16} aria-hidden="true" /> {t(pwa.reloadAvailable ? 'pwaReloadNow' : pwa.updating ? 'pwaUpdating' : 'pwaUpdateNow')}
        </Button>
      </div>
    </aside>}
  </>;
}
