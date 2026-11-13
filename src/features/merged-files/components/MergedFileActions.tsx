import { Download, ExternalLink, Share2, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui';
import { useMergedFileActions } from '../hooks/useMergedFileActions';

interface MergedFileActionsProps {
  id: number;
  onDelete: () => void;
}

export function MergedFileActions({ id, onDelete }: MergedFileActionsProps) {
  const { t } = useTranslation();
  const { busy, errorKey, open, download, share } = useMergedFileActions();
  return <div className="merged-file-actions-wrap">
    {errorKey && <p className={`file-feedback ${errorKey === 'fileShareFallbackDownloaded' ? 'file-feedback--success' : 'file-feedback--error'}`} role={errorKey === 'fileShareFallbackDownloaded' ? 'status' : 'alert'}>{t(errorKey)}</p>}
    <div className="merged-file-actions">
      <Button variant="secondary" disabled={busy} onClick={() => void open(id)}><ExternalLink size={17} aria-hidden="true" />{busy ? t('openingFile') : t('openFile')}</Button>
      <Button disabled={busy} onClick={() => void download(id)}><Download size={17} aria-hidden="true" />{busy ? t('preparingDownload') : t('downloadFile')}</Button>
      <Button variant="ghost" disabled={busy} onClick={() => void share(id)}><Share2 size={17} aria-hidden="true" />{busy ? t('sharingFile') : t('shareFile')}</Button>
      <Button variant="danger" disabled={busy} onClick={onDelete}><Trash2 size={17} aria-hidden="true" />{t('deleteFile')}</Button>
    </div>
  </div>;
}
