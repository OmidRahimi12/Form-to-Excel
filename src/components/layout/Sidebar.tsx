import { NavigationMenu } from './NavigationMenu';
import { useTranslation } from 'react-i18next';

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate: () => void }) {
  const { t } = useTranslation();
  return <><aside className={`sidebar${open ? ' sidebar--open' : ''}`}><div className="sidebar__brand"><span className="brand-mark">ف</span><span>{t('appName')}</span></div><NavigationMenu onNavigate={onNavigate} /></aside>{open && <button className="sidebar-scrim" aria-label={t('closeNavigation')} onClick={onNavigate} />}</>;
}
