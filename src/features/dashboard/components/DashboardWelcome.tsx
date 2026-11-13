import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';

export function DashboardWelcome() {
  const { t } = useTranslation();
  return <Card className="welcome-card">
    <div className="welcome-card__icon"><FileSpreadsheet size={24} aria-hidden="true" /></div>
    <div className="welcome-card__content">
      <h2>{t('welcomeTitle')}</h2>
      <p>{t('welcomeDescription')}</p>
    </div>
  </Card>;
}
