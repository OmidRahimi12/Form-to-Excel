import { useTranslation } from 'react-i18next';
import { EmptyState, Loading } from '../../../components/shared';
import type { MergedFileMetadata } from '../types/mergedFile';
import { MergedFileCard } from './MergedFileCard';

interface MergedFilesListProps {
  files: MergedFileMetadata[];
  loading: boolean;
  error: boolean;
  onDelete: (file: MergedFileMetadata) => void;
}

export function MergedFilesList({ files, loading, error, onDelete }: MergedFilesListProps) {
  const { t } = useTranslation();
  if (loading) return <div className="files-status"><Loading label={t('loadingMergedFiles')} /></div>;
  if (error) return <div className="files-status"><EmptyState title={t('mergedFilesLoadError')} description={t('filesLoadErrorDescription')} /></div>;
  if (!files.length) return <div className="files-status"><EmptyState title={t('noMergedFiles')} description={t('noMergedFilesDescription')} /></div>;
  return <ul className="merged-file-list">{files.map((file) => <li key={file.id}><MergedFileCard file={file} onDelete={onDelete} /></li>)}</ul>;
}
