import type { FormRecord } from '../../forms/types/form';
import type { StoredFileMetadata } from '../../files/types/file';
import type { MergedFileMetadata } from '../../merged-files/types/mergedFile';
import type { NoteRecord } from '../../notes/types/note';
import type { FormTemplate } from '../../forms/types/template';

export const BACKUP_FORMAT = 'form-to-excel-backup';
export const BACKUP_VERSION = 2;
export const BACKUP_MAX_ARCHIVE_BYTES = 16 * 1024 * 1024;
export const BACKUP_MAX_EXPANDED_BYTES = 16 * 1024 * 1024;
export const BACKUP_MAX_ENTRY_BYTES = 8 * 1024 * 1024;
export const BACKUP_MAX_METADATA_BYTES = 2 * 1024 * 1024;
export const BACKUP_MAX_MANIFEST_BYTES = 1024 * 1024;
export const BACKUP_MAX_ENTRIES = 1000;
export const BACKUP_MIME_TYPE = 'application/zip';

export interface BackupManifest {
  format: typeof BACKUP_FORMAT;
  formatVersion: 1 | typeof BACKUP_VERSION;
  appId: 'form-to-excel';
  createdAt: string;
  databaseVersion: 3 | 4;
  tables: string[];
  contents: Array<{ table: 'fileContents' | 'mergedFileContents'; id: number; path: string; size: number }>;
}

export interface BackupData {
  forms: FormRecord[];
  files: StoredFileMetadata[];
  mergedFiles: MergedFileMetadata[];
  notes: NoteRecord[];
  formTemplates: FormTemplate[];
}

export interface BackupSnapshot {
  data: BackupData;
  fileContents: Array<{ fileId: number; blob: Blob }>;
  mergedFileContents: Array<{ fileId: number; blob: Blob }>;
}

export interface ValidatedBackup {
  manifest: BackupManifest;
  forms: FormRecord[];
  files: StoredFileMetadata[];
  fileContents: Array<{ fileId: number; blob: Blob }>;
  mergedFiles: MergedFileMetadata[];
  mergedFileContents: Array<{ fileId: number; blob: Blob }>;
  notes: NoteRecord[];
  formTemplates: FormTemplate[];
}

export type BackupWorkerTask =
  | { type: 'create'; snapshot: BackupSnapshot }
  | { type: 'validate'; file: File };

export type BackupWorkerRequest = BackupWorkerTask & { id: number };

export type BackupWorkerResponse =
  | { id: number; ok: true; result: Blob | ValidatedBackup }
  | { id: number; ok: false; errorKey: string };
