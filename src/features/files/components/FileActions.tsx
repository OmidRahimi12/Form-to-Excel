import { Download, ExternalLink, Share2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import { useFileActions } from '../hooks/useFileActions';

interface FileActionsProps {
  id: number;
  contentAvailable: boolean;
  onDelete: () => void;
}

export function FileActions({ id, contentAvailable, onDelete }: FileActionsProps) {
  const { t } = useTranslation();
  const { busy, errorKey, open, download, share } = useFileActions();
  return <div className="file-actions-wrap">
    {!contentAvailable && <p className="file-feedback file-feedback--error" role="alert">{t('fileContentMissing')}</p>}
    {errorKey && <p className="file-feedback file-feedback--error" role="alert">{t(errorKey)}</p>}
    <div className="file-actions">
      <Button variant="secondary" disabled={busy || !contentAvailable} onClick={() => void open(id)}><ExternalLink size={17} aria-hidden="true" />{busy ? t('openingFile') : t('openFile')}</Button>
      <Button disabled={busy || !contentAvailable} onClick={() => void download(id)}><Download size={17} aria-hidden="true" />{busy ? t('preparingDownload') : t('downloadFile')}</Button>
      <Button variant="ghost" disabled={busy || !contentAvailable} onClick={() => void share(id)}><Share2 size={17} aria-hidden="true" />{busy ? t('sharingFile') : t('shareFile')}</Button>
      <Button variant="danger" disabled={busy} onClick={onDelete}><Trash2 size={17} aria-hidden="true" />{t('deleteFile')}</Button>
    </div>
  </div>;
}
