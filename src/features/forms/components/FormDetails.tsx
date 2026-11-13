import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';
import { formFields } from './formFields';
import type { FormRecord } from '../types/form';

export function FormDetails({ form }: { form: FormRecord }) {
  const { t, i18n } = useTranslation();
  const timestampFormat = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' });
  return <Card className="form-details">
    <dl className="form-details__grid">
      {formFields.map(({ key }) => <div className="form-details__item" key={key}>
        <dt>{t(key)}</dt><dd>{form[key].trim() || '—'}</dd>
      </div>)}
      <div className="form-details__item"><dt>{t('createdAt')}</dt><dd><time dateTime={new Date(form.createdAt).toISOString()}>{timestampFormat.format(form.createdAt)}</time></dd></div>
      <div className="form-details__item"><dt>{t('updatedAt')}</dt><dd><time dateTime={new Date(form.updatedAt).toISOString()}>{timestampFormat.format(form.updatedAt)}</time></dd></div>
    </dl>
  </Card>;
}
