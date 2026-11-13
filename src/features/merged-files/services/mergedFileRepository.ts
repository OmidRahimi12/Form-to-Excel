import { appDatabase } from '../../../database/appDatabase';
import type { MergedFileMetadata } from '../types/mergedFile';
import { XLSX_MIME_TYPE } from '../types/mergedFile';
import type { AppDatabase } from '../../../database/appDatabase';

export type MergedFileRepositoryErrorCode = 'invalidName' | 'unsupportedType' | 'invalidContent' | 'fileNotFound' | 'contentMissing' | 'contentCorrupt' | 'concurrentModification';

export class MergedFileRepositoryError extends Error {
  constructor(readonly code: MergedFileRepositoryErrorCode) {
    super(code);
    this.name = 'MergedFileRepositoryError';
  }
}

export async function listMergedFiles(): Promise<MergedFileMetadata[]> {
  return appDatabase.mergedFiles.orderBy('createdAt').reverse().toArray();
}

export async function getMergedFileContent(id: number, database: AppDatabase = appDatabase): Promise<{ metadata: MergedFileMetadata; blob: Blob }> {
  const [metadata, content] = await database.transaction(
    'r',
    database.mergedFiles,
    database.mergedFileContents,
    () => Promise.all([database.mergedFiles.get(id), database.mergedFileContents.get(id)]),
  );
  if (!metadata) throw new MergedFileRepositoryError('fileNotFound');
  if (!content || !(content.blob instanceof Blob)) throw new MergedFileRepositoryError('contentMissing');
  if (content.blob.size !== metadata.size || content.blob.type.split(';', 1)[0].trim().toLowerCase() !== metadata.mimeType || !(await hasZipHeader(content.blob))) {
    throw new MergedFileRepositoryError('contentCorrupt');
  }
  return { metadata, blob: content.blob };
}

export async function saveMergedFile(blob: Blob, rawFileName: string): Promise<number> {
  const metadata = { ...(await validateMergedFile(blob, rawFileName)), revision: 0 };
  return appDatabase.transaction('rw', appDatabase.mergedFiles, appDatabase.mergedFileContents, async () => {
    const id = await appDatabase.mergedFiles.add(metadata);
    await appDatabase.mergedFileContents.add({ fileId: id, blob });
    return id;
  });
}

/** Atomically replace content only after a complete new workbook has been generated and validated. */
export async function replaceMergedFileContent(id: number, blob: Blob, expectedRevision: number): Promise<void> {
  const existing = await appDatabase.mergedFiles.get(id);
  if (!existing) throw new MergedFileRepositoryError('fileNotFound');
  const metadata = await validateMergedFile(blob, existing.fileName);
  await appDatabase.transaction('rw', appDatabase.mergedFiles, appDatabase.mergedFileContents, async () => {
    const current = await appDatabase.mergedFiles.get(id);
    if (!current) throw new MergedFileRepositoryError('fileNotFound');
    if ((current.revision ?? 0) !== expectedRevision) throw new MergedFileRepositoryError('concurrentModification');
    await appDatabase.mergedFileContents.put({ fileId: id, blob });
    await appDatabase.mergedFiles.update(id, { size: metadata.size, mimeType: metadata.mimeType, revision: expectedRevision + 1 });
  });
}

export async function deleteMergedFile(id: number): Promise<void> {
  await appDatabase.transaction('rw', appDatabase.mergedFiles, appDatabase.mergedFileContents, async () => {
    await appDatabase.mergedFileContents.delete(id);
    await appDatabase.mergedFiles.delete(id);
  });
}

export function normalizeMergedFileName(rawFileName: string): string {
  const trimmed = rawFileName.trim();
  if (!trimmed || trimmed.length > 240 || /[\\/\u0000-\u001f]/.test(trimmed)) throw new MergedFileRepositoryError('invalidName');
  const extensionIndex = trimmed.lastIndexOf('.');
  const hasXlsxExtension = extensionIndex >= 0 && trimmed.slice(extensionIndex).toLowerCase() === '.xlsx';
  const baseName = hasXlsxExtension ? trimmed.slice(0, extensionIndex).trim() : trimmed;
  if (!baseName || baseName.length > 235 || (extensionIndex >= 0 && !hasXlsxExtension)) throw new MergedFileRepositoryError('invalidName');
  return `${baseName}.xlsx`;
}

async function validateMergedFile(blob: Blob, rawFileName: string): Promise<Omit<MergedFileMetadata, 'id'>> {
  if (!(blob instanceof Blob) || !blob.size || !(await hasZipHeader(blob))) throw new MergedFileRepositoryError('invalidContent');
  const mimeType = blob.type.split(';', 1)[0].trim().toLowerCase();
  if (mimeType !== XLSX_MIME_TYPE) throw new MergedFileRepositoryError('unsupportedType');
  return { fileName: normalizeMergedFileName(rawFileName), mimeType: XLSX_MIME_TYPE, size: blob.size, createdAt: Date.now() };
}

async function hasZipHeader(blob: Blob): Promise<boolean> {
  if (blob.size < 4) return false;
  const header = new Uint8Array(await blob.slice(0, 4).arrayBuffer());
  return header[0] === 0x50 && header[1] === 0x4b && (header[2] === 0x03 || header[2] === 0x05 || header[2] === 0x07);
}
