import { useState } from 'react';
import { Files } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { appRoutes } from '../../../app/navigation';
import { ConfirmationDialog, PageHeader } from '../../../components/shared';
import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { deleteMergedFile, listMergedFiles } from '../services/mergedFileRepository';
import type { MergedFileMetadata } from '../types/mergedFile';
import { MergedFilesList } from '../components/MergedFilesList';

export function MergedFilesPage() {
  const { t } = useTranslation();
  const { value: files, loading, error } = useDexieQuery<MergedFileMetadata[]>(listMergedFiles, [], []);
  const [selected, setSelected] = useState<MergedFileMetadata | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const [notice, setNotice] = useState<string>();

  const confirmDelete = async () => {
    if (selected?.id === undefined) return;
    try {
      await deleteMergedFile(selected.id);
      setSelected(null);
      setDeleteError(false);
      setNotice(t('mergedFileDeleted'));
    } catch {
      setDeleteError(true);
    }
  };

  return <section className="merged-files-page">
    <PageHeader
      eyebrow={t('appName')}
      title={t('mergedFiles')}
      description={t('mergedFilesDescription')}
      actions={<Link className="button button--secondary" to={appRoutes.files}><Files size={17} aria-hidden="true" />{t('files')}</Link>}
    />
    {!loading && !error && <p className="merged-files-count" aria-live="polite">{t('mergedFileCount', { count: files.length })}</p>}
    {notice && <p className="file-feedback file-feedback--success" role="status">{notice}</p>}
    {deleteError && <p className="file-feedback file-feedback--error" role="alert">{t('mergedFileDeleteError')}</p>}
    <MergedFilesList files={files} loading={loading} error={error} onDelete={(file) => { setDeleteError(false); setSelected(file); }} />
    <ConfirmationDialog
      open={Boolean(selected)}
      title={t('deleteFile')}
      message={selected ? t('mergedFileDeleteMessage', { file: selected.fileName }) : ''}
      confirmLabel={t('deleteFile')}
      onCancel={() => setSelected(null)}
      onConfirm={() => void confirmDelete()}
    />
  </section>;
}
