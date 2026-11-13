import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ConfirmationDialog, PageHeader, SearchBar } from '../../../components/shared';
import { Button } from '../../../components/ui';
import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { deleteFile, listFiles, searchFiles } from '../services/fileService';
import type { StoredFileMetadata } from '../types/file';
import { FilesList } from '../components/FilesList';
import { AppendMergedFileDialog } from '../../merged-files/components/AppendMergedFileDialog';
import { CreateMergedFileDialog } from '../../merged-files/components/CreateMergedFileDialog';
import { MergeSelectionToolbar } from '../../merged-files/components/MergeSelectionToolbar';
import { useMergeSelection } from '../../merged-files/hooks/useMergeSelection';
import { useMergeWorkflow } from '../../merged-files/hooks/useMergeWorkflow';
import { useMergedFilesQuery } from '../../merged-files/hooks/useMergedFilesQuery';

export function FilesPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { value: files, loading, error } = useDexieQuery<StoredFileMetadata[]>(listFiles, [], []);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<StoredFileMetadata | null>(null);
  const [deleteError, setDeleteError] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [appendDialogOpen, setAppendDialogOpen] = useState(false);
  const [notice, setNotice] = useState<string | undefined>(() => (location.state as { notice?: string } | null)?.notice);
  const visibleFiles = useMemo(() => searchFiles(files, query), [files, query]);
  const selection = useMergeSelection();
  const mergeWorkflow = useMergeWorkflow();
  const { value: mergedFiles } = useMergedFilesQuery();

  const confirmDelete = async () => {
    if (!selected?.id) return;
    try {
      await deleteFile(selected.id);
      selection.removeFile(selected.id);
      setSelected(null);
      setDeleteError(false);
      setNotice(t('fileDeleted'));
    } catch {
      setDeleteError(true);
    }
  };

  const submitCreate = async (fileName: string) => {
    const completed = await mergeWorkflow.create(selection.selectedIds, fileName);
    if (completed) selection.cancelSelection();
    return completed;
  };

  const submitAppend = async (targetId: number, sourceId: number) => {
    const completed = await mergeWorkflow.append(sourceId, targetId);
    if (completed) selection.cancelSelection();
    return completed;
  };

  return <section className="files-page">
    <PageHeader eyebrow={t('appName')} title={t('files')} description={t('filesDescription')} />
    {notice && <p className="file-feedback file-feedback--success" role="status">{notice}</p>}
    {mergeWorkflow.successKey && <p className="file-feedback file-feedback--success" role="status">{t(mergeWorkflow.successKey)}</p>}
    {deleteError && <p className="file-feedback file-feedback--error" role="alert">{t('fileDeleteError')}</p>}
    <div className="files-toolbar"><SearchBar placeholder={t('searchFiles')} value={query} onChange={setQuery} />{query && <Button variant="ghost" onClick={() => setQuery('')}>{t('clearSearch')}</Button>}</div>
    <MergeSelectionToolbar
      active={selection.selectionMode}
      selectedCount={selection.selectedIds.length}
      canCreate={selection.selectedIds.length >= 2}
      canAppend={selection.selectedIds.length === 1 && mergedFiles.length > 0}
      onStart={() => { mergeWorkflow.clearMessages(); selection.startSelection(); }}
      onCancel={selection.cancelSelection}
      onCreate={() => { mergeWorkflow.clearMessages(); setCreateDialogOpen(true); }}
      onAppend={() => { mergeWorkflow.clearMessages(); setAppendDialogOpen(true); }}
    />
    <FilesList
      files={visibleFiles}
      loading={loading}
      error={error}
      hasSearch={Boolean(query.trim())}
      onDelete={(file) => { setSelected(file); setDeleteError(false); }}
      selectionMode={selection.selectionMode}
      selectedIds={selection.selectedIdSet}
      onToggleSelection={selection.toggleFile}
    />
    <ConfirmationDialog open={Boolean(selected)} title={t('deleteFile')} message={selected ? t('deleteFileMessage', { file: selected.fileName }) : ''} confirmLabel={t('deleteFile')} onCancel={() => setSelected(null)} onConfirm={() => void confirmDelete()} />
    <CreateMergedFileDialog open={createDialogOpen} busy={mergeWorkflow.busy} errorKey={mergeWorkflow.errorKey} onClose={() => setCreateDialogOpen(false)} onSubmit={submitCreate} />
    <AppendMergedFileDialog
      open={appendDialogOpen}
      busy={mergeWorkflow.busy}
      errorKey={mergeWorkflow.errorKey}
      files={mergedFiles}
      onClose={() => setAppendDialogOpen(false)}
      onSubmit={(targetId) => submitAppend(targetId, selection.selectedIds[0])}
    />
  </section>;
}
