import { FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';
import { formatFileSize } from '../../files/utils/formatFileSize';
import type { MergedFileMetadata } from '../types/mergedFile';
import { MergedFileActions } from './MergedFileActions';

interface MergedFileCardProps {
  file: MergedFileMetadata;
  onDelete: (file: MergedFileMetadata) => void;
}

export function MergedFileCard({ file, onDelete }: MergedFileCardProps) {
  const { t, i18n } = useTranslation();
  const savedAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(file.createdAt);
  return <Card className="merged-file-card">
    <span className="local-file-card__icon"><FileSpreadsheet size={22} aria-hidden="true" /></span>
    <div className="merged-file-card__content">
      <h2 className="local-file-card__title" dir="auto">{file.fileName}</h2>
      <dl className="local-file-card__metadata">
        <div><dt>{t('fileType')}</dt><dd>{t('xlsxSpreadsheet')}</dd></div>
        <div><dt>{t('fileSize')}</dt><dd>{formatFileSize(file.size, i18n.resolvedLanguage ?? 'fa')}</dd></div>
        <div><dt>{t('fileCreated')}</dt><dd><time dateTime={new Date(file.createdAt).toISOString()}>{savedAt}</time></dd></div>
      </dl>
    </div>
    {file.id !== undefined && <MergedFileActions id={file.id} onDelete={() => onDelete(file)} />}
  </Card>;
}
