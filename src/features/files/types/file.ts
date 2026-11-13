export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
export const CSV_MIME_TYPE = 'text/csv';

export interface StoredFileMetadata {
  id?: number;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: number;
  contentHash?: string;
}

export interface StoredFileContent {
  fileId: number;
  blob: Blob;
}

export interface FileDetails {
  file: StoredFileMetadata;
  contentAvailable: boolean;
}
