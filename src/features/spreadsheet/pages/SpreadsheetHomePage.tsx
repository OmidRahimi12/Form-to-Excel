import { useTranslation } from 'react-i18next';
import { EmptyState, Loading, PageHeader } from '../../../components/shared';
import { useSpreadsheetHome } from '../hooks/useSpreadsheetHome';
import { SpreadsheetHomeActions } from '../components/SpreadsheetHomeActions';

export function SpreadsheetHomePage() {
  const { t } = useTranslation();
  const home = useSpreadsheetHome();
  return <section className="spreadsheet-home-page">
    <PageHeader eyebrow={t('appName')} title={t('spreadsheet')} description={t('spreadsheetDescription')} actions={<SpreadsheetHomeActions busy={home.busy} onCreate={() => void home.createWorkbook()} onImport={(file, kind) => void home.importWorkbook(file, kind)} />} />
    <p className="spreadsheet-limitations">{t('spreadsheetLimitations')}</p>
    {home.busy && <Loading label={t('spreadsheetLoading')} />}
    {home.errorKey && <EmptyState title={t(home.errorKey)} description={t('spreadsheetImportHelp')} />}
  </section>;
}
