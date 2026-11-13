import { CSV_MIME_TYPE } from '../types/file';

export function getFileFormatLabelKey(mimeType: string): 'csvFile' | 'xlsxSpreadsheet' {
  return mimeType === CSV_MIME_TYPE ? 'csvFile' : 'xlsxSpreadsheet';
}
