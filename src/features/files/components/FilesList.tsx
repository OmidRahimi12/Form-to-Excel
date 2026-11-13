import { useTranslation } from 'react-i18next';
import { EmptyState, Loading } from '../../../components/shared';
import { FileCard } from './FileCard';
import type { StoredFileMetadata } from '../types/file';

interface FilesListProps {
  files: StoredFileMetadata[];
  loading: boolean;
  error: boolean;
  hasSearch: boolean;
  onDelete: (file: StoredFileMetadata) => void;
  selectionMode?: boolean;
  selectedIds?: Set<number>;
  onToggleSelection?: (file: StoredFileMetadata) => void;
}

export function FilesList({ files, loading, error, hasSearch, onDelete, selectionMode = false, selectedIds = new Set(), onToggleSelection }: FilesListProps) {
  const { t } = useTranslation();
  if (loading) return <div className="files-status"><Loading label={t('loadingFiles')} /></div>;
  if (error) return <div className="files-status"><EmptyState title={t('filesLoadError')} description={t('filesLoadErrorDescription')} /></div>;
  if (!files.length) return <div className="files-status"><EmptyState title={t(hasSearch ? 'noFilesMatch' : 'noFiles')} description={t(hasSearch ? 'noFilesMatchDescription' : 'noFilesDescription')} /></div>;
  return <ul className="local-file-list">{files.map((file) => <li key={file.id}><FileCard
    file={file}
    onDelete={onDelete}
    selectionMode={selectionMode}
    selected={file.id !== undefined && selectedIds.has(file.id)}
    onToggleSelection={onToggleSelection}
  /></li>)}</ul>;
}
