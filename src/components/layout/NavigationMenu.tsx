import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { navigationLinks } from '../../app/navigation';

export function NavigationMenu({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const { t } = useTranslation();
  const visibleLinks = compact ? navigationLinks.slice(0, 5) : navigationLinks;
  return <nav className="navigation" aria-label={t('navigation')}>
    {visibleLinks.map(({ to, key, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'} onClick={onNavigate} className={({ isActive }) => `navigation__link${isActive ? ' is-active' : ''}`}>
      <Icon size={19} strokeWidth={1.8} /><span>{t(key)}</span>
    </NavLink>)}
  </nav>;
}
