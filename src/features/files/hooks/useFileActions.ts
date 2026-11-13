import { useState } from 'react';
import { FileServiceError, getFileContent } from '../services/fileService';

export function useFileActions() {
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
      const { blob } = await getFileContent(id);
      const objectUrl = URL.createObjectURL(blob);
      popup.location.replace(objectUrl);
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (error) {
      popup.close();
      setErrorKey(getFileActionErrorKey(error));
    } finally {
      setBusy(false);
    }
  };

  const download = async (id: number) => {
    setErrorKey(undefined);
    setBusy(true);
    try {
      const { blob, metadata } = await getFileContent(id);
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
      setErrorKey(getFileActionErrorKey(error));
    } finally {
      setBusy(false);
    }
  };

  const share = async (id: number) => {
    setErrorKey(undefined);
    if (!navigator.share || typeof File === 'undefined') {
      setErrorKey('fileShareUnavailable');
      return;
    }
    setBusy(true);
    try {
      const { blob, metadata } = await getFileContent(id);
      const file = new File([blob], metadata.fileName, { type: metadata.mimeType, lastModified: metadata.createdAt });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        setErrorKey('fileShareUnavailable');
        return;
      }
      await navigator.share({ files: [file], title: metadata.fileName });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      setErrorKey(error instanceof FileServiceError ? getFileActionErrorKey(error) : 'fileShareError');
    } finally {
      setBusy(false);
    }
  };

  return { busy, errorKey, open, download, share };
}

function getFileActionErrorKey(error: unknown): string {
  if (!(error instanceof FileServiceError)) return 'fileReadError';
  switch (error.code) {
    case 'fileNotFound': return 'fileNotFound';
    case 'contentMissing': return 'fileContentMissing';
    case 'contentCorrupt':
    case 'invalidContent': return 'fileContentCorrupt';
    default: return 'fileReadError';
  }
}
