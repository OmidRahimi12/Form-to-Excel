import { Download, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../../components/ui';
import { usePwa } from '../providers/PwaProvider';

export function PwaInstallCard() {
  const { t } = useTranslation();
  const pwa = usePwa();

  return <Card className="pwa-install-card">
    <div className="pwa-install-card__icon"><Smartphone size={21} aria-hidden="true" /></div>
    <div className="pwa-install-card__content">
      <h2>{t('pwaInstallTitle')}</h2>
      <p>{t('pwaInstallDescription')}</p>
      {pwa.isInstalled
        ? <p className="pwa-install-card__status" role="status">{t('pwaInstalled')}</p>
        : pwa.canPromptInstall
          ? <Button onClick={() => void pwa.promptInstall()}><Download size={17} aria-hidden="true" /> {t('installApp')}</Button>
          : <p className="pwa-install-card__hint">{t(pwa.isIOS ? 'pwaInstallIosHint' : 'pwaInstallUnsupported')}</p>}
      {pwa.serviceWorkerError && <p className="pwa-install-card__error" role="alert">{t('pwaServiceWorkerError')}</p>}
    </div>
  </Card>;
}
