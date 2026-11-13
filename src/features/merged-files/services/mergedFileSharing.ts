import { XLSX_MIME_TYPE, type MergedFileMetadata } from '../types/mergedFile';

export interface MergedFileShareApi {
  share?: (data: ShareData) => Promise<void>;
  canShare?: (data: ShareData) => boolean;
}

export function createMergedFileShareFile(blob: Blob, metadata: MergedFileMetadata): File {
  if (!(blob instanceof Blob) || !blob.size || blob.size !== metadata.size || metadata.mimeType !== XLSX_MIME_TYPE || !Number.isFinite(metadata.createdAt) || !metadata.fileName.toLowerCase().endsWith('.xlsx') || /[\\/\u0000-\u001f]/.test(metadata.fileName)) {
    throw new Error('INVALID_MERGED_SHARE_FILE');
  }
  return new File([blob], metadata.fileName, { type: XLSX_MIME_TYPE, lastModified: metadata.createdAt });
}

export function supportsMergedFileSharing(api: MergedFileShareApi, file: File): boolean {
  if (typeof api.share !== 'function' || typeof api.canShare !== 'function') return false;
  try { return api.canShare({ files: [file] }); }
  catch { return false; }
}

export async function shareMergedFile(api: MergedFileShareApi, file: File, title: string): Promise<'shared' | 'cancelled' | 'unsupported'> {
  if (!supportsMergedFileSharing(api, file)) return 'unsupported';
  try {
    await api.share!({ files: [file], title });
    return 'shared';
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return 'cancelled';
    if (error instanceof TypeError || (error instanceof Error && error.name === 'NotAllowedError')) return 'unsupported';
    throw error;
  }
}
