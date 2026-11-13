import Dexie from 'dexie';
import { appDatabase } from '../../../database/appDatabase';
import type { AppDatabase } from '../../../database/appDatabase';
import type { BackupSnapshot, BackupWorkerRequest, BackupWorkerResponse, BackupWorkerTask, ValidatedBackup } from '../types/backup';

export class BackupError extends Error {
  constructor(readonly translationKey: string, options?: ErrorOptions) {
    super(translationKey, options);
    this.name = 'BackupError';
  }
}

let requestId = 0;

function runWorker<T>(request: BackupWorkerTask): Promise<T> {
  const id = ++requestId;
  const worker = new Worker(new URL('../workers/backup.worker.ts', import.meta.url), { type: 'module' });
  return new Promise<T>((resolve, reject) => {
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      worker.terminate();
      callback();
    };
    worker.onmessage = (event: MessageEvent<BackupWorkerResponse>) => {
      const response = event.data;
      if (response.id !== id) return;
      if (response.ok) finish(() => resolve(response.result as T));
      else finish(() => reject(new BackupError(response.errorKey)));
    };
    worker.onerror = (event) => {
      event.preventDefault();
      finish(() => reject(new BackupError('backupErrorWorker')));
    };
    worker.onmessageerror = () => finish(() => reject(new BackupError('backupErrorWorker')));
    try { worker.postMessage({ ...request, id } as BackupWorkerRequest); }
    catch (error) { finish(() => reject(new BackupError('backupErrorWorker', { cause: error }))); }
  });
}

export async function readBackupSnapshot(database: AppDatabase = appDatabase): Promise<BackupSnapshot> {
  try {
    return await database.transaction('r', [database.forms, database.files, database.fileContents, database.mergedFiles, database.mergedFileContents, database.notes, database.formTemplates], async () => {
      const [forms, files, fileContents, mergedFiles, mergedFileContents, notes, formTemplates] = await Promise.all([
        database.forms.toArray(), database.files.toArray(), database.fileContents.toArray(),
        database.mergedFiles.toArray(), database.mergedFileContents.toArray(),
        database.notes.toArray(), database.formTemplates.toArray(),
      ]);
      return { data: { forms, files, mergedFiles, notes, formTemplates }, fileContents, mergedFileContents };
    });
  } catch (error) { throw new BackupError('backupErrorRead', { cause: error }); }
}

export async function createBackup(database: AppDatabase = appDatabase): Promise<Blob> {
  const snapshot = await readBackupSnapshot(database);
  try { return await runWorker<Blob>({ type: 'create', snapshot }); }
  catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError('backupErrorCreate', { cause: error });
  }
}

export async function validateBackupFile(file: File): Promise<ValidatedBackup> {
  try { return await runWorker<ValidatedBackup>({ type: 'validate', file }); }
  catch (error) {
    if (error instanceof BackupError) throw error;
    throw new BackupError('backupErrorInvalid', { cause: error });
  }
}

export async function restoreBackup(backup: ValidatedBackup, database: AppDatabase = appDatabase): Promise<void> {
  try {
    await database.transaction('rw', [database.forms, database.files, database.fileContents, database.mergedFiles, database.mergedFileContents, database.notes, database.formTemplates], async () => {
      await Promise.all([database.forms.clear(), database.files.clear(), database.fileContents.clear(), database.mergedFiles.clear(), database.mergedFileContents.clear(), database.notes.clear(), database.formTemplates.clear()]);
      if (backup.forms.length) await database.forms.bulkAdd(backup.forms);
      if (backup.files.length) await database.files.bulkAdd(backup.files);
      if (backup.fileContents.length) await database.fileContents.bulkAdd(backup.fileContents);
      if (backup.mergedFiles.length) await database.mergedFiles.bulkAdd(backup.mergedFiles);
      if (backup.mergedFileContents.length) await database.mergedFileContents.bulkAdd(backup.mergedFileContents);
      if (backup.notes.length) await database.notes.bulkAdd(backup.notes);
      if (backup.formTemplates.length) await database.formTemplates.bulkAdd(backup.formTemplates);
    });
  } catch (error) {
    const cause = error instanceof Dexie.AbortError || error instanceof Dexie.ConstraintError ? error : error;
    throw new BackupError('backupErrorRestore', { cause });
  }
}

export function downloadBackup(blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `form-to-excel-backup-${new Date().toISOString().slice(0, 10)}.zip`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000);
}
