import { useTranslation } from 'react-i18next';
import { EmptyState, Loading } from '../../../components/shared';
import { Button } from '../../../components/ui';
import { FormCard } from './FormCard';
import type { FormRecord } from '../types/form';

interface FormsListProps {
  forms: FormRecord[];
  loading: boolean;
  error: boolean;
  hasSearch: boolean;
  onCreate: () => void;
  onDelete: (form: FormRecord) => void;
}

export function FormsList({ forms, loading, error, hasSearch, onCreate, onDelete }: FormsListProps) {
  const { t } = useTranslation();
  if (loading) return <div className="forms-status"><Loading label={t('loadingForms')} /></div>;
  if (error) return <div className="forms-status"><EmptyState title={t('formsLoadError')} description={t('formsLoadErrorDescription')} /></div>;
  if (!forms.length) return <div className="forms-status"><EmptyState title={t(hasSearch ? 'noFormsMatch' : 'noForms')} description={t(hasSearch ? 'noFormsMatchDescription' : 'noFormsDescription')} action={!hasSearch && <Button onClick={onCreate}>{t('createForm')}</Button>} /></div>;
  return <ul className="saved-form-list">{forms.map((form) => <li key={form.id}><FormCard form={form} onDelete={onDelete} /></li>)}</ul>;
}
