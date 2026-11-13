export const formFieldKeys = [
  'documentNumber',
  'documentDate',
  'incomingNumber',
  'incomingDate',
  'outgoingNumber',
  'issueDate',
  'sender',
  'recipient',
  'fileNumber',
  'pageNumberInFile',
  'deliveredTo',
  'subject',
  'notes',
] as const;

export type FormFieldKey = (typeof formFieldKeys)[number];
export type FormData = Record<FormFieldKey, string>;

export interface FormRecord extends FormData {
  id?: number;
  templateId?: number;
  createdAt: number;
  updatedAt: number;
}

export const emptyFormData: FormData = {
  documentNumber: '',
  documentDate: '',
  incomingNumber: '',
  incomingDate: '',
  outgoingNumber: '',
  issueDate: '',
  sender: '',
  recipient: '',
  fileNumber: '',
  pageNumberInFile: '',
  deliveredTo: '',
  subject: '',
  notes: '',
};
