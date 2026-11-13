import { useTranslation } from 'react-i18next';
import { Card } from '../../../components/ui';
import type { StoredFileMetadata } from '../types/file';
import { formatFileSize } from '../utils/formatFileSize';
import { getFileFormatLabelKey } from '../utils/getFileFormatLabel';

export function FileDetailsCard({ file }: { file: StoredFileMetadata }) {
  const { t, i18n } = useTranslation();
  const createdAt = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'full', timeStyle: 'short' }).format(file.createdAt);
  return <Card className="file-details-card">
    <dl className="file-details-grid">
      <div><dt>{t('fileName')}</dt><dd dir="auto">{file.fileName}</dd></div>
      <div><dt>{t('fileType')}</dt><dd>{t(getFileFormatLabelKey(file.mimeType))}</dd></div>
      <div><dt>{t('fileSize')}</dt><dd>{formatFileSize(file.size, i18n.resolvedLanguage ?? 'fa')}</dd></div>
      <div><dt>{t('fileCreated')}</dt><dd><time dateTime={new Date(file.createdAt).toISOString()}>{createdAt}</time></dd></div>
    </dl>
  </Card>;
}
