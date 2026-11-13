import { formFieldKeys, type FormData, type FormFieldKey } from '../types/form';

export type FormValidationErrors = Partial<Record<FormFieldKey | 'form', string>>;

export function validateForm(data: FormData, visibleFields: FormFieldKey[] = [...formFieldKeys], requiredFields: FormFieldKey[] = []): FormValidationErrors {
  const errors: FormValidationErrors = {};
  for (const key of requiredFields) if (!data[key].trim()) errors[key] = 'formRequiredFieldError';
  const hasContent = visibleFields.some((key) => data[key].trim().length > 0);
  if (!hasContent && !Object.keys(errors).length) errors.form = 'formEmptyError';
  return errors;
}
