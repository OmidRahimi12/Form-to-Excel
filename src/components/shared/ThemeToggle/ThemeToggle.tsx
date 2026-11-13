import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../app/providers/ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const nextThemeLabel = theme === 'light' ? t('switchToDarkTheme') : t('switchToLightTheme');
  const Icon = theme === 'light' ? Moon : Sun;
  return <button type="button" className="icon-button" onClick={toggleTheme} aria-label={nextThemeLabel} title={nextThemeLabel}><Icon size={19} aria-hidden="true" /></button>;
}
