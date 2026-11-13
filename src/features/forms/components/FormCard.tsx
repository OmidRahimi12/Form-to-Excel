import { Edit3, Eye, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button, Card } from '../../../components/ui';
import { appRoutes } from '../../../app/navigation';
import type { FormRecord } from '../types/form';

interface FormCardProps {
  form: FormRecord;
  onDelete: (form: FormRecord) => void;
}

export function FormCard({ form, onDelete }: FormCardProps) {
  const { t, i18n } = useTranslation();
  const id = form.id!;
  const modified = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(form.updatedAt);
  return <Card className="saved-form-card">
    <div className="saved-form-card__content">
      <h2 className="saved-form-card__title">{form.subject.trim() || form.documentNumber.trim() || t('untitledForm')}</h2>
      <dl className="saved-form-card__metadata">
        <div><dt>{t('documentNumber')}</dt><dd>{form.documentNumber.trim() || '—'}</dd></div>
        <div><dt>{t('sender')}</dt><dd>{form.sender.trim() || '—'}</dd></div>
        <div><dt>{t('updatedAt')}</dt><dd><time dateTime={new Date(form.updatedAt).toISOString()}>{modified}</time></dd></div>
      </dl>
    </div>
    <div className="saved-form-card__actions">
      <Link className="button button--secondary" to={`${appRoutes.forms}/${id}`} aria-label={`${t('viewForm')}: ${form.subject || form.documentNumber || t('untitledForm')}`}><Eye size={17} aria-hidden="true" /><span>{t('viewForm')}</span></Link>
      <Link className="button button--ghost" to={`${appRoutes.forms}/${id}/edit`} aria-label={`${t('editForm')}: ${form.subject || form.documentNumber || t('untitledForm')}`}><Edit3 size={17} aria-hidden="true" /><span>{t('editForm')}</span></Link>
      <Button variant="danger" onClick={() => onDelete(form)} aria-label={`${t('deleteForm')}: ${form.subject || form.documentNumber || t('untitledForm')}`}><Trash2 size={17} aria-hidden="true" /><span>{t('deleteForm')}</span></Button>
    </div>
  </Card>;
}
