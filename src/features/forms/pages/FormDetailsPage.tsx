import { useState } from 'react';
import { Edit3, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { ConfirmationDialog, EmptyState, Loading, PageHeader } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { FormDetails } from '../components/FormDetails';
import { useFormQuery } from '../hooks/useFormQueries';
import { deleteForm } from '../services/formService';
import { parseRecordId } from '../utils/parseRecordId';

export function FormDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const id = parseRecordId(useParams().id);
  const { value: form, loading, error: loadError } = useFormQuery(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const notice = (location.state as { notice?: string } | null)?.notice;

  if (loading) return <div className="forms-status"><Loading label={t('loadingForm')} /></div>;
  if (loadError) return <div className="forms-status"><EmptyState title={t('formLoadError')} description={t('formsLoadErrorDescription')} /></div>;
  if (!form?.id) return <div className="forms-status"><EmptyState title={t('formNotFound')} description={t('formNotFoundDescription')} /></div>;

  const deleteCurrentForm = async () => {
    try {
      await deleteForm(form.id!);
      navigate(appRoutes.forms, { state: { notice: t('formDeleted') } });
    } catch {
      setDeleteError(true);
      setConfirmOpen(false);
    }
  };

  return <section className="form-details-page">
    <PageHeader eyebrow={t('forms')} title={form.subject || form.documentNumber || t('untitledForm')} actions={<>
      <Button variant="secondary" onClick={() => navigate(`${appRoutes.forms}/${form.id}/edit`)}><Edit3 size={17} aria-hidden="true" />{t('editForm')}</Button>
      <Button variant="danger" onClick={() => { setDeleteError(false); setConfirmOpen(true); }}><Trash2 size={17} aria-hidden="true" />{t('deleteForm')}</Button>
    </>} />
    {notice && <p className="form-feedback form-feedback--success" role="status">{notice}</p>}
    {deleteError && <p className="form-feedback form-feedback--error" role="alert">{t('formDeleteError')}</p>}
    <FormDetails form={form} />
    <ConfirmationDialog open={confirmOpen} title={t('deleteForm')} message={t('deleteFormMessage', { form: form.subject.trim() || form.documentNumber.trim() || t('untitledForm') })} confirmLabel={t('deleteForm')} onCancel={() => setConfirmOpen(false)} onConfirm={() => void deleteCurrentForm()} />
  </section>;
}
