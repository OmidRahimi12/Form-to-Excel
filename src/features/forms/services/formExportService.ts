import { saveExportedFile } from '../../files/services/fileService';
import { XLSX_MIME_TYPE } from '../../files/types/file';
import { listForms } from './formService';
import type { FormRecord, FormFieldKey } from '../types/form';

export const FORMS_EXPORT_FILE_NAME = 'forms_export.xlsx';

export const formExportColumns: ReadonlyArray<{ key: FormFieldKey; header: string }> = [
  { key: 'documentNumber', header: 'نمبر مکتوب' },
  { key: 'documentDate', header: 'تاریخ مکتوب' },
  { key: 'incomingNumber', header: 'نمبر وارده' },
  { key: 'incomingDate', header: 'تاریخ وارده' },
  { key: 'outgoingNumber', header: 'نمبر صادره' },
  { key: 'issueDate', header: 'تاریخ صدور' },
  { key: 'sender', header: 'مرسل' },
  { key: 'recipient', header: 'مرسل الیه' },
  { key: 'fileNumber', header: 'نمبر دوسیه' },
  { key: 'pageNumberInFile', header: 'نمبر صفحه در دوسیه' },
  { key: 'deliveredTo', header: 'تحویل داده شده به' },
  { key: 'subject', header: 'موضوع' },
  { key: 'notes', header: 'ملاحظات' },
];

export class FormExportError extends Error {
  constructor(readonly code: 'noForms') {
    super(code);
    this.name = 'FormExportError';
  }
}

/** Build a single RTL worksheet with one header row and one row per saved form. */
export async function buildFormsWorkbook(forms: readonly FormRecord[]): Promise<Blob> {
  if (!forms.length) throw new FormExportError('noForms');

  const XLSX = await import('xlsx');
  const workbook = XLSX.utils.book_new();
  workbook.Workbook = { Views: [{ RTL: true }] };
  const rows = [
    formExportColumns.map(({ header }) => header),
    ...forms.map((form) => formExportColumns.map(({ key }) => form[key] ?? '')),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  const bytes = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  return new Blob([bytes], { type: XLSX_MIME_TYPE });
}

/** Export all forms in service order and store the completed workbook in Files. */
export async function exportAllForms(): Promise<{ fileId: number; formCount: number }> {
  const forms = await listForms();
  if (!forms.length) throw new FormExportError('noForms');

  const workbook = await buildFormsWorkbook(forms);
  const fileId = await saveExportedFile(workbook, FORMS_EXPORT_FILE_NAME);
  return { fileId, formCount: forms.length };
}
