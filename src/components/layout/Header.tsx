import { useTranslation } from 'react-i18next';
import { Select } from '../ui';
import { ThemeToggle } from '../shared';

const languages = [{ code: 'fa', label: 'فارسی' }, { code: 'ps', label: 'پښتو' }, { code: 'en', label: 'English' }];

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const { t, i18n } = useTranslation();
  return <header className="topbar">
    <button className="menu-toggle" onClick={onMenuClick} aria-label={t('openMenu')}>☰</button>
    <div className="topbar__title"><span className="brand-mark">ف</span><span>{t('appName')}</span></div>
    <div className="topbar__actions">
      <ThemeToggle />
      <Select aria-label={t('language')} value={i18n.resolvedLanguage ?? 'fa'} onChange={(event) => void i18n.changeLanguage(event.target.value)}>
        {languages.map(({ code, label }) => <option key={code} value={code}>{label}</option>)}
      </Select>
    </div>
  </header>;
}
