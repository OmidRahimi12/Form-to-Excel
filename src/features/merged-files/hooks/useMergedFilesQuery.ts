import { useDexieQuery } from '../../../hooks/useDexieQuery';
import { listMergedFiles } from '../services/mergedFileRepository';
import type { MergedFileMetadata } from '../types/mergedFile';

export function useMergedFilesQuery() {
  return useDexieQuery<MergedFileMetadata[]>(listMergedFiles, [], []);
}
