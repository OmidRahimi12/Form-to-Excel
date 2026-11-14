import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';
import { EmptyState, Loading, PageHeader } from '../../../components/shared';
import { appDatabase } from '../../../database/appDatabase';

interface Counts { forms: number; files: number; merged: number; notes: number; }
export function DocumentInformationPage() {
  const { t, i18n } = useTranslation(); const [counts, setCounts] = useState<Counts | null>(null); const [error, setError] = useState(false);
  useEffect(() => { let live = true; void Promise.all([appDatabase.forms.count(), appDatabase.files.count(), appDatabase.mergedFiles.count(), appDatabase.notes.count()]).then(([forms, files, merged, notes]) => { if (live) setCounts({ forms, files, merged, notes }); }).catch(() => { if (live) setError(true); }); return () => { live = false; }; }, []);
  return <section className="information-page redesign-page document-information-page"><PageHeader eyebrow={t('appName')} title={t('documentInformation')} description={t('documentInformationDescription')} />
    {error ? <EmptyState title={t('documentInfoError')} /> : !counts ? <Loading label={t('loadingDocumentInfo')} /> : <div className="document-info-grid">
      <Card className="document-info-card document-info-card--overview"><h2>{t('appName')}</h2><dl className="document-info-list"><div><dt>{t('storageMode')}</dt><dd>{t('localStorageOnly')}</dd></div><div><dt>{t('currentLanguage')}</dt><dd>{t(({ fa: 'languagePersian', ps: 'languagePashto', en: 'languageEnglish' } as Record<string, string>)[i18n.resolvedLanguage?.split('-')[0] ?? 'fa'] ?? 'languagePersian')}</dd></div><div><dt>{t('databaseVersion')}</dt><dd>{appDatabase.verno}</dd></div></dl></Card>
      <Card className="document-info-card document-info-card--records"><h2>{t('localRecords')}</h2><dl className="document-info-list document-info-list--stats"><div><dt>{t('forms')}</dt><dd>{counts.forms}</dd></div><div><dt>{t('files')}</dt><dd>{counts.files}</dd></div><div><dt>{t('mergedFiles')}</dt><dd>{counts.merged}</dd></div><div><dt>{t('notes')}</dt><dd>{counts.notes}</dd></div></dl><p>{t('documentInfoStorageNote')}</p></Card>
    </div>}
  </section>;
}
