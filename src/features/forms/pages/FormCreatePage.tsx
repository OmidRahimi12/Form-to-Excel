import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loading, PageHeader } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { FormEditor } from '../components/FormEditor';
import { createForm } from '../services/formService';
import type { FormData } from '../types/form';
import { useFormTemplate } from '../hooks/useFormTemplates';
import { parseRecordId } from '../utils/parseRecordId';

export function FormCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  const [params] = useSearchParams();
  const templateId = parseRecordId(params.get('template') ?? undefined);
  const { value: template, loading } = useFormTemplate(templateId);
  const save = async (values: FormData) => {
    setError(false);
    try {
      const id = await createForm(values, template?.id);
      navigate(`${appRoutes.forms}/${id}`, { state: { notice: t('formCreated') } });
    } catch {
      setError(true);
    }
  };
  if (loading) return <Loading label={t('loadingTemplates')} />;
  return <section className="form-editor-page">
    <PageHeader eyebrow={t('forms')} title={t('createForm')} description={t('createFormDescription')} />
    <FormEditor fieldConfiguration={template?.fields} submitLabel={t('saveForm')} onCancel={() => navigate(appRoutes.forms)} onSave={save} externalError={error ? t('formSaveError') : undefined} />
  </section>;
}
