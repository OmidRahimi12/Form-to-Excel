import { useState } from 'react';
import { getMergedFileContent, MergedFileRepositoryError } from '../services/mergedFileRepository';
import { createMergedFileShareFile, shareMergedFile } from '../services/mergedFileSharing';

export function useMergedFileActions() {
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>();

  const open = async (id: number) => {
    setErrorKey(undefined);
    const popup = window.open('about:blank', '_blank');
    if (!popup) {
      setErrorKey('fileOpenBlocked');
      return;
    }
    popup.opener = null;
    setBusy(true);
    try {
      const { blob } = await getMergedFileContent(id);
      const objectUrl = URL.createObjectURL(blob);
      popup.location.replace(objectUrl);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      popup.close();
      setErrorKey(getActionErrorKey(error));
    } finally {
      setBusy(false);
    }
  };

  const download = async (id: number) => {
    setErrorKey(undefined);
    setBusy(true);
    try {
      const { blob, metadata } = await getMergedFileContent(id);
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = metadata.fileName;
      link.rel = 'noopener';
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
    } catch (error) {
      setErrorKey(getActionErrorKey(error));
    } finally {
      setBusy(false);
    }
  };

  const share = async (id: number) => {
    setErrorKey(undefined);
    setBusy(true);
    try {
      const { blob, metadata } = await getMergedFileContent(id);
      if (typeof File === 'undefined') {
        downloadMergedBlob(blob, metadata.fileName);
        setErrorKey('fileShareFallbackDownloaded');
        return;
      }
      const file = createMergedFileShareFile(blob, metadata);
      const result = await shareMergedFile(navigator, file, metadata.fileName);
      if (result === 'unsupported') {
        downloadMergedBlob(blob, metadata.fileName);
        setErrorKey('fileShareFallbackDownloaded');
      }
    } catch (error) {
      setErrorKey(error instanceof MergedFileRepositoryError ? getActionErrorKey(error) : 'fileShareError');
    } finally {
      setBusy(false);
    }
  };

  return { busy, errorKey, open, download, share };
}

function downloadMergedBlob(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  link.rel = 'noopener';
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}


function getActionErrorKey(error: unknown): string {
  if (!(error instanceof MergedFileRepositoryError)) return 'fileReadError';
  switch (error.code) {
    case 'fileNotFound': return 'mergedFileNotFound';
    case 'contentMissing': return 'mergedFileContentMissing';
    case 'contentCorrupt':
    case 'invalidContent': return 'mergedFileCorrupt';
    default: return 'fileReadError';
  }
}
