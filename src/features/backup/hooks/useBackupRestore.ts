import { useRef, useState } from 'react';
import { BackupError, createBackup, downloadBackup, restoreBackup, validateBackupFile } from '../services/backupService';
import type { ValidatedBackup } from '../types/backup';

export function useBackupRestore() {
  const [busy, setBusy] = useState(false);
  const [pendingBackup, setPendingBackup] = useState<ValidatedBackup | null>(null);
  const [statusKey, setStatusKey] = useState('');
  const operationLock = useRef(false);

  async function createAndDownloadBackup() {
    if (operationLock.current) return;
    operationLock.current = true;
    setBusy(true); setStatusKey('');
    try { downloadBackup(await createBackup()); setStatusKey('backupCreated'); }
    catch (error) { setStatusKey(error instanceof BackupError ? error.translationKey : 'backupErrorCreate'); }
    finally { setBusy(false); operationLock.current = false; }
  }

  async function inspectBackup(file: File) {
    if (operationLock.current) return;
    operationLock.current = true;
    setBusy(true); setStatusKey(''); setPendingBackup(null);
    try { setPendingBackup(await validateBackupFile(file)); }
    catch (error) { setStatusKey(error instanceof BackupError ? error.translationKey : 'backupErrorInvalid'); }
    finally { setBusy(false); operationLock.current = false; }
  }

  async function confirmRestore() {
    if (!pendingBackup || operationLock.current) return;
    operationLock.current = true;
    setBusy(true); setStatusKey('');
    try { await restoreBackup(pendingBackup); setPendingBackup(null); setStatusKey('backupRestored'); }
    catch (error) { setStatusKey(error instanceof BackupError ? error.translationKey : 'backupErrorRestore'); }
    finally { setBusy(false); operationLock.current = false; }
  }

  return { busy, pendingBackup, statusKey, createAndDownloadBackup, inspectBackup, confirmRestore, cancelRestore: () => { if (!operationLock.current) setPendingBackup(null); } };
}
