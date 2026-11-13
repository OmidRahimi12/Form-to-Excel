import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Modal } from '../../../components/ui';
import { ConfirmationDialog, EmptyState, Loading, PageHeader } from '../../../components/shared';
import { appRoutes } from '../../../app/navigation';
import { useFormTemplates } from '../hooks/useFormTemplates';
import { deleteFormTemplate } from '../services/formTemplateService';
import { FormBuilderEditor } from '../components/FormBuilderEditor';
import { FormTemplateCard } from '../components/FormTemplateCard';
import type { FormTemplate } from '../types/template';
export function FormBuilderPage() {
 const { t } = useTranslation(); const navigate = useNavigate(); const { value, loading, error } = useFormTemplates(); const [editing, setEditing] = useState<FormTemplate | 'new' | null>(null); const [deleting, setDeleting] = useState<FormTemplate | null>(null);
 return <section className="builder-page"><PageHeader eyebrow={t('forms')} title={t('formBuilder')} description={t('formBuilderDescription')} actions={<Button onClick={() => setEditing('new')}><Plus size={18} aria-hidden="true" />{t('createTemplate')}</Button>} />
 {loading ? <Loading label={t('loadingTemplates')} /> : error ? <EmptyState title={t('templatesLoadError')} /> : value.length ? <div className="template-list">{value.map((template) => <FormTemplateCard key={template.id} template={template} onEdit={() => setEditing(template)} onUse={() => navigate(`${appRoutes.forms}/new?template=${template.id}`)} onDelete={() => setDeleting(template)} />)}</div> : <EmptyState title={t('noTemplates')} description={t('noTemplatesDescription')} action={<Button onClick={() => setEditing('new')}>{t('createTemplate')}</Button>} />}
 <Modal open={editing !== null} title={t(editing === 'new' ? 'createTemplate' : 'editTemplate')} onClose={() => setEditing(null)}>{editing !== null && <FormBuilderEditor template={editing === 'new' ? undefined : editing} onCancel={() => setEditing(null)} onSaved={() => setEditing(null)} />}</Modal>
 <ConfirmationDialog open={Boolean(deleting)} title={t('deleteTemplate')} message={t('deleteTemplateMessage')} confirmLabel={t('deleteTemplate')} onCancel={() => setDeleting(null)} onConfirm={() => { if (deleting?.id) void deleteFormTemplate(deleting.id).then(() => setDeleting(null)); }} />
 </section>;
}
