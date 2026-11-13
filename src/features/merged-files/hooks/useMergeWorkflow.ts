import { useState } from 'react';
import { ExcelMergeError } from '../services/excelMergeService';
import { MergedFileRepositoryError, normalizeMergedFileName } from '../services/mergedFileRepository';
import { appendFileToMergedWorkbook, createMergedWorkbook } from '../services/mergeWorkflowService';

export function useMergeWorkflow() {
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>();
  const [successKey, setSuccessKey] = useState<string>();

  const create = async (fileIds: number[], fileName: string): Promise<boolean> => {
    setBusy(true);
    setErrorKey(undefined);
    setSuccessKey(undefined);
    try {
      const normalizedName = normalizeMergedFileName(fileName);
      await createMergedWorkbook(fileIds, normalizedName);
      setSuccessKey('mergedFileCreated');
      return true;
    } catch (error) {
      setErrorKey(getMergeErrorKey(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const append = async (sourceFileId: number, targetMergedFileId: number): Promise<boolean> => {
    setBusy(true);
    setErrorKey(undefined);
    setSuccessKey(undefined);
    try {
      await appendFileToMergedWorkbook(sourceFileId, targetMergedFileId);
      setSuccessKey('mergedFileAppended');
      return true;
    } catch (error) {
      setErrorKey(getMergeErrorKey(error));
      return false;
    } finally {
      setBusy(false);
    }
  };

  const clearMessages = () => {
    setErrorKey(undefined);
    setSuccessKey(undefined);
  };

  return { busy, errorKey, successKey, create, append, clearMessages };
}

function getMergeErrorKey(error: unknown): string {
  if (error instanceof ExcelMergeError) {
    switch (error.code) {
      case 'tooFewFiles': return 'mergeNeedsTwoFiles';
      case 'invalidWorkbook': return 'mergeInvalidWorkbook';
      case 'emptyWorkbook': return 'mergeEmptyWorkbook';
      case 'incompatibleSheets': return 'mergeIncompatibleSheets';
      case 'incompatibleColumns': return 'mergeIncompatibleColumns';
    }
  }
  if (error instanceof MergedFileRepositoryError) {
    switch (error.code) {
      case 'invalidName': return 'invalidMergedFileName';
      case 'unsupportedType': return 'mergeInvalidWorkbook';
      case 'invalidContent':
      case 'contentCorrupt': return 'mergedFileCorrupt';
      case 'fileNotFound': return 'mergedFileNotFound';
      case 'contentMissing': return 'mergedFileContentMissing';
      case 'concurrentModification': return 'mergeConcurrentAppend';
    }
  }
  if (error instanceof Error) {
    if (error.message === 'tooFewFiles') return 'mergeNeedsTwoFiles';
    if (error.message === 'unsupportedSource') return 'mergeUnsupportedSource';
  }
  return 'mergeOperationError';
}
