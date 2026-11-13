import type { StoredFileMetadata } from '../../files/types/file';
import { XLSX_MIME_TYPE } from '../../files/types/file';

export function isMergeableFile(file: StoredFileMetadata): boolean {
  return file.mimeType === XLSX_MIME_TYPE && file.fileName.toLowerCase().endsWith('.xlsx');
}
