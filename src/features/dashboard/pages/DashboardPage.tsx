import { useTranslation } from 'react-i18next';
import { PageHeader } from '../../../components/shared';
import { dashboardFeatureLinks, type NavigationKey } from '../../../app/navigation';
import { DashboardFeatureGrid, type DashboardFeature } from '../components/DashboardFeatureGrid';
import { DashboardWelcome } from '../components/DashboardWelcome';

const featureDescriptionKeys: Partial<Record<NavigationKey, string>> = {
  forms: 'dashboardFormsDescription',
  formBuilder: 'dashboardFormBuilderDescription',
  files: 'dashboardFilesDescription',
  spreadsheet: 'dashboardSpreadsheetDescription',
  mergedFiles: 'dashboardMergedFilesDescription',
  notes: 'dashboardNotesDescription',
};

export function DashboardPage() {
  const { t } = useTranslation();
  const features: DashboardFeature[] = dashboardFeatureLinks.map((item) => ({
    to: item.to,
    key: item.key,
    title: t(item.key),
    description: t(featureDescriptionKeys[item.key] ?? 'phasePlaceholderDescription'),
    icon: item.icon,
  }));

  return <section className="dashboard-page">
    <PageHeader eyebrow={t('appName')} title={t('dashboard')} />
    <DashboardWelcome />
    <DashboardFeatureGrid title={t('dashboardFeatures')} features={features} />
  </section>;
}
