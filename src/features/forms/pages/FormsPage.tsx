import { useMemo, useState } from 'react';
import { FileSpreadsheet, Plus, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { ConfirmationDialog, PageHeader, SearchBar } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { deleteForm, searchForms } from '../services/formService';
import { useFormsQuery } from '../hooks/useFormQueries';
import type { FormRecord } from '../types/form';
import { FormsList } from '../components/FormsList';
import { useFormExport } from '../hooks/useFormExport';

export function FormsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { value: forms, loading, error } = useFormsQuery();
  const formExport = useFormExport();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FormRecord | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(() => (location.state as { notice?: string } | null)?.notice);
  const visibleForms = useMemo(() => searchForms(forms, query), [forms, query]);

  const confirmDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteForm(selected.id);
      setSelected(null);
      setDeleteError(false);
      setNotice(t('formDeleted'));
    } catch {
      setDeleteError(true);
    }
  };

  return <section className="forms-page">
    <PageHeader eyebrow={t('appName')} title={t('forms')} description={t('formsDescription')} actions={<div className="forms-header-actions">
      <Button variant="secondary" onClick={() => navigate(appRoutes.formBuilder)}><SlidersHorizontal size={18} aria-hidden="true" />{t('formBuilder')}</Button>
      <Button variant="secondary" onClick={() => void formExport.exportForms()} disabled={formExport.busy || loading || error}>
        <FileSpreadsheet size={18} aria-hidden="true" />{t(formExport.busy ? 'exportingForms' : 'exportAllFormsToExcel')}
      </Button>
      <Button onClick={() => navigate(`${appRoutes.forms}/new`)}><Plus size={18} aria-hidden="true" />{t('createForm')}</Button>
    </div>} />
    {notice && <p className="form-feedback form-feedback--success" role="status">{notice}</p>}
    {formExport.feedback && <p className={`form-feedback form-feedback--${formExport.feedback.kind}`} role={formExport.feedback.kind === 'error' ? 'alert' : 'status'}>
      {t(formExport.feedback.key, formExport.feedback.kind === 'success' ? { count: formExport.feedback.count } : undefined)}
    </p>}
    <div className="forms-toolbar"><SearchBar placeholder={t('searchForms')} value={query} onChange={setQuery} />{query && <Button variant="ghost" onClick={() => setQuery('')}>{t('clearSearch')}</Button>}</div>
    <FormsList forms={visibleForms} loading={loading} error={error} hasSearch={Boolean(query.trim())} onCreate={() => navigate(`${appRoutes.forms}/new`)} onDelete={(form) => { setSelected(form); setDeleteError(false); }} />
    <ConfirmationDialog open={Boolean(selected)} title={t('deleteForm')} message={selected ? t('deleteFormMessage', { form: selected.subject.trim() || selected.documentNumber.trim() || t('untitledForm') }) : ''} confirmLabel={t('deleteForm')} onCancel={() => setSelected(null)} onConfirm={() => void confirmDelete()} />
    {deleteError && <p className="form-feedback form-feedback--error" role="alert">{t('formDeleteError')}</p>}
  </section>;
}
