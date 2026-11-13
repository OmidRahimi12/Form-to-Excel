import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input, Textarea } from '../../../components/ui';
import { FormField } from '../../../components/shared/FormField/FormField';
import { emptyFormData, type FormData, type FormFieldKey } from '../types/form';
import { validateForm, type FormValidationErrors } from '../validation/validateForm';
import { formFields } from './formFields';
import type { FormTemplateField } from '../types/template';

interface FormEditorProps {
  initialValues?: FormData;
  submitLabel: string;
  onCancel: () => void;
  onSave: (values: FormData) => Promise<void>;
  externalError?: string;
  fieldConfiguration?: FormTemplateField[];
}

export function FormEditor({ initialValues = emptyFormData, submitLabel, onCancel, onSave, externalError, fieldConfiguration }: FormEditorProps) {
  const { t } = useTranslation();
  const [values, setValues] = useState<FormData>(() => ({ ...emptyFormData, ...initialValues }));
  const [errors, setErrors] = useState<FormValidationErrors>({});
  const [saving, setSaving] = useState(false);
  const [externalErrorDismissed, setExternalErrorDismissed] = useState(false);
  const submitting = useRef(false);

  useEffect(() => setExternalErrorDismissed(false), [externalError]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting.current) return;
    const visible = fieldConfiguration?.filter((field) => field.visible).map((field) => field.key);
    const required = fieldConfiguration?.filter((field) => field.visible && field.required).map((field) => field.key) ?? [];
    const validationErrors = validateForm(values, visible, required);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) return;
    submitting.current = true;
    setSaving(true);
    try {
      await onSave(values);
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  };

  const updateValue = (key: FormFieldKey, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setExternalErrorDismissed(true);
    setErrors((current) => current.form ? {} : current);
  };

  const configuredFields = fieldConfiguration
    ? fieldConfiguration.filter((field) => field.visible).flatMap((field) => formFields.filter((definition) => definition.key === field.key))
    : formFields;

  return <form className="form-editor" onSubmit={(event) => void handleSubmit(event)} noValidate>
    {((externalError && !externalErrorDismissed) || errors.form) && <p className="form-feedback form-feedback--error" role="alert">{externalError && !externalErrorDismissed ? externalError : t(errors.form!)}</p>}
    <div className="form-editor__grid">
      {configuredFields.map(({ key, type }) => <FormField key={key} id={`form-${key}`} label={t(key)} required={fieldConfiguration?.some((field) => field.key === key && field.required)} error={errors[key] ? t(errors[key]!) : undefined}>
        {type === 'textarea'
          ? <Textarea value={values[key]} onChange={(event) => updateValue(key, event.target.value)} rows={4} />
          : <Input type={type} value={values[key]} onChange={(event) => updateValue(key, event.target.value)} />}
      </FormField>)}
    </div>
    <footer className="form-editor__actions">
      <Button type="button" variant="secondary" onClick={onCancel} disabled={saving}>{t('cancel')}</Button>
      <Button type="submit" disabled={saving}>{saving ? t('saving') : submitLabel}</Button>
    </footer>
  </form>;
}
