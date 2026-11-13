import Dexie, { type Table } from 'dexie';
import type { FormRecord } from '../features/forms/types/form';
import type { StoredFileContent, StoredFileMetadata } from '../features/files/types/file';
import type { MergedFileContent, MergedFileMetadata } from '../features/merged-files/types/mergedFile';
import type { NoteRecord } from '../features/notes/types/note';
import type { FormTemplate } from '../features/forms/types/template';

export class AppDatabase extends Dexie {
  forms!: Table<FormRecord, number>;
  files!: Table<StoredFileMetadata, number>;
  fileContents!: Table<StoredFileContent, number>;
  mergedFiles!: Table<MergedFileMetadata, number>;
  mergedFileContents!: Table<MergedFileContent, number>;
  notes!: Table<NoteRecord, number>;
  formTemplates!: Table<FormTemplate, number>;

  constructor(name = 'form-to-excel') {
    super(name);
    // First schema version: this project had no previous browser database to migrate.
    this.version(1).stores({ forms: '++id, createdAt, updatedAt' });
    // Version 2 adds metadata and binary stores; existing Forms records are unchanged.
    this.version(2).stores({
      forms: '++id, createdAt, updatedAt',
      files: '++id, fileName, createdAt',
      fileContents: 'fileId',
    });
    // Version 3 adds a separate local store for merged workbook outputs.
    this.version(3).stores({
      forms: '++id, createdAt, updatedAt',
      files: '++id, fileName, createdAt',
      fileContents: 'fileId',
      mergedFiles: '++id, fileName, createdAt',
      mergedFileContents: 'fileId',
    });
    // Version 4 adds local Notes and configurable form layouts. Existing rows stay intact.
    this.version(4).stores({
      forms: '++id, createdAt, updatedAt',
      files: '++id, fileName, createdAt',
      fileContents: 'fileId',
      mergedFiles: '++id, fileName, createdAt',
      mergedFileContents: 'fileId',
      notes: '++id, updatedAt',
      formTemplates: '++id, name, updatedAt',
    });
  }
}

export const appDatabase = new AppDatabase();
