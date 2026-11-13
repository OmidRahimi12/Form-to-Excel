import { appDatabase } from '../../../database/appDatabase';
import type { FileDetails, StoredFileMetadata } from '../types/file';
import { CSV_MIME_TYPE, XLSX_MIME_TYPE } from '../types/file';

export type FileServiceErrorCode = 'invalidName' | 'invalidTimestamp' | 'unsupportedType' | 'emptyContent' | 'invalidContent' | 'fileNotFound' | 'contentMissing' | 'contentCorrupt';

export class FileServiceError extends Error {
  constructor(readonly code: FileServiceErrorCode) {
    super(code);
    this.name = 'FileServiceError';
  }
}

export async function listFiles(): Promise<StoredFileMetadata[]> {
  return appDatabase.files.orderBy('createdAt').reverse().toArray();
}

export async function getFileDetails(id: number): Promise<FileDetails | undefined> {
  const file = await appDatabase.files.get(id);
  if (!file) return undefined;
  const contentCount = await appDatabase.fileContents.where('fileId').equals(id).count();
  return { file, contentAvailable: contentCount > 0 };
}

export interface SaveExportedFileOptions {
  createdAt?: number;
  contentHash?: string;
}

export interface ValidatedFileMetadata {
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: number;
  contentHash?: string;
}

/** Validate the metadata and basic container signature without parsing a workbook or CSV. */
export async function validateExportedFile(blob: Blob, rawFileName: string, options: SaveExportedFileOptions = {}): Promise<ValidatedFileMetadata> {
  if (!(blob instanceof Blob)) throw new FileServiceError('invalidContent');
  const fileName = rawFileName.trim();
  if (!fileName || fileName.length > 240 || /[\\/\u0000-\u001f]/.test(fileName)) throw new FileServiceError('invalidName');
  const extension = fileName.slice(fileName.lastIndexOf('.') + 1).toLocaleLowerCase();
  const expectedMimeType = extension === 'xlsx' ? XLSX_MIME_TYPE : extension === 'csv' ? CSV_MIME_TYPE : undefined;
  const suppliedMimeType = normalizeMimeType(blob.type);
  if (!expectedMimeType || suppliedMimeType !== expectedMimeType) throw new FileServiceError('unsupportedType');
  if (!Number.isFinite(options.createdAt ?? Date.now()) || (options.createdAt ?? 0) < 0) throw new FileServiceError('invalidTimestamp');
  if (!blob.size) throw new FileServiceError('emptyContent');
  if (expectedMimeType === XLSX_MIME_TYPE && !(await hasZipHeader(blob))) throw new FileServiceError('invalidContent');
  return {
    fileName,
    mimeType: expectedMimeType,
    size: blob.size,
    createdAt: options.createdAt ?? Date.now(),
    ...(options.contentHash ? { contentHash: options.contentHash } : {}),
  };
}

/** Store an app-generated XLSX or CSV artifact; this is not a user file-upload flow. */
export async function saveExportedFile(blob: Blob, rawFileName: string, options: SaveExportedFileOptions = {}): Promise<number> {
  const metadata = await validateExportedFile(blob, rawFileName, options);

  return appDatabase.transaction('rw', appDatabase.files, appDatabase.fileContents, async () => {
    const id = await appDatabase.files.add(metadata);
    await appDatabase.fileContents.add({ fileId: id, blob });
    return id;
  });
}

export async function getFileContent(id: number): Promise<{ metadata: StoredFileMetadata; blob: Blob }> {
  const [metadata, content] = await Promise.all([appDatabase.files.get(id), appDatabase.fileContents.get(id)]);
  if (!metadata) throw new FileServiceError('fileNotFound');
  if (!content || !(content.blob instanceof Blob)) throw new FileServiceError('contentMissing');
  const contentType = normalizeMimeType(content.blob.type);
  const invalidXlsx = metadata.mimeType === XLSX_MIME_TYPE && !(await hasZipHeader(content.blob));
  if (content.blob.size !== metadata.size || contentType !== metadata.mimeType || invalidXlsx) {
    throw new FileServiceError('contentCorrupt');
  }
  return { metadata, blob: content.blob };
}

export async function deleteFile(id: number): Promise<void> {
  await appDatabase.transaction('rw', appDatabase.files, appDatabase.fileContents, async () => {
    await appDatabase.fileContents.delete(id);
    await appDatabase.files.delete(id);
  });
}

export function searchFiles(files: StoredFileMetadata[], rawQuery: string): StoredFileMetadata[] {
  const query = rawQuery.trim().toLocaleLowerCase();
  return query ? files.filter((file) => file.fileName.toLocaleLowerCase().includes(query)) : files;
}

async function hasZipHeader(blob: Blob): Promise<boolean> {
  if (blob.size < 4) return false;
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return header[0] === 0x50 && header[1] === 0x4b && (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
}

function normalizeMimeType(mimeType: string): string {
  return mimeType.split(';', 1)[0].trim().toLocaleLowerCase();
}
