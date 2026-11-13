export const XLSX_MIME_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export interface MergedFileMetadata {
  id?: number;
  fileName: string;
  mimeType: typeof XLSX_MIME_TYPE;
  size: number;
  createdAt: number;
  /** Optimistic concurrency token; absent on records saved before this safeguard. */
  revision?: number;
}

export interface MergedFileContent {
  fileId: number;
  blob: Blob;
}

