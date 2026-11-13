import type { FormFieldKey } from './form';

export interface FormTemplateField { key: FormFieldKey; visible: boolean; required: boolean; }
export interface FormTemplate {
  id?: number;
  name: string;
  fields: FormTemplateField[];
  createdAt: number;
  updatedAt: number;
}
