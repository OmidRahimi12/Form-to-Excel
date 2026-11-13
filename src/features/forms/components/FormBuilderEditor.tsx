import { useState } from 'react';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Input } from '../../../components/ui';
import { FormField } from '../../../components/shared/FormField/FormField';
import { defaultTemplateFields, saveFormTemplate } from '../services/formTemplateService';
import type { FormFieldKey } from '../types/form';
import type { FormTemplate, FormTemplateField } from '../types/template';

export function FormBuilderEditor({ template, onSaved, onCancel }: { template?: FormTemplate; onSaved: () => void; onCancel: () => void }) {
  const { t } = useTranslation(); const [name, setName] = useState(template?.name ?? ''); const [fields, setFields] = useState<FormTemplateField[]>(template?.fields ?? defaultTemplateFields()); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const change = (key: FormFieldKey, patch: Partial<FormTemplateField>) => setFields((items) => items.map((item) => item.key === key ? { ...item, ...patch, required: patch.visible === false ? false : patch.required ?? item.required } : item));
  const move = (index: number, step: number) => setFields((items) => { const next = [...items]; const target = index + step; if (target < 0 || target >= next.length) return items; [next[index], next[target]] = [next[target], next[index]]; return next; });
  const submit = async (event: React.FormEvent) => { event.preventDefault(); if (busy) return; setBusy(true); setError(''); try { await saveFormTemplate(name, fields, template?.id); onSaved(); } catch { setError('formBuilderSaveError'); } finally { setBusy(false); } };
  return <form className="builder-editor" onSubmit={(event) => void submit(event)}>
    <FormField id="template-name" label={t('formTemplateName')}><Input id="template-name" value={name} maxLength={80} required onChange={(event) => setName(event.target.value)} /></FormField>
    {error && <p role="alert" className="form-feedback form-feedback--error">{t(error)}</p>}
    <ol className="builder-field-list">{fields.map((field, index) => <li key={field.key}>
      <Checkbox checked={field.visible} label={t(field.key)} onChange={(event) => change(field.key, { visible: event.target.checked })} />
      <Checkbox checked={field.required} disabled={!field.visible} label={t('requiredField')} onChange={(event) => change(field.key, { required: event.target.checked })} />
      <div><Button type="button" variant="ghost" aria-label={t('moveFieldUp')} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} aria-hidden="true" /></Button><Button type="button" variant="ghost" aria-label={t('moveFieldDown')} disabled={index === fields.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} aria-hidden="true" /></Button></div>
    </li>)}</ol>
    <div className="dialog-actions"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>{t('cancel')}</Button><Button type="submit" disabled={busy}>{t(busy ? 'saving' : 'saveTemplate')}</Button></div>
  </form>;
}
