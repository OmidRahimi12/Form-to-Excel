import { useState } from 'react';
import { Table2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmationDialog, EmptyState, Loading, PageHeader } from '../../../components/shared';
import { Button } from '../../../components/ui';
import { appRoutes } from '../../../app/navigation';
import { FileActions } from '../components/FileActions';
import { FileDetailsCard } from '../components/FileDetailsCard';
import { useFileQuery } from '../hooks/useFilesQuery';
import { deleteFile } from '../services/fileService';
import { parseFileId } from '../utils/parseFileId';

export function FileDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const id = parseFileId(useParams().id);
  const { value: details, loading, error } = useFileQuery(id);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  if (loading) return <div className="files-status"><Loading label={t('loadingFile')} /></div>;
  if (error) return <div className="files-status"><EmptyState title={t('fileLoadError')} description={t('filesLoadErrorDescription')} /></div>;
  if (!details?.file.id) return <div className="files-status"><EmptyState title={t('fileNotFound')} description={t('fileNotFoundDescription')} /></div>;

  const { file, contentAvailable } = details;
  const canEditInSpreadsheet = file.mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && file.fileName.toLowerCase().endsWith('.xlsx');
  const deleteCurrentFile = async () => {
    try {
      await deleteFile(file.id!);
      navigate(appRoutes.files, { state: { notice: t('fileDeleted') } });
    } catch {
      setDeleteError(true);
      setConfirmOpen(false);
    }
  };

  return <section className="file-details-page">
    <PageHeader eyebrow={t('files')} title={file.fileName} actions={<div className="file-details-header-actions">
      {canEditInSpreadsheet && <Button disabled={!contentAvailable} onClick={() => navigate(`${appRoutes.spreadsheetFileOpen}/${file.id}`)}><Table2 size={17} aria-hidden="true" />{t('openInSpreadsheet')}</Button>}
      <Button variant="secondary" onClick={() => navigate(appRoutes.files)}>{t('backToFiles')}</Button>
    </div>} />
    <FileDetailsCard file={file} />
    {deleteError && <p className="file-feedback file-feedback--error" role="alert">{t('fileDeleteError')}</p>}
    <FileActions id={file.id!} contentAvailable={contentAvailable} onDelete={() => { setDeleteError(false); setConfirmOpen(true); }} />
    <ConfirmationDialog open={confirmOpen} title={t('deleteFile')} message={t('deleteFileMessage', { file: file.fileName })} confirmLabel={t('deleteFile')} onCancel={() => setConfirmOpen(false)} onConfirm={() => void deleteCurrentFile()} />
  </section>;
}
