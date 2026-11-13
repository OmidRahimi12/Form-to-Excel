import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appRoutes } from '../../../app/navigation';
import { createBlankWorkbook, parseSpreadsheetFile } from '../services/spreadsheetService';
import { setPendingSpreadsheetSession } from '../services/spreadsheetSessionStore';
import type { SpreadsheetImportKind } from '../types/spreadsheet';

export function useSpreadsheetHome() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string>();
  const requestId = useRef(0);

  useEffect(() => () => { requestId.current += 1; }, []);

  const createWorkbook = async () => {
    const request = ++requestId.current;
    setBusy(true);
    setErrorKey(undefined);
    try {
      const workbook = await createBlankWorkbook();
      if (request !== requestId.current) return;
      setPendingSpreadsheetSession({ workbook, fileName: 'Workbook.xlsx', initiallyDirty: true });
      navigate(appRoutes.spreadsheetEditor);
    } catch {
      if (request === requestId.current) setErrorKey('spreadsheetOpenError');
    } finally {
      if (request === requestId.current) setBusy(false);
    }
  };

  const importWorkbook = async (file: File, kind: SpreadsheetImportKind) => {
    const request = ++requestId.current;
    setBusy(true);
    setErrorKey(undefined);
    try {
      const workbook = await parseSpreadsheetFile(file, kind);
      if (request !== requestId.current) return;
      const baseName = file.name.replace(/\.(xlsx|csv)$/i, '').trim() || 'Workbook';
      setPendingSpreadsheetSession({ workbook, fileName: `${baseName}.xlsx`, initiallyDirty: true });
      navigate(appRoutes.spreadsheetEditor);
    } catch (error) {
      if (request === requestId.current) setErrorKey(getSpreadsheetErrorKey(error));
    } finally {
      if (request === requestId.current) setBusy(false);
    }
  };

  return { busy, errorKey, createWorkbook, importWorkbook };
}

function getSpreadsheetErrorKey(error: unknown): string {
  if (error instanceof Error && 'code' in error) {
    switch (error.code) {
      case 'unsupportedType': return 'spreadsheetUnsupportedType';
      case 'emptyFile': return 'spreadsheetEmptyFile';
      case 'fileTooLarge': return 'spreadsheetFileTooLarge';
      case 'workbookTooLarge': return 'spreadsheetWorkbookTooLarge';
      case 'suspiciousWorkbook': return 'spreadsheetSuspiciousWorkbook';
    }
  }
  return 'spreadsheetImportError';
}
