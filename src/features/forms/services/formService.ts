import { appDatabase } from '../../../database/appDatabase';
import { formFieldKeys, type FormData, type FormRecord } from '../types/form';
import type { AppDatabase } from '../../../database/appDatabase';

export async function listForms(database: AppDatabase = appDatabase): Promise<FormRecord[]> {
  return database.forms.orderBy('updatedAt').reverse().toArray();
}

export async function getForm(id: number, database: AppDatabase = appDatabase): Promise<FormRecord | undefined> {
  return database.forms.get(id);
}

export async function createForm(data: FormData, templateId?: number, database: AppDatabase = appDatabase): Promise<number> {
  const timestamp = Date.now();
  return database.forms.add({ ...data, ...(templateId === undefined ? {} : { templateId }), createdAt: timestamp, updatedAt: timestamp });
}

export async function updateForm(id: number, data: FormData, expectedUpdatedAt?: number, database: AppDatabase = appDatabase): Promise<void> {
  await database.transaction('rw', database.forms, async () => {
    const existing = await database.forms.get(id);
    if (!existing) throw new Error('FORM_NOT_FOUND');
    if (expectedUpdatedAt !== undefined && existing.updatedAt !== expectedUpdatedAt) throw new Error('FORM_CONFLICT');
    await database.forms.update(id, { ...data, updatedAt: Math.max(Date.now(), existing.updatedAt + 1) });
  });
}

export async function deleteForm(id: number): Promise<void> {
  await appDatabase.forms.delete(id);
}

export function searchForms(forms: FormRecord[], rawQuery: string): FormRecord[] {
  const query = normalizeSearchText(rawQuery);
  if (!query) return forms;
  return forms.filter((form) => formFieldKeys.some((key) => normalizeSearchText(form[key]).includes(query)));
}

function normalizeSearchText(value: string): string {
  return value
    .normalize('NFKC')
    .trim()
    .toLocaleLowerCase()
    .replace(/[\u064B-\u065F\u0670\u0640]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}
