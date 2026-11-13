import type { FormFieldKey } from '../types/form';

export interface FormFieldDefinition {
  key: FormFieldKey;
  type: 'text' | 'date' | 'textarea';
}

// Field order and labels follow the original workbook shipped inside the APK.
export const formFields: FormFieldDefinition[] = [
  { key: 'documentNumber', type: 'text' },
  { key: 'documentDate', type: 'date' },
  { key: 'incomingNumber', type: 'text' },
  { key: 'incomingDate', type: 'date' },
  { key: 'outgoingNumber', type: 'text' },
  { key: 'issueDate', type: 'date' },
  { key: 'sender', type: 'text' },
  { key: 'recipient', type: 'text' },
  { key: 'fileNumber', type: 'text' },
  { key: 'pageNumberInFile', type: 'text' },
  { key: 'deliveredTo', type: 'text' },
  { key: 'subject', type: 'text' },
  { key: 'notes', type: 'textarea' },
];
