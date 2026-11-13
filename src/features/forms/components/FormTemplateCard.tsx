import { Edit3, Play, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Card } from '../../../components/ui';
import type { FormTemplate } from '../types/template';
export function FormTemplateCard({ template, onEdit, onUse, onDelete }: { template: FormTemplate; onEdit: () => void; onUse: () => void; onDelete: () => void }) {
 const { t } = useTranslation(); const active = template.fields.filter((item) => item.visible);
 return <Card className="template-card"><div><h2>{template.name}</h2><p>{t('templateFieldCount', { count: active.length })}</p><ul>{active.map((field) => <li key={field.key}>{t(field.key)}{field.required ? ` · ${t('requiredField')}` : ''}</li>)}</ul></div><div className="note-card__actions"><Button onClick={onUse}><Play size={16} aria-hidden="true" />{t('useTemplate')}</Button><Button variant="secondary" onClick={onEdit}><Edit3 size={16} aria-hidden="true" />{t('editTemplate')}</Button><Button variant="danger" onClick={onDelete}><Trash2 size={16} aria-hidden="true" />{t('deleteTemplate')}</Button></div></Card>;
}
