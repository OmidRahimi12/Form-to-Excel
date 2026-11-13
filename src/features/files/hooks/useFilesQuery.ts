import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { getFileDetails, listFiles } from '../services/fileService';
import type { FileDetails, StoredFileMetadata } from '../types/file';

export function useFilesQuery() {
  return useDexieQuery<StoredFileMetadata[]>(listFiles, [], []);
}

export function useFileQuery(id: number | undefined) {
  return useDexieQuery<FileDetails | undefined>(
    () => id === undefined ? Promise.resolve(undefined) : getFileDetails(id),
    [id],
    undefined,
  );
}
