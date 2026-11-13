import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { getForm, listForms } from '../services/formService';
import type { FormRecord } from '../types/form';

export function useFormsQuery() {
  return useDexieQuery<FormRecord[]>(listForms, [], []);
}

export function useFormQuery(id: number | undefined) {
  return useDexieQuery<FormRecord | undefined>(() => id === undefined ? Promise.resolve(undefined) : getForm(id), [id], undefined);
}
