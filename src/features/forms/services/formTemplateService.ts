import { appDatabase } from '../../../database/appDatabase';
import { formFieldKeys, type FormFieldKey } from '../types/form';
import type { FormTemplateField } from '../types/template';
import type { AppDatabase } from '../../../database/appDatabase';

export const listFormTemplates = (database: AppDatabase = appDatabase) => database.formTemplates.orderBy('updatedAt').reverse().toArray();
export const getFormTemplate = (id: number, database: AppDatabase = appDatabase) => database.formTemplates.get(id);
export async function saveFormTemplate(name: string, fields: FormTemplateField[], id?: number, database: AppDatabase = appDatabase): Promise<number> {
  const trimmed = name.trim();
  if (!trimmed || trimmed.length > 80) throw new Error('TEMPLATE_INVALID');
  if (!fields.length || fields.some(({ key }) => !formFieldKeys.includes(key))) throw new Error('TEMPLATE_INVALID');
  const deduped = [...new Map(fields.map((field) => [field.key, { ...field, visible: Boolean(field.visible), required: Boolean(field.required) && Boolean(field.visible) }])).values()];
  if (!deduped.some((field) => field.visible)) throw new Error('TEMPLATE_NO_FIELDS');
  const now = Date.now();
  if (id === undefined) return database.formTemplates.add({ name: trimmed, fields: deduped, createdAt: now, updatedAt: now });
  return database.transaction('rw', database.formTemplates, async () => {
    const existing = await database.formTemplates.get(id); if (!existing) throw new Error('TEMPLATE_NOT_FOUND');
    await database.formTemplates.put({ ...existing, name: trimmed, fields: deduped, updatedAt: Math.max(now, existing.updatedAt + 1) }); return id;
  });
}
export const deleteFormTemplate = (id: number, database: AppDatabase = appDatabase) => database.formTemplates.delete(id);
export function defaultTemplateFields(): FormTemplateField[] { return formFieldKeys.map((key: FormFieldKey) => ({ key, visible: true, required: false })); }
