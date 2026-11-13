import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { EmptyState, Loading, PageHeader } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { useFormQuery } from '../hooks/useFormQueries';
import { FormEditor } from '../components/FormEditor';
import { updateForm } from '../services/formService';
import type { FormData } from '../types/form';
import { parseRecordId } from '../utils/parseRecordId';
import { useFormTemplate } from '../hooks/useFormTemplates';

export function FormEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = parseRecordId(useParams().id);
  const { value: form, loading, error: loadError } = useFormQuery(id);
  const [saveError, setSaveError] = useState<string | null>(null);
  const { value: template, loading: templateLoading } = useFormTemplate(form?.templateId);

  if (loading || templateLoading) return <div className="forms-status"><Loading label={t('loadingForm')} /></div>;
  if (loadError) return <div className="forms-status"><EmptyState title={t('formLoadError')} description={t('formsLoadErrorDescription')} /></div>;
  if (!form?.id) return <div className="forms-status"><EmptyState title={t('formNotFound')} description={t('formNotFoundDescription')} /></div>;

  const save = async (values: FormData) => {
    setSaveError(null);
    try {
      await updateForm(form.id!, values, form.updatedAt);
      navigate(`${appRoutes.forms}/${form.id}`, { state: { notice: t('formUpdated') } });
    } catch (error) {
      setSaveError(error instanceof Error && error.message === 'FORM_CONFLICT' ? 'formConflictError' : 'formSaveError');
    }
  };

  return <section className="form-editor-page">
    <PageHeader eyebrow={t('forms')} title={t('editForm')} description={form.subject || form.documentNumber || t('untitledForm')} />
    <FormEditor initialValues={form} fieldConfiguration={template?.fields} submitLabel={t('saveChanges')} onCancel={() => navigate(`${appRoutes.forms}/${form.id}`)} onSave={save} externalError={saveError ? t(saveError) : undefined} />
  </section>;
}

