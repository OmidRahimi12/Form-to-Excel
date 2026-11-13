import { useMemo, useState } from 'react';
import type { StoredFileMetadata } from '../../files/types/file';
import { isMergeableFile } from '../utils/isMergeableFile';

export function useMergeSelection() {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const startSelection = () => setSelectionMode(true);
  const cancelSelection = () => {
    setSelectionMode(false);
    setSelectedIds([]);
  };
  const toggleFile = (file: StoredFileMetadata) => {
    if (!file.id || !isMergeableFile(file)) return;
    setSelectedIds((current) => current.includes(file.id!) ? current.filter((id) => id !== file.id) : [...current, file.id!]);
  };
  const removeFile = (id: number) => setSelectedIds((current) => current.filter((selectedId) => selectedId !== id));

  return { selectionMode, selectedIds, selectedIdSet, startSelection, cancelSelection, toggleFile, removeFile };
}
