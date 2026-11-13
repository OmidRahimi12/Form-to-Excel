import { FileSpreadsheet, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { appRoutes } from '../../../app/navigation';
import { Button, Card, Checkbox } from '../../../components/ui';
import type { StoredFileMetadata } from '../types/file';
import { formatFileSize } from '../utils/formatFileSize';
import { getFileFormatLabelKey } from '../utils/getFileFormatLabel';
import { isMergeableFile } from '../../merged-files/utils/isMergeableFile';

interface FileCardProps {
  file: StoredFileMetadata;
  onDelete: (file: StoredFileMetadata) => void;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelection?: (file: StoredFileMetadata) => void;
}

export function FileCard({ file, onDelete, selectionMode = false, selected = false, onToggleSelection }: FileCardProps) {
  const { t, i18n } = useTranslation();
  const modified = new Intl.DateTimeFormat(i18n.resolvedLanguage, { dateStyle: 'medium', timeStyle: 'short' }).format(file.createdAt);
  const mergeable = isMergeableFile(file);
  return <Card className={`local-file-card${selected ? ' local-file-card--selected' : ''}`}>
    {selectionMode && <div className="local-file-card__selection">
      <Checkbox
        label={<>{t('selectForMerge')}: <bdi dir="auto">{file.fileName}</bdi></>}
        checked={selected}
        disabled={!mergeable}
        onChange={() => onToggleSelection?.(file)}
      />
      {!mergeable && <span className="local-file-card__selection-hint">{t('onlyXlsxCanMerge')}</span>}
    </div>}
    <span className="local-file-card__icon"><FileSpreadsheet size={22} aria-hidden="true" /></span>
    <div className="local-file-card__content">
      <h2 className="local-file-card__title" dir="auto">{file.fileName}</h2>
      <dl className="local-file-card__metadata">
        <div><dt>{t('fileType')}</dt><dd>{t(getFileFormatLabelKey(file.mimeType))}</dd></div>
        <div><dt>{t('fileSize')}</dt><dd>{formatFileSize(file.size, i18n.resolvedLanguage ?? 'fa')}</dd></div>
        <div><dt>{t('fileCreated')}</dt><dd><time dateTime={new Date(file.createdAt).toISOString()}>{modified}</time></dd></div>
      </dl>
    </div>
    <div className="local-file-card__actions">
      <Link className="button button--secondary" to={`${appRoutes.files}/${file.id}`} aria-label={`${t('viewFile')}: ${file.fileName}`}>{t('viewFile')}</Link>
      <Button variant="danger" onClick={() => onDelete(file)} aria-label={`${t('deleteFile')}: ${file.fileName}`}><Trash2 size={17} aria-hidden="true" /><span>{t('deleteFile')}</span></Button>
    </div>
  </Card>;
}
