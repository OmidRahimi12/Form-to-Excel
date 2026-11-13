import { useTranslation } from 'react-i18next';
import { EmptyState, PageHeader } from '../shared';

export function ModulePage({ titleKey }: { titleKey: string }) {
  const { t } = useTranslation();
  return <section className="module-page"><PageHeader eyebrow={t('appName')} title={t(titleKey)} /><div className="module-page__content"><EmptyState title={t('phasePlaceholder')} description={t('phasePlaceholderDescription')} /></div></section>;
}
