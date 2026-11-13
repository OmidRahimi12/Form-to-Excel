import { BackupError, createBackupArchive, validateBackupArchive } from '../services/backupArchive';
import type { BackupWorkerRequest, BackupWorkerResponse } from '../types/backup';

const workerScope = globalThis as unknown as {
  onmessage: ((event: MessageEvent<BackupWorkerRequest>) => void) | null;
  postMessage: (message: BackupWorkerResponse) => void;
};

workerScope.onmessage = async ({ data }) => {
  try {
    const result = data.type === 'create'
      ? await createBackupArchive(data.snapshot)
      : await validateBackupArchive(data.file);
    workerScope.postMessage({ id: data.id, ok: true, result });
  } catch (error) {
    const errorKey = error instanceof BackupError ? error.translationKey : data.type === 'create' ? 'backupErrorCreate' : 'backupErrorInvalid';
    workerScope.postMessage({ id: data.id, ok: false, errorKey });
  }
};
