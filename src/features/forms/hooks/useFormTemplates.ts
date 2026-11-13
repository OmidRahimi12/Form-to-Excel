import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { getFormTemplate, listFormTemplates } from '../services/formTemplateService';
import type { FormTemplate } from '../types/template';
export function useFormTemplates() { return useDexieQuery<FormTemplate[]>(listFormTemplates, [], []); }
export function useFormTemplate(id?: number) { return useDexieQuery<FormTemplate | undefined>(() => id === undefined ? Promise.resolve(undefined) : getFormTemplate(id), [id], undefined); }
